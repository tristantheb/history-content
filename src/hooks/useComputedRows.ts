import { useMemo } from 'react'
import type { Row, Counts } from '@/types'
import { Status } from '@/types/Status'
import { EnglishData, LocalizedData } from '@/types/HistoryDataType'

/**
 * Getting a formatted version of the pages list to use as search or page
 * results.
 * @param {EnglishData[]} original The list of pages in english.
 * @param {LocalizedData[]} localized The list of pages in the selected locale.
 *
 * @returns {Row[]} The formated rows with usefull informations to display.
 */
const getAllRows = (original: EnglishData[] = [], localized: LocalizedData[] = []): Row[] => (
  useMemo(() => {
    return original.map((el: EnglishData, i) => {
      const {originPath, originHash} = { originPath: el.path, originHash: el.sourceCommit }
      const localeData = localized.find(l10n => l10n.path === originPath)
      const localeHash = localeData?.sourceCommit ?? undefined
      const categories = el && typeof el.categories === 'string' ? el.categories.split('|') : []

      let hashStatus: Status
      if (!localeHash) hashStatus = Status.UNSTRANSLATED
      else if (localeHash === 'no_hash_commit') hashStatus = Status.MISSING
      else if (originHash && localeHash === originHash) hashStatus = Status.UP_TO_DATE
      else hashStatus = Status.OUTDATED

      return {
        id: i + 1,
        path: originPath,
        lastModified: el.lastModified,
        lastModifiedLocale: localeData?.lastModified ?? undefined,
        categories,
        hashStatus
      }
    })
  }, [original, localized])
)

/**
 * Getting the count of each rows status to global stats.
 * @param {Row[]} allRows A list of formatted rows about the pages.
 *
 * @returns {Counts} A count of each status for the pages to say what need to be
 *  updated.
 */
const getRowsCounts = (allRows: Row[]): Counts => (
  useMemo(() => {
    let upToDate = 0, outDated = 0, unstranslated = 0, total = 0
    for (const r of allRows) {
      if (r.hashStatus === Status.UP_TO_DATE) upToDate++
      else if (r.hashStatus === Status.OUTDATED) outDated++
      else if (r.hashStatus === Status.MISSING) outDated++
      else unstranslated++
      total++
    }
    return { upToDate, outDated, unstranslated, total }
  }, [allRows])
)

/**
 * Custom hook to get all formatted rows and status counts.
 * @exported
 * @param {EnglishData[]} original The list of pages in english.
 * @param {LocalizedData[]} localized The list of pages in the selected locale.
 *
 * @returns {{ allRows: Row[], counts: Counts }} An object containing all
 *  formatted rows and their status counts.
 */
const useComputedRows = (
  original: EnglishData[] = [], localized: LocalizedData[] = []
) : { allRows: Row[]; counts: Counts } => {
  const allRows = getAllRows(original, localized)
  const counts = getRowsCounts(allRows)
  return { allRows, counts }
}

export { getRowsCounts, useComputedRows }
