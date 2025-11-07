import { Suspense } from 'react'
import { Table } from './StatsTable/Table'
import type { Row } from '@/types'

type AsyncTableProps = {
  rows?: Row[]
  error?: string | null
  popularityMap?: Record<string, number> | null
  popularityReady?: boolean
  totalRows?: number
  startIndex?: number
}

const AsyncTable = (props: AsyncTableProps) => {
  return (
    <Suspense
      fallback={
        <div className={'bg-sky-400/20 text-sky-400 p-3 my-8 rounded'}>
          Table is loading…
        </div>
      }
    >
      <Table {...props} />
    </Suspense>
  )
}

export { AsyncTable }
