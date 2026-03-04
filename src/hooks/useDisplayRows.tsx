import { useMemo, type ReactNode } from 'react'
import type { Row } from '@/types'

/**
 * @type DisplayRow
 * @property {Row[]} rows An optional array of Row objects to be displayed.
 * @property {Record<string, number> | null} popularityMap An optional mapping
 *  of page paths to their popularity values.
 * @property {boolean} [popularityReady=false] A flag indicating whether the
 *  popularity data is ready for use.
 */
type DisplayRow = {
  rows?: Row[]
  popularityMap?: Record<string, number> | null
  popularityReady?: boolean
}

const useDisplayRows = ({ rows = [], popularityMap = null, popularityReady = false }: DisplayRow) => (
  useMemo(() => {
    return (rows || []).map(r => {
      const pv = popularityReady && popularityMap && r.path ?
        (popularityMap[r.path] ?? null) :
        null
      const pvCell: ReactNode | undefined = pv !== null && pv !== undefined ? (
        <span className={'text-gray'}>{Number(pv).toLocaleString()}</span>
      ) : undefined
      return { ...r, pvCell }
    }) as Array<Row & { pvCell?: ReactNode }>
  }, [rows, popularityMap, popularityReady])
)

export { useDisplayRows }
