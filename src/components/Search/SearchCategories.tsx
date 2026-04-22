import type { JSX} from 'react'
import { useState } from 'react'
import { FunnelX } from 'lucide-react'

type SearchCategoriesProps = {
  value: string[];
  onChange: (value: string[]) => void;
  customClass?: string;
  categories: Record<string, string[]>
}

/**
 * The search method for categories
 * @param {string} searchTerm The term to search for within the categories.
 * @param {Record<string, string[]>} categories The categories to search within.
 *
 * @returns {Record<string, string[]>} A filtered record of categories matching
 * the search term.
 * @version 2.7.0
 */
const searchedCategories = (searchTerm: string, categories: Record<string, string[]>): Record<string, string[]> => {
  if (!searchTerm) return categories

  return Object.entries(categories).reduce((acc, [group, cats]) => {
    const filteredCats = cats.filter(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
    if (filteredCats.length > 0) {
      acc[group] = filteredCats
    }
    return acc
  }, {} as Record<string, string[]>)
}

const SearchCategories = (
  { value, onChange, customClass = '', categories }: SearchCategoriesProps
): JSX.Element => {
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
        {Object.entries(searchedCategories(searchTerm, categories)).map(([group, categories]) => (
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
