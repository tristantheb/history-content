import { useMemo } from 'react'
import type { Row, Counts } from '@/types'
import { Status } from '@/types/Status'
import { getRowsCounts } from './useComputedRows'

type SearchRequest = {
  unfilteredRows: Row[]
  filters: {
    path: string
    categories: string[]
    statuses: Status[]
  }
}

type FilteredRows = {
  rows: Row[]
  counts: Counts
}

const getCategories = (categories: string[] = [], filters: string[] = []): boolean => {
  if (filters.length === 0) return true
  // filters can contain "group,category" or "category"
  return filters.some(filter => {
    if (filter.includes(',')) {
      const [group, category] = filter.split(',')
      return categories.includes(category) && categories.includes(group)
    }
    return categories.includes(filter)
  })
}

const getPath = (path: string = '', filterPath: string): boolean => {
  if (!filterPath) return true
  return path.includes(filterPath)
}

const getStatuses = (hashStatus: Status, filters: Status[] = []): boolean => {
  if (filters.length === 0) return true
  for (const f of filters) {
    if (hashStatus === f) return true
  }
  return false
}

const useFilteredRows = ({ unfilteredRows, filters }: SearchRequest): FilteredRows => {
  const filteredRows = useMemo(() => (
    unfilteredRows.filter(row => (
      getPath(row.path, filters.path) &&
      getCategories(row.categories, filters.categories) &&
      getStatuses(row.hashStatus, filters.statuses)
    ))
  ), [unfilteredRows, filters])

  const counts = getRowsCounts(filteredRows)

  return { rows: filteredRows, counts }
}

export type { FilteredRows }
export { useFilteredRows }
