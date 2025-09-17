## Badges SVG statiques pour MDN Page Status

Des images SVG sont générées automatiquement pour une liste de pages MDN dans `site/public/badges/` à chaque build.

Exemple d'intégration :

```
<img src="https://tristantheb.github.io/history-content/badges/en-US_docs_Web_HTML.svg" alt="MDN Page Status">
```

Pages disponibles (exemples) :
- `/en-US/docs/Web/HTML` → `badges/en-US_docs_Web_HTML.svg`
- `/fr/docs/Web/HTML` → `badges/fr_docs_Web_HTML.svg`

Pour ajouter d'autres pages, modifiez la liste `PAGES` dans `scripts/generate-badges.js`.
# The MDN Change history reader
This script makes it possible to differentiate between two text files containing the latest modifications of two distinct folders in order to indicate the absence of a page or an update of the pages.

## Site React (Vite + Tailwind) et déploiement GitHub Pages

Une application React minimaliste a été ajoutée dans `site/` avec Vite et Tailwind CSS. Elle est prête à être publiée sur GitHub Pages via un workflow GitHub Actions.

### Développer en local

1. Installer les dépendances de l'app React

```
cd site
npm install
```

2. Lancer le serveur de dev

```
npm run dev
```

3. Construire pour la prod (facultatif)

```
npm run build
```

Le build est généré dans `site/dist`.

### Publier sur GitHub Pages

Le fichier de workflow `/.github/workflows/deploy.yml` est configuré pour :

- construire l'app sous `site/`
- publier le dossier `site/dist` sur GitHub Pages
- utiliser `base: '/history-content/'` (chemin de ce dépôt)

Étapes côté GitHub :

1. Dans GitHub > Settings > Pages, choisissez « Build and deployment: GitHub Actions » si ce n’est pas déjà le cas.
2. Poussez sur `main` (ou `l10n-fr`). Le workflow « Deploy React site to GitHub Pages » s’exécute et publie le site.
3. L’URL publiée ressemble à : `https://<votre-utilisateur>.github.io/history-content/`.

### Personnaliser le site

- Page d’entrée : `site/src/App.jsx`
- Point d’entrée : `site/src/main.jsx`
- Styles globaux Tailwind : `site/index.css`
- Config Vite (inclut `base`) : `site/vite.config.js`

Si vous renommez le dépôt, pensez à mettre à jour la propriété `base` dans `site/vite.config.js` avec le nouveau nom, par ex. `'/nouveau-repo/'`.

## Recovering data
1. In order to generate a file, you need to open a Bash command block, and use the following command to retrieve the information from the `mdn/content` repository:
    ```bash
    git ls-tree -r --name-only HEAD files/en-us/ | grep ".md$" | while read filename; do
      echo "$(git log -1 --format="%ad" -- $filename) $filename" >> logs-en-us.txt
    done
    ```
    **Note:** You must have the folder locally on your computer, be in `content` and run the command from the root `content`.
2. Then you need to retrieve the data for the language you want to check. For example with the French folder :
    ```bash
    git ls-tree -r --name-only HEAD files/fr/ | grep ".md$" | while read filename; do
      echo "$(git log -1 --format="%ad" -- $filename) $filename" >> logs-fr.txt
    done
    ```
    **Note:** You must have the folder locally on your computer, be in `translated-content` and run the command from the root `translated-content`.

    **Note 2:** If you wish to change the language, you must change `files/fr/` and `logs-fr.txt` to the code used on the MDN for your language.
3. Place both log files in the `history` folder of `history-content` so that the script can process them.

## Processing the data
Now let's set up the important part of the system, the language we are checking. In the `index.js` file, change the following line to the language you want to check:
```js
const lang = 'fr';
```
Then you just have to launch the index.html page and wait for the result to be returned.
