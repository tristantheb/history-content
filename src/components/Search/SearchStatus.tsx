import { Status } from '@/types/Status'

type SearchStatusProps = {
  value: Status[]
  onChange: (v: Status[]) => void
  customClass?: string
}

const SearchStatus = (
  { value, onChange, customClass = '' }: SearchStatusProps
) => {
  return (
    <select
      value={value.map(v => v.toString())}
      onChange={e => onChange(Array.from(
        e.target.selectedOptions,
        option => Number(option.value) as Status
      ))}
      className={`search-bar ${customClass}`}
      aria-label={'Search by translation status'}
      multiple
    >
      <option value={Status.OUTDATED}>Outdated</option>
      <option value={Status.MISSING}>Missing hash</option>
      <option value={Status.UNSTRANSLATED}>Untranslated</option>
      <option value={Status.UP_TO_DATE}>Up to date</option>
    </select>
  )
}

export { SearchStatus }
