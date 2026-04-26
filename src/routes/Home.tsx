import { type JSX } from 'react'
import { type PageData } from '@/types/HistoryDataType'
import { type SearchFilters } from '@/components/Search/SearchStatus'
import { useMemo, useState } from 'react'
import { AsideBar } from '@/components/AsideBar'
import { SectionContainer } from '@/components/SectionContainer'
import { useGetPages } from '@/hooks/useGetPages'
import { useLocale } from '@/hooks/useLocale'

const Home = (): JSX.Element => {
  const { locale, setLocale } = useLocale('fr')
  const { pages, categories }: { pages: PageData[], categories: Record<string, string[]> } = useGetPages(locale)
  const [searchPath, setSearchPath] = useState('')
  const [searchCategories, setSearchCategories] = useState<string[]>([])
  const [searchStatuses, setSearchStatuses] = useState<SearchFilters[]>([])

  const filters = useMemo(() => ({
    path: searchPath.toLocaleLowerCase(),
    categories: searchCategories,
    statuses: searchStatuses
  }), [searchPath, searchCategories, searchStatuses])

  return (
    <main id={'page-content'} className={'main-container'}>
      <AsideBar
        locale={locale}
        setLocale={setLocale}
        statuses={{ setSearchStatuses }}
        categories={{ searchCategories, setSearchCategories, categories }}
      />
      <SectionContainer locale={locale} pages={pages} filters={filters} search={{searchPath, setSearchPath}} />
    </main>
  )
}

export { Home }
