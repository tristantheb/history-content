import { useEffect, useMemo, useState } from 'react'
import { type SearchFilters } from '@/components/Search/SearchStatus'
import { Status } from '@/types/Status'

/**
 * Represents the state of the search filters used in the application.
 *
 * @since 2.10.0
 */
type SearchState = {
  path: string
  categories: string[]
  statuses: SearchFilters[]
}

/**
 * Represents the state and functions to manage search filters in the
 * application.
 *
 * @since 2.10.0
 */
type SearchFiltersState = {
  searchPath: string
  setSearchPath: (path: string) => void
  searchCategories: string[]
  setSearchCategories: (categories: string[]) => void
  searchStatuses: SearchFilters[]
  setSearchStatuses: (statuses: SearchFilters[]) => void
  filters: SearchState
}

/**
 * Retrieves the current search state from the URL's query parameters.
 *
 * @returns {SearchState} The current search state.
 * @since 2.10.0
 */
const getSearchState = (): SearchState => {
  const params = new URLSearchParams(window.location.search)
  const statuses: SearchFilters[] = []

  for (const value of params.getAll('status')) {
    const separator = value.lastIndexOf(':')
    if (separator === -1) continue

    const status = value.slice(0, separator) as SearchFilters[0]
    const filter = value.slice(separator + 1)
    if (
      Object.values(Status).includes(status as Status) &&
      (filter === 'show' || filter === 'hide') &&
      !statuses.some(([current]) => current === status)
    ) {
      statuses.push([status, filter])
    }
  }

  return {
    path: params.get('path') || '',
    categories: params.getAll('category'),
    statuses
  }
}

/**
 * Updates the URL's query parameters based on the provided search state.
 * @param {string} path The path filter to set in the URL.
 * @param {string[]} categories The categories filter to set in the URL.
 * @param {SearchFilters[]} statuses The statuses filter to set in the URL.
 *
 * @returns {void}
 * @since 2.10.0
 */
const updateSearchUrl = ({ path, categories, statuses }: SearchState): void => {
  const url = new URL(window.location.href)
  url.searchParams.delete('path')
  url.searchParams.delete('category')
  url.searchParams.delete('status')

  if (path) url.searchParams.set('path', path)
  for (const category of categories) url.searchParams.append('category', category)
  for (const [status, filter] of statuses) url.searchParams.append('status', `${status}:${filter}`)

  window.history.replaceState(null, '', url.toString())
}

/**
 * A custom React hook that manages search filters and synchronizes them with
 * the URL's query parameters.
 *
 * @returns {SearchFiltersState} An object containing the current search filters
 * and functions to update them.
 * @since 2.10.0
 */
const useSearchFilters = (): SearchFiltersState => {
  const [searchState, setSearchState] = useState<SearchState>(getSearchState)

  useEffect(() => {
    const handlePopState = (): void => setSearchState(getSearchState())
    window.addEventListener('popstate', handlePopState)
    return (): void => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => updateSearchUrl(searchState), [searchState])

  const updateSearchState = (nextState: Partial<SearchState>): void => {
    setSearchState(current => ({ ...current, ...nextState }))
  }

  const filters = useMemo(() => ({
    path: searchState.path.toLocaleLowerCase(),
    categories: searchState.categories,
    statuses: searchState.statuses
  }), [searchState])

  return {
    searchPath: searchState.path,
    setSearchPath: (path: string): void => updateSearchState({ path }),
    searchCategories: searchState.categories,
    setSearchCategories: (categories: string[]): void => updateSearchState({ categories }),
    searchStatuses: searchState.statuses,
    setSearchStatuses: (statuses: SearchFilters[]): void => updateSearchState({ statuses }),
    filters
  }
}

export { useSearchFilters }
