import { QuickNav } from '@/components/QuickNav'
import { TableContainer } from '@/components/StatsTable/TableContainer'
import { OutdatedL10n as Outdated } from '@/components/StatusIcons/OutdatedL10n'
import { UntranslatedL10n as Untranslated } from '@/components/StatusIcons/UntranslatedL10n'
import { UpToDateL10n as UpToDate } from '@/components/StatusIcons/UpToDateL10n'
import { useHistoryData } from '@/hooks/useHistoryData.js'

const baseUrl = import.meta.env.BASE_URL
const urlParams = new URLSearchParams(window.location.search)
const lang = urlParams.get('lang') || 'fr'
const popularityFile = urlParams.get('popularityFile') || 'current'
const rowsPerPage = 50

const Home = () => {
  const { original, localized, popularityCsv } = useHistoryData({ baseUrl, lang, popularityFile })

  return (
    <main id={'page-content'} className={'p-4 lg:p-8'}>
      <div className={'container grid grid-cols-1 xl:grid-cols-4 mx-auto gap-4'}>
        <div className={'lg:order-2 lg:col-span-3'}>
          <h2 id={'table_of_page_changes'} className={'font-bold text-white text-2xl md:text-3xl xl:text-4xl mb-3'}>
            Table of page changes
          </h2>
          <p className={'mb-2'}>
            You will find in this table the various documents currently translated, coloured in green or yellow...
          </p>
          <p className={'mb-2'}>This is described as follows:</p>
          <ul className={'mb-2 pl-4'}>
            <li className={'py-1'}>
              <UpToDate />&nbsp;The latest update of the document is more recent than the original version.
            </li>
            <li className={'py-1'}>
              <Outdated />&nbsp;The latest update of the document is older than the original version.
            </li>
            <li className={'py-1'}>
              <Untranslated />&nbsp;The document has not been translated into your language.
            </li>
          </ul>
          <TableContainer
            original={original}
            localized={localized}
            popularityCsv={popularityCsv}
            rowsPerPage={rowsPerPage} />
        </div>
        <QuickNav />
      </div>
    </main>
  )
}

export { Home }
