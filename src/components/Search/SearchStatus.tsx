import { type JSX } from 'react'
import { type Filter, HTMLFilterElement } from '@/components/HTMLFilterElement/HTMLFilterElement'
import { Status } from '@/types/Status'

type SearchStatusProps = {
  onChange: (v: Filter) => void
  customClass?: string
}

const SearchStatus = (
  { onChange, customClass }: SearchStatusProps
): JSX.Element => {
  return <HTMLFilterElement
    options={Object.values(Status)}
    onChange={onChange}
    customClass={customClass} />
}

export { SearchStatus }
