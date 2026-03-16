import { Suspense } from 'react'
import { Table } from './StatsTable/Table'
import type { Row } from '@/types'

type AsyncTableProps = {
  rows?: Row[]
  lang: string
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
        <div className={'info-block'}>
          Table is loading…
        </div>
      }
    >
      <Table {...props} />
    </Suspense>
  )
}

export { AsyncTable }
