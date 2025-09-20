import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';

// ——— Constants ————————————————————————————————————————————————
const FONT = 'font-family="-apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Helvetica Neue, Arial, Noto Sans, sans-serif"';
const GEOM = { totalW: 420, h: 28, gap: 8, leftLabelW: 40, categoryW: 70, iconW: 28 };
const COLORS = {
  fg: '#e5e7eb',
  bg: '#0b1220',
  stroke: '#1f2a44',
  muted: '#9aa4b2',
};
const STATUS = {
  unknown: { fg: '#e5e7eb', bg: '#2a3347', ring: '#3a4764', glyph: '?' },
  green:   { fg: 'oklch(87.1% .15 154.449)', bg: 'oklch(39.3% .095 152.535)', ring: 'oklch(87.1% .15 154.449)', glyph: 'check' },
  yellow:  { fg: 'oklch(90.5% .182 98.111)', bg: 'oklch(42.1% .095 57.708)',  ring: 'oklch(90.5% .182 98.111)', glyph: 'warn' },
  red:     { fg: 'oklch(70.4% .191 22.216)', bg: 'oklch(39.6% .141 25.723)', ring: 'oklch(70.4% .191 22.216)', glyph: 'x' },
  gray:    { fg: '#cbd5e1', bg: '#334155', ring: '#94a3b8', glyph: '—' },
};
const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
const CATEGORY_MAP = {
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

// ——— Utils ————————————————————————————————————————————————
function escapeHTML(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function middleTruncate(s, max) {
  const str = String(s || '');
  return str.length <= max
    ? str
    : `${str.slice(0, Math.ceil(max / 2) - 1)}…${str.slice(-Math.floor(max / 2) + 1)}`;
}
function fmtDateISO(raw) {
  if (!raw) return '';
  const parts = raw.split(' ');
  if (parts.length < 6) return '';
  const yyyy = parts[4];
  const mm = String(MONTHS[parts[1]] || 0).padStart(2, '0');
  const dd = String(parts[2]).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function parseLogDate(entry) {
  const m = entry?.match(/^(.*) files\//);
  if (!m) return null;
  const parts = m[1].trim().split(' ');
  if (parts.length < 6) return null;
  const d = new Date(parts.slice(1, 5).join(' '));
  return Number.isNaN(d.getTime()) ? null : d;
}
function extractRaw(entry) {
  return entry?.match(/^(.*) files\//)?.[1].trim() || '';
}
function slugToCategory(s) {
  if (!s) return 'Web';
  return CATEGORY_MAP[s] || s[0].toUpperCase() + s.slice(1);
}

// ——— SVG Render ————————————————————————————————————————————————
function statusToSVG({ color, titleText, category, dateOrigStr, dateLocaStr }) {
  const palette = STATUS[color] || STATUS.unknown;
  const { totalW, h, gap, leftLabelW, categoryW, iconW } = GEOM;
  const cy = h / 1.5;

  const dateShort = dateLocaStr ? fmtDateISO(dateLocaStr) : (dateOrigStr ? 'never' : 'removed');

  const xCat = leftLabelW + gap;
  const xTitle = xCat + categoryW + gap;
  const xDate = totalW - iconW - gap;
  const titleMaxW = xDate - gap - xTitle;
  const shownTitle = middleTruncate(titleText, Math.floor(titleMaxW / 7));

  const iconCx = totalW - iconW / 2 - 4;
  const iconCy = cy / 1.3;

  let iconPath = '';
  if (palette.glyph === 'check') {
    iconPath = `<path d="M ${iconCx - 5} ${iconCy} l3 3 l7 -7" fill="none" stroke="${palette.fg}" stroke-width="2" stroke-linecap="round" />`;
  } else if (palette.glyph === 'warn') {
    iconPath = `<path d="M${iconCx} ${iconCy - 6} v6" fill="none" stroke="${palette.fg}" stroke-width="2" stroke-linecap="round" />
      <circle cx="${iconCx}" cy="${iconCy + 5}" r="1.3" fill="${palette.fg}"/>`;
  } else if (palette.glyph === 'x') {
    iconPath = `<path d="M${iconCx - 4} ${iconCy - 4} l8 8 M${iconCx + 4} ${iconCy - 4} l-8 8" fill="none" stroke="${palette.fg}" stroke-width="2" stroke-linecap="round" />`;
  } else {
    iconPath = `<text x="${iconCx}" y="${iconCy}" font-size="10" ${FONT} font-weight="700" fill="${palette.fg}" text-anchor="middle" dominant-baseline="middle">${palette.glyph}</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${h}" viewBox="0 0 ${totalW} ${h}" role="img">
    <rect x="0.5" y="0.5" width="${totalW - 1}" height="${h - 1}" rx="6" fill="${COLORS.bg}" stroke="${COLORS.stroke}" />
    <rect x="0" y="0" width="${leftLabelW}" height="${h}" rx="6" fill="#111827"/>
    <text x="8" y="${cy}" font-size="12" ${FONT} font-weight="700" fill="${COLORS.fg}" dominant-baseline="middle" text-anchor="start">MDN</text>
    <text x="${xCat}" y="${cy}" font-size="12" ${FONT} font-weight="600" fill="${COLORS.fg}" dominant-baseline="middle" text-anchor="start">${escapeHTML(category)}</text>
    <text x="${xTitle}" y="${cy}" font-size="12" ${FONT} font-weight="600" fill="${COLORS.fg}" dominant-baseline="middle" text-anchor="start">${escapeHTML(shownTitle)}</text>
    <text x="${xDate}" y="${cy}" font-size="10" ${FONT} font-weight="500" fill="${COLORS.muted}" dominant-baseline="middle" text-anchor="end">${escapeHTML(dateShort)}</text>
    <g>
      <circle cx="${iconCx}" cy="${iconCy}" r="10" fill="${palette.bg}" stroke="${palette.ring}" stroke-width="1.5" />
      <circle cx="${iconCx}" cy="${iconCy}" r="9" fill="${palette.bg}" stroke="${palette.ring}" stroke-width="1" />
      ${iconPath}
    </g>
  </svg>`;
}

// ——— Composant ————————————————————————————————————————————————
export default function StatusSVG({ lang = 'fr', page = 'web/html' }) {
  const isBrowser = typeof window !== 'undefined';
  const [search, setSearch] = useState(isBrowser ? window.location.search : '');
  const [svg, setSvg] = useState('');

  // Listen to URL changes (popstate/hashchange + patch push/replace)
  useEffect(() => {
    if (!isBrowser) return;
    const onChange = () => setSearch(window.location.search);

    window.addEventListener('popstate', onChange);
    window.addEventListener('hashchange', onChange);

    const _push = history.pushState;
    const _replace = history.replaceState;
    history.pushState = function (...a) { _push.apply(this, a); onChange(); };
    history.replaceState = function (...a) { _replace.apply(this, a); onChange(); };

    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener('hashchange', onChange);
      history.pushState = _push;
      history.replaceState = _replace;
    };
  }, [isBrowser]);

  const params = useMemo(() => new URLSearchParams(search), [search]);

  // Initial render "unknown"
  useEffect(() => {
    const effectivePage = params.get('page') || page;
    const parts = effectivePage.replace(/\/index\.md$/i, '').split('/').filter(Boolean);
    const root = parts[0]?.toLowerCase() === 'web' ? (parts[1]?.toLowerCase() || '') : (parts[0]?.toLowerCase() || '');
    const category = slugToCategory(root);
    const titleText = parts.slice(root === parts[0] ? 1 : 2).join(' / ') || root;
    setSvg(statusToSVG({ color: 'unknown', titleText, category, dateOrigStr: '', dateLocaStr: '' }));
  }, [params, page]);

  // Loading logs and calculating status
  useEffect(() => {
    let aborted = false;
    async function run() {
      const effectivePage = params.get('page') || page;
      const effectiveLang = params.get('lang') || lang;
      const pageKey = /\/index\.md$/i.test(effectivePage) ? effectivePage : `${effectivePage}/index.md`;

      try {
        const [origRes, locaRes] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}history/logs-en-us.txt`),
          fetch(`${import.meta.env.BASE_URL}history/logs-${effectiveLang}.txt`),
        ]);
        const [origText, locaText] = await Promise.all([origRes.text(), locaRes.text()]);

        const filterValid = (arr) => arr.filter((e) => !/\/conflicting\//.test(e) && !/\/orphaned\//.test(e));
        const origEntries = filterValid(origText.match(/^(.*\.md)$/gm) || []);
        const locaEntries = filterValid(locaText.match(/^(.*\.md)$/gm) || []);

        const findPageEntry = (entries, key) =>
          entries.find((e) => e.match(/(files\/.*)/)?.[1].toLowerCase().endsWith(key.toLowerCase()));

        const origEntry = findPageEntry(origEntries, pageKey);
        const locaEntry = findPageEntry(locaEntries, pageKey);

        const dateOrigStr = extractRaw(origEntry);
        const dateLocaStr = extractRaw(locaEntry);

        let color = 'unknown';
        if (!origEntry) color = 'gray';
        else if (!locaEntry) color = 'red';
        else color = (parseLogDate(locaEntry) > parseLogDate(origEntry)) ? 'green' : 'yellow';

        if (!aborted) {
          const parts = effectivePage.replace(/\/index\.md$/i, '').split('/').filter(Boolean);
          const root = parts[0]?.toLowerCase() === 'web' ? (parts[1]?.toLowerCase() || '') : (parts[0]?.toLowerCase() || '');
          const category = slugToCategory(root);
          const titleText = parts.slice(root === parts[0] ? 1 : 2).join(' / ') || root;
          setSvg(statusToSVG({ color, titleText, category, dateOrigStr, dateLocaStr }));
        }
      } catch (e) {
        /* eslint-disable no-console */
        console.error(e);
        /* eslint-enable no-console */
      }
    }
    run();
    return () => { aborted = true; };
  }, [params, lang, page]);

  const sanitized = useMemo(
    () => DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true } }),
    [svg],
  );

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
