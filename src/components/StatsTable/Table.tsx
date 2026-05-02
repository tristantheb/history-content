import { type JSX } from 'react'
import type { PageData } from '@/types/HistoryDataType'
import type { SortDir, SortKey } from '@/types/SortingType'
import { ArrowDownUp, ArrowDownWideNarrow, ArrowDownZA, ArrowUpAZ, ArrowUpNarrowWide } from 'lucide-react'
import { Line } from './Line'

type TableProps = {
  rows?: PageData[]
  lang: string
  error?: string | null
  totalRows?: number
  startIndex?: number
  handleSort?: (key: SortKey) => void
  sortKey?: SortKey
  sortDir?: SortDir
}

const generateRows = (
  data: Array<PageData> = [],
  lang: string,
  startIndex = 1
): JSX.Element[] => data.map((i, idx): JSX.Element => (
  <Line key={i.id} row={i} lang={lang} rowIndex={startIndex + idx} />
))

const TableLoading = (error?: string | null): JSX.Element => (
  <div className={'container-item info-decoration'}>
    <div className={'container-item-title'}>
      <h3>Loading…</h3>
    </div>
    <div className={'container-item-content'}>
      <p>
        Please wait, the table is being generated.<br />
        This may take a few seconds depending on your system.<br/><br/>
        If the table doesn't load and no error is shown, your filters may be too restrictive.
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
  startIndex,
  handleSort,
  sortKey,
  sortDir
}: TableProps): JSX.Element => {
  const effectiveTotal = totalRows ?? rows.length
  const effectiveStart = startIndex ?? 1
  const getArrowLetters = (key: SortKey): JSX.Element =>
    sortKey === key ? (sortDir === 'asc' ?
      <ArrowUpAZ size={24} /> :
      <ArrowDownZA size={24} />) :
      <ArrowDownUp size={24} />
  const getArrowNumber = (key: SortKey): JSX.Element =>
    sortKey === key ? (sortDir === 'asc' ?
      <ArrowUpNarrowWide size={24} /> :
      <ArrowDownWideNarrow size={24} />) :
      <ArrowDownUp size={24} />

  return !rows.length ? (
    TableLoading(error)
  ) : (
    <div className={'container-item'}>
      <table id={'changes-table'} className={'table-container'} aria-rowcount={effectiveTotal}>
        <thead>
          <tr className={'table-container-title'}>
            <th
              onClick={() => handleSort && handleSort('path')}
              aria-sort={sortKey === 'path' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <span className={'table-container-title-label'}>Path to file {getArrowLetters('path')}</span>
            </th>
            <th
              onClick={() => handleSort && handleSort('parity')}
              aria-sort={sortKey === 'parity' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <span className={'table-container-title-label'}>Parity {getArrowNumber('parity')}</span>
            </th>
            <th>Status</th>
            <th
              onClick={() => handleSort && handleSort('popularity')}
              aria-sort={sortKey === 'popularity' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <span className={'table-container-title-label'}>Popularity {getArrowNumber('popularity')}</span>
            </th>
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
