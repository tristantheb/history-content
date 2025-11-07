import { useEffect, useRef, useState } from 'react'

const usePopularityWorker = (csvString: string | null) => {
  const workerRef = useRef<Worker | null>(null)
  const [map, setMap] = useState<Record<string, number> | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!csvString) {
      setMap(null)
      setReady(false)
      return
    }
    // Use the dedicated popularity worker to parse CSV on background thread.
    let cancelled = false
    let w: Worker
    try {
      w = new Worker(new URL('./popularityWorker.js', import.meta.url), { type: 'module' })
    } catch {
      // Worker unavailable - do not parse popularity
      setMap(null)
      setReady(false)
      return () => {}
    }

    workerRef.current = w
    const onMsg = (e: MessageEvent) => {
      if (cancelled) return
      setMap((e.data as Record<string, number>) || Object.create(null))
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

export { usePopularityWorker }
