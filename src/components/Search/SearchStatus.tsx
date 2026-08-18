import type { JSX, MouseEvent } from 'react'
import { Status } from '@/types/Status'

type SearchStatusProps = {
  statusFilter: SearchFilters[]
  onChange: (v: SearchFilters[]) => void
}

type FilterButtonProps = {
  statusValue: Status
  filter: string
  onClick: (e: MouseEvent<HTMLButtonElement>, statusValue: Status, filter: string) => void
  onContextMenu: (e: MouseEvent<HTMLButtonElement>, statusValue: Status, filter: string) => void
}

type SearchFilters = [Status, string]
const filtersOrder: string[] = ['off', 'show', 'hide']

/**
 * Represent a button to filter status
 * @param {Status} statusValue The status value to display on the filter button.
 * @param {string} filter The current filter applied to the status.
 * @param {function} onClick The event handler for the click event.
 * @param {function} onContextMenu The event handler for the context menu event.
 *
 * @returns {JSX.Element} The filter button element.
 * @since 2.7.0
 */
const FilterButton = ({ statusValue, filter, onClick, onContextMenu }: FilterButtonProps): JSX.Element => (
  <button
    key={statusValue}
    className={'filter-btn'}
    data-filter={filter as string}
    onClick={(e) => onClick(e, statusValue, filter)}
    onContextMenu={(e) => onContextMenu(e, statusValue, filter)}
  >
    <span className={'dot'}></span>
    {statusValue}
  </button>
)

/**
 * An element to filter all statuses used in the pages status.
 * @param {SearchFilters} statusFilter An object with all filters and
 *   their current filter status.
 * @param {function} onChange The event handler to change options in the filters
 *   lists and return the updated lists to the parent component.
 *
 * @returns {JSX.Element<SearchStatus>} The search status element with filter
 *   element.
 * @since 2.5.0
 */
const SearchStatus = (
  { statusFilter, onChange }: SearchStatusProps
): JSX.Element => {
  const handleClick = (
    event: MouseEvent<HTMLButtonElement>,
    statusValue: Status,
    filter: string
  ): void => {
    event.preventDefault()
    const current = event.currentTarget.getAttribute('data-filter') ?? filter
    const nextFilter: string = event.type === 'click'
      ? filtersOrder[(filtersOrder.indexOf(current) + 1) % filtersOrder.length] as string
      : filtersOrder[(filtersOrder.indexOf(current) - 1 + filtersOrder.length) % filtersOrder.length] as string

    const nextFilters = statusFilter.filter(([currentStatus]) => currentStatus !== statusValue)
    if (nextFilter !== 'off') nextFilters.push([statusValue, nextFilter])
    onChange(nextFilters)
  }

  return (
    <>
      {Object.values(Status).map((statusValue) => (
        <FilterButton
          key={statusValue}
          statusValue={statusValue}
          filter={statusFilter.find(([currentStatus]) => currentStatus === statusValue)?.[1] || 'off'}
          onClick={(e, currentStatus, currentFilter) => handleClick(e, currentStatus, currentFilter)}
          onContextMenu={(e, currentStatus, currentFilter) => handleClick(e, currentStatus, currentFilter)}
        />
      ))}
    </>
  )
}

export { type SearchFilters, SearchStatus }
