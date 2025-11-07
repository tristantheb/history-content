import { useMemo } from 'react'
import type { Row } from '@/types'
import type { ReactNode } from 'react'

const useDisplayRows = (
  rows: Row[] = [],
  popularityMap: Record<string, number> | null = null,
  popularityReady = false
) => {
  const makePopularityKeyFromPath = (pathName?: string) => {
    if (!pathName) return ''
    let short = String(pathName || '').replace(/^files\//i, '')
    short = short.replace(/^en-us\//i, '')
    short = short.replace(/\/index\.md$/i, '')
    short = short.replace(/\.md$/i, '')
    short = short.replace(/\/$/, '')
    if (!short) return ''
    return `/en-us/docs/${short}`.toLowerCase()
  }

  const displayRows = useMemo(() => {
    return (rows || []).map(r => {
      const key = makePopularityKeyFromPath(r.pathName)
      const pv = popularityReady && popularityMap && key ?
        (popularityMap[key] ?? popularityMap[r.pathName] ?? null) :
        null
      const pvCell: ReactNode | undefined = pv !== null && pv !== undefined ? (
        <span className={'dark:text-slate-200 text-sm font-medium'}>{Number(pv).toLocaleString()}</span>
      ) : undefined
      return { ...r, pvCell }
    }) as Array<Row & { pvCell?: ReactNode }>
  }, [rows, popularityMap, popularityReady])

  return displayRows
}

export { useDisplayRows }
