#!/usr/bin/env python3
"""
Usage: python .github/scripts/extract-mdn-logs.py [repo_path] [lang] [out_file]
Default: ./content en-us
"""
from __future__ import annotations
from concurrent.futures import ThreadPoolExecutor
import argparse
import os
import re
import subprocess
from pathlib import Path
import time
from typing import Dict, Iterable, List, Optional, Set

RECORD_SEPARATOR = b"\x1e"
NUL = b"\x00"
INDEX_SUFFIX = b"/index.md"
CONFLICTING = b"/conflicting/"
ORPHANED = b"/orphaned/"

def run_git(argv: Iterable[str], repo: str) -> subprocess.CompletedProcess[bytes]:
  return subprocess.run(["git", "-C", repo, *argv], capture_output=True)

def find_index_files(base_dir: Path, repo_root: Path) -> List[str]:
  if not base_dir.exists():
    return []
  out: List[str] = []
  repo_root_resolved = repo_root.resolve()
  for p in base_dir.rglob("index.md"):
    try:
      rel = p.resolve().relative_to(repo_root_resolved)
    except Exception:
      rel = Path(os.path.relpath(p.resolve(), repo_root_resolved))
    s = str(rel).replace("\\", "/").lstrip("./")
    if "/conflicting/" in s or "/orphaned/" in s:
      continue
    out.append(s)
  return out

def get_git_log_buffer(repo: str, lang: str) -> bytes:
  common = [
    "-c",
    "core.quotepath=off",
    "log",
    "--format=%x1e%H%x00",
    "--name-only",
    "-z",
    "--",
  ]

  completed = run_git([*common, f"files/{lang}"], repo)
  if completed.returncode != 0 or not completed.stdout:
    completed = run_git([
      *common,
      f":(glob)files/{lang}/**/index.md",
      f":(exclude,glob)files/{lang}/**/conflicting/**",
      f":(exclude,glob)files/{lang}/**/orphaned/**"
    ], repo)
  if completed.returncode != 0:
    stderr = (completed.stderr or b"").decode("utf-8", errors="replace")
    raise RuntimeError(f"git log failed: {stderr}")
  return completed.stdout

def parse_git_log_buffer(buffer: bytes, targets: Set[bytes]) -> Dict[bytes, str]:
  out: Dict[bytes, str] = {}
  if not buffer:
    return out
  for rec in buffer.split(RECORD_SEPARATOR):
    if not rec:
      continue
    parts = rec.split(NUL)
    if len(parts) < 2:
      continue
    commit = parts[0].decode("utf-8", errors="replace").strip()
    if not commit:
      continue
    for raw in parts[1:]:
      if not raw:
        continue
      # normalize path bytes: windows backslash -> slash, strip leading ./
      p = raw.replace(b"\\", b"/")
      if p.startswith(b"./"):
        p = p[2:]
      if not p.endswith(INDEX_SUFFIX):
        continue
      if CONFLICTING in p or ORPHANED in p:
        continue
      if p in targets and p not in out:
        out[p] = commit
        if len(out) >= len(targets):
          return out
  return out

def git_last_commit(repo: str, rel_path: str) -> Optional[str]:
  # rel_path is a filesystem path (str)
  completed = run_git(["log", "-1", "--format=%H", "--", rel_path], repo)
  if completed.returncode != 0:
    return None
  sha = (completed.stdout or b"").decode("utf-8", errors="replace").strip()
  return sha or None

def get_l10n_source_commit(repo: str, rel_path: str) -> Optional[str]:
  # Read only the frontmatter portion to avoid loading full files when unnecessary.
  try:
    p = Path(repo) / rel_path
    with p.open("rb") as fh:
      head = fh.read(1024)  # read first 1KB
  except Exception:
    return None
  m = re.search(br"sourceCommit\s*:\s*['\"]?([0-9a-fA-F]{7,40})['\"]?", head)
  if not m:
    return None
  return m.group(1).decode("ascii")

def extract_logs(repo_path: str = "./content", lang: str = "en-us", out_file: Optional[str] = None) -> str:
  if out_file is None:
    out_file = f"history/logs-{lang}.txt"

  repo = repo_path
  repo_path_obj = Path(repo)
  if not repo_path_obj.exists():
    raise FileNotFoundError(f"repo path does not exist: {repo}")

  base_dir = repo_path_obj / "files" / lang
  index_files = find_index_files(base_dir, repo_path_obj)
  if not index_files:
    Path(out_file).write_text("", encoding="utf-8")
    return out_file

  # Work in bytes when parsing git output to reduce allocations.
  index_files_bytes = [f.encode('utf-8') for f in index_files]
  log_buffer = get_git_log_buffer(repo, lang)
  targets = set(index_files_bytes)
  latest_map = parse_git_log_buffer(log_buffer, targets)

  missing_bytes = [b for b in index_files_bytes if b not in latest_map]
  if missing_bytes:
    print(f"::debug::Computing commit hash for {len(missing_bytes)} missing files individually")
    def fetch_last(rel_path_bytes: bytes):
      rel = rel_path_bytes.decode('utf-8')
      return rel_path_bytes, git_last_commit(repo, rel)

    cpu = max(1, os.cpu_count() or 1)
    max_workers = min(32, len(missing_bytes), cpu * 2) or 1
    with ThreadPoolExecutor(max_workers=max_workers) as ex:
      for rel_path_bytes, val in ex.map(fetch_last, missing_bytes):
        if val:
          latest_map[rel_path_bytes] = val

  # Write output incrementally to avoid building a huge string in memory
  with open(out_file, 'w', encoding='utf-8') as out_f:
    for path in sorted(index_files, key=lambda p: p.replace('/index.md', '')):
      path_b = path.encode('utf-8')
      if lang == 'en-us':
        hash_val = latest_map.get(path_b) or git_last_commit(repo, path) or 'no_hash_commit'
      else:
        hash_val = get_l10n_source_commit(repo, path) or 'no_hash_commit'
      out_f.write(f"{path} {hash_val}\n")
  return out_file

def main(argv: Optional[List[str]] = None) -> int:
  parser = argparse.ArgumentParser(description="Extract MDN logs into a single file per locale")
  parser.add_argument("repo", nargs="?", default="./content")
  parser.add_argument("lang", nargs="?", default="en-us")
  args = parser.parse_args(argv)

  start = time.time()
  try:
    out = extract_logs(args.repo, args.lang)
    elapsed = time.time() - start
    print(f"::notice::Completed extract in {elapsed:.2f} seconds" if os.environ.get('GITHUB_ACTIONS')=='true' else f"Completed extract in {elapsed:.2f} seconds")
    print("Wrote", out)
    return 0
  except Exception as exc:
    elapsed = time.time() - start
    print(f"::error::Failed after {elapsed:.2f} seconds: {exc}" if os.environ.get('GITHUB_ACTIONS')=='true' else f"Failed after {elapsed:.2f} seconds: {exc}")
    return 2

if __name__ == "__main__":
  raise SystemExit(main())
