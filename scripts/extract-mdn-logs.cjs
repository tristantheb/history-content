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
const tmpList = path.join(__dirname, 'tmp-md-files.txt');
fs.writeFileSync(tmpList, files.join('\n'), 'utf8');

// Utilise xargs pour paralléliser les appels git log
const gitCmd = `cat "${tmpList}" | xargs -P 8 -I {} git log -1 --format=\"%ad {}\" -- {}`;
const output = execSync(gitCmd, { cwd: repoPath, maxBuffer: 1024 * 1024 * 10 }).toString();
fs.unlinkSync(tmpList);

const lines = output
  .split('\n')
  .map(line => {
    const match = line.match(/^(.*?)\s+(.*index\.md)$/);
    if (!match) return null;
    const date = match[1].trim();
    const relPath = path.relative(repoPath, match[2]).replace(/\\/g, '/');
    return `${date} ${relPath}`;
  })
  .filter(Boolean);

fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
console.log(`Created lang: ${outFile} (${lines.length} lines)`);
