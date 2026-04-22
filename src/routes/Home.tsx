import { JSX } from 'react'
import { FlaskConical } from 'lucide-react'
import { GraphStats } from '@/components/GraphStats'
import { QuickNav } from '@/components/QuickNav'
import { SelectLocale } from '@/components/SelectLocale'
import { TableContainer } from '@/components/StatsTable/TableContainer'
import { useLocale } from '@/hooks/useLocale'

const Home = (): JSX.Element => {
  const { lang, setLang } = useLocale('fr')

  return (
    <main id={'page-content'} className={'container'}>
      <SelectLocale value={lang} onChange={(l) => setLang(l)} />
      <div className={'main-table'}>
        <div className={'graph-stats-container'}>
          <div className={'experimental-badge'}><FlaskConical size={16} />Experimental</div>
          <h2>Translations statistics of your locale</h2>
          <GraphStats lang={lang} />
        </div>
        <h2 id={'table_of_page_changes'}>
          Table of page changes
        </h2>
        <p>
          You will find in this table the various documents currently translated, coloured in green or yellow...
        </p>
        <TableContainer lang={lang} />
      </div>
      <QuickNav />
    </main>
  )
}

export { Home }
