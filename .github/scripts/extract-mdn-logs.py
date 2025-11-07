#!/usr/bin/env python3
"""
Usage: python .github/scripts/extract-mdn-logs.py [repo_path] [lang] [out_file]
Default: ./content en-us
"""
from __future__ import annotations
import os
import argparse
import concurrent.futures
import logging
import shutil
import subprocess
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Set

RECORD_SEPARATOR = 0x1E
GIT_DATE_FORMAT = "%a %b %d %H:%M:%S %Y %z"

def check_git_available() -> None:
  if shutil.which("git") is None:
    raise RuntimeError("git is not available on PATH")

def git_run(argv: Iterable[str], repo: str) -> subprocess.CompletedProcess[bytes]:
  return subprocess.run(["git", "-C", repo, *argv], capture_output=True)

def ensure_full_git_history(repo: str) -> None:
  proc = git_run(["rev-parse", "--is-shallow-repository"], repo)
  if proc.returncode != 0:
    logging.debug("Could not determine shallow state; continuing")
    return
  if proc.stdout.strip() == b"true":
    logging.info("Repo is shallow; attempting to unshallow")
    fetch_proc = git_run(["fetch", "--unshallow", "--tags"], repo)
    if fetch_proc.returncode != 0:
      git_run(["fetch", "--depth=2147483647", "--tags"], repo)

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
    s = str(rel).replace("\\", "/")
    s = s.lstrip("./")
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
    f"--date=format:{GIT_DATE_FORMAT}",
    "--format=%x1e%ad%x00%H%x00",
    "--name-only",
    "-z",
    "--",
  ]

  args = [*common,
      f":(glob)files/{lang}/**/index.md",
      f":(exclude,glob)files/{lang}/**/conflicting/**",
      f":(exclude,glob)files/{lang}/**/orphaned/**"]
  completed = git_run(args, repo)
  if completed.returncode != 0 or not completed.stdout:
    completed = git_run([*common, f"files/{lang}"], repo)
  if completed.returncode != 0:
    stderr = (completed.stderr or b"").decode("utf-8", errors="replace")
    raise RuntimeError(f"git log failed: {stderr}")
  return completed.stdout

def parse_git_log_buffer(buffer: bytes, targets: Set[str]) -> Dict[str, str]:
  out: Dict[str, str] = {}
  position = 0
  buffer_len = len(buffer)
  while position < buffer_len and len(out) < len(targets):
    if buffer[position] != RECORD_SEPARATOR:
      position += 1
      continue
    cursor = position + 1
    nul_date_idx = buffer.find(b"\x00", cursor)
    if nul_date_idx == -1:
      break
    date = buffer[cursor:nul_date_idx].decode("utf-8", errors="replace").strip()
    cursor = nul_date_idx + 1
    # read commit hash (NUL-terminated)
    nul_hash_idx = buffer.find(b"\x00", cursor)
    if nul_hash_idx == -1:
      break
    commit_hash = buffer[cursor:nul_hash_idx].decode("utf-8", errors="replace").strip()
    cursor = nul_hash_idx + 1
    while cursor < buffer_len and buffer[cursor] != RECORD_SEPARATOR and len(out) < len(targets):
      nul_file_idx = buffer.find(b"\x00", cursor)
      if nul_file_idx == -1:
        cursor = buffer_len
        break
      file_path = buffer[cursor:nul_file_idx].decode("utf-8", errors="replace")
      file_path = file_path.replace("\\", "/")
      if file_path.startswith("./"):
        file_path = file_path[2:]
      cursor = nul_file_idx + 1
      if not file_path.endswith("/index.md"):
        continue
      if "/conflicting/" in file_path or "/orphaned/" in file_path:
        continue
      if file_path not in targets:
        continue
      if file_path not in out:
        out[file_path] = f"{date}\t{commit_hash}"
    position = cursor
  return out

def git_last_touch(repo: str, rel_path: str) -> Optional[str]:
  completed = git_run(["log", "-1", "-m", "--follow", f"--date=format:{GIT_DATE_FORMAT}", "--format=%ad", "--", rel_path], repo)
  if completed.returncode != 0:
    return None
  date_str = (completed.stdout or b"").decode("utf-8", errors="replace").strip()
  return date_str or None

def git_last_commit(repo: str, rel_path: str) -> Optional[str]:
  """Return full commit hash for the last commit touching rel_path (follow renames)."""
  completed = git_run(["log", "-1", "-m", "--follow", "--format=%H", "--", rel_path], repo)
  if completed.returncode != 0:
    return None
  sha = (completed.stdout or b"").decode("utf-8", errors="replace").strip()
  return sha or None

def get_l10n_source_commit(repo: str, rel_path: str) -> Optional[str]:
  """Parse the file at rel_path in the repo and extract l10n.sourceCommit from YAML frontmatter if present."""
  try:
    p = Path(repo) / rel_path
    text = p.read_text(encoding="utf-8")
  except Exception:
    return None
  # Extract YAML frontmatter
  import re
  fm = re.match(r"\s*---\s*\n(.*?)\n---", text, re.S)
  if not fm:
    return None
  front = fm.group(1)
  m = re.search(r"sourceCommit\s*:\s*['\"]?([0-9a-fA-F]{7,40})['\"]?", front)
  if m:
    return m.group(1)
  return None

def extract_logs(repo_path: str = "./content", lang: str = "en-us", out_file: Optional[str] = None) -> str:
  if out_file is None:
    out_file = f"logs-{lang}.txt"

  repo = repo_path
  repo_path_obj = Path(repo)
  if not repo_path_obj.exists():
    raise FileNotFoundError(f"repo path does not exist: {repo}")

  ensure_full_git_history(repo)

  base_dir = repo_path_obj / "files" / lang
  index_files = find_index_files(base_dir, repo_path_obj)
  if not index_files:
    Path(out_file).write_text("", encoding="utf-8")
    return out_file

  log_buffer = get_git_log_buffer(repo, lang)
  targets = set([p.replace("\\", "/").lstrip("./") for p in index_files])
  latest_map = parse_git_log_buffer(log_buffer, targets)

  missing = [f for f in index_files if f not in latest_map]
  if missing:
    logging.info("Computing last-touch for %d missing files individually", len(missing))
    def fetch_last(rel_path: str):
      try:
        last_date = git_last_touch(repo, rel_path)
        last_commit = git_last_commit(repo, rel_path)
        if last_date:
          return rel_path, f"{last_date}\t{last_commit or ''}"
      except Exception:
        return rel_path, None
      return rel_path, None

    max_workers = min(32, len(missing)) or 1
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as ex:
      for rel_path, val in ex.map(fetch_last, missing):
        if val:
          latest_map[rel_path] = val

  out_lines: List[str] = []
  # Build output lines: <date> <path> <hash>
  for path in sorted(index_files, key=lambda p: p.replace('/index.md', '')):
    val = latest_map.get(path)
    date_str = None
    sha_from_log: Optional[str] = None
    if val:
      parts = val.split('\t')
      date_str = parts[0] if parts else None
      if len(parts) > 1:
        sha_from_log = parts[1] or None

    date = date_str or 'N/A'

    if lang == 'en-us':
      # prefer the sha obtained from the initial git log; fallback to git_last_commit
      hash_val = sha_from_log or git_last_commit(repo, path) or 'no_hash_commit'
    else:
      # translations: use l10n.sourceCommit when present
      l10n_hash = get_l10n_source_commit(repo, path)
      hash_val = l10n_hash or 'no_hash_commit'

    out_lines.append(f"{date} {path} {hash_val}")

  Path(out_file).write_text("\n".join(out_lines), encoding="utf-8")
  return out_file

def main(argv: Optional[List[str]] = None) -> int:
  parser = argparse.ArgumentParser(description="Extract MDN logs into a single file per locale")
  parser.add_argument("repo", nargs="?", default="./content")
  parser.add_argument("lang", nargs="?", default="en-us")
  args = parser.parse_args(argv)

  logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

  try:
    check_git_available()
    out = extract_logs(args.repo, args.lang)
    print("Wrote", out)
    return 0
  except Exception as exc:
    logging.error(str(exc))
    return 2

if __name__ == "__main__":
  raise SystemExit(main())
