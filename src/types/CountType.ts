/**
 * Represent a counter of the different status of the pages.
 * @since 2.0.0
 */
type Counts = {
  /**
   * The number of pages with up-to-date localization.
   * @since 2.0.0
   */
  upToDate: number
  /**
   * The number of pages with outdated or missing hash.
   * @since 2.0.0
   */
  outDated: number
  /**
   * The number of pages with an invalid hash.
   * @since 2.7.0
   */
  poisoned: number
  /**
   * The number of pages without translation.
   * @since 2.0.0
   */
  unstranslated: number
  /**
   * The total number of pages.
   * @since 2.0.0
   */
  total: number
}

export type { Counts }
