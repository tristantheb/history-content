import { Languages } from 'lucide-react'
import type { JSX, ChangeEvent } from 'react'

const LOCALES: Array<[string, string]> = [
  ['de', 'Deutsch (de)'],
  ['es', 'Español (es)'],
  ['fr', 'Français (fr)'],
  ['ja', '日本語 (ja)'],
  ['ko', '한국어 (ko)'],
  ['pt-br', 'Português (pt-br)'],
  ['ru', 'Русский (ru)'],
  ['zh-cn', '简体中文 (zh-cn)'],
  ['zh-tw', '繁體中文 (zh-tw)']
]

type SelectLocaleProps = {
  value: string
  onChange: (locale: string) => void
}

const SelectLocale = ({ value, onChange }: SelectLocaleProps): JSX.Element => {
  const handle = (e: ChangeEvent<HTMLSelectElement>): void => {
    const locale = e.target.value
    const url = new URL(window.location.href)
    if (locale) url.searchParams.set('lang', locale)
    else url.searchParams.delete('lang')
    // update the address bar without reloading the page
    window.history.pushState(null, '', url.toString())
    onChange(locale)
  }

  return (
    <div className={'locale-selector'}>
      <Languages size={16} />&nbsp;
      <label htmlFor={'select-locale'}>
        Switch locale
      </label>&nbsp;
      <select
        id={'select-locale'}
        className={'selector'}
        value={value}
        onChange={handle}
        aria-label={'Sélection de la langue'}
        aria-haspopup={'listbox'}
      >
        {LOCALES.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  )
}

export { SelectLocale }
