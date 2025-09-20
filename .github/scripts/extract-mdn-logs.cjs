// extract-mdn-logs.cjs
// Usage: node scripts/extract-mdn-logs.cjs <repoPath> <lang> <outFile>
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoPath = process.argv[2] || './content';
const lang = process.argv[3] || 'en-us';
const outFile = process.argv[4] || `l10n-${lang}.txt`;
console.log(`Creating lang: ${outFile}`);

const dateFormat = '%a %b %d %H:%M:%S %Y %z';

function getAllIndexFiles(dir) {
  let out = [];
  if (!fs.existsSync(dir)) return out;
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, d.name);
    if (d.isDirectory()) {
      if (d.name === 'conflicting' || d.name === 'orphaned') continue;
      out = out.concat(getAllIndexFiles(fp));
    } else if (d.name === 'index.md') {
      out.push(fp);
    }
  }
  return out;
}

const baseDir = path.join(repoPath, 'files', lang);
const filesRel = getAllIndexFiles(baseDir).map(f => path.relative(repoPath, f).replace(/\\/g, '/'));
const targetSet = new Set(filesRel);

if (filesRel.length === 0) {
  fs.writeFileSync(outFile, '', 'utf8');
  console.log(`Created lang: ${outFile} (0 lines)`);
  process.exit(0);
}

const args = [
  '-C', repoPath,
  '-c', 'core.quotepath=off',
  'log',
  '--no-merges',
  '--no-renames',
  `--date=format:${dateFormat}`,
  '--format=%x1e%ad%x00',
  '--name-only',
  '-z',
  '--',
  `:(glob)files/${lang}/**/index.md`,
  `:(exclude,glob)files/${lang}/**/conflicting/**`,
  `:(exclude,glob)files/${lang}/**/orphaned/**`
];

const res = spawnSync('git', args, {
  stdio: ['ignore', 'pipe', 'pipe'],
  maxBuffer: 1024 * 1024 * 512,
  env: { ...process.env, LC_ALL: 'C', LANG: 'C' }
});
if (res.status !== 0) {
  const err = (res.stderr || Buffer.alloc(0)).toString().trim() || res.error?.message || 'git failed';
  throw new Error(`git log failed: ${err}`);
}

const buf = res.stdout;
const RS = 0x1e;
const latest = new Map();

let p = 0;
while (p < buf.length) {
  if (buf[p] !== RS) { p++; continue; }
  let i = p + 1;

  const nulDate = buf.indexOf(0x00, i);
  if (nulDate === -1) break;
  const date = buf.subarray(i, nulDate).toString().trimEnd();
  i = nulDate + 1;

  while (i < buf.length && buf[i] !== RS) {
    const nulFile = buf.indexOf(0x00, i);
    if (nulFile === -1) { i = buf.length; break; }
    const file = buf.subarray(i, nulFile).toString();
    if (file && targetSet.has(file) && !latest.has(file)) latest.set(file, `${date} ${file}`);
    i = nulFile + 1;
  }
  p = i;
}

const entries = filesRel
  .map(f => latest.has(f) ? { key: f.replace(/\/index\.md$/, ''), line: latest.get(f) } : null)
  .filter(Boolean)
  .sort((a, b) => a.key.localeCompare(b.key, 'en', { numeric: true }));

const lines = entries.map(e => e.line);

fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
console.log(`Created lang: ${outFile} (${lines.length} lines)`);
