import { useState } from 'react'
import { FunnelX } from 'lucide-react'
import Categories from '@/data/categories.csv?raw'

type SearchCategoriesProps = {
  value: string[];
  onChange: (value: string[]) => void;
  customClass?: string;
}

const getCategoriesAndGroups = (searched: string): Record<string, string[]> => {
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
  for (const [group, labels] of Object.entries(groups)) {
    if (searched) {
      const filteredLabels = Array
        .from(labels)
        .filter(label => label.toLocaleLowerCase().includes(searched.toLocaleLowerCase()))
      if (filteredLabels.length > 0) {
        result[group] = filteredLabels
      }
    } else {
      result[group] = Array.from(labels)
    }
  }
  return result
}

const SearchCategories = ({ value, onChange, customClass = '' }: SearchCategoriesProps) => {
  const [listStatus, setListStatus] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <form className={`search-categories ${customClass}`.trim()}>
      <label
        className={'search-categories-search'}
        htmlFor={'list-display'}>
        <div className={'search-categories-search-result'}>
          {
            value.length > 0 ?
              value.map(v => v.
                split(',')
                .slice(-1)[0])
                .join(', ') :
              '🔍 Search by category…'
          }
        </div>
        <span>{listStatus ? '▼' : '◄'}</span>
      </label>
      <input
        onChange={e => setListStatus(e.target.checked)}
        checked={listStatus}
        id={'list-display'}
        type={'checkbox'}
        hidden
      />
      <div className={'search-categories-list'}>
        <div className={'search-categories-list-filter'}>
          <input
            placeholder={'🔍 Search by category…'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button
            type={'reset'}
            onClick={() => { setSearchTerm(''), onChange([]), setListStatus(true) }}
          >
            <FunnelX /><span className={'sr-only'}>Reset search</span>
          </button>
        </div>
        {Object.entries(getCategoriesAndGroups(searchTerm)).map(([group, categories]) => (
          <ul className={'search-categories-list-group'} key={group}>
            <li>{group}</li>
            {categories.map(category => (
              <ul className={'search-categories-list-group-items'} key={category}>
                <li>
                  <label>
                    <input
                      type={'checkbox'}
                      value={group !== category ? `${group},${category}` : category}
                      checked={value.includes(group !== category ? `${group},${category}` : category)}
                      onChange={e => {
                        const checked = e.target.checked
                        const selectedValue = e.target.value
                        if (checked) {
                          onChange([...value, selectedValue])
                        } else {
                          onChange(value.filter(v => v !== selectedValue))
                        }
                      }}/>&nbsp;
                    <span>{category}</span>
                  </label>
                </li>
              </ul>
            ))}
          </ul>
        ))}
      </div>
    </form>
  )
}

export { SearchCategories }
