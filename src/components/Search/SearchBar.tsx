import type { JSX } from 'react'

const SearchBar = (
  {
    value,
    onChange
  }:
  {
    value: string;
    onChange: (v: string) => void;
  }
): JSX.Element => {
  return (
    <div className={'nav-bar-search'}>
      <input
        id={'search-bar'}
        type={'search'}
        placeholder={'🔍 Search by file path...'}
        onChange={e => onChange(e.target.value)}
        value={value}
        aria-label={'Search by file path'}
      />
    </div>
  )
}

export { SearchBar }
