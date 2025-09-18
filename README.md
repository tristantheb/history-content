# The MDN Change History Reader

This project provides a live tool to explore the edit history of MDN Web Docs locales.
Using comparative text analysis between document versions of en-US and the selected locale.

## Usage

Go to the [deployed site]() and select a locale by adding `?locale=` and the locale following the folder names in the [MDN Translated Content repository]().

### Badges of a page

To use a badge of a page, you need to use the next URL format:

`https://tristantheb.github.io/history-content/badges/<locale>/<path>.svg`

For example:

`https://tristantheb.github.io/history-content/badges/fr/web/html.svg`

#### Results

![Badge of the french page Web/HTML on MDN displaying the current translation status](https://tristantheb.github.io/history-content/badges/fr/web/html.svg)

## How it's working

The project deploy an updated version of the status every day at 3 AM UTC.

## Want to contribute?

Feel free to open issues or pull requests.

Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License

[MIT](LICENSE.md)
