import { Suspense } from 'react'
import { Table } from './StatsTable/Table'
import type { Row } from '../workers/useComputedRows'

type AsyncTableProps = {
  rows?: Row[]
  error?: string | null
  popularityMap?: Record<string, number> | null
  popularityReady?: boolean
}

const AsyncTable = (props: AsyncTableProps) => {
  return (
    <Suspense
      fallback={
        <div className="bg-sky-400/20 text-sky-400 p-3 my-8 rounded">
          Chargement du tableau…
        </div>
      }
    >
      <Table {...props} />
    </Suspense>
  )
}

export { AsyncTable }
