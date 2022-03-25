// Init generals variables
const lang = 'fr';
let original = [], localized = [];

const $htmlElm = {};

// Start operation when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    $htmlElm.changesTable = document.querySelector('#changes-table');
    $htmlElm.changesTableContent = document.querySelector('#changes-table > tbody');
    $htmlElm.quickNav = document.querySelector('nav > ul');

    fecthAllFiles()
        .then(() => {
            // When all is ok, generate table and navigation
            generateTables();
            generateNav();
        })
        .then(() => {
            let counts = {}
            counts.success = document.querySelectorAll('tr.updated').length;
            counts.warning = document.querySelectorAll('tr.outdated').length;
            counts.error = document.querySelectorAll('tr.missing').length;
            counts.max = counts.success + counts.warning + counts.error;

            const $newDiv = document.createElement('div');
            
            $newDiv.innerHTML = `<h3 id="some_statistics" class="text-lg text-slate-100 md:text-xl xl:text-2xl mb-2">Some statistics</h3>
            <div class="flex my-4 rounded ring-1 ring-inset ring-white/10 shadow-lg overflow-hidden">
                <div class="bg-green-900/30 text-green-300 p-2" style="width: ${counts.success / counts.max * 100}%;">${counts.success}</div>
                <div class="bg-yellow-900/30 text-yellow-300 p-2" style="width: ${counts.warning / counts.max * 100}%;">${counts.warning}</div>
                <div class="bg-red-900/30 text-red-200 p-2" style="width: ${counts.error / counts.max * 100}%;">${counts.error}</div>
            </div>`;

            $htmlElm.changesTable.parentElement.insertBefore($newDiv, $htmlElm.changesTable);
        })
        .catch(e => {
            console.error('There has been a problem with your fetch operation: ' + e.message);
        });
});

async function fecthAllFiles() {
    // Fetch the origin version
    let response = await fetch('history/logs-en-us.txt');

    if (response.ok) {
        let txt = await response.text();
        let regex = /^(.*\.md)$/gm;
        let res = txt.match(regex);
        original = original.concat(res);
    } else {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
        
    // Fetch the translated version
    response = await fetch(`history/logs-${lang}.txt`);

    if (response.ok) {
        let text = await response.text();
        let regex = /^(.*\.md)$/gm;
        localized = localized.concat(text.match(regex));

        for (let i = 0; i < localized.length; i++) {
            let str = localized[i];
            if (str.includes("/conflicting/") || str.includes("/orphaned/")) {
                localized.splice(i, 1);
                i--;
            }
        }
    } else {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

/**
 * This function takes care of generating the table to see the
 * differences and missing pages from the MDN Web Docs
 */
function generateTables() {
    // Remove missing pages from origin var and move to missing var
    let html = '';

    original.forEach((el, i) => {
        let date = el.match(/^(.*) /g);
        let pathName = el.match(/(files\/.*)$/g);

        // Remove the en-US for searching the existing pages
        let pathShort = pathName[0].slice(11);

        let dateLoca, pathNameLoca;
        localized.forEach(l10n => {
            if (l10n.includes(pathShort)) {
                dateLoca = l10n.match(/^(.*) /g);
                pathNameLoca = l10n.match(/(files\/.*)$/g);
            }
        });

        let date1, date2, color, status;
        date1 = new Date(date);
        date2 = dateLoca ? new Date(dateLoca) : undefined;
        color = date1 < date2 ? "updated bg-green-900/30 text-green-300" :
                date2 === undefined ? "missing bg-red-900/30 text-red-200" :
                "outdated bg-yellow-900/30 text-yellow-300";
        status = date1 < date2 ? '<div class="bg-green-900/60 text-green-300 border-4 border-double border-green-300 text-center inline-flex p-1 rounded-full"><svg role="img" viewBox="0 0 31 21" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" class="inline h-5 w-5 p-0.5"><path d="M3 8l10 10 15-15"></path></svg><span class="sr-only">Up-to-date</span></div>' :
                date2 === undefined ? '<div class="bg-red-900/60 text-red-300 border-4 border-double border-red-300 text-center inline-flex p-1 rounded-full"><svg role="img" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" class="inline h-5 w-5 p-0.5"><path d="M3 3l24 24m-24 0 24-24"></path></svg><span class="sr-only">Missing</span></div>' :
                '<div class="bg-yellow-900/60 text-yellow-300 border-4 border-double border-yellow-300 text-center inline-flex p-1 rounded-full"><svg role="img" viewBox="0 0 28 29" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" class="inline h-5 w-5 p-0.5"><path d="M14 3v15m0 8z"></path></svg><span class="sr-only">Outdated</span></div>';
        
        let id = i + 1;
        if (!pathNameLoca && !dateLoca) {
            html += `<tr id="${id}" class="${color} text-sm"><th scope="row" class="px-3 py-2">#${id}</th><td class="px-3 py-2">${pathName}</td><td></td><td class="hidden xl:block"></td><td class="px-3 py-2 text-center">${status}</td></tr>`;
        } else {
            html += `<tr id="${id}" class="${color} text-sm"><th scope="row" class="px-3 py-2">#${id}</th><td class="px-3 py-2">${pathName}</td><td class="px-3 py-2">${pathNameLoca}</td><td class="hidden xl:block px-3 py-2">${dateLoca}</td><td class="px-3 py-2 text-center">${status}</td></tr>`;
        }
    });

    $htmlElm.changesTableContent.innerHTML = html;
}

/**
 * This function takes care of the number pages from the MDN Web Docs
 * and generate on page links to all 100 pages
 */
function generateNav() {
    let count = (original.length - (original.length % 100)) / 100, html = '';
    for (let i = 1; i <= count; i++) {
        let id = i * 100;
        html += `<li><a href="#${id}" class="text-blue-300 hover:text-blue-50 visited:text-purple-500">#${id}</a></li>`;
    }

    $htmlElm.quickNav.innerHTML = html;
}
