#!/usr/bin/env python3
"""
Usage: python .github/scripts/extract-mdn-logs.py [repo_path] [lang]
Default: ./content en-us
"""
import os
import sys
import re
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Iterable, List, Optional


DEFAULT_CATEGORIES_FILE = "/data/categories.csv"
DEFAULT_FOLDER = "./content"
DEFAULT_LANG = "en-us"
DEFAULT_OUT_FILE_TEMPLATE = "history/logs-{}.csv"
categories = []


def _run_git(argv: Iterable[str], repo: str) -> subprocess.CompletedProcess[bytes]:
  return subprocess.run(["git", "-C", repo, *argv], capture_output=True)


def _reduce_path(data: str) -> str:
  # Remove the files/<lang> from the path and the /index.md
  return re.sub(r"^files/[^/]+/(.+)/index\.md$", r"\1", data)


def _loading_categories() -> None:
  global categories
  try:
    with open(
      os.path.dirname(__file__)+DEFAULT_CATEGORIES_FILE,
      "r",
      encoding="utf-8"
    ) as file:
      categories = [line.strip() for line in file if line.strip()]
  except Exception as e:
    print(f"::error::Failed to load categories: {e}")
    exit(1)


# Get the last commit for each index.md file in the english repository.
def get_last_commit(repo: str, lang: str) -> Optional[List[str]]:
  completed = _run_git(["ls-files", f"files/{lang}/**/index.md"], repo)

  if completed.returncode != 0:
    return None

  files = (completed.stdout or b"").decode("utf-8", errors="replace").strip().splitlines()
  results: List[str] = []

  print(f"Found {len(files)} files in {lang} locale, retrieving last commits...")

  max_workers = min(32, (len(files) or 1))
  with ThreadPoolExecutor(max_workers=max_workers) as executor:
    futures = {executor.submit(_run_git, ["log", "-1", "--format=%H", "--", f], repo): f for f in files}
    for fut in as_completed(futures):
      path = futures[fut]
      content = fut.result()

      arrCat: List[str] = []
      for cat in categories:
        if re.search(cat.split(",")[0], path):
          arrCat.append(cat.split(",")[1])
      
      if [] == arrCat:
        arrCat.append("Other")

      if content.returncode != 0:
        continue

      sha = (content.stdout or b"").decode("utf-8", errors="replace").strip()
      results.append(f"{_reduce_path(path)},{sha},{'|'.join(arrCat)}")

  return results or None


# Retrieve the source commit in the frontmatter of the locale.
def get_l10n_source_commit(repo: str, lang: str) -> Optional[List[str]]:
  completed = _run_git([
    "ls-files",
    f"files/{lang}/**/index.md",
    f":(exclude,glob)files/{lang}/conflicting/**",
    f":(exclude,glob)files/{lang}/orphaned/**"
  ], repo)

  if completed.returncode != 0:
    return None

  files = (completed.stdout or b"").decode("utf-8", errors="replace").strip().splitlines()
  results: List[str] = []

  print(f"Found {len(files)} files in {lang} locale, retrieving last commits...")

  max_workers = min(32, (len(files) or 1))
  with ThreadPoolExecutor(max_workers=max_workers) as executor:
    futures = {executor.submit(_run_git, ["log", "-1", "--format=%H", "--", f], repo): f for f in files}
    for fut in as_completed(futures):
      path = futures[fut].strip()
      try:
        p = Path(repo) / path
        with p.open("rb") as fh:
          head = fh.read(1024)  # read first 1KB
      except Exception:
        return None
      sha = re.search(br"sourceCommit\s*:\s*['\"]?([0-9a-fA-F]{7,40})['\"]?", head)
      sha = sha.group(1).decode('ascii') if sha else 'no_hash_commit'
      results.append(f"{_reduce_path(path)},{sha}")

  return results or None


# Write the output to a csv file with the format "Path,SourceCommit".
def write_csv_file(out_file: str, data: List[str], others: str = "") -> None:
  with open(out_file, 'w', encoding='utf-8') as out_f:
    out_f.write(f"Path,SourceCommit{others}\n")
    for line in data:
      out_f.write(f"{line}\n")


# Get repo path and locale from Github workflow and return a number of readed files.
def main(argv: Optional[List[str]] = None) -> None:
  # Log time
  start = time.time()

  # Inits
  _loading_categories()

  if argv is None:
    exit(1)

  # Getting arguments from the command.
  repo = argv[0] if len(argv) > 0 else DEFAULT_FOLDER
  lang = argv[1] if len(argv) > 1 else DEFAULT_LANG

  if lang == "en-us":
    content = get_last_commit(repo, lang)
    elapsed = time.time() - start
    if content is None:
      print(f"::error::Failed after {elapsed:.2f} seconds, en-us file is empty !")
      exit(1)
    write_csv_file(DEFAULT_OUT_FILE_TEMPLATE.format(lang), content, ",Categories")
  elif lang:
    content = get_l10n_source_commit(repo, lang)
    elapsed = time.time() - start
    if content is None:
      print(f"::error::Failed after {elapsed:.2f} seconds, {lang} file is empty !")
      exit(1)
    write_csv_file(DEFAULT_OUT_FILE_TEMPLATE.format(lang), content)
  else:
    elapsed = time.time() - start
    print(f"::error::Failed after {elapsed:.2f} seconds, {lang} does not exist !")
    exit(1)

  print(f"::notice::Finished after {elapsed:.2f} seconds, logs-{lang}.csv is ready !")
  exit(0)


if __name__ == "__main__":
  raise SystemExit(main(sys.argv[1:]))
