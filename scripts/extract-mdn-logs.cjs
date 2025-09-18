// extract-mdn-logs.cjs
// Usage: node scripts/extract-mdn-logs.cjs <repoPath> <lang> <outFile>
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoPath = process.argv[2] || './content';
const lang = process.argv[3] || 'en-us';
const outFile = process.argv[4] || `l10n-${lang}.txt`;

const baseDir = path.join(repoPath, 'files', lang);

function getAllMdFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, dirent.name);
    if (dirent.isDirectory()) results = results.concat(getAllMdFiles(fp));
    else if (dirent.name === 'index.md') results.push(fp);
  }
  return results;
}

const BATCH_SIZE = 500;
const filesAbs = getAllMdFiles(baseDir);
const filesRel = filesAbs.map(f => path.relative(repoPath, f).replace(/\\/g, '/'));

function batch(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

const seen = new Map(); // file -> date
const dateFormat = "%a %b %d %H:%M:%S %Y %z";

for (const group of batch(filesRel, BATCH_SIZE)) {
  const gitCmd = `git log --date=format:'${dateFormat}' --format="%ad" --name-only -- ${group.map(f => `"${f}"`).join(' ')}`;
  let out = '';
  try {
    out = execSync(gitCmd, { cwd: repoPath, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  } catch {
    continue;
  }
  let currentDate = '';
  for (const rawLine of out.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^[A-Za-z]{3} [A-Za-z]{3} \d{2} \d{2}:\d{2}:\d{2} \d{4} [+-]\d{4}$/.test(line)) {
      currentDate = line;
      continue;
    }
    // line is a path
    const f = line;
    if (!seen.has(f) && group.includes(f)) {
      if (currentDate) seen.set(f, currentDate);
    }
  }
}

// sortie triée par chemin pour stabilité
const lines = Array.from(seen.entries())
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([f, d]) => `${d} ${f}`);

fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
console.log(`Created lang: ${outFile} (${lines.length} lines)`);
