import { Languages } from 'lucide-react'
import type { ChangeEvent } from 'react'

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

type Props = {
  value: string
  onChange: (lang: string) => void
}

const SelectLocale = ({ value, onChange }: Props) => {
  const handle = (e: ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value
    const url = new URL(window.location.href)
    if (lang) url.searchParams.set('lang', lang)
    else url.searchParams.delete('lang')
    // update the address bar without reloading the page
    window.history.pushState(null, '', url.toString())
    onChange(lang)
  }

  return (
    <div className={'flex items-center justify-end gap-2 mb-4'}>
      <Languages />
      <label className={'dark:text-slate-200 text-sm font-medium pt-1'} htmlFor={'select-locale'}>
        Switch locale
      </label>
      <select
        id={'select-locale'}
        value={value}
        onChange={handle}
        className={
          'rounded px-4 py-2 bg-white/95 dark:bg-slate-950/80 text-slate-900 dark:text-white border border-slate-300 ' +
          'focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-sm font-medium'
        }
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
