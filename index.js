// Init generals variables
const lang = 'fr';
let original = [], localized = [];

// Start operation when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get the tables
  const $changesTable = document.querySelector('table.changes-table > tbody');
  const $quickNav = document.querySelector('nav.quick-nav > ul');
  
  async function fecthAllFiles() {
    // Fetch the origin version
    console.info("Start fetching original file");
    await fetch('history/logs-en-us.txt')
      .then(response => response.text())
      .then(text => {
        let regex = /^(.*\.html)$/gm;
        let res = text.match(regex)
        original = original.concat(res);
      })
      .catch((e) => {
        console.error(`An error occurred while loading the original file: ${e.message}`)
      });
      
    // Fetch the translated version
    console.info("Start fetching translated file");
    await fetch(`history/logs-${lang}.txt`)
      .then(response => response.text())
      .then(text => {
        let regex = /^(.*\.html)$/gm;
        localized = localized.concat(text.match(regex));
      })
      .then(() => {
        for (let i = 0; i < localized.length; i++) {
          let str = localized[i];
          if (str.includes("/conflicting/") || str.includes("/orphaned/")) {
            localized.splice(i, 1);
            i--;
          }
        }
      })
      .catch((e) => {
        console.error(`An error occurred while loading the original file: ${e.message}`);
      });

    generateTables();
    generateNav();
  }

  /**
   * This function takes care of generating the two tables to see the
   * differences and missing pages from the DND Web Docs
   */
  async function generateTables() {
    console.info("Start generating table");
    // Remove missing pages from origin var and move to missing var
    let html = '';

    original.forEach((el, i) => {
      let date = el.match(/^(.*) /g);
      let pathName = el.match(/(files\/.*)$/g);

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

      if (!pathNameLoca && !dateLoca) {
        html += `<tr id="${i}" class="${color}"><th scope="row">#${i}</th><td>${pathName}</td><td class="m-hide">${date}</td><td colspan="2"><div class="note missing"><p><b>Warning !</b></p><p>This page is missing.</p></div></td></tr>`;
      } else {
        html += `<tr id="${i}" class="${color}"><th scope="row">#${i}</th><td>${pathName}</td><td class="m-hide">${date}</td><td>${pathNameLoca}</td><td class="m-hide">${dateLoca}</td></tr>`;
      }
    });

    $changesTable.innerHTML = html;
  }

  async function generateNav() {
    console.info("Start generating navigation");
    let count = (original.length - (original.length % 100)) / 100, html = '';
    for (let i = 1; i <= count; i++) {
      html += `<li><a href="#${i * 100}">#${i * 100}</a></li>`;
    }

    $quickNav.innerHTML = html;
  }

  fecthAllFiles();
});
