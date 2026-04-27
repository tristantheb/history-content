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
  <div className={'container-item info-decoration'}>
    <div className={'container-item-title'}>
      <h3>Loading…</h3>
    </div>
    <div className={'container-item-content'}>
      <p>
        Please wait, the table is being generated.<br />
        This may take a few seconds depending on your system.<br/><br/>
        If the table not load and no error is shown, your filters may be to restrictive.
      </p>
      {error && <p>Error: {error}</p>}
    </div>
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
