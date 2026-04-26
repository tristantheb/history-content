import type { JSX, MouseEvent } from 'react'
import { Status } from '@/types/Status'

type SearchStatusProps = {
  statusFilter?: SearchFilters
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
  const handleClick = (event: MouseEvent<HTMLButtonElement>, filter: string): void => {
    event.preventDefault()
    const current = (event.currentTarget.getAttribute('data-filter') ?? filter) as string
    const nextFilter: string = event.type === 'click'
      ? filtersOrder[(filtersOrder.indexOf(current) + 1) % filtersOrder.length] as string
      : filtersOrder[(filtersOrder.indexOf(current) - 1 + filtersOrder.length) % filtersOrder.length] as string

    const button = event.currentTarget
    button.setAttribute('data-filter', nextFilter)

    const btns = Array.from(document.querySelectorAll('.filter-btn'))
    const nextFilters: SearchFilters[] = []
    for (const b of btns) {
      const name = (b.textContent || '').trim()
      const filterValue = (b.getAttribute('data-filter') || 'off') as string
      const statusMatch = Object.values(Status).find(v => v === name)
      if (filterValue !== 'off' && statusMatch) nextFilters.push([statusMatch as Status, filterValue] as SearchFilters)
    }

    onChange(nextFilters)
  }

  return (
    <>
      {Object.values(Status).map((statusValue) => (
        <FilterButton
          key={statusValue}
          statusValue={statusValue}
          filter={statusFilter?.[1] || 'off'}
          onClick={(e) => handleClick(e, statusFilter?.[1] || 'off')}
          onContextMenu={(e) => handleClick(e, statusFilter?.[1] || 'off')}
        />
      ))}
    </>
  )
}

export { type SearchFilters, SearchStatus }
