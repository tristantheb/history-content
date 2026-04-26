import type { Dispatch, JSX, SetStateAction } from 'react'

type PaginationProps = {
  page: number
  totalPages: number
  setPage: Dispatch<SetStateAction<number>>
  customClass?: string | undefined
}

const Pagination = (
  { page, totalPages, setPage, customClass = '' }: PaginationProps
): JSX.Element => {
  return (
    <div className={`nav-bar-pagination ${customClass}`}>
      <button
        className={'prev-next-btn'}
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
        aria-label={'Previous page'}
      >
        &lt;
      </button>&nbsp;
      <span className={'current-page'}>{page}</span> / {totalPages || 1}&nbsp;
      <button
        className={'prev-next-btn'}
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        disabled={page === totalPages || totalPages === 0}
        aria-label={'Next page'}
      >
        &gt;
      </button>
    </div>
  )
}

export { Pagination }
