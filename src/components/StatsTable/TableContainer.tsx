import { useState, useMemo } from 'react'
import { AsyncTable } from '@/components/AsyncTable'
import { Pagination } from '@/components/Pagination'
import { SearchBar } from '@/components/SearchBar'
import { StatsSummary } from '@/components/StatsSummary'
import { Status } from '@/types/Status'
import { useComputedRows } from '@/hooks/useComputedRows'
import { useDisplayRows } from '@/hooks/useDisplayRows'
import { usePaginatedWorker } from '@/hooks/usePaginatedWorker'
import { usePopularityWorker } from '@/hooks/usePopularityWorker'

type TableContainerProps = {
  original?: string[]
  localized?: string[]
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
  popularityCsv = '',
  rowsPerPage = 50
}: TableContainerProps) => {
  const [search, setSearch] = useState('')
  const { allRows, counts } = useComputedRows(original, localized)
  const { map: popularityMap, ready: popularityReady } = usePopularityWorker(popularityCsv)

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    return search ? allRows.filter(r => r.pathName.toLowerCase().includes(search.toLowerCase())) : allRows
  }, [allRows, search])

  // Paginate via worker
  const { pageRows, page, setPage, total } = usePaginatedWorker(filteredRows, rowsPerPage)
  const totalPages = Math.ceil(total / rowsPerPage)

  // Attach popularity display cell
  const displayRows = useDisplayRows(pageRows, popularityMap, popularityReady)
  const onSearchChange = (v: string) => {
    setSearch(v)
    setPage(1)
  }

  const filteredCounts = useMemo(() => {
    let upToDate = 0, outDated = 0, unstranslated = 0, totalCount = 0
    for (const r of filteredRows) {
      if (r.hashStatus === Status.UP_TO_DATE) upToDate++
      else if (r.hashStatus === Status.OUTDATED) outDated++
      else if (r.hashStatus === Status.MISSING) outDated++
      else unstranslated++
      totalCount++
    }
    return { upToDate, outDated, unstranslated, total: totalCount }
  }, [filteredRows])

  const displayCounts = search ? filteredCounts : counts
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
        <SearchBar value={search} onChange={onSearchChange} customClass={'nav-col'} />
        <Pagination {...{ page, totalPages, setPage }} customClass={'nav-col'} />
        {search && <StatsSummary counts={displayCounts} customClass={'nav-row'} />}
      </div>
      <h3 id={'some_statistics'}>
        Some statistics
      </h3>
      <p>
        All translated files represent <strong>{translatedCount}</strong>
        (<em>{translatedPct.toFixed(2)}%</em>) files out of {counts.total} files to be translate.
      </p>
      <StatsSummary counts={counts} />
      <AsyncTable
        rows={displayRows}
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
