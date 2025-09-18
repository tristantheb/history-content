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
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of list) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(getAllMdFiles(filePath));
    } else if (file.name === 'index.md') {
      results.push(filePath);
    }
  }
  return results;
}

const files = getAllMdFiles(baseDir);


function batch(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

const batchSize = 100;
let lines = [];
for (const group of batch(files, batchSize)) {
  const quotedFiles = group.map(f => `"${f}"`).join(' ');
  const gitCmd = `git log -1 --format="%ad %f" -- ${quotedFiles}`;
  const output = execSync(gitCmd, { cwd: repoPath }).toString().trim();

  const outLines = output.split('\n').filter(Boolean);
  for (let i = 0; i < outLines.length; i++) {
    // On suppose que l'ordre de sortie correspond à l'ordre des fichiers
    const date = outLines[i].split(' ')[0];
    const relPath = path.relative(repoPath, group[i]).replace(/\\/g, '/');
    lines.push(`${date} ${relPath}`);
  }
}

fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
console.log(`Created lang: ${outFile} (${lines.length} lines)`);
