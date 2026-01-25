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
    <main id={'page-content'} className={'p-4 lg:p-8'}>
      <div className={'container grid grid-cols-1 xl:grid-cols-4 mx-auto gap-4'}>
        <div className={'lg:order-2 lg:col-span-3'}>
          <div className={'mb-4'}>
            <SelectLocale value={lang} onChange={(l) => setLang(l)} />
          </div>
          <h2 id={'table_of_page_changes'} className={'font-bold text-2xl md:text-3xl xl:text-4xl mb-3'}>
            Table of page changes
          </h2>
          <p className={'mb-2'}>
            You will find in this table the various documents currently translated, coloured in green or yellow...
          </p>
          <TableContainer
            original={original}
            localized={localized}
            popularityCsv={popularityCsv}
            rowsPerPage={defaultRowsPerPage} />
        </div>
        <QuickNav />
      </div>
    </main>
  )
}

export { Home }
