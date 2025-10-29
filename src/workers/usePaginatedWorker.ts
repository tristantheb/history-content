import { useEffect, useRef, useState } from 'react'

export function usePaginatedWorker(rows, perPage) {
  const workerRef = useRef()
  const [page, setPage] = useState(1)
  const [pageRows, setPageRows] = useState([])
  const [total, setTotal] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    if (workerRef.current) {
      workerRef.current.terminate()
    }
    workerRef.current = new Worker(
      new URL('./tablePaginationWorker.js', import.meta.url),
      { type: 'module' }
    )
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'ready') {
        setTotal(e.data.total)
        setReady(true)
      }
      if (e.data.type === 'page') setPageRows(e.data.rows)
    }
    setPage(1)
    workerRef.current.postMessage({ type: 'init', data: { rows } })
    return () => workerRef.current.terminate()
  }, [rows])

  useEffect(() => {
    if (workerRef.current && ready) {
      workerRef.current.postMessage({ type: 'getPage', data: { page, perPage } })
    }
  }, [page, perPage, ready])

  return { pageRows, page, setPage, total }
}
