import { useEffect, useMemo, useState } from 'react';

export default function StatusSVG({ lang = 'fr', page = 'web/html' }) {
  // Helper to escape HTML special chars for SVG text nodes
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const [search, setSearch] = useState(window.location.search);
  const [svg, setSvg] = useState('');

  useEffect(() => {
    const onChange = () => setSearch(window.location.search);
    window.addEventListener('popstate', onChange);
    window.addEventListener('hashchange', onChange);
    const _push = history.pushState;
    history.pushState = function (...a) { _push.apply(this, a); onChange(); };
    const _replace = history.replaceState;
    history.replaceState = function (...a) { _replace.apply(this, a); onChange(); };
    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener('hashchange', onChange);
      history.pushState = _push;
      history.replaceState = _replace;
    };
  }, []);

  const params = useMemo(() => new URLSearchParams(search), [search]);

  const middleTruncate = (s, max) =>
    s.length <= max ? s : `${s.slice(0, Math.ceil(max / 2) - 1)}…${s.slice(-Math.floor(max / 2) + 1)}`;
  const fmtDateISO = (raw) => {
    if (!raw) return '';
    const parts = raw.split(' ');
    if (parts.length < 6) return '';
    const map = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
    const yyyy = parts[4];
    const mm = String(map[parts[1]] || 0).padStart(2, '0');
    const dd = String(parts[2]).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const slugToCategory = (s) => {
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
  };

  const statusToSVG = ({ color, titleText, category, dateOrigStr, dateLocaStr }) => {
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

    const dateShort = dateLocaStr ? fmtDateISO(dateLocaStr) : (dateOrigStr ? 'never' : 'removed');

    // calcul des positions
    const xCat = leftLabelW + gap;
    const xTitle = xCat + categoryW + gap;
    const xDate = totalW - iconW - gap;
    const titleMaxW = xDate - gap - xTitle;
    const shownTitle = middleTruncate(titleText, Math.floor(titleMaxW / 7));

    const iconCx = totalW - iconW / 2 - 4;
    const iconCy = cy;
    const rOuter = 10;
    const rInner = 9;

    // icône
    const iconPath =
      status.glyph === 'check'
        ? `<path d="M ${iconCx - 5} ${iconCy} l3 3 l7 -7" fill="none" stroke="${status.fg}" stroke-width="2" stroke-linecap="round" />`
        : status.glyph === 'warn'
          ? `<path d="M${iconCx} ${iconCy - 6} v6" fill="none" stroke="${status.fg}" stroke-width="2" stroke-linecap="round" />
            <circle cx="${iconCx}" cy="${iconCy + 5}" r="1.3" fill="${status.fg}"/>`
          : status.glyph === 'x'
            ? `<path d="M${iconCx - 4} ${iconCy - 4} l8 8 M${iconCx + 4} ${iconCy - 4} l-8 8" fill="none" stroke="${status.fg}" stroke-width="2" stroke-linecap="round" />`
            : `<text x="${iconCx}" y="${iconCy}" font-size="10" ${font} font-weight="700" fill="${status.fg}" text-anchor="middle" dominant-baseline="middle">${status.glyph}</text>`;

    // rendu
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${h}" viewBox="0 0 ${totalW} ${h}" role="img">
      <rect x="0.5" y="0.5" width="${totalW - 1}" height="${h - 1}" rx="6" fill="${bg}" stroke="${stroke}" />
      <rect x="0" y="0" width="${leftLabelW}" height="${h}" rx="6" fill="#111827"/>
      <text x="8" y="${cy}" font-size="12" ${font} font-weight="700" fill="${fg}" dominant-baseline="middle" text-anchor="start">MDN</text>
      <text x="${xCat}" y="${cy}" font-size="12" ${font} font-weight="600" fill="${fg}" dominant-baseline="middle" text-anchor="start">${category}</text>
      <text x="${xTitle}" y="${cy}" font-size="12" ${font} font-weight="600" fill="${fg}" dominant-baseline="middle" text-anchor="start">${escapeHTML(shownTitle)}</text>
      <text x="${xDate}" y="${cy}" font-size="10" ${font} font-weight="500" fill="${muted}" dominant-baseline="middle" text-anchor="end">${dateShort}</text>
      <g>
        <circle cx="${iconCx}" cy="${iconCy}" r="${rOuter}" fill="${status.bg}" stroke="${status.ring}" stroke-width="1.5" />
        <circle cx="${iconCx}" cy="${iconCy}" r="${rInner}" fill="${status.bg}" stroke="${status.ring}" stroke-width="1" />
        ${iconPath}
      </g>
    </svg>`;
  };

  useEffect(() => {
    async function run() {
      const effectivePage = params.get('page') || page;
      const effectiveLang = params.get('lang') || lang;

      const parts = effectivePage.replace(/\/index\.md$/i, '').split('/').filter(Boolean);
      const root = parts[0]?.toLowerCase() === 'web' ? (parts[1]?.toLowerCase() || '') : (parts[0]?.toLowerCase() || '');
      const category = slugToCategory(root);
      const titleText = parts.slice(root === parts[0] ? 1 : 2).join(' / ') || root;

      const pageKey = /\/index\.md$/i.test(effectivePage) ? effectivePage : `${effectivePage}/index.md`;

      let dateOrigStr = '';
      let dateLocaStr = '';
      let color = 'unknown';

      setSvg(statusToSVG({ color, titleText, category, dateOrigStr, dateLocaStr }));

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
          entries.find((e) => {
            const m = e.match(/(files\/.*)/);
            return m ? m[1].toLowerCase().endsWith(key.toLowerCase()) : false;
          });

        const origEntry = findPageEntry(origEntries, pageKey);
        const locaEntry = findPageEntry(locaEntries, pageKey);

        const parseLogDate = (entry) => {
          const m = entry?.match(/^(.*) files\//);
          if (!m) return null;
          const raw = m[1].trim();
          const parts = raw.split(' ');
          if (parts.length < 6) return null;
          const d = new Date(parts.slice(1, 5).join(' '));
          return Number.isNaN(d.getTime()) ? null : d;
        };
        const extractRaw = (entry) => entry?.match(/^(.*) files\//)?.[1].trim() || '';

        dateOrigStr = extractRaw(origEntry);
        dateLocaStr = extractRaw(locaEntry);

        if (!origEntry) color = 'gray';
        else if (!locaEntry) color = 'red';
        else color = (parseLogDate(locaEntry) > parseLogDate(origEntry)) ? 'green' : 'yellow';

        setSvg(statusToSVG({ color, titleText, category, dateOrigStr, dateLocaStr }));
      } catch (e) {
        /* eslint-disable no-console */
        console.error(e);
        /* eslint-enable no-console */
      }
    }
    run();
  }, [params, lang, page]);

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
