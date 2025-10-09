import { Footer } from '../components/Footer.jsx';
import { OutOfDate } from '../components/StatusIcons/OutOfDate.jsx';
import TableContainer from '../components/StatsTable/TableContainer.jsx';
import { Untranslated } from '../components/StatusIcons/Untranslated.jsx';
import { UpToDate } from '../components/StatusIcons/UpToDate.jsx';
import { useHistoryData } from '../workers/useHistoryData.js';

const urlParams = new URLSearchParams(window.location.search);
const lang = urlParams.get('lang') || 'fr';
const popularityFile = urlParams.get('popularityFile') || 'current';
const baseUrl = import.meta.env.BASE_URL;

function Home() {
  const rowsPerPage = 50;

  const { original, localized, popularityCsv } = useHistoryData({ baseUrl, lang, popularityFile });

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
            <p className="mb-2">This is described as follows:</p>
            <ul className="mb-2 pl-4">
              <li className="py-1"><UpToDate />&nbsp;The latest update of the document is more recent than the original version.</li>
              <li className="py-1"><OutOfDate />&nbsp;The latest update of the document is older than the original version.</li>
              <li className="py-1"><Untranslated />&nbsp;The document has not been translated into your language.</li>
            </ul>
            <TableContainer original={original} localized={localized} popularityCsv={popularityCsv} rowsPerPage={rowsPerPage} />
          </article>
          <aside className="lg:order-1 lg:col-span-1">
            <h2 id="quick_navigation" className="font-semibold text-white text-xl md:text-2xl xl:text-3xl mb-3">Quick navigation</h2>
            <h3 id="mdn_repositories" className="text-lg text-slate-100 md:text-xl xl:text-2xl mb-2">MDN Repositories</h3>
            <ul className="mb-2">
              <li><a href="https://github.com/mdn/content" target="_blank" rel="noreferrer" className="text-blue-300 hover:text-blue-50 visited:text-purple-500">GitHub mdn/content</a></li>
              <li><a href="https://github.com/mdn/translated-content" target="_blank" rel="noreferrer" className="text-blue-300 hover:text-blue-50 visited:text-purple-500">GitHub mdn/translated-content</a></li>
            </ul>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Home;
