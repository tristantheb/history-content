import type { ReactNode } from 'react'
import type { Row } from '@/types'
import { FlaskConical, Trash2 } from 'lucide-react'
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
          <th scope={'col'} className={'px-3 py-1 w-10/16'}>Path to file</th>
          <th scope={'col'} className={'px-3 py-1 w-3/16'}>
            Last edit date<br />
            <span className={'bg-red-400/80 leading-8 text-sm font-bold px-2 py-1 whitespace-nowrap'}>
              <Trash2 size={16} className={'w-4 h-4 inline'} /> Deprecated
            </span>
          </th>
          <th scope={'col'} className={'px-3 py-1 w-1/16'}>Popularity</th>
          <th scope={'col'} className={'px-3 py-1 w-1/16'}>
            Status<br />
            <span className={'bg-red-400/80 leading-8 text-sm font-bold px-2 py-1 whitespace-nowrap'}>
              <Trash2 size={16} className={'w-4 h-4 inline'} /> Deprecated
            </span>
          </th>
          <th scope={'col'} className={'px-3 py-1 w-1/16'}>
            Hash Status<br />
            <span className={'bg-sky-400/80 leading-8 text-sm font-bold px-2 py-1 whitespace-nowrap'}>
              <FlaskConical size={16} className={'w-4 h-4 inline'} /> Experimental
            </span>
          </th>
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
