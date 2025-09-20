// extract-mdn-logs.cjs
// Usage: node scripts/extract-mdn-logs.cjs <repoPath> <lang> <outFile>
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoPath = process.argv[2] || './content';
const lang = process.argv[3] || 'en-us';
const outFile = process.argv[4] || `l10n-${lang}.txt`;
const DATE_FORMAT = '%a %b %d %H:%M:%S %Y %z';
const RS = 0x1e;

main();

function main() {
  console.log(`Creating lang: ${outFile}`);
  ensureFullHistory(repoPath);

  // Collect targets: files/<lang>/**/index.md excluding conflicting/orphaned
  const baseDir = path.join(repoPath, 'files', lang);
  const filesRel = listIndexFiles(baseDir).map(f =>
    path.relative(repoPath, f).replace(/\\/g, '/')
  );

  if (filesRel.length === 0) {
    writeLines(outFile, []);
    return;
  }

  // Pass 1: single log over the subtree, newest→oldest
  const buf = getLogBuffer(repoPath, lang);
  const targets = new Set(filesRel);
  const latest = pickLastTouches(buf, targets);

  // Pass 2 (fallback): for misses only, ask git per file (fast enough for few)
  const missing = filesRel.filter(f => !latest.has(f));
  if (missing.length) {
    for (const f of missing) {
      const d = lastTouchOne(repoPath, f);
      if (d) latest.set(f, `${d} ${f}`);
    }
  }

  // Build output sorted by path without '/index.md'
  const rows = filesRel.map(f => ({
    key: f.replace(/\/index\.md$/, ''),
    path: f
  })).sort((a, b) => a.key.localeCompare(b.key, 'en', { numeric: true }));

  const lines = rows.map(r => latest.get(r.path) ?? `N/A ${r.path}`);

  writeLines(outFile, lines);
}

function listIndexFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, d.name);
    if (d.isDirectory()) {
      if (d.name === 'conflicting' || d.name === 'orphaned') continue;
      out.push(...listIndexFiles(fp));
    } else if (d.name === 'index.md') {
      out.push(fp);
    }
  }
  return out;
}

// One subtree log. No diff-filter. Includes merges that actually touch files.
function getLogBuffer(repo, lang) {
  const common = [
    '-C', repo,
    '-c', 'core.quotepath=off',
    'log',
    '-m',
    '--no-renames',
    `--date=format:${DATE_FORMAT}`,
    '--format=%x1e%ad%x00',
    '--name-only',
    '-z',
    '--'
  ];

  // Prefer glob pathspec; fallback to plain directory if empty/unsupported
  let res = git([
    ...common,
    `:(glob)files/${lang}/**/index.md`,
    `:(exclude,glob)files/${lang}/**/conflicting/**`,
    `:(exclude,glob)files/${lang}/**/orphaned/**`
  ]);
  if (!ok(res) || !res.stdout?.length) {
    res = git([...common, `files/${lang}`]);
  }
  if (!ok(res)) throw new Error(stderr(res) || 'git log failed');
  return res.stdout;
}

// Parse newest→oldest; first time we see a target = its last-touch date.
function pickLastTouches(buf, targets) {
  const out = new Map();
  let p = 0;
  while (p < buf.length && out.size < targets.size) {
    if (buf[p] !== RS) { p++; continue; }
    let i = p + 1;

    const nulDate = buf.indexOf(0x00, i);
    if (nulDate === -1) break;
    const date = buf.subarray(i, nulDate).toString().trimEnd();
    i = nulDate + 1;

    while (i < buf.length && buf[i] !== RS && out.size < targets.size) {
      const nulFile = buf.indexOf(0x00, i);
      if (nulFile === -1) { i = buf.length; break; }
      const file = buf.subarray(i, nulFile).toString();
      i = nulFile + 1;

      if (!file.endsWith('/index.md')) continue;
      if (file.includes('/conflicting/') || file.includes('/orphaned/')) continue;
      if (!targets.has(file)) continue;
      if (!out.has(file)) out.set(file, `${date} ${file}`);
    }
    p = i;
  }
  return out;
}

// Fallback for a single file: last commit date touching this path, merges included.
function lastTouchOne(repo, relPath) {
  const res = git([
    '-C', repo,
    'log',
    '-1',
    '-m',
    `--date=format:${DATE_FORMAT}`,
    '--format=%ad',
    '--',
    relPath
  ]);
  if (!ok(res)) return null;
  const s = String(res.stdout || '').trim();
  return s || null;
}

// CI shallow clone guard
function ensureFullHistory(repo) {
  const r = git(['-C', repo, 'rev-parse', '--is-shallow-repository']);
  if (ok(r) && String(r.stdout).trim() === 'true') {
    let f = git(['-C', repo, 'fetch', '--unshallow', '--tags']);
    if (!ok(f)) git(['-C', repo, 'fetch', '--depth=2147483647', '--tags']);
  }
}

function git(args) {
  return spawnSync('git', args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 1024 * 1024 * 512,
    env: { ...process.env, LC_ALL: 'C', LANG: 'C' }
  });
}
function ok(r) { return r && r.status === 0; }
function stderr(r) { return String((r.stderr || '')).trim(); }
function writeLines(file, lines) {
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log(`Created lang: ${file} (${lines.length} lines)`);
}
