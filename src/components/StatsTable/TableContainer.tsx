import { useState, useMemo } from 'react'
import { AsyncTable } from '@/components/AsyncTable'
import { Pagination } from '@/components/Pagination'
import { SearchBar } from '@/components/SearchBar'
import { StatsSummary } from '@/components/StatsSummary'
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

const TableContainer = ({
  original = [],
  localized = [],
  popularityCsv = '',
  rowsPerPage = 50
}: TableContainerProps) => {
  const [search, setSearch] = useState('')

  // Compute rows and counts from raw history lines
  const { allRows, counts } = useComputedRows(original, localized)

  // Popularity worker
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

  const translatedCount = counts.upToDate + counts.outDated
  const translatedPct = counts.total ? (translatedCount / counts.total) * 100 : 0

  const navigationClass = [
    'flex items-center md:justify-between gap-4 mb-6',
    'bg-zinc-200 dark:bg-zinc-800 p-4 rounded-lg shadow-lg'
  ].join(' ')

  return (
    <section>
      <div className={navigationClass}>
        <SearchBar value={search} onChange={onSearchChange} />
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>
      <h3 id={'some_statistics'} className={'text-lg dark:text-slate-100 md:text-xl xl:text-2xl mb-2'}>
        Some statistics
      </h3>
      <StatsSummary counts={counts} />
      <p className={'mb-6'}>
        It represent <strong>{translatedCount}</strong>
        (<em>{translatedPct.toFixed(2)}%</em>) files translated of {counts.total} files.
      </p>
      <AsyncTable
        rows={displayRows}
        error={null}
        popularityMap={popularityMap}
        popularityReady={popularityReady}
        totalRows={total}
        startIndex={Math.max(1, (page - 1) * rowsPerPage + 1)}
      />
    </section>
  )
}

export { TableContainer }
