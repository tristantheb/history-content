#!/usr/bin/env python3
"""
Usage: python .github/scripts/extract-mdn-logs.py [repo_path] [lang] [out_file]
Default: ./content en-us logs-en-us.txt
"""
from __future__ import annotations
import argparse
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
      rel = p
    s = str(rel).replace("\\", "/")
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
    "--no-renames",
    f"--date=format:{GIT_DATE_FORMAT}",
    "--format=%x1e%ad%x00",
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
    while cursor < buffer_len and buffer[cursor] != RECORD_SEPARATOR and len(out) < len(targets):
      nul_file_idx = buffer.find(b"\x00", cursor)
      if nul_file_idx == -1:
        cursor = buffer_len
        break
      file_path = buffer[cursor:nul_file_idx].decode("utf-8", errors="replace")
      cursor = nul_file_idx + 1
      if not file_path.endswith("/index.md"):
        continue
      if "/conflicting/" in file_path or "/orphaned/" in file_path:
        continue
      if file_path not in targets:
        continue
      if file_path not in out:
        out[file_path] = f"{date} {file_path}"
    position = cursor
  return out


def git_last_touch(repo: str, rel_path: str) -> Optional[str]:
  completed = git_run(["log", "-1", "-m", f"--date=format:{GIT_DATE_FORMAT}", "--format=%ad", "--", rel_path], repo)
  if completed.returncode != 0:
    return None
  date_str = (completed.stdout or b"").decode("utf-8", errors="replace").strip()
  return date_str or None


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
  targets = set(index_files)
  latest_map = parse_git_log_buffer(log_buffer, targets)

  missing = [f for f in index_files if f not in latest_map]
  if missing:
    logging.info("Computing last-touch for %d missing files individually", len(missing))
    for rel_path in missing:
      last_date = git_last_touch(repo, rel_path)
      if last_date:
        latest_map[rel_path] = f"{last_date} {rel_path}"

  row_list = [{"key": path.replace("/index.md", ""), "path": path} for path in index_files]

  try:
    import pandas as pd
    dataframe = pd.DataFrame(row_list)
    dataframe["date_line"] = dataframe["path"].map(lambda p: latest_map.get(p, f"N/A {p}"))
    dataframe = dataframe.sort_values("key")
    out_lines = dataframe["date_line"].tolist()
  except Exception:
    row_list.sort(key=lambda r: r["key"])
    out_lines = [latest_map.get(row["path"], f"N/A {row['path']}") for row in row_list]

  Path(out_file).write_text("\n".join(out_lines), encoding="utf-8")
  return out_file


def main(argv: Optional[List[str]] = None) -> int:
  parser = argparse.ArgumentParser(description="Extract MDN logs into a single file per locale")
  parser.add_argument("repo", nargs="?", default="./content")
  parser.add_argument("lang", nargs="?", default="en-us")
  parser.add_argument("out", nargs="?", default=None)
  args = parser.parse_args(argv)

  logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

  try:
    check_git_available()
    out = extract_logs(args.repo, args.lang, args.out)
    print("Wrote", out)
    return 0
  except Exception as exc:
    logging.error(str(exc))
    return 2


if __name__ == "__main__":
  raise SystemExit(main())
