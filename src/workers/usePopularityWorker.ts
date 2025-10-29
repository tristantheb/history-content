import { useEffect, useRef, useState } from 'react'

export function usePopularityWorker(csvString) {
  const workerRef = useRef(null)
  const [map, setMap] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!csvString) {
      setMap(null)
      setReady(false)
      return
    }
    // Use the dedicated popularity worker to parse CSV on background thread.
    let cancelled = false
    let w
    try {
      w = new Worker(new URL('./popularityWorker.js', import.meta.url), { type: 'module' })
    } catch {
      // Worker unavailable - do not parse popularity
      setMap(null)
      setReady(false)
      return () => {}
    }

    workerRef.current = w
    const onMsg = (e) => {
      if (cancelled) return
      setMap(e.data || Object.create(null))
      setReady(true)
    }
    w.addEventListener('message', onMsg)
    w.postMessage(csvString)

    return () => {
      cancelled = true
      w.removeEventListener('message', onMsg)
      w.terminate()
    }
  }, [csvString])

  return { map, ready }
}
