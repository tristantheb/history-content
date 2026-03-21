import { useMemo, useState } from 'react'
import { type Filter } from '@/components/HTMLFilterElement/HTMLFilterElement'
import { AsyncTable } from '@/components/AsyncTable'
import { Pagination } from '@/components/Pagination'
import { SearchBar } from '@/components/Search/SearchBar'
import { SearchCategories } from '@/components/Search/SearchCategories'
import { SearchStatus } from '@/components/Search/SearchStatus'
import { StatsSummary } from '@/components/StatsSummary'
import { useComputedRows } from '@/hooks/useComputedRows'
import { useDisplayRows } from '@/hooks/useDisplayRows'
import { useFilteredRows, type FilteredRows } from '@/hooks/useFilteredRows'
import { usePaginatedWorker } from '@/hooks/usePaginatedWorker'
import { usePopularityWorker } from '@/hooks/usePopularityWorker'
import { EnglishData, LocalizedData } from '@/types/HistoryDataType'

type TableContainerProps = {
  original?: EnglishData[]
  localized?: LocalizedData[]
  lang?: string
  popularityCsv?: string
  rowsPerPage?: number
}

const BarBackground = () => (
  <>
    <div className={'nav-bar-left'} aria-hidden={true}></div>
    <div className={'nav-bar-right'} aria-hidden={true}></div>
  </>
)

const TableContainer = ({
  original = [],
  localized = [],
  lang = 'fr',
  popularityCsv = '',
  rowsPerPage = 50
}: TableContainerProps) => {
  const [searchPath, setSearchPath] = useState('')
  const [searchCategories, setSearchCategories] = useState<string[]>([])
  const [searchStatuses, setSearchStatuses] = useState<Filter>({ included: [], excluded: [] })

  const { allRows, counts } = useComputedRows(original, localized)
  const { map: popularityMap, ready: popularityReady } = usePopularityWorker(popularityCsv)

  const filters = useMemo(() => ({
    path: searchPath.toLocaleLowerCase(),
    categories: searchCategories,
    statuses: searchStatuses
  }), [searchPath, searchCategories, searchStatuses])

  // Filter rows based on search
  const filteredRows: FilteredRows = useFilteredRows({
    unfilteredRows: allRows,
    filters
  })

  // Paginate via worker
  const { pageRows, page, setPage, total } = usePaginatedWorker(filteredRows.rows, rowsPerPage)
  const totalPages = Math.ceil(total / rowsPerPage)

  // Attach popularity display cell
  const displayRows = useDisplayRows({ rows: pageRows, popularityMap, popularityReady })

  const translatedCount = counts.upToDate + counts.outDated
  const translatedPct = counts.total ? (translatedCount / counts.total) * 100 : 0

  return (
    <section>
      <div
        className={'navigation-bar navigation-bar-grid'}
        aria-atomic={false}
        aria-live={'polite'}
      >
        <BarBackground />
        <h3 className={'navigation-title'}>Search</h3>
        <SearchBar value={searchPath} onChange={setSearchPath} customClass={'nav-col'} />
        <Pagination {...{ page, totalPages, setPage }} customClass={'nav-col'} />
        <details className={'nav-row'}>
          <summary>Advanced search</summary>
          <h4>Search by status</h4>
          <SearchStatus onChange={setSearchStatuses} />
          <br />
          <h4>Search by category</h4>
          <SearchCategories value={searchCategories} onChange={setSearchCategories} customClass={'nav-col'} />
        </details>
        <StatsSummary counts={filteredRows.counts} customClass={'nav-row'} />
        <p>
          All translated files represent <strong>{translatedCount}</strong>
          (<em>{translatedPct.toFixed(2)}%</em>) files out of {counts.total} files to be translated.
        </p>
      </div>
      <AsyncTable
        rows={displayRows}
        lang={lang}
        error={null}
        popularityMap={popularityMap}
        popularityReady={popularityReady}
        totalRows={total}
        startIndex={Math.max(1, (page - 1) * rowsPerPage + 1)}
      />
      <div
        className={'navigation-bar navigation-bar-flex'}
        aria-atomic={false}
        aria-live={'polite'}
      >
        <BarBackground />
        <Pagination {...{ page, totalPages, setPage }} />
      </div>
    </section>
  )
}

export { TableContainer }
