import { useEffect, useState } from 'react'

/**
 * Utility function to get a URL parameter value with a default fallback, used
 * to initialize the locale state and update it on URL changes.
 * @param {string} name The name of the URL parameter to retrieve.
 * @param {string} defaultValue The default value to return if the parameter is
 * not found.
 *
 * @returns {string} The value of the URL parameter or the default value.
 */
const getParam = (name: string, defaultValue: string): string => {
  const selectedValue = new URLSearchParams(window.location.search).get(name)
  return selectedValue || defaultValue
}

/**
 * C'est la merde de Copilot, les variable veulent rien dire, y'a pas de
 * description, le typage n'est pas effectué, rien ne va dans cette fonction
 *
 * @version 2.7.0
 */
const useLocale = (defaultLocale = 'fr') => {
  const [lang, setLangState] = useState<string>(() => getParam('lang', defaultLocale))

  useEffect(() => {
    const onPop = () => setLangState(getParam('lang', defaultLocale))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [defaultLocale])

  const setLang = (l: string) => {
    const url = new URL(window.location.href)
    if (l) url.searchParams.set('lang', l)
    else url.searchParams.delete('lang')
    window.history.pushState(null, '', url.toString())
    setLangState(l)
  }

  return { lang, setLang }
}

export { useLocale }
