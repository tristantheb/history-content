import { useMemo } from 'react'
import { type Counts } from '@/types/CountType'
import { type PageData } from '@/types/HistoryDataType'
import { Status } from '@/types/Status'

/**
 * Getting the count of each rows status to global stats.
 * @param {PageData[]} allPageDatas A list of formatted rows about the pages.
 *
 * @returns {Counts} A count of each status for the pages to say what need to be
 *  updated.
 * @since 2.5.0
 */
const getRowsCounts = (allPageDatas: PageData[]): Counts => (
  useMemo(() => {
    let upToDate = 0, outDated = 0, unstranslated = 0, poisoned = 0, total = 0
    for (const r of allPageDatas) {
      if (r.hashStatus === Status.UP_TO_DATE) upToDate++
      else if (r.hashStatus === Status.OUTDATED) outDated++
      else if (r.hashStatus === Status.MISSING) outDated++
      else if (r.hashStatus === Status.POISONED) poisoned++
      else unstranslated++
      total++
    }
    return { upToDate, outDated, unstranslated, poisoned, total }
  }, [allPageDatas])
)

/**
 * Custom hook to get all formatted rows and status counts.
 * @param {PageData[]} pages The list of pages with all informations to parse.
 *
 * @returns {{ counts: Counts }} An object containing all
 *  formatted rows and their status counts.
 * @since 2.2.0
 */
const useComputedRows = (
  pages: PageData[] = []
) : { counts: Counts } => {
  const counts = getRowsCounts(pages)
  return { counts }
}

export { getRowsCounts, useComputedRows }
