import type { Dispatch, JSX, SetStateAction } from 'react'
import { BarBackground } from '@/components/BarBackground'
import { Pagination } from '@/components/Pagination'
import { SearchBar } from '@/components/Search/SearchBar'

type SearchNavigationBarProps = {
  path: {
    searchPath: string
    setSearchPath: (path: string) => void
  }
  paginate: {
    page: number
    totalPages: number
    setPage: Dispatch<SetStateAction<number>>
    customClass?: string
  }
}

const SearchNavigationBar = ({
  path,
  paginate
}: SearchNavigationBarProps): JSX.Element => {

  return (
    <div
      className={'container-item nav-bar'}
      aria-atomic={false}
      aria-live={'polite'}
    >
      <BarBackground />
      <SearchBar value={path.searchPath} onChange={path.setSearchPath} />
      <Pagination {...paginate} />
    </div>
  )
}

export { SearchNavigationBar }
