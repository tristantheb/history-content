import { Suspense } from 'react'
import { Table } from './StatsTable/Table'

const AsyncTable = (props: any) => {
  return (
    <Suspense fallback={<div className="bg-sky-400/20 text-sky-400 p-3 my-8 rounded">Chargement du tableau…</div>}>
      <Table {...props} />
    </Suspense>
  )
}

export { AsyncTable }
