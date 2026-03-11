import { type JSX } from 'react'
import { type Filter, HTMLFilterElement } from '@/components/HTMLFilterElement/HTMLFilterElement'
import { Status } from '@/types/Status'

type SearchStatusProps = {
  onChange: (v: Filter) => void
  customClass?: string
}

/**
 * An element to filter all statuses used in the pages status.
 * @param {function} onChange The event handler to change options in the filters
 *   lists and return the updated lists to the parent component.
 * @param {string|undefined} customClass An optional custom class for styling.
 *
 * @returns {JSX.Element<SearchStatus>} The search status element with filter
 *   element.
 */
const SearchStatus = (
  { onChange, customClass }: SearchStatusProps
): JSX.Element => {
  return <HTMLFilterElement
    options={Object.values(Status)}
    onChange={onChange}
    customClass={customClass} />
}

export { SearchStatus }
