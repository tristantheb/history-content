import { type JSX } from 'react'
import { Line } from './Line'
import { type PageData } from '@/types/HistoryDataType'

const generateRows = (
  data: Array<PageData> = [],
  lang: string,
  startIndex = 1
): JSX.Element[] => data.map((i, idx): JSX.Element => (
  <Line key={i.id} row={i} lang={lang} rowIndex={startIndex + idx} />
))

type TableProps = {
  rows?: PageData[]
  lang: string
  error?: string | null
  totalRows?: number
  startIndex?: number
}

const TableLoading = (error?: string | null): JSX.Element => (
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
  lang,
  error = null,
  totalRows,
  startIndex
}: TableProps): JSX.Element => {
  const effectiveTotal = totalRows ?? rows.length
  const effectiveStart = startIndex ?? 1

  return !rows.length ? (
    TableLoading(error)
  ) : (
    <div className={'container-item'}>
      <table id={'changes-table'} className={'table-container'} aria-rowcount={effectiveTotal}>
        <thead>
          <tr className={'table-container-title'}>
            <th scope={'col'}>Path to file</th>
            <th scope={'col'}>Parity</th>
            <th scope={'col'}>Status</th>
            <th scope={'col'}>Popularity</th>
          </tr>
        </thead>
        <tbody className={'table-container-content'} aria-live={'polite'}>
          {generateRows(rows, lang, effectiveStart)}
        </tbody>
      </table>
    </div>
  )
}

export { Table }
