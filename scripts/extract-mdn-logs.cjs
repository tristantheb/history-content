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

const lines = files.map((filename) => {
  const gitCmd = `git log -1 --format="%ad" -- "${filename}"`;
  const date = execSync(gitCmd, { cwd: repoPath }).toString().trim();
  const relPath = path.relative(repoPath, filename).replace(/\\/g, '/');
  return `${date} ${relPath}`;
});

fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
console.log(`Created lang: ${outFile} (${lines.length} lines)`);
