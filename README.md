# The MDN Change history reader
This script makes it possible to differentiate between two text files containing the latest modifications of two distinct folders in order to indicate the absence of a page or an update of the pages.

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
