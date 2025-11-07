const SearchBar = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  return (
    <input
      type={'text'}
      placeholder={'🔍 Search by file path...'}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={
        'transition-all duration-200 rounded-full px-4 py-2 text-base w-full ' +
        'md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400 ' +
        'border border-slate-300 focus:border-blue-400 shadow-sm bg-white/90 text-slate-900'
      }
      aria-label={'Search by file path'}
    />
  )
}

export { SearchBar }
