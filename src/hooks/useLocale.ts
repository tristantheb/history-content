import { useEffect, useState } from 'react'

/**
 * Utils elements for locale management ad read/write.
 */
type LocaleState = {
  /**
   * The navigator local by default, or the selected one by the user.
   * @since 2.7.0
   */
  locale: string
  /**
   * The mutator function to update the locale, it updates the URL and the state
   * of the app.
   * @param locale The new locale to set.
   *
   * @returns void
   * @since 2.7.0
   */
  setLocale: (locale: string) => void
}

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
 * Custom React hook to manage locale state based on URL parameters, allowing
 * dynamic updates when the URL changes.
 * @param {string} defaultLocale The default locale to use as user locale.
 * @default 'fr'
 *
 * @returns {LocaleState} An object containing the current locale and a function
 * to update it.
 * @since 2.7.0
 */
const useLocale = (defaultLocale = 'fr'): LocaleState => {
  const [locale, setLocaleState] = useState<string>(() => getParam('lang', defaultLocale))

  useEffect(() => {
    const handlePopState = (): void => {
      setLocaleState(getParam('lang', defaultLocale))
    }

    window.addEventListener('popstate', handlePopState)
    return (): void => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [defaultLocale])

  const setLocale = (locale: string, setLocaleState: (locale: string) => void): void => {
    setLocaleState(locale)
  }

  return { locale, setLocale: (locale: string) => setLocale(locale, setLocaleState) }
}

export { useLocale }
