import type { Dispatch, JSX, SetStateAction } from 'react'
import { type Filter } from '@/components/Search/FilterElement'
import { type FilteredRows } from '@/hooks/useFilteredRows'
import { BarBackground } from '@/components/BarBackground'
import { Pagination } from '@/components/Pagination'
import { SearchBar } from '@/components/Search/SearchBar'
// import { SearchCategories } from '@/components/Search/SearchCategories'
import { SearchStatus } from '@/components/Search/SearchStatus'
import { StatsSummary } from '@/components/StatsSummary'

type SearchNavigationBarProps = {
  counts: {
    total: number
    upToDate: number
    outDated: number
  }
  filteredRows: FilteredRows
  path: {
    searchPath: string
    setSearchPath: (path: string) => void
  }
  categories: {
    searchCategories: string[]
    setSearchCategories: (categories: string[]) => void
  }
  statuses: {
    searchStatuses: Filter
    setSearchStatuses: (statuses: Filter) => void
  }
  paginate: {
    page: number
    totalPages: number
    setPage: Dispatch<SetStateAction<number>>
    customClass?: string
  }
}

const SearchNavigationBar = ({
  counts,
  filteredRows,
  path,
  categories,
  statuses,
  paginate
}: SearchNavigationBarProps): JSX.Element => {
  const translatedCount = counts.upToDate + counts.outDated
  const translatedPct = counts.total ? (translatedCount / counts.total) * 100 : 0

  return (
    <div
      className={'navigation-bar navigation-bar-grid'}
      aria-atomic={false}
      aria-live={'polite'}
    >
      <BarBackground />
      <h3 className={'navigation-title'}>Search</h3>
      <SearchBar value={path.searchPath} onChange={path.setSearchPath} customClass={'nav-col'} />
      <Pagination {...paginate} customClass={'nav-col'} />
      <details className={'nav-row'}>
        <summary>Advanced search</summary>
        <h4>Search by status</h4>
        <SearchStatus onChange={statuses.setSearchStatuses} />
        {/* <br />
        <h4>Search by category</h4>
        <SearchCategories
          value={categories.searchCategories}
          onChange={categories.setSearchCategories}
          customClass={'nav-col'} /> */}
      </details>
      <StatsSummary counts={filteredRows.counts} customClass={'nav-row'} />
      <p>
        All translated files represent <strong>{translatedCount}</strong>
        (<em>{translatedPct.toFixed(2)}%</em>) files out of {counts.total} files to be translated.
      </p>
    </div>
  )
}

export { SearchNavigationBar }
