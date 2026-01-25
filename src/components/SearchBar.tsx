const searchBarClass: string = [
  'transition-all duration-200 rounded-full px-4 py-2 text-base w-full',
  'focus:outline-none focus:ring-2 focus:ring-blue-400',
  'border border-slate-300 focus:border-blue-400 shadow-sm bg-white/90 text-slate-900'
].join(' ')

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
      type={'text'}
      placeholder={'🔍 Search by file path...'}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`${searchBarClass} ${customClass}`}
      aria-label={'Search by file path'}
    />
  )
}

export { SearchBar }
