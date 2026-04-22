import { type Status } from './Status'

/**
 * Global element duplicated in all extending types
 */
type BaseData = {
  /**
   * The hash commit of the page (for en-us) or the source page (for translated)
   * @version 2.6.3
   */
  sourceCommit: string | undefined
}

/**
 * Data of a localized page
 */
type LocalizedData = BaseData & {
  /**
   * Give the last modified date of the page in the locale. Useful for
   * page witout commit hash.
   *
   * @version 2.6.3
   */
  lastModified?: string
  /**
   * Represents the parity number of the commits between last used on translated
   * and the current commit on en-us.
   *   - null is the value for "no commit hash" and "untranslated" pages.
   *   - 0 is the up-to-date state.
   *   - every positive number is the gap between the commits.
   * @default null
   * @version 2.7.0
   */
  parity: number
}

/**
 * Data of the origin page in en-us
 */
type EnglishData = BaseData & {
  /**
   * A string of categories separated by `|`. Used for search by categories.
   * @version 2.6.3
   */
  categories: string
}

/**
 * The data of a page with all the useful information to display in the table
 * and global stats.
 * @version 2.7.0
 */
type PageData = LocalizedData & {
  /**
   * The localization status of the page, used to display the right status in
   * the table and global stats.
   * @version 2.7.0
   */
  hashStatus: Status
  /**
   * This is the ID of the page in the line of CSV for React use.
   * @version 2.7.0
   */
  id: number
  /**
   * Path of the page in workspace format
   * @version 2.6.3
   */
  path: string
  /**
   * The original data from en-us, used for comparison and to get categories.
   * @version 2.7.0
   */
  parent: EnglishData
  /**
   * The page popularity from en-us logs, used as global popularity estimation.
   * @version 2.7.0
   */
  popularity: number | null
}

export type { PageData }
