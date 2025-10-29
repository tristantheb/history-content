import { useMemo } from 'react'

export function useDisplayRows(rows = [], popularityMap = null, popularityReady = false) {
  function makePopularityKeyFromPath(pathName) {
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
      const pv = popularityReady && popularityMap && key ? (popularityMap[key] ?? popularityMap[r.pathName] ?? null) : null
      const pvCell = pv !== null && pv !== undefined ? (
        <span className="text-slate-200 text-sm font-medium">{Number(pv).toLocaleString()}</span>
      ) : undefined
      return { ...r, pvCell }
    })
  }, [rows, popularityMap, popularityReady])

  return displayRows
}
