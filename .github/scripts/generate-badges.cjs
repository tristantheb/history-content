// generate-badges.cjs
'use strict';

const fs = require('fs');
const path = require('path');

// ——— Utils ————————————————————————————————————————————————————————————————

/** Strict sanitization for slug/lang: keeps only [a-zA-Z0-9_-/] */
function sanitizeHash(str) {
  return String(str || '').replace(/[^a-zA-Z0-9_\-\/]/g, '');
}

/** Escape HTML for text nodes in SVG/HTML */
function escapeHTML(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Parse log line, return { raw, date, formatted } */
function parseLogMeta(entry) {
  if (!entry) return { raw: '', date: null, formatted: '' };
  const m = entry.match(/^(.*) files\//);
  if (!m) return { raw: '', date: null, formatted: '' };

  const raw = m[1].trim();
  const parts = raw.split(' ');
  if (parts.length < 6) return { raw, date: null, formatted: raw };

  // Example tokens: [DayOfWeek, Mon, DD, HH:MM:SS, YYYY, TZ]
  const monthMap = {
    Jan: 'Jan', Feb: 'Feb', Mar: 'Mar', Apr: 'Apr',
    May: 'May', Jun: 'Jun', Jul: 'Jul', Aug: 'Aug',
    Sep: 'Sep', Oct: 'Oct', Nov: 'Nov', Dec: 'Dec',
  };

  const month = monthMap[parts[1]] || parts[1];
  const day = parts[2];
  const year = parts[4];

  const formatted = `${day} ${month} ${year}`;
  const date = new Date(parts.slice(1, 5).join(' ')); // Mon DD HH:MM:SS YYYY

  return { raw, date: Number.isNaN(date.getTime()) ? null : date, formatted };
}

/** Middle truncate for labels */
function middleTruncate(s, max) {
  const str = String(s || '');
  return str.length <= max
    ? str
    : `${str.slice(0, Math.ceil(max / 2) - 1)}…${str.slice(-Math.floor(max / 2) + 1)}`;
}

/** Root slug → category label */
function slugToCategory(s) {
  const map = {
    accessibility: 'Accessibility',
    api: 'API',
    css: 'CSS',
    games: 'Games',
    glossary: 'Glossary',
    html: 'HTML',
    http: 'HTTP',
    javascript: 'JavaScript',
    learn_web_development: 'Learn Dev',
    mathml: 'MathML',
    mdn: '(MDN)',
    media: 'Media',
    mozilla: 'Mozilla',
    performance: 'Performance',
    privacy: 'Privacy',
    progressive_web_apps: 'PWA',
    security: 'Security',
    svg: 'SVG',
    uri: 'URI',
    webassembly: 'WebAssembly',
    webdriver: 'WebDriver',
    xml: 'XML',
  };
  if (!s) return 'Web';
  return map[s] || s[0].toUpperCase() + s.slice(1);
}

// ——— SVG badge ————————————————————————————————————————————————————————————

function statusToSVG({ color, pageName, category, dateOrigStr, dateLocaStr }) {
  const fg = '#e5e7eb';
  const bg = '#0b1220';
  const stroke = '#1f2a44';
  const muted = '#9aa4b2';

  const palette = {
    unknown: { fg: '#e5e7eb', bg: '#2a3347', ring: '#3a4764', glyph: '?' },
    green:   { fg: 'oklch(87.1% .15 154.449)', bg: 'oklch(39.3% .095 152.535)', ring: 'oklch(87.1% .15 154.449)', glyph: 'check' },
    yellow:  { fg: 'oklch(90.5% .182 98.111)', bg: 'oklch(42.1% .095 57.708)',  ring: 'oklch(90.5% .182 98.111)', glyph: 'warn' },
    red:     { fg: 'oklch(70.4% .191 22.216)', bg: 'oklch(39.6% .141 25.723)', ring: 'oklch(70.4% .191 22.216)', glyph: 'x' },
    gray:    { fg: '#cbd5e1', bg: '#334155', ring: '#94a3b8', glyph: '—' },
  };
  const status = palette[color] || palette.unknown;

  const font = 'font-family="-apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Helvetica Neue, Arial, Noto Sans, sans-serif"';

  const totalW = 420;
  const h = 28;
  const cy = h / 1.5;
  const gap = 8;

  const leftLabelW = 40;
  const categoryW = 70;
  const iconW = 28;

  const dateShort = dateLocaStr ? dateLocaStr : (dateOrigStr ? 'never' : 'removed');

  const xCat = leftLabelW + gap;
  const xTitle = xCat + categoryW + gap;
  const xDate = totalW - iconW - gap;
  const titleMaxW = xDate - gap - xTitle;
  const shownTitle = middleTruncate(pageName, Math.floor(titleMaxW / 7));

  const iconCx = totalW - iconW / 2 - 4;
  const iconCy = cy / 1.3;

  let iconPath = '';
  if (status.glyph === 'check') {
    iconPath = `<path d="M ${iconCx - 5} ${iconCy} l3 3 l7 -7" fill="none" stroke="${status.fg}" stroke-width="2" stroke-linecap="round" />`;
  } else if (status.glyph === 'warn') {
    iconPath = `<path d="M${iconCx} ${iconCy - 6} v6" fill="none" stroke="${status.fg}" stroke-width="2" stroke-linecap="round" />
      <circle cx="${iconCx}" cy="${iconCy + 5}" r="1.3" fill="${status.fg}"/>`;
  } else if (status.glyph === 'x') {
    iconPath = `<path d="M${iconCx - 4} ${iconCy - 4} l8 8 M${iconCx + 4} ${iconCy - 4} l-8 8" fill="none" stroke="${status.fg}" stroke-width="2" stroke-linecap="round" />`;
  } else {
    iconPath = `<text x="${iconCx}" y="${iconCy}" font-size="10" ${font} font-weight="700" fill="${status.fg}" text-anchor="middle" dominant-baseline="middle">${status.glyph}</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${h}" viewBox="0 0 ${totalW} ${h}" role="img">
    <rect x="0.5" y="0.5" width="${totalW - 1}" height="${h - 1}" rx="6" fill="${bg}" stroke="${stroke}" />
    <rect x="0" y="0" width="${leftLabelW}" height="${h}" rx="6" fill="#111827"/>
    <text x="8" y="${cy}" font-size="12" ${font} font-weight="700" fill="${fg}" dominant-baseline="middle" text-anchor="start">MDN</text>
    <text x="${xCat}" y="${cy}" font-size="12" ${font} font-weight="600" fill="${fg}" dominant-baseline="middle" text-anchor="start">${escapeHTML(category)}</text>
    <text x="${xTitle}" y="${cy}" font-size="12" ${font} font-weight="600" fill="${fg}" dominant-baseline="middle" text-anchor="start">${escapeHTML(shownTitle)}</text>
    <text x="${xDate}" y="${cy}" font-size="10" ${font} font-weight="500" fill="${muted}" dominant-baseline="middle" text-anchor="end">${escapeHTML(dateShort)}</text>
    <g>
      <circle cx="${iconCx}" cy="${iconCy}" r="10" fill="${status.bg}" stroke="${status.ring}" stroke-width="1.5" />
      <circle cx="${iconCx}" cy="${iconCy}" r="9" fill="${status.bg}" stroke="${status.ring}" stroke-width="1" />
      ${iconPath}
    </g>
  </svg>`;
}

// ——— HTML writer ———————————————————————————————————————————————————————————

function writeTwitterCardHtml({ lang, slug, pageName, svgUrl, outDir }) {
  const html = `<!DOCTYPE html>
<html lang="${escapeHTML(lang)}">
<head>
  <meta charset="UTF-8" />
  <title>MDN Badge: ${escapeHTML(pageName)}</title>
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="MDN Badge: ${escapeHTML(pageName)}">
  <meta name="twitter:description" content="Statut de la page MDN ${escapeHTML(pageName)}">
  <meta name="twitter:image" content="${escapeHTML(svgUrl)}">
  <meta name="twitter:url" content="https://tristantheb.github.io/history-content/badges/${escapeHTML(lang)}/${escapeHTML(slug)}.html">
</head>
<body>
  <img src="${escapeHTML(svgUrl)}" alt="MDN Badge ${escapeHTML(pageName)}">
</body>
</html>`;
  const outPath = path.join(outDir, slug + '.html');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');
}

// ——— Main ————————————————————————————————————————————————————————————————

const LOGS_DIR = path.resolve(__dirname, '../../history');

const lang = sanitizeHash(process.argv[2] || 'fr');
if (!lang) {
  console.error(`Invalid lang parameter: ${process.argv[2]}`);
  process.exit(1);
}

const logFile = path.join(LOGS_DIR, `logs-${lang}.txt`);
if (!fs.existsSync(logFile)) {
  console.error(`Log file not found: ${logFile}`);
  process.exit(1);
}
const log = fs.readFileSync(logFile, 'utf8');

const enLogFile = path.join(LOGS_DIR, 'logs-en-us.txt');
const enLog = fs.existsSync(enLogFile) ? fs.readFileSync(enLogFile, 'utf8') : '';

const OUT_DIR = path.resolve(process.cwd(), `public/badges/${lang}`);
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function getEntries(text) {
  return (text.match(/^(.*\.md)$/gm) || [])
    .filter(e => !/\/conflicting\//.test(e) && !/\/orphaned\//.test(e));
}

const entries = getEntries(log);
const enEntries = getEntries(enLog);

// EN index (unchanged in spirit)
const enIndex = new Map(
  enEntries.map(e => {
    const m = e.match(/(files\/.*)/);
    const key = m ? m[1].toLowerCase() : '';
    return [key, e];
  }),
);

// Generate badges
const locaIndex = new Map(
  entries.map(e => {
    const m = e.match(/(files\/.*)/);
    const key = m ? m[1].toLowerCase() : '';
    return [key, e];
  }),
);

// Union of keys: all EN keys + locale-only keys projected to EN space
const keys = new Set(enIndex.keys());
for (const k of locaIndex.keys()) {
  const ek = k.replace(/^files\/[^/]+\//, 'files/en-us/');
  if (!enIndex.has(ek)) keys.add(ek);
}

for (const enKey of keys) {
  const locaKey   = enKey.replace(/^files\/en-us\//, `files/${lang}/`);
  const origEntry = enIndex.get(enKey) || null;        // EN line
  const locaEntry = locaIndex.get(locaKey) || null;    // locale line (may be null)

  const { date: d1, formatted: dateOrigStr } = parseLogMeta(origEntry);
  const { date: d2, formatted: dateLocaStr } = parseLogMeta(locaEntry);

  // Colors per spec
  let color;
  if (!origEntry) color = 'gray';
  else if (!locaEntry) color = 'red';
  else if (d1 && d2 && d2 > d1) color = 'green';
  else color = 'yellow';

  // Titles/category from whichever side exists
  const pathForTitles = (locaEntry ? locaKey : enKey)
    .replace(/^files\/(en-us|[^/]+)\//, '')
    .replace(/\/index\.md$/i, '');
  const parts = pathForTitles.split('/').filter(Boolean);
  const root = parts[0]?.toLowerCase() === 'web'
    ? (parts[1]?.toLowerCase() || '')
    : (parts[0]?.toLowerCase() || '');
  const category = slugToCategory(root);
  const titleText = parts.slice(root === parts[0] ? 1 : 2).join(' / ') || root;

  // Slug in locale space even if missing
  let slug = locaKey
    .replace(new RegExp(`^files/${lang}/`), '')
    .replace(/\/index\.md$/i, '');
  slug = sanitizeHash(slug);

  const svg = statusToSVG({ color, pageName: titleText, category, dateOrigStr, dateLocaStr });
  const svgUrl = `https://tristantheb.github.io/history-content/badges/${lang}/${slug}.svg`;

  const svgOut = path.join(OUT_DIR, slug + '.svg');
  fs.mkdirSync(path.dirname(svgOut), { recursive: true });
  fs.writeFileSync(svgOut, svg, 'utf8');

  writeTwitterCardHtml({ lang, slug, pageName: titleText, svgUrl, outDir: OUT_DIR });
  console.log('Generated badge:', svgOut, '→', color);
}
