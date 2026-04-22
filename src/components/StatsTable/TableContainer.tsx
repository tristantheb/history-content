import { JSX, Suspense, useMemo, useState } from 'react'
import { type Filter } from '@/components/Search/FilterElement'
import { BarBackground } from '@/components/BarBackground'
import { Pagination } from '@/components/Pagination'
import { SearchNavigationBar } from '@/components/Search/SearchNavigationBar'
import { Table } from './Table'
import { useComputedRows } from '@/hooks/useComputedRows'
import { useFilteredRows, type FilteredRows } from '@/hooks/useFilteredRows'
import { useGetPages } from '@/hooks/useGetPages'
import { usePaginatedWorker } from '@/hooks/usePaginatedWorker'
import { type PageData } from '@/types/HistoryDataType'

const defaultRowsPerPage = 50

const TableContainer = ({lang = 'fr'}: { lang?: string }): JSX.Element => {
  const [searchPath, setSearchPath] = useState('')
  const [searchCategories, setSearchCategories] = useState<string[]>([])
  const [searchStatuses, setSearchStatuses] = useState<Filter>({ included: [], excluded: [] })

  const { pages, categories }: { pages: PageData[], categories: Record<string, string[]> } = useGetPages({ lang })
  const { counts } = useComputedRows(pages)

  const filters = useMemo(() => ({
    path: searchPath.toLocaleLowerCase(),
    categories: searchCategories,
    statuses: searchStatuses
  }), [searchPath, searchCategories, searchStatuses])

  // Filter rows based on search
  const filteredRows: FilteredRows = useFilteredRows({
    unfilteredRows: pages,
    filters
  })

  // Paginate via worker
  const { pageRows, page, setPage, total } = usePaginatedWorker(filteredRows.rows, defaultRowsPerPage)
  const totalPages = Math.ceil(total / defaultRowsPerPage)

  return (
    <section>
      <SearchNavigationBar
        counts={counts}
        filteredRows={filteredRows}
        path={{ searchPath, setSearchPath }}
        categories={{ searchCategories, setSearchCategories, categories }}
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
          rows={pageRows}
          lang={lang}
          error={null}
          totalRows={total}
          startIndex={Math.max(1, (page - 1) * defaultRowsPerPage + 1)}
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
