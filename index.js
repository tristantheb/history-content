// Init generals variables
const lang = 'fr';
let original = [], localized = [];

const $htmlElm = {};

// Start operation when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  $htmlElm.changesTable = document.querySelector('table.changes-table > tbody');
  $htmlElm.quickNav = document.querySelector('nav.quick-nav > ul');

  fecthAllFiles()
    .then(() => {
        // When all is ok, generate table and navigation
        generateTables();
        generateNav();
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
    let regex = /^(.*\.html)$/gm;
    let res = txt.match(regex);
    original = original.concat(res);
  } else {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
    
  // Fetch the translated version
  response = await fetch(`history/logs-${lang}.txt`);

  if (response.ok) {
    let text = await response.text();
    let regex = /^(.*\.html)$/gm;
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

    let date1, date2, color;
    date1 = new Date(date);
    date2 = dateLoca ? new Date(dateLoca) : undefined;
    color = date1 < date2 ? "success" :
            date2 === undefined ? "error" :
            "warning";
    
    let id = i + 1;
    if (!pathNameLoca && !dateLoca) {
      html += `<tr id="${id}" class="${color}"><th scope="row">#${id}</th><td>${pathName}</td><td class="m-hide">${date}</td><td colspan="2"><div class="note missing"><p><b>Missing page !</b></p><p>This page is only available in English, you might want to translate it.</p></div></td></tr>`;
    } else {
      html += `<tr id="${id}" class="${color}"><th scope="row">#${id}</th><td>${pathName}</td><td class="m-hide">${date}</td><td>${pathNameLoca}</td><td class="m-hide">${dateLoca}</td></tr>`;
    }
  });

  $htmlElm.changesTable.innerHTML = html;
}

/**
 * This function takes care of the number pages from the MDN Web Docs
 * and generate on page links to all 100 pages
 */
function generateNav() {
  let count = (original.length - (original.length % 100)) / 100, html = '';
  for (let i = 1; i <= count; i++) {
    let id = i * 100;
    html += `<li><a href="#${id}">#${id}</a></li>`;
  }

  $htmlElm.quickNav.innerHTML = html;
}
