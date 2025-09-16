// Language code for translation logs
const lang = 'fr';
let original, localized;

/**
 * Get a query parameter from the URL
 * @param {string} name - The parameter name
 * @returns {string|null}
 */
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Fetch a text file from a given URL
 * @param {string} url
 * @returns {Promise<string>}
 */
async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Loading error: ' + url);
  return await response.text();
}

/**
 * Find a page entry in the log file array
 * @param {string[]} entries - Array of log lines
 * @param {string} pageKey - Page key to search for
 * @returns {string|undefined}
 */
function findPageEntry(entries, pageKey) {
  return entries.find(e => {
    const match = e.match(/(files\/.*)/);
    if (!match) return false;
    return match[1].toLowerCase().includes(pageKey.toLowerCase());
  });
}

/**
 * Extract the raw date string from a log entry
 * @param {string} entry - Log line
 * @returns {string}
 */
function extractRawDate(entry) {
  if (!entry) return '';
  const match = entry.match(/^(.*) files\//);
  return match ? match[1].trim() : '';
}

/**
 * Format a raw date string from the log entry
 * @param {string} raw - Raw date string
 * @returns {string}
 */
function formatDateString(raw) {
  if (!raw) return '';
  const parts = raw.split(' ');
  if (parts.length < 6) return raw;
  const monthMap = {
    Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June',
    Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December'
  };
  const day = parts[2];
  const month = monthMap[parts[1]] || parts[1];
  const year = parts[4];
  const time = parts[3].slice(0,5); // HH:MM
  return `${month} ${day}, ${year} at ${time}`;
}

/**
 * Extract and format the date from a log entry
 * @param {string} entry - Log line
 * @returns {string}
 */
function getFormattedDate(entry) {
  return formatDateString(extractRawDate(entry));
}

/**
 * Extract the file path from a log entry
 * @param {string} entry - Log line
 * @returns {string}
 */
/**
 * Extract the file path from a log entry
 * @param {string} entry - Log line
 * @returns {string}
 */
/**
 * Extract the file path from a log entry
 * @param {string} entry - Log line
 * @returns {string}
 */
function extractFilePath(entry) {
  if (!entry) return '';
  const match = entry.match(/(files\/.*)/);
  return match ? match[1] : '';
}

function getPath(entry) {
  return extractFilePath(entry);
}

// Parse dates from raw log lines for accurate comparison
function parseLogDate(entry) {
  if (!entry) return null;
  const match = entry.match(/^(.*) files\//);
  if (!match) return null;
  // Remove weekday and timezone for Date.parse compatibility
  // Example: "Fri Jul 4 12:52:01 2025 +0200" => "Jul 4 12:52:01 2025"
  const raw = match[1].trim();
  const parts = raw.split(' ');
  if (parts.length < 6) return null;
  // Remove weekday (parts[0]) and timezone (parts[5])
  const dateStr = parts.slice(1, 5).join(' ');
  return new Date(dateStr);
}

/**
 * Get the translation status for a page
 * @param {string} dateOrig - Original page date
 * @param {string} dateLoca - Localized page date
 * @returns {{label: string, class: string}}
 */
/**
 * Get the translation status for a page
 * @param {string} dateOrig - Original page date
 * @param {string} dateLoca - Localized page date
 * @returns {{label: string, class: string}}
 */
function getStatus(dateOrig, dateLoca) {
  if (!dateOrig) return {
    label: '<svg role="img" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="inline h-5 w-5 p-0.5"><path d="M9 5c0-1 1-2 2-2h8c1 0 2 1 2 2m-18 4v-2c0-1 1-2 2-2h20c1 0 2 1 2 2v2m-21-1v19c0 1 1 2 2 2h14c1 0 2-1 2-2v-19m-13 2v16m4-16v16m4-16v16"></path></svg><span class="sr-only">Missing</span>',
    class: 'bg-slate-900/60 text-slate-200 border-4 border-double border-slate-200 text-center inline-flex p-1 rounded-full'
  };
  if (!dateLoca) return {
    label: '<svg role="img" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" class="inline h-5 w-5 p-0.5"><path d="M3 3l24 24m-24 0 24-24"></path></svg><span class="sr-only">Missing</span>',
    class: 'bg-red-900/60 text-red-300 border-4 border-double border-red-300 text-center inline-flex p-1 rounded-full'
  };
  const d1 = parseLogDate(dateOrig);
  const d2 = parseLogDate(dateLoca);
  if (d1 && d2 && d2 > d1) return {
    label: '<svg role="img" viewBox="0 0 31 21" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" class="inline h-5 w-5 p-0.5"><path d="M3 8l10 10 15-15"></path></svg><span class="sr-only">Up-to-date</span>',
    class: 'bg-green-900/60 text-green-300 border-4 border-double border-green-300 text-center inline-flex p-1 rounded-full'
  };
  return {
    label: '<svg role="img" viewBox="0 0 28 29" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" class="inline h-5 w-5 p-0.5"><path d="M14 3v15m0 8z"></path></svg><span class="sr-only">Outdated</span>',
    class: 'bg-yellow-900/60 text-yellow-300 border-4 border-double border-yellow-300 text-center inline-flex p-1 rounded-full'
  };
}

/**
 * Render the information block for the page
 * @param {string} pageName
 * @param {string} dateOrig
 * @param {string} dateLoca
 * @param {{label: string, class: string}} status
 */
function renderInfoBlock(pageName, dateOrig, dateLoca, status) {
  return `
    <section class="mx-auto bg-slate-900/80 rounded-2xl shadow-lg border border-slate-700 p-4 flex flex-col gap-4 items-center">
      <div class="w-full text-center">
        <h2 class="text-xl md:text-2xl font-bold text-slate-100 mb-2">${pageName}</h2>
      </div>
      <div class="w-full flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex-1 text-center">
          <span class="block text-slate-400 text-sm">Last translation date</span>
          <span class="block text-lg font-semibold text-slate-100">${!dateOrig ? '<span class=\"text-slate-300\">Page removed</span>' : (dateLoca || '<span class=\"text-red-400\">Never translated</span>')}</span>
        </div>
        <div class="flex-1 text-center">
          <span class="block text-slate-400 text-sm">Page status</span>
          <span class="block mt-2 ${status.class}">${status.label}</span>
        </div>
      </div>
    </section>
  `;
}
/**
 * Main logic: fetch data, process, and render
 */
async function main() {
  let pageKey = getQueryParam('page');
  const resultDiv = document.getElementById('result');
  if (!pageKey) {
    resultDiv.innerHTML = '<div class="rounded-xl bg-red-900/40 border border-red-700 p-4 text-center text-lg">Parameter ?page= is required (e.g. ?page=web/css)</div>';
    return;
  }

  // Always search for /index.md
  if (!pageKey.endsWith('/index.md')) {
    pageKey = pageKey + '/index.md';
  }

  try {
    const [origText, locaText] = await Promise.all([
      fetchText('../../history/logs-en-us.txt'),
      fetchText(`../../history/logs-${lang}.txt`)
    ]);
    // Filter out entries in 'conflicting' and 'orphaned' folders
    const filterValid = arr => arr.filter(e =>
      !/\/conflicting\//.test(e) && !/\/orphaned\//.test(e)
    );
    const origEntries = filterValid(origText.match(/^(.*\.md)$/gm) || []);
    const locaEntries = filterValid(locaText.match(/^(.*\.md)$/gm) || []);

    // Find entries once and pass them to helpers
    const origEntry = findPageEntry(origEntries, pageKey);
    const locaEntry = findPageEntry(locaEntries, pageKey);

    // Clean up page name for display
    function cleanPageName(path) {
      if (!path) return pageKey;
      return path.replace(/^files\/fr\//, '').replace(/\/index\.md$/, '').replace(/^files\/en-us\//, '');
    }

  const pageName = cleanPageName(getPath(locaEntry) || getPath(origEntry));
  const dateOrigStr = getFormattedDate(origEntry);
  const dateLocaStr = getFormattedDate(locaEntry);
  const status = getStatus(origEntry, locaEntry);

  resultDiv.innerHTML = renderInfoBlock(pageName, dateOrigStr, dateLocaStr, status);
  } catch (e) {
    resultDiv.innerHTML = `<div class="rounded-xl bg-red-900/40 border border-red-700 p-4 text-center text-lg">Error loading data: ${e.message}</div>`;
  }

// Run main logic after DOM is loaded
document.addEventListener('DOMContentLoaded', main);
}

main();
