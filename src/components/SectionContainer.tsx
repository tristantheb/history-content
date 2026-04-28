import { type JSX } from 'react'
import { type PageData } from '@/types/HistoryDataType'
import { type SearchFilters } from './Search/SearchStatus'
import { Suspense } from 'react'
import { FlaskConical } from 'lucide-react'
import { GraphStats } from '@/components/GraphStats'
import { Pagination } from '@/components/Pagination'
import { SearchNavigationBar } from '@/components/Search/SearchNavigationBar'
import { Table } from './StatsTable/Table'
import { useFilteredRows, type FilteredRows } from '@/hooks/useFilteredRows'
import { usePaginatedWorker } from '@/hooks/usePaginatedWorker'
import { StatsSummary } from './StatsSummary'

const defaultRowsPerPage = 50

type SectionContainerProps = {
  locale: string
  pages: PageData[]
  filters: {
    path: string
    categories: string[]
    statuses: SearchFilters[]
  }
  search: {
    searchPath: string
    setSearchPath: (path: string) => void
  }
}

const SectionContainer = (props: SectionContainerProps): JSX.Element => {
  const { locale, pages, filters, search } = props
  const filteredRows: FilteredRows = useFilteredRows({
    unfilteredRows: pages,
    filters
  })
  const { pageRows, page, setPage, total } = usePaginatedWorker(filteredRows.rows, defaultRowsPerPage)
  const totalPages = Math.ceil(total / defaultRowsPerPage)

  return (
    <section className={'container'}>
      <div className={'path-container'} aria-hidden={'true'}>
        <div className={'path-left'}></div>
        <div className={'path-right'}></div>
      </div>

      <div>
        <h2 id={'table-of-page-statuses'}>Table of page statuses</h2>
        <p>You will find in this table the various documents currently translated, coloured in green or yellow…</p>
      </div>

      <div className={'container-item'}>
        <div className={'container-item-title'}>
          <h3>
            <span className={'experimental-badge'}>
              <FlaskConical size={16} />Experimental
            </span> Advanced statistics
          </h3>
        </div>
        <div className={'container-item-content'}>
          <GraphStats lang={locale} />
        </div>
      </div>

      <StatsSummary {...filteredRows.counts} />

      <SearchNavigationBar
        path={{ searchPath: search.searchPath, setSearchPath: search.setSearchPath }}
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
          lang={locale}
          error={null}
          totalRows={total}
          startIndex={Math.max(1, (page - 1) * defaultRowsPerPage + 1)}
        />
      </Suspense>

      <div
        className={'container-item nav-bar'}
        aria-atomic={false}
        aria-live={'polite'}
      >
        <Pagination {...{ page, totalPages, setPage }} />
      </div>
    </section>
  )
}

export { SectionContainer }
