import Categories from '@/data/categories.csv?raw'

type SearchCategoriesProps = {
  value: string[];
  onChange: (value: string[]) => void;
  customClass?: string;
}

const getCategoriesAndGroups = (): Record<string, string[]> => {
  const rawCsv = (Categories ?? '').trim()
  if (!rawCsv) return {}
  const lines = rawCsv.split('\n').slice(1).map(l => l.trim()).filter(Boolean)

  const pathToLabel: Record<string, string> = {}
  for (const line of lines) {
    const commaIndex = line.indexOf(',')
    const path = line.slice(0, commaIndex)
    const label = line.slice(commaIndex + 1).replace(/^"|"$/g, '')
    pathToLabel[path] = label
  }

  const groups: Record<string, Set<string>> = {}
  for (const path of Object.keys(pathToLabel)) {
    const label = pathToLabel[path]
    let ancestor = path
    while (ancestor.includes('/')) {
      ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'))
      if (pathToLabel[ancestor]) {
        const groupName = pathToLabel[ancestor]
        groups[groupName] = groups[groupName] ?? new Set<string>()
        groups[groupName].add(groupName)
        groups[groupName].add(label)
        break
      }
    }
    if (!Object.keys(groups).some(k => groups[k].has(label))) {
      groups[label] = groups[label] ?? new Set<string>()
      groups[label].add(label)
    }
  }

  const result: Record<string, string[]> = {}
  for (const key of Object.keys(groups)) {
    result[key] = Array.from(groups[key]).sort((a, b) => a.localeCompare(b))
  }
  return result
}

const SearchCategories = ({ value, onChange, customClass = '' }: SearchCategoriesProps
) => (
  <select
    multiple
    value={value}
    onChange={event => {
      const selectedOptions = Array
        .from(event.target.selectedOptions)
        .map(option => option.value)
      onChange(selectedOptions)
    }}
    className={`search-bar ${customClass}`}
    aria-label={'Filter by categories'}
  >
    {Object.entries(getCategoriesAndGroups()).map(([group, categories]) => (
      <optgroup key={group} label={group}>
        {categories.map(category => (
          <option key={category} value={group !== category ? `${group},${category}` : category}>{category}</option>
        ))}
      </optgroup>
    ))}
    <hr />
    <option value={'Other'}>Other</option>
  </select>
)

export { SearchCategories }
