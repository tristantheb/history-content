import { type JSX, useEffect, useState } from 'react'
import { X, Minus, Plus } from 'lucide-react'

/**
 * @experimental
 */
import '/styles/htmlFilter.css'

type Filter = {
  included: string[];
  excluded: string[];
}

type UnfilteredItemProps = {
  option?: string;
  setIncluded: (included: string[]) => void;
  setExcluded: (excluded: string[]) => void;
  customClass?: string;
} & Filter

type FilteredItemProps = {
  option?: string;
  removeItem: (option: string) => void;
  customClass?: string;
}

type FilterElementProps = {
  options?: string[];
  included: string[];
  excluded: string[];
} & UnfilteredItemProps

type HTMLFilterElementProps = {
  options?: string[];
  onChange: (filter: Filter) => void;
  customClass?: string;
}

/**
 * An filtered item of the filter element.
 * @param option The chosen options to display and purpose to remove.
 * @param removeItem The remove handler.
 *
 * @returns The option with a remove button.
 */
const FilteredItem = (
  {option = '', removeItem, customClass}: FilteredItemProps
): JSX.Element => (
  <span key={option} className={customClass}>
    <span className={'name'}>{option}</span>
    <div className={'buttons'}>
      <button onClick={() => removeItem(option)}><X /></button>
    </div>
  </span>
)

const UnfilteredItem = (
  {option = '', included, excluded, setIncluded, setExcluded, customClass}: UnfilteredItemProps
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

const FilterElement = (
  { options = [], included, excluded, setIncluded, setExcluded, customClass }: FilterElementProps
): JSX.Element => (
  <div className={`filter ${customClass}`}>
    {included?.map(i => (
      <FilteredItem
        option={i}
        removeItem={(option: string) => setIncluded(included.filter(i => i !== option))}
        customClass={'filter-element filter-included'}
      />
    ))}
    {excluded?.map(e => (
      <FilteredItem
        option={e}
        removeItem={(option: string) => setExcluded(excluded.filter(e => e !== option))}
        customClass={'filter-element filter-excluded'}
      />
    ))}
    {options?.filter(option => !included.includes(option) && !excluded.includes(option)).map(option => (
      <UnfilteredItem
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
