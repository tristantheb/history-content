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
    "-m",
    "--format=%x1e%H%x00",
    "--name-only",
    "-z",
    "--",
  ]

  proc = run_git([*common, f"files/{lang}"], repo)
  if proc.returncode != 0 or not proc.stdout:
    proc = run_git([
      *common,
      f":(glob)files/{lang}/**/index.md",
      f":(exclude,glob)files/{lang}/**/conflicting/**",
      f":(exclude,glob)files/{lang}/**/orphaned/**",
    ], repo)
  if proc.returncode != 0:
    stderr = (proc.stderr or b"").decode("utf-8", errors="replace")
    raise RuntimeError(f"git log failed: {stderr}")
  return proc.stdout

def parse_git_log_buffer(buffer: bytes, targets: Set[str]) -> Dict[str, str]:
  out: Dict[str, str] = {}
  if not buffer:
    return out
  # records are separated by ASCII 0x1E, each record: <hash>\0<file>\0<file>\0...
  for rec in buffer.split(RECORD_SEPARATOR):
    if not rec:
      continue
    parts = rec.split(b"\x00")
    if len(parts) < 2:
      continue
    commit = parts[0].decode("utf-8", errors="replace").strip()
    if not commit:
      continue
    for raw in parts[1:]:
      if not raw:
        continue
      path = raw.decode("utf-8", errors="replace").replace("\\", "/").lstrip("./")
      if not path.endswith("/index.md"):
        continue
      if "/conflicting/" in path or "/orphaned/" in path:
        continue
      if path in targets and path not in out:
        out[path] = commit
        if len(out) >= len(targets):
          return out
  return out

def git_last_commit(repo: str, rel_path: str) -> Optional[str]:
  proc = run_git(["log", "-1", "-m", "--follow", "--format=%H", "--", rel_path], repo)
  if proc.returncode != 0:
    return None
  sha = (proc.stdout or b"").decode("utf-8", errors="replace").strip()
  return sha or None

def get_l10n_source_commit(repo: str, rel_path: str) -> Optional[str]:
  try:
    text = (Path(repo) / rel_path).read_text(encoding="utf-8")
  except Exception:
    return None
  m = re.search(r"sourceCommit\s*:\s*['\"]?([0-9a-fA-F]{7,40})['\"]?", text)
  return m.group(1) if m else None

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

  buf = get_git_log_buffer(repo, lang)
  targets = set(index_files)
  latest_map = parse_git_log_buffer(buf, targets)

  missing = [f for f in index_files if f not in latest_map]
  if missing:
    print(f"::debug::Computing commit hash for {len(missing)} missing files individually")
    def fetch_last(rel_path: str):
      return rel_path, git_last_commit(repo, rel_path)

    cpu = max(1, os.cpu_count() or 1)
    max_workers = min(32, len(missing), cpu * 2) or 1
    with ThreadPoolExecutor(max_workers=max_workers) as ex:
      for rel_path, val in ex.map(fetch_last, missing):
        if val:
          latest_map[rel_path] = val

  out_lines: List[str] = []
  for path in sorted(index_files, key=lambda p: p.replace('/index.md', '')):
    if lang == 'en-us':
      hash_val = latest_map.get(path) or git_last_commit(repo, path) or 'no_hash_commit'
    else:
      hash_val = get_l10n_source_commit(repo, path) or 'no_hash_commit'
    out_lines.append(f"{path} {hash_val}")

  Path(out_file).write_text("\n".join(out_lines), encoding="utf-8")
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
