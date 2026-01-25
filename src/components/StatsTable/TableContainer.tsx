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
    <div
      aria-hidden={true}
      className={'absolute top-1/2 left-[max(-5rem,calc(50%-52rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl'}
    >
      <div
        style={{clipPath: 'polygon(0 80%, 4% 74%, 8% 4%, 12% 91%, 25% 8%, 40% 64%, 96% 25%, 100% 98%, 48% 4%)'}}
        className={'aspect-577/310 w-144.25 bg-linear-to-r from-[#ff4aa2] to-[#00ddff] opacity-40'}></div>
    </div>
    <div
      aria-hidden={true}
      className={'absolute top-1/2 left-[max(40rem,calc(50%+8rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl'}
    >
      <div
        style={{clipPath: 'polygon(0 80%, 4% 74%, 8% 4%, 12% 91%, 25% 8%, 40% 64%, 96% 25%, 100% 98%, 48% 4%)'}}
        className={'aspect-577/310 w-144.25 bg-linear-to-r from-[#ff4aa2] to-[#00ddff] opacity-40'}></div>
    </div>
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
        className={`
          grid grid-cols-12 grid-flow-row auto-rows-max gap-4bg-zinc-200 dark:bg-zinc-800/50
          p-4 rounded mb-6 relative isolate overflow-hidden
        `}
        aria-atomic={false}
        aria-live={'polite'}
      >
        <BarBackground />
        <SearchBar value={search} onChange={onSearchChange} customClass={'col-span-6'} />
        <Pagination {...{ page, totalPages, setPage }} customClass={'col-span-6'} />
        {search && <StatsSummary counts={displayCounts} customClass={'col-span-12'} />}
      </div>
      <h3 id={'some_statistics'} className={'text-lg dark:text-slate-100 md:text-xl xl:text-2xl mb-2'}>
        Some statistics
      </h3>
      <p className={'mb-6'}>
        All translated files represent <strong>{translatedCount}</strong>
        (<em>{translatedPct.toFixed(2)}%</em>) files out of {counts.total} files to be translate.
      </p>
      <StatsSummary counts={counts} customClass={'mb-4'} />
      <AsyncTable
        rows={displayRows}
        error={null}
        popularityMap={popularityMap}
        popularityReady={popularityReady}
        totalRows={total}
        startIndex={Math.max(1, (page - 1) * rowsPerPage + 1)}
      />
      <div
        className={`
          flex items-center md:justify-center bg-zinc-200 dark:bg-zinc-800/50 p-2 rounded mt-6
          relative isolate overflow-hidden
        `}
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
