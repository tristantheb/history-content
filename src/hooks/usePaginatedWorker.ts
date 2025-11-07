import { useEffect, useRef, useState } from 'react'
import type { Row } from '@/types'

const usePaginatedWorker = (rows: Row[] = [], perPage = 25) => {
  const workerRef = useRef<Worker | null>(null)
  const [page, setPage] = useState<number>(1)
  const [pageRows, setPageRows] = useState<Row[]>([])
  const [total, setTotal] = useState<number>(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    if (workerRef.current) {
      workerRef.current.terminate()
    }
    workerRef.current = new Worker(
      new URL('../workers/tablePaginationWorker.ts', import.meta.url),
      { type: 'module' }
    ) as Worker
    workerRef.current.onmessage = (e: MessageEvent) => {
      if (e.data.type === 'ready') {
        setTotal(e.data.total)
        setReady(true)
      }
      if (e.data.type === 'page') setPageRows(e.data.rows)
    }
    setPage(1)
    workerRef.current.postMessage({ type: 'init', data: { rows } })
    return () => workerRef.current?.terminate()
  }, [rows])

  useEffect(() => {
    if (workerRef.current && ready) {
      workerRef.current.postMessage({ type: 'getPage', data: { page, perPage } })
    }
  }, [page, perPage, ready])

  return { pageRows, page, setPage, total }
}

export { usePaginatedWorker }
