import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'

type PaginationProps = {
  page: number
  totalPages: number
  setPage: Dispatch<SetStateAction<number>>
}

const Pagination = ({ page, totalPages, setPage }: PaginationProps) => {
  return (
    <div className={'flex gap-2 items-center justify-center md:justify-start'}>
      <button
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
        aria-label={'Previous page'}
        className={
          'p-2 rounded-full bg-zinc-700 hover:bg-slate-600 text-white ' +
          'font-semibold transition disabled:opacity-50 hover:cursor-pointer ' +
          'disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400'
        }
      >
        <ChevronLeft color={'currentColor'} />
      </button>
      <span className={'dark:text-zinc-200 font-medium text-base px-2 select-none'}>
        Page
        {' '}
        <span className={'text-blue-700 dark:text-blue-300 font-bold'}>{page}</span>
        {' '}
        /
        {' '}
        <span className={'text-blue-950 dark:text-blue-200'}>{totalPages || 1}</span>
      </span>
      <button
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        disabled={page === totalPages || totalPages === 0}
        aria-label={'Next page'}
        className={
          'p-2 rounded-full bg-zinc-700 hover:bg-slate-600 text-white ' +
          'font-semibold transition disabled:opacity-50 hover:cursor-pointer ' +
          'disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400'
        }
      >
        <ChevronRight color={'currentColor'} />
      </button>
    </div>
  )
}

export { Pagination }
