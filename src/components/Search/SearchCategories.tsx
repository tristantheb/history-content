import type { JSX} from 'react'
import { useState } from 'react'
import { FunnelX } from 'lucide-react'

type SearchCategoriesProps = {
  value: string[];
  onChange: (value: string[]) => void;
  categories: Record<string, string[]>
}

/**
 * The search method for categories
 * @param {string} searchTerm The term to search for within the categories.
 * @param {Record<string, string[]>} categories The categories to search within.
 *
 * @returns {Record<string, string[]>} A filtered record of categories matching
 * the search term.
 * @since 2.7.0
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
  { value, onChange, categories }: SearchCategoriesProps
): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState('')

  /**
   * TODO: Replace this with a scroll-driven animation when support of Firefox
   * is active on this (currently in Nightly).
   */
  const list = document.querySelector('.category-filter-list')
  if (list) {
    list.addEventListener('scroll', () => {
      const scrollTop = list.scrollTop
      const scrollHeight = list.scrollHeight
      const clientHeight = list.clientHeight

      if (scrollTop === 0) {
        list.classList.remove('active-top')
        list.classList.add('active-bottom')
      } else if (scrollTop + clientHeight >= scrollHeight) {
        list.classList.remove('active-bottom')
        list.classList.add('active-top')
      } else {
        list.classList.add('active-top', 'active-bottom')
      }
    })
  }

  return (
    <form className={'category-filter'}>
      <label
        className={'category-filter-search'}
        htmlFor={'list-display'}>
        <div className={'category-filter-search-result'}>
          {value.length > 0 ?
            value.map(v => v.
              split(',')
              .slice(-1)[0])
              .join(', ') :
            '🔍 Search by category…'}
        </div>
      </label>
      <hr />
      <div className={'category-filter-list'}>
        <div className={'category-filter-list-filter'}>
          <input
            id={'list-display'}
            type={'search'}
            placeholder={'🔍 Search by category…'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button
            type={'reset'}
            onClick={() => { setSearchTerm(''), onChange([]) }}
          >
            <FunnelX size={16} /><span className={'sr-only'}>Reset search</span>
          </button>
        </div>
        {Object.entries(searchedCategories(searchTerm, categories)).map(([group, categories]) => (
          <ul className={'category-filter-list-group'} key={group}>
            <li className={'category-filter-list-group-title'}>{group}</li>
            {categories.map(category => (
              <ul className={'category-filter-list-group-items'} key={category}>
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
