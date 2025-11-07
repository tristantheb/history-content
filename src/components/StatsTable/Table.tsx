import { Line } from './Line'
import type { ReactNode } from 'react'
import type { Row } from '@/types'

const generateRows = (data: Array<Row & { pvCell?: ReactNode }> = []) => data.map(i => (
  <Line key={i.id} row={i} pvCell={i.pvCell ?? undefined} />
))

type TableProps = {
  rows?: Row[]
  error?: string | null
}

const TableLoading = (error?: string | null) => (
  <div className={'bg-sky-400/20 text-sky-400 p-3 my-8 rounded'} role={'status'}>
    <p><strong>Chargement…</strong></p>
    <p>
      Veuillez patienter, le tableau est en cours de génération.<br />
      Cela peut prendre quelques secondes selon votre système.
    </p>
    {error && <p className={'text-red-400 mt-2'}>Erreur : {error}</p>}
  </div>
)

const Table = ({
  rows = [],
  error = null
}: TableProps) => {
  return !rows.length ? (
    TableLoading(error)
  ) : (
    <table id={'changes-table'} className={'w-full'} aria-rowcount={rows?.length}>
      <thead>
        <tr className={'bg-slate-900 text-slate-50'}>
          <th scope={'col'} className={'px-3 py-1 w-10/16'}>Path to file</th>
          <th scope={'col'} className={'px-3 py-1 w-3/16'}>Last edit date</th>
          <th scope={'col'} className={'px-3 py-1 w-1/16'}>Popularity</th>
          <th scope={'col'} className={'px-3 py-1 w-1/16'}>Status</th>
          {/*<th scope="col" className={'px-3 py-1 w-1/16'}>Copy MD</th>*/}
        </tr>
      </thead>
      <tbody className={'divide-y divide-white/10'}>
        {generateRows(rows)}
      </tbody>
    </table>
  )
}

export { Table }
