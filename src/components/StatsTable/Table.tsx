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
  <div className={'info-block'} role={'status'}>
    <p><strong>Loading…</strong></p>
    <p>
      Please wait, the table is being generated.<br />
      This may take a few seconds depending on your system.
    </p>
    {error && <p className={'error-message'}>Error: {error}</p>}
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
    <table id={'changes-table'} className={'version-table'} aria-rowcount={effectiveTotal}>
      <thead>
        <tr className={'table-header'}>
          <th scope={'col'}>Path to file</th>
          <th scope={'col'}>Popularity</th>
          <th scope={'col'}>Status</th>
        </tr>
      </thead>
      <tbody>
        {generateRows(rows as Array<Row & { pvCell?: ReactNode }>, effectiveStart)}
      </tbody>
    </table>
  )
}

export { Table }
