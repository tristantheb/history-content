import { Languages } from 'lucide-react'
import type { JSX, ChangeEvent } from 'react'

const LOCALES: Array<[string, string]> = [
  ['de', 'Deutsch'],
  ['fr', 'Français'],
  ['es', 'Español'],
  ['ja', '日本語'],
  ['ko', '한국어'],
  ['pt-br', 'Português'],
  ['ru', 'Русский'],
  ['zh-cn', '简体中文'],
  ['zh-tw', '繁體中文']
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
      <Languages />
      <label htmlFor={'select-locale'}>
        Switch locale
      </label>
      <select
        id={'select-locale'}
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
