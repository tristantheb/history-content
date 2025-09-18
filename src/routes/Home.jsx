import { useEffect, useMemo, useState } from 'react';

const urlParams = new URLSearchParams(window.location.search);
const lang = urlParams.get('lang') || 'fr';
const popularityFile = urlParams.get('popularityFile') || 'current';

export default function Home() {
  const [original, setOriginal] = useState([]);
  const [localized, setLocalized] = useState([]);
  const [popularity, setPopularity] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // The files live under /history relative to the app's base.
        const [enRes, locaRes] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}history/logs-en-us.txt`),
          fetch(`${import.meta.env.BASE_URL}history/logs-${lang}.txt`),
        ]);
        if (!enRes.ok) throw new Error(`HTTP error logs-en-us: ${enRes.status}`);
        if (!locaRes.ok) throw new Error(`HTTP error logs-${lang}: ${locaRes.status}`);
        const [enText, locaText] = await Promise.all([enRes.text(), locaRes.text()]);
        const enEntries = (enText.match(/^(.*\.md)$/gm) || []);
        const locaEntriesRaw = (locaText.match(/^(.*\.md)$/gm) || []);
        const locaEntries = locaEntriesRaw.filter((str) => !str.includes('/conflicting/') && !str.includes('/orphaned/'));

        // Popularity is optional
        try {
          const popRes = await fetch(`${import.meta.env.BASE_URL}history/${popularityFile}.csv`);
          if (popRes.ok) {
            const csv = await popRes.text();
            const map = {};
            csv
              .split(/\r?\n/)
              .slice(1)
              .forEach((line) => {
                if (!line) return;
                const [page, viewsStr] = line.split(',').map((s) => s.trim());
                if (!page || !viewsStr || !page.startsWith('/en-US/docs/')) return;
                const views = parseInt(viewsStr, 10);
                if (Number.isNaN(views)) return;
                const rest = page.replace(/^\/en-US\/docs\/?/, '/');
                const filesPath = ('files/en-us' + rest + (rest.endsWith('/') ? '' : '/') + 'index.md').toLowerCase();
                map[filesPath] = views;
              });
            if (!cancelled) setPopularity(map);
          }
        } catch {
          // ignore optional popularity errors
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
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    return original.map((el, i) => {
      const date = el.match(/^(.*) /g);
      const pathName = el.match(/(files\/.*)$/g).toString();
      const pathShort = pathName.slice(11) || '';

      let dateLoca, pathNameLoca;
      for (const l10n of localized) {
        if (l10n.includes(pathShort)) {
          dateLoca = l10n.match(/^(.*) /g);
          pathNameLoca = l10n.match(/(files\/.*)$/g).toString();
          break;
        }
      }

      const date1 = new Date(date?.[0]?.trim());
      const date2 = dateLoca ? new Date(dateLoca?.[0]?.trim()) : undefined;

      let color, status;
      if (date2 === undefined) {
        color = 'missing bg-red-900/30 text-red-200';
        status = (
          <div className="bg-red-900/60 text-red-300 border-4 border-double border-red-300 text-center inline-flex p-1 rounded-full">
            <svg role="img" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="inline h-5 w-5 p-0.5"><path d="M3 3l24 24m-24 0 24-24"></path></svg>
            <span className="sr-only">Missing</span>
          </div>
        );
      } else if (date1.getTime() < date2.getTime()) {
        color = 'updated bg-green-900/30 text-green-300';
        status = (
          <div className="bg-green-900/60 text-green-300 border-4 border-double border-green-300 text-center inline-flex p-1 rounded-full">
            <svg role="img" viewBox="0 0 31 21" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="inline h-5 w-5 p-0.5"><path d="M3 8l10 10 15-15"></path></svg>
            <span className="sr-only">Up-to-date</span>
          </div>
        );
      } else {
        color = 'outdated bg-yellow-900/30 text-yellow-300';
        status = (
          <div className="bg-yellow-900/60 text-yellow-300 border-4 border-double border-yellow-300 text-center inline-flex p-1 rounded-full">
            <svg role="img" viewBox="0 0 28 29" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="inline h-5 w-5 p-0.5"><path d="M14 3v15m0 8z"></path></svg>
            <span className="sr-only">Outdated</span>
          </div>
        );
      }

      const id = i + 1;
      const pv = popularity[pathName ? pathName[0].toLowerCase() : ''];
      const pvCell = typeof pv === 'number' ? pv.toLocaleString() : '';

      return (
        <tr key={id} id={String(id)} className={`${color} text-sm`}>
          <th scope="row" className="px-3 py-2">#{id}</th>
          <td className="px-3 py-2">{pathName.replace('files/en-us/', '').replace('/index.md', '')}</td>
          <td className="px-3 py-2">{dateLoca}</td>
          <td className="px-3 py-2 text-right">{pvCell}</td>
          <td className="px-3 py-2 text-center">{status}</td>
        </tr>
      );
    });
  }, [original, localized, popularity]);

  const quickNav = useMemo(() => {
    const count = Math.floor(original.length / 100);
    const items = [];
    for (let i = 1; i <= count; i++) {
      const id = i * 100;
      items.push(
        <li key={id}><a href={`#${id}`} className="text-blue-300 hover:text-blue-50 visited:text-purple-500">#{id}</a></li>
      );
    }
    return items;
  }, [original.length]);

  const counts = useMemo(() => {
    let upToDate = 0;
    let outDated = 0;
    let missing = 0;
    let total = rows.length;
    rows.forEach((row) => {
      if (row.props.className.includes('updated')) upToDate++;
      else if (row.props.className.includes('outdated')) outDated++;
      else if (row.props.className.includes('missing')) missing++;
    });
    return { upToDate, outDated, missing, total };
  }, [rows]);

  return (
    <div className="bg-slate-800 text-slate-300 break-words leading-snug min-h-screen">
      <header id="page-head" className="bg-slate-900 p-8 lg:p-16 mb-4 lg:mb-8">
        <div className="container mx-auto">
          <h1 className="font-bold text-white xl:font-extrabold text-3xl md:text-4xl xl:text-6xl mb-4">Editing history of the MDN pages</h1>
          <p className="text-lg">This history manager groups the <strong>main changes</strong> that are made or to be made regarding pages in the <abbr title="Mozilla Developer Network">MDN</abbr> Web Docs.</p>
        </div>
      </header>
      <main id="page-content" className="p-4 lg:p-8">
        <div className="container grid grid-cols-1 xl:grid-cols-4 mx-auto gap-4">
          <article className="lg:order-2 lg:col-span-3">
            <h2 id="table_of_page_changes" className="font-bold text-white text-2xl md:text-3xl xl:text-4xl mb-3">Table of page changes</h2>
            <p className="mb-2">You will find in this table the various documents currently translated, coloured in green or yellow...</p>
            <p class="mb-2">This is described as follows:</p>
            <ul class="mb-2 pl-4">
              <li class="py-1"><span class="bg-green-900/60 text-green-300 border-4 border-double border-green-300 text-center inline-flex p-1 rounded-full mr-2">
                <svg role="img" viewBox="0 0 31 21" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" class="inline h-5 w-5 p-0.5">
                  <path d="M3 8l10 10 15-15"></path>
                </svg><span class="sr-only">Up-to-date</span>
              </span>&nbsp;The latest update of the document is more recent than the original version.</li>
              <li class="py-1"><span class="bg-yellow-900/60 text-yellow-300 border-4 border-double border-yellow-300 text-center inline-flex p-1 rounded-full mr-2">
                <svg role="img" viewBox="0 0 28 29" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" class="inline h-5 w-5 p-0.5">
                  <path d="M14 3v15m0 8z"></path>
                </svg><span class="sr-only">Outdated</span>
              </span>&nbsp;The latest update of the document is older than the original version.</li>
              <li class="py-1"><span class="bg-red-900/60 text-red-300 border-4 border-double border-red-300 text-center inline-flex p-1 rounded-full mr-2">
                <svg role="img" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" class="inline h-5 w-5 p-0.5">
                  <path d="M3 3l24 24m-24 0 24-24"></path>
                </svg><span class="sr-only">Missing</span>
              </span>&nbsp;The document has not been translated into your language.</li>
            </ul>
            <p class="mb-2">Note that this table is generated from the two files you provided, you must have both repositories up to date when you generate your files otherwise you may get false positives.</p>
            <noscript>
              <div class="border border-yellow-400 bg-yellow-900/20 text-yellow-400 rounded p-3 my-3" role="alert">
                <p><b>JavaScript error :</b></p>
                <p>JavaScript is not enabled on your browser! The quick navigation and the table of changes need JavaScript to be generated.</p>
              </div>
            </noscript>
            <h3 id="some_statistics" class="text-lg text-slate-100 md:text-xl xl:text-2xl mb-2">Some statistics</h3>
            <div class="flex my-4 rounded ring-1 ring-inset ring-white/10 shadow-lg overflow-hidden">
              <div className="bg-green-900/30 text-green-300 p-2" style={{ width: `${(counts.upToDate / counts.total) * 100}%` }}>{counts.upToDate}</div>
              <div className="bg-yellow-900/30 text-yellow-300 p-2" style={{ width: `${(counts.outDated / counts.total) * 100}%` }}>{counts.outDated}</div>
              <div className="bg-red-900/30 text-red-200 p-2" style={{ width: `${(counts.missing / counts.total) * 100}%` }}>{counts.missing}</div>
            </div>
            <table id="changes-table" className="w-full">
              <thead>
                <tr className="bg-slate-900 text-slate-50">
                  <th scope="col">#id</th>
                  <th scope="col">Path to file</th>
                  <th scope="col">Last modification date</th>
                  <th scope="col">Popularity (en-US)</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {rows.length ? rows : (
                  <tr>
                    <td colSpan={6}>
                      <div className="bg-sky-400/20 text-sky-400 p-3" role="contentinfo">
                        <p><b>Note:</b></p>
                        <p>Please wait, the table is generating a huge list of pages!<br/>This may take a few seconds depending on the system you are using.</p>
                        {error && <p className="text-red-400 mt-2">Error: {error}</p>}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </article>
          <aside className="lg:order-1 lg:col-span-1">
            <h2 id="additionnal_information" className="font-semibold text-white text-xl md:text-2xl xl:text-3xl mb-3">Additional information</h2>
            <p className="mb-3">Use the ID to jump to rows like this: <code className="bg-stone-900 p-1">#1000</code></p>
            <h2 id="quick_navigation" className="font-semibold text-white text-xl md:text-2xl xl:text-3xl mb-3">Quick navigation</h2>
            <h3 id="mdn_repositories" className="text-lg text-slate-100 md:text-xl xl:text-2xl mb-2">MDN Repositories</h3>
            <ul className="mb-2">
              <li><a href="https://github.com/mdn/content" target="_blank" rel="noreferrer" className="text-blue-300 hover:text-blue-50 visited:text-purple-500">GitHub mdn/content</a></li>
              <li><a href="https://github.com/mdn/translated-content" target="_blank" rel="noreferrer" className="text-blue-300 hover:text-blue-50 visited:text-purple-500">GitHub mdn/translated-content</a></li>
              <li><a href="https://github.com/mdn/archived-content" target="_blank" rel="noreferrer" className="text-blue-300 hover:text-blue-50 visited:text-purple-500">GitHub mdn/archived-content</a></li>
            </ul>
            <h3 id="this_page" className="hidden xl:block xl:text-2xl mb-2">This page</h3>
            <nav role="navigation" className="hidden xl:block">
              <ul>
                {quickNav.length ? quickNav : <li>Loading ...</li>}
              </ul>
            </nav>
          </aside>
        </div>
      </main>
      <footer className="bg-zinc-900 text-white p-8 lg:p-16 mt-4 lg:mt-8">
        <p>tristantheb/history-content © 2021-{new Date().getFullYear()}, created by the community for the community.</p>
      </footer>
    </div>
  );
}
