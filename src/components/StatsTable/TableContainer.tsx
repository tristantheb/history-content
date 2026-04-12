import { Suspense, useMemo, useState } from 'react'
import { type Filter } from '@/components/Search/FilterElement'
import { BarBackground } from '@/components/BarBackground'
import { Pagination } from '@/components/Pagination'
import { SearchNavigationBar } from '@/components/Search/SearchNavigationBar'
import { Table } from './Table'
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

  return (
    <section>
      <SearchNavigationBar
        counts={counts}
        filteredRows={filteredRows}
        path={{ searchPath, setSearchPath }}
        categories={{ searchCategories, setSearchCategories }}
        statuses={{ searchStatuses, setSearchStatuses }}
        paginate={{ page, totalPages, setPage }}
      />
      <Suspense
        fallback={
          <div className={'info-block'}>
            Table is loading…
          </div>
        }
      >
        <Table
          rows={displayRows}
          lang={lang}
          error={null}
          totalRows={total}
          startIndex={Math.max(1, (page - 1) * rowsPerPage + 1)}
        />
      </Suspense>
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
