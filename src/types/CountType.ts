/**
 * Represent a counter of the different status of the pages.
 * @version 2.0.0
 */
type Counts = {
  /**
   * The number of pages with up-to-date localization.
   * @version 2.0.0
   */
  upToDate: number
  /**
   * The number of pages with outdated or missing hash.
   * @version 2.0.0
   */
  outDated: number
  /**
   * The number of pages without translation.
   * @version 2.0.0
   */
  unstranslated: number
  /**
   * The total number of pages.
   * @version 2.0.0
   */
  total: number
}

export type { Counts }
