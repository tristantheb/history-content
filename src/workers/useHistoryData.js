import { useEffect, useState } from 'react';

export function useHistoryData({ baseUrl, lang = 'fr', popularityFile = 'current' } = {}) {
  const [original, setOriginal] = useState([]);
  const [localized, setLocalized] = useState([]);
  const [popularityCsv, setPopularityCsv] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [originRessources, localRessources] = await Promise.all([
          fetch(`${baseUrl}history/logs-en-us.txt`),
          fetch(`${baseUrl}history/logs-${lang}.txt`),
        ]);

        if (!originRessources.ok) throw new Error(`HTTP error logs-en-us: ${originRessources.status}`);
        if (!localRessources.ok) throw new Error(`HTTP error logs-${lang}: ${localRessources.status}`);

        const [enText, locaText] = await Promise.all([originRessources.text(), localRessources.text()]);
        const enEntries = enText.match(/^(.*\.md)$/gm) || [];
        const locaEntriesRaw = locaText.match(/^(.*\.md)$/gm) || [];
        const locaEntries = locaEntriesRaw.filter((s) => !s.includes('/conflicting/') && !s.includes('/orphaned/'));

        try {
          const popRes = await fetch(`${baseUrl}history/${popularityFile}.csv`);
          if (popRes.ok) {
            const csv = (await popRes.text()).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
            if (!cancelled) setPopularityCsv(csv);
          }
        } catch {
          // optional
        }

        if (!cancelled) {
          setOriginal(enEntries);
          setLocalized(locaEntries);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [baseUrl, lang, popularityFile]);

  return { original, localized, popularityCsv, error };
}
