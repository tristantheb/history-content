import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { type PageData } from '@/types/HistoryDataType'

type PaginatedWorkerState = {
  pageRows: PageData[]
  page: number
  setPage: Dispatch<SetStateAction<number>>
  total: number
}

/**
 * Custom hook to paginate rows.
 * @param {PageData[]} rows The list of rows to paginate.
 * @param {number} perPage The number of rows to display per page.
 *
 * @returns {PaginatedWorkerState} An object containing the current page rows,
 * the current page number, a function to set the page, and the total number of
 * rows.
 * @version 2.1.2
 */
const usePaginatedWorker = (rows: PageData[] = [], perPage = 25): PaginatedWorkerState => {
  const workerRef = useRef<Worker | null>(null)
  const [page, setPage] = useState<number>(1)
  const [pageRows, setPageRows] = useState<PageData[]>([])
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
    workerRef.current.onmessage = (e: MessageEvent): void => {
      if (e.data.type === 'ready') {
        setTotal(e.data.total)
        setReady(true)
      }
      if (e.data.type === 'page') setPageRows(e.data.rows)
    }
    setPage(1)
    workerRef.current.postMessage({ type: 'init', data: { rows } })
    return (): void => workerRef.current?.terminate()
  }, [rows])

  useEffect(() => {
    if (workerRef.current && ready) {
      workerRef.current.postMessage({ type: 'getPage', data: { page, perPage } })
    }
  }, [page, perPage, ready])

  return { pageRows, page, setPage, total }
}

export { usePaginatedWorker }
