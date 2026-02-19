import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'

type PaginationProps = {
  page: number
  totalPages: number
  setPage: Dispatch<SetStateAction<number>>
  customClass?: string
}

const Pagination = ({ page, totalPages, setPage, customClass = '' }: PaginationProps) => {
  return (
    <div className={`pagination ${customClass}`}>
      <button
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
        aria-label={'Previous page'}
      >
        <ChevronLeft color={'currentColor'} />
      </button>
      <span>
        Page {page} / {totalPages || 1}
      </span>
      <button
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        disabled={page === totalPages || totalPages === 0}
        aria-label={'Next page'}
      >
        <ChevronRight color={'currentColor'} />
      </button>
    </div>
  )
}

export { Pagination }
