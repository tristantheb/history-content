import { type JSX, useEffect, useState } from 'react'
import { X, Minus, Plus } from 'lucide-react'

type Filter = {
  included: string[];
  excluded: string[];
}

type UnfilteredItemProps = {
  option?: string;
  setIncluded: (included: string[]) => void;
  setExcluded: (excluded: string[]) => void;
  customClass?: string | undefined;
} & Filter

type FilteredItemProps = {
  option?: string;
  removeItem: (option: string) => void;
  customClass?: string | undefined;
}

type FilterElementProps = {
  options?: string[];
  included: string[];
  excluded: string[];
} & UnfilteredItemProps

type HTMLFilterElementProps = {
  options?: string[];
  onChange: (filter: Filter) => void;
  customClass?: string | undefined;
}

/**
 * An filtered item of the filter element.
 * @param {string|undefined} option The chosen options to display and purpose to
 *   remove.
 * @param {function} removeItem The remove handler.
 * @param {string|undefined} customClass An optional custom class for styling.
 *
 * @returns {JSX.Element} The option with a remove button.
 */
const FilteredItem = (
  { option = '', removeItem, customClass }: FilteredItemProps
): JSX.Element => (
  <span key={option} className={customClass}>
    <span className={'name'}>{option}</span>
    <div className={'buttons'}>
      <button onClick={() => removeItem(option)}><X /></button>
    </div>
  </span>
)

/**
 * An unfiltered item of the filter element.
 * @param {string|undefined} option The chosen options to display and purpose to
 *   add to filter.
 * @param {string[]} included The selected options, included from the filter
 *   list.
 * @param {string[]} excluded The selected options, excluded from the filter
 *   list.
 * @param {function} setIncluded The handler to add an option to the included
 *   list.
 * @param {function} setExcluded The handler to add an option to the excluded
 *   list.
 * @param {string|undefined} customClass An optional custom class for styling.
 *
 * @returns {JSX.Element} The option with buttons to include or exclude.
 */
const UnfilteredItem = (
  { option = '', included, excluded, setIncluded, setExcluded, customClass }: UnfilteredItemProps
): JSX.Element => (
  <div key={option} className={'filter-element' + ` ${customClass}`}>
    <span className={'name'}>{option}</span>
    <div className={'buttons'}>
      <button onClick={() => setIncluded([...included, option])}>
        <Plus />
      </button>
      <button onClick={() => setExcluded([...excluded, option])}>
        <Minus />
      </button>
    </div>
  </div>
)

/**
 * The filter element component to render as an HTML component.
 * @param {string[]} options The list of options to purpose for the include and
 *   the exclude filters, returned.
 * @param {string[]} included The selected options, included from the filter
 *   list.
 * @param {string[]} excluded The selected options, excluded from the filter
 *   list.
 * @param {function} setIncluded The handler to add an option to the included
 *   list.
 * @param {function} setExcluded The handler to add an option to the excluded
 *   list.
 * @param {string|undefined} customClass An optional custom class for styling.
 *
 * @returns {JSX.Element} The option with buttons to include or exclude.
 */
const FilterElement = (
  { options = [], included, excluded, setIncluded, setExcluded, customClass }: FilterElementProps
): JSX.Element => (
  <div className={`filter ${customClass}`}>
    {included.map(i => (
      <FilteredItem
        key={i}
        option={i}
        removeItem={(option: string) => setIncluded(included.filter(i => i !== option))}
        customClass={'filter-element filter-included'}
      />
    ))}
    {excluded.map(e => (
      <FilteredItem
        key={e}
        option={e}
        removeItem={(option: string) => setExcluded(excluded.filter(e => e !== option))}
        customClass={'filter-element filter-excluded'}
      />
    ))}
    {options.filter(option => !included.includes(option) && !excluded.includes(option)).map(option => (
      <UnfilteredItem
        key={option}
        option={option}
        included={included}
        excluded={excluded}
        setIncluded={setIncluded}
        setExcluded={setExcluded}
        customClass={'filter-element'}
      />
    ))}
  </div>
)

/**
 * The filter element component to render as an HTML component.
 * @param {string[]} options The list of options to purpose for the include and
 *   the exclude filters, returned.
 * @param {function} onChange The event handler to change options in the filters
 *   lists and return the updated lists to the parent component.
 * @param {string|undefined} customClass An optional custom class for styling.
 *
 * @returns {JSX.Element} The filter element folly wrapped with its logic.
 */
const HTMLFilterElement = (
  { options = [], onChange, customClass }: HTMLFilterElementProps
): JSX.Element => {
  const [included, setIncluded] = useState<string[]>([])
  const [excluded, setExcluded] = useState<string[]>([])

  useEffect(() => {
    onChange({ included, excluded })
  }, [included, excluded])

  return <FilterElement
    options={options}
    included={included}
    excluded={excluded}
    setIncluded={setIncluded}
    setExcluded={setExcluded}
    customClass={customClass}
  />
}

export { HTMLFilterElement, type Filter }
