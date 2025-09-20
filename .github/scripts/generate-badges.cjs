// Helper pour échapper les caractères spéciaux HTML dans les textes SVG
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
// generate-badges.cjs
const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.resolve(__dirname, '../../history');

const lang = process.argv[2] || 'fr';
const logFile = path.join(LOGS_DIR, `logs-${lang}.txt`);
if (!fs.existsSync(logFile)) {
  console.error(`Log file not found: ${logFile}`);
  process.exit(1);
}
const log = fs.readFileSync(logFile, 'utf8');
const enLogFile = path.join(LOGS_DIR, 'logs-en-us.txt');
const enLog = fs.existsSync(enLogFile) ? fs.readFileSync(enLogFile, 'utf8') : '';

const OUT_DIR = path.resolve(__dirname, `../public/badges/${lang}`);

function parseLogDate(entry) {
  if (!entry) return null;
  const match = entry.match(/^(.*) files\//);
  if (!match) return null;
  const raw = match[1].trim();
  const parts = raw.split(' ');
  if (parts.length < 6) return null;
  const dateStr = parts.slice(1, 5).join(' ');
  return new Date(dateStr);
}

function extractRawDate(entry) {
  if (!entry) return '';
  const match = entry.match(/^(.*) files\//);
  return match ? match[1].trim() : '';
}

function formatDateString(raw) {
  if (!raw) return '';
  const parts = raw.split(' ');
  if (parts.length < 6) return raw;
  const monthMap = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' };
  const day = parts[2];
  const month = monthMap[parts[1]] || parts[1];
  const year = parts[4];
  const time = parts[3].slice(0, 5);
  return `${month} ${day}, ${year} at ${time}`;
}


function slugToCategory(s) {
  if (s === 'accessibility') return 'Accessibility';
  if (s === 'api') return 'API';
  if (s === 'css') return 'CSS';
  if (s === 'games') return 'Games';
  if (s === 'glossary') return 'Glossary';
  if (s === 'html') return 'HTML';
  if (s === 'http') return 'HTTP';
  if (s === 'javascript') return 'JavaScript';
  if (s === 'learn_web_development') return 'Learn Dev';
  if (s === 'mathml') return 'MathML';
  if (s === 'mdn') return '(MDN)';
  if (s === 'media') return 'Media';
  if (s === 'mozilla') return 'Mozilla';
  if (s === 'performance') return 'Performance';
  if (s === 'privacy') return 'Privacy';
  if (s === 'progressive_web_apps') return 'PWA';
  if (s === 'security') return 'Security';
  if (s === 'svg') return 'SVG';
  if (s === 'uri') return 'URI';
  if (s === 'webassembly') return 'WebAssembly';
  if (s === 'webdriver') return 'WebDriver';
  if (s === 'xml') return 'XML';
  return s ? s[0].toUpperCase() + s.slice(1) : 'Web';
}

function middleTruncate(s, max) {
  return s.length <= max ? s : `${s.slice(0, Math.ceil(max / 2) - 1)}…${s.slice(-Math.floor(max / 2) + 1)}`;
}

function statusToSVG({ color, pageName, category, dateOrigStr, dateLocaStr }) {
  const fg = '#e5e7eb';
  const bg = '#0b1220';
  const stroke = '#1f2a44';
  const muted = '#9aa4b2';

  const status = {
    unknown: { fg: '#e5e7eb', bg: '#2a3347', ring: '#3a4764', glyph: '?' },
    green: { fg: 'oklch(87.1% .15 154.449)', bg: 'oklch(39.3% .095 152.535)', ring: 'oklch(87.1% .15 154.449)', glyph: 'check' },
    yellow: { fg: 'oklch(90.5% .182 98.111)', bg: 'oklch(42.1% .095 57.708)', ring: 'oklch(90.5% .182 98.111)', glyph: 'warn' },
    red: { fg: 'oklch(70.4% .191 22.216)', bg: 'oklch(39.6% .141 25.723)', ring: 'oklch(70.4% .191 22.216)', glyph: 'x' },
    gray: { fg: '#cbd5e1', bg: '#334155', ring: '#94a3b8', glyph: '—' },
  }[color] || { fg: '#e5e7eb', bg: '#2a3347', ring: '#3a4764', glyph: '?' };

  const font = 'font-family="-apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Helvetica Neue, Arial, Noto Sans, sans-serif"';

  const totalW = 420;
  const h = 28;
  const cy = h / 2;
  const gap = 8;

  const leftLabelW = 40;
  const categoryW = 70;
  const iconW = 28;

  // Date formatting
  const dateShort = dateLocaStr ? dateLocaStr : (dateOrigStr ? 'never' : 'removed');

  // Calculate positions
  const xCat = leftLabelW + gap;
  const xTitle = xCat + categoryW + gap;
  const xDate = totalW - iconW - gap;
  const titleMaxW = xDate - gap - xTitle;
  const shownTitle = middleTruncate(pageName, Math.floor(titleMaxW / 7));

  const iconCx = totalW - iconW / 2 - 4;
  const iconCy = cy;
  const rOuter = 10;
  const rInner = 9;

  // Icon rendering
  let iconPath = '';
  if (status.glyph === 'check') {
    iconPath = `<path d="M ${iconCx - 5} ${iconCy} l3 3 l7 -7" fill="none" stroke="${status.fg}" stroke-width="2" stroke-linecap="round" />`;
  } else if (status.glyph === 'warn') {
    iconPath = `<path d="M${iconCx} ${iconCy - 6} v6" fill="none" stroke="${status.fg}" stroke-width="2" stroke-linecap="round" />\n            <circle cx="${iconCx}" cy="${iconCy + 5}" r="1.3" fill="${status.fg}"/>`;
  } else if (status.glyph === 'x') {
    iconPath = `<path d="M${iconCx - 4} ${iconCy - 4} l8 8 M${iconCx + 4} ${iconCy - 4} l-8 8" fill="none" stroke="${status.fg}" stroke-width="2" stroke-linecap="round" />`;
  } else {
    iconPath = `<text x="${iconCx}" y="${iconCy}" font-size="10" ${font} font-weight="700" fill="${status.fg}" text-anchor="middle" dominant-baseline="middle">${status.glyph}</text>`;
  }

  // SVG rendering
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${h}" viewBox="0 0 ${totalW} ${h}" role="img">
    <rect x="0.5" y="0.5" width="${totalW - 1}" height="${h - 1}" rx="6" fill="${bg}" stroke="${stroke}" />
    <rect x="0" y="0" width="${leftLabelW}" height="${h}" rx="6" fill="#111827"/>
    <text x="8" y="${cy}" font-size="12" ${font} font-weight="700" fill="${fg}" dominant-baseline="middle" text-anchor="start">MDN</text>
    <text x="${xCat}" y="${cy}" font-size="12" ${font} font-weight="600" fill="${fg}" dominant-baseline="middle" text-anchor="start">${escapeHTML(category)}</text>
    <text x="${xTitle}" y="${cy}" font-size="12" ${font} font-weight="600" fill="${fg}" dominant-baseline="middle" text-anchor="start">${escapeHTML(shownTitle)}</text>
    <text x="${xDate}" y="${cy}" font-size="10" ${font} font-weight="500" fill="${muted}" dominant-baseline="middle" text-anchor="end">${escapeHTML(dateShort)}</text>
    <g>
      <circle cx="${iconCx}" cy="${iconCy}" r="${rOuter}" fill="${status.bg}" stroke="${status.ring}" stroke-width="1.5" />
      <circle cx="${iconCx}" cy="${iconCy}" r="${rInner}" fill="${status.bg}" stroke="${status.ring}" stroke-width="1" />
      ${iconPath}
    </g>
  </svg>`;
}

function writeTwitterCardHtml({ lang, slug, pageName, svgUrl }) {
  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <title>MDN Badge: ${pageName}</title>
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="MDN Badge: ${pageName}">
  <meta name="twitter:description" content="Statut de la page MDN ${pageName}">
  <meta name="twitter:image" content="${svgUrl}">
  <meta name="twitter:url" content="https://tristantheb.github.io/history-content/badges/${lang}/${slug}.html">
</head>
<body>
  <img src="${svgUrl}" alt="MDN Badge ${pageName}">
</body>
</html>`;
  const outPath = path.join(OUT_DIR, slug + '.html');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function getEntries(log) {
  return (log.match(/^(.*\.md)$/gm) || []).filter(e => !/\/conflicting\//.test(e) && !/\/orphaned\//.test(e));
}
const entries = getEntries(log);
const enEntries = getEntries(enLog);


for (const entry of entries) {
  const match = entry.match(/(files\/.*)/);
  if (!match) continue;
  const pageKey = match[1];
  let color = 'unknown', dateOrigStr = '', dateLocaStr = '';
  // Find original entry in enLog
  const origEntry = enEntries.find(e => {
    const m = e.match(/(files\/.*)/);
    return m && m[1].toLowerCase() === pageKey.toLowerCase().replace(/^files\/fr\//, 'files/en-us/');
  });
  const locaEntry = entry;
  // Category and title extraction
  const parts = pageKey.replace(/\/index\.md$/i, '').split('/').filter(Boolean);
  const root = parts[0]?.toLowerCase() === 'web' ? (parts[1]?.toLowerCase() || '') : (parts[0]?.toLowerCase() || '');
  const category = slugToCategory(root);
  const titleText = parts.slice(root === parts[0] ? 1 : 2).join(' / ') || root;

  dateOrigStr = formatDateString(extractRawDate(origEntry));
  dateLocaStr = formatDateString(extractRawDate(locaEntry));
  if (!origEntry) {
    color = 'gray';
  } else if (!locaEntry) {
    color = 'red';
  } else {
    const d1 = parseLogDate(origEntry);
    const d2 = parseLogDate(locaEntry);
    if (d1 && d2 && d2 > d1) {
      color = 'green';
    } else {
      color = 'yellow';
    }
  }
  // Slugify page for filename
  const slug = pageKey.replace(new RegExp(`^files/${lang}/`), '').replace(/\/index\.md$/, '');
  const svg = statusToSVG({ color, pageName: titleText, category, dateOrigStr, dateLocaStr });
  const svgUrl = `https://tristantheb.github.io/history-content/badges/${lang}/${slug}.svg`;
  writeTwitterCardHtml({ lang, slug, pageName: titleText, svgUrl });
  const outPath = path.join(OUT_DIR, slug + '.svg');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, svg, 'utf8');

  // Log elements in CI console
  console.log('Generated badge:', path.join(lang, slug + '.svg'));
}
