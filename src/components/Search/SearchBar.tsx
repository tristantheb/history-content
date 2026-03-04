const SearchBar = (
  {
    value,
    onChange,
    customClass = ''
  }:
  {
    value: string;
    onChange: (v: string) => void;
    customClass?: string;
  }
) => {
  return (
    <input
      id={'search-bar'}
      type={'text'}
      placeholder={'🔍 Search by file path...'}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`search-bar ${customClass}`}
      aria-label={'Search by file path'}
    />
  )
}

export { SearchBar }
