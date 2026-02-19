import { useEffect, useState } from 'react'
import { QuickNav } from '@/components/QuickNav'
import { SelectLocale } from '@/components/SelectLocale'
import { TableContainer } from '@/components/StatsTable/TableContainer'
import { useHistoryData } from '@/hooks/useHistoryData.js'

const baseUrl = import.meta.env.BASE_URL
const defaultRowsPerPage = 50

const Home = () => {
  const getParam = (name: string, def: string) => {
    const v = new URLSearchParams(window.location.search).get(name)
    return v || def
  }

  const [lang, setLang] = useState(() => getParam('lang', 'fr'))
  const [popularityFile] = useState(() => getParam('popularityFile', 'current'))

  useEffect(() => {
    const onPop = () => setLang(getParam('lang', 'fr'))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const { original, localized, popularityCsv } = useHistoryData({ baseUrl, lang, popularityFile })

  return (
    <main id={'page-content'} className={'container'}>
      <SelectLocale value={lang} onChange={(l) => setLang(l)} />
      <div className={'main-table'}>
        <h2 id={'table_of_page_changes'}>
          Table of page changes
        </h2>
        <p>
          You will find in this table the various documents currently translated, coloured in green or yellow...
        </p>
        <TableContainer
          original={original}
          localized={localized}
          popularityCsv={popularityCsv}
          rowsPerPage={defaultRowsPerPage} />
      </div>
      <QuickNav />
    </main>
  )
}

export { Home }
