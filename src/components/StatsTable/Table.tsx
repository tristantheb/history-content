import type { ReactNode } from 'react'
import type { Row } from '@/types'
import { Line } from './Line'

const generateRows = (
  data: Array<Row & { pvCell?: ReactNode }> = [],
  startIndex = 1
) => data.map((i, idx) => (
  <Line key={i.id} row={i} pvCell={i.pvCell ?? undefined} rowIndex={startIndex + idx} />
))

type TableProps = {
  rows?: Row[]
  error?: string | null
  totalRows?: number
  startIndex?: number
}

const TableLoading = (error?: string | null) => (
  <div className={'bg-sky-400/20 text-sky-400 p-3 my-8 rounded'} role={'status'}>
    <p><strong>Loading…</strong></p>
    <p>
      Please wait, the table is being generated.<br />
      This may take a few seconds depending on your system.
    </p>
    {error && <p className={'text-red-400 mt-2'}>Error: {error}</p>}
  </div>
)

const Table = ({
  rows = [],
  error = null,
  totalRows,
  startIndex
}: TableProps) => {
  const effectiveTotal = totalRows ?? rows.length
  const effectiveStart = startIndex ?? 1

  return !rows.length ? (
    TableLoading(error)
  ) : (
    <table id={'changes-table'} className={'w-full'} aria-rowcount={effectiveTotal}>
      <thead>
        <tr className={'bg-stone-950 text-slate-50'}>
          <th scope={'col'} className={'px-3 py-1 w-6/8'}>Path to file</th>
          <th scope={'col'} className={'px-3 py-1 w-1/8'}>Popularity</th>
          <th scope={'col'} className={'px-3 py-1 w-1/8'}>Hash Status</th>
          {/*<th scope="col" className={'px-3 py-1 w-1/16'}>Copy MD</th>*/}
        </tr>
      </thead>
      <tbody className={'divide-y divide-black/10 dark:divide-white/10'}>
        {generateRows(rows as Array<Row & { pvCell?: ReactNode }>, effectiveStart)}
      </tbody>
    </table>
  )
}

export { Table }
