import { useMemo } from 'react'
import { type SearchFilters } from '@/components/Search/SearchStatus'
import { type Counts } from '@/types/CountType'
import { type PageData } from '@/types/HistoryDataType'
import { getRowsCounts } from './useComputedRows'
import type { SortDir, SortKey } from '@/types/SortingType'

/**
 * Represents the search request for filtering rows in the table.
 * @since 2.5.0
 */
type SearchRequest = {
  unfilteredRows: PageData[]
  filters: {
    path: string
    categories: string[]
    statuses: SearchFilters[]
  }
  sortKey: SortKey
  sortDir: SortDir
}

/**
 * Returns the filtered rows based on the search request and the counts of each
 * status in the filtered rows.
 * @since 2.5.0
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
 * @since 2.5.0
 */
const getCategories = (categories: string[], filters: string[] = []): boolean => {
  if (filters.length === 0) return true
  const joinedCategories = categories.join(',')

  for (const filterString of filters) {
    if (!filterString) continue

    const tokenList = filterString.split(',').map(tokenRaw => tokenRaw.trim()).filter(Boolean)
    if (tokenList.length === 0) continue

    if (tokenList.length === 1) {
      const firstToken = tokenList[0]
      if (firstToken && joinedCategories.indexOf(firstToken) !== -1) return true
      continue
    }

    let searchPosition = 0
    let matched = true
    for (const tokenItem of tokenList) {
      const foundIndex = joinedCategories.indexOf(tokenItem, searchPosition)
      if (foundIndex === -1) { matched = false; break }
      searchPosition = foundIndex + tokenItem.length
    }
    if (matched) return true
  }

  return false
}

/**
 * Logic to filter rows based on the path search criteria.
 * @param {string} path The path in the row.
 * @param {string} filterPath The path filter to apply.
 *
 * @returns {boolean} Whether the row matches the path filter.
 * @since 2.5.0
 */
const getPath = (path: string = '', filterPath: string): boolean => {
  if (!filterPath) return true
  return path.includes(filterPath)
}

/**
 * Logic to filter rows based on the status search criteria.
 * @param {Status} hashStatus The status of the row.
 * @param {SearchFilters} filters The filters to apply.
 *
 * @returns {boolean} Whether the row matches the status filter.
 * @since 2.5.0
 */
const getStatuses = (hashStatus: string, filters: SearchFilters[] = []): boolean => {
  if (filters.length === 0) return true

  // collect statuses explicitly marked 'show' or 'hide'
  const showList = filters.filter(p => p[1] === 'show').map(p => String(p[0]))
  if (showList.length > 0) return showList.includes(String(hashStatus))

  const hideList = filters.filter(p => p[1] === 'hide').map(p => String(p[0]))
  if (hideList.length > 0) return !hideList.includes(String(hashStatus))

  return true
}

/**
 * Logic to sort empty rows to the bottom of the table.
 * @param {string|number|null} value The value to check.
 *
 * @returns {boolean} Whether the value is considered empty.
 * @since 2.8.0
 */
const isEmpty = (value: string | number | null): boolean =>
  value == null || value === '' || (typeof value === 'number' && isNaN(value))

/**
 * Logic to compare two values for sorting.
 * @param left The left value to compare.
 * @param right The right value to compare.
 * @param sortDir The direction to sort ('asc' or 'desc').
 *
 * @returns {number} The comparison result.
 * @since 2.8.0
 */
const compareValues = (left: string | number, right: string | number, sortDir: 'asc' | 'desc'): number => {
  const compare = left
    .toLocaleString()
    .localeCompare(right.toLocaleString(), undefined, { numeric: true, sensitivity: 'base' })
  return sortDir === 'asc' ? compare : -compare
}

/**
 * Logic to sort rows based on a key and direction.
 * @param rows The rows to sort.
 * @param sortKey The key to sort by.
 * @param sortDir The direction to sort ('asc' or 'desc').
 *
 * @returns {PageData[]} The sorted rows.
 * @since 2.8.0
 */
const setSorting = (rows: PageData[], sortKey: SortKey, sortDir: SortDir): PageData[] => {
  return [...rows].sort((a, b) => {
    const aVal = a[sortKey] as string | number
    const bVal = b[sortKey] as string | number
    const aEmpty = isEmpty(aVal)
    const bEmpty = isEmpty(bVal)

    if (aEmpty !== bEmpty) return aEmpty ? 1 : -1
    if (aEmpty) return 0

    return compareValues(aVal, bVal, sortDir)
  })
}

/**
 * Custom hook to filter rows based on search criteria and get the counts of
 * each status in the filtered rows.
 * @param {PageData[]} SearchRequest['unfilteredRows'] The rows to be filtered.
 * @param {object} filters The filters to apply on the rows, containing path,
 * categories and statuses filters.
 * @param {SortKey} sortKey The key to sort the rows by.
 * @param {SortDir} sortDir The direction to sort the rows.
 *
 * @returns {FilteredRows} The filtered rows and their counts.
 * @since 2.5.0
 */
const useFilteredRows = ({ unfilteredRows, filters, sortKey, sortDir }: SearchRequest): FilteredRows => {
  const filteredRows = useMemo(() => (
    unfilteredRows.filter((row: PageData) => (
      getPath(row.path, filters.path) &&
      getCategories(row.parent.categories, filters.categories) &&
      getStatuses(row.hashStatus, filters.statuses)
    ))
  ), [unfilteredRows, filters])

  const sortedRows = useMemo(
    () => setSorting(filteredRows, sortKey, sortDir),
    [filteredRows, sortKey, sortDir]
  )
  const counts = getRowsCounts(filteredRows)

  return { rows: sortedRows, counts }
}

export { type FilteredRows, useFilteredRows }
