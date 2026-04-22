import { useMemo } from 'react'
import { type Filter } from '@/components/Search/FilterElement'
import { type Counts } from '@/types/CountType'
import { type PageData } from '@/types/HistoryDataType'
import { type Status } from '@/types/Status'
import { getRowsCounts } from './useComputedRows'

/**
 * Represents the search request for filtering rows in the table.
 *
 * @version 2.5.0
 */
type SearchRequest = {
  unfilteredRows: PageData[]
  filters: {
    path: string
    categories: string[]
    statuses: Filter
  }
}

/**
 * Returns the filtered rows based on the search request and the counts of each
 * status in the filtered rows.
 *
 * @version 2.5.0
 */
type FilteredRows = {
  rows: PageData[]
  counts: Counts
}

/**
 * Logic to filter rows based on search criteria: path, categories and statuses.
 * @param {string[]} categories The categories of the row.
 * @param {string[]} filters The filters to apply.
 *
 * @returns {boolean} Whether the row matches the filters.
 * @version 2.5.0
 */
const getCategories = (categories: string[] = [], filters: string[] = []): boolean => {
  if (filters.length === 0) return true

  const categoriesString = categories.join(',').toLowerCase()
  return filters.some(filter => categoriesString.includes(filter.toLowerCase()))
}

/**
 * Logic to filter rows based on the path search criteria.
 * @param {string} path The path in the row.
 * @param {string} filterPath The path filter to apply.
 *
 * @returns {boolean} Whether the row matches the path filter.
 * @version 2.5.0
 */
const getPath = (path: string = '', filterPath: string): boolean => {
  if (!filterPath) return true
  return path.includes(filterPath)
}

/**
 * Logic to filter rows based on the status search criteria.
 * @param {Status} hashStatus The status of the row.
 * @param {Filter} filters The filters to apply.
 *
 * @returns {boolean} Whether the row matches the status filter.
 * @version 2.5.0
 */
const getStatuses = (hashStatus: Status, filters: Filter = { included: [], excluded: [] }): boolean => {
  if (filters.included.length === 0 && filters.excluded.length === 0) return true
  if (filters.included.length > 0 && !filters.included.includes(hashStatus)) return false
  if (filters.excluded.length > 0 && filters.excluded.includes(hashStatus)) return false
  return true
}

/**
 * Custom hook to filter rows based on search criteria and get the counts of
 * each status in the filtered rows.
 * @param {PageData[]} SearchRequest['unfilteredRows'] The rows to be filtered.
 * @param {object} filters The filters to apply on the rows, containing path,
 * categories and statuses filters.
 *
 * @returns {FilteredRows} The filtered rows and their counts.
 * @version 2.5.0
 */
const useFilteredRows = ({ unfilteredRows, filters }: SearchRequest): FilteredRows => {
  const filteredRows = useMemo(() => (
    unfilteredRows.filter((row: PageData) => (
      getPath(row.path, filters.path) &&
      getCategories(row.parent.categories, filters.categories) &&
      getStatuses(row.hashStatus, filters.statuses)
    ))
  ), [unfilteredRows, filters])

  const counts = getRowsCounts(filteredRows)

  return { rows: filteredRows, counts }
}

export { type FilteredRows, useFilteredRows }
