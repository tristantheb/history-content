import { type JSX } from 'react'
import { type PageData } from '@/types/HistoryDataType'
import { AsideBar } from '@/components/AsideBar'
import { SectionContainer } from '@/components/SectionContainer'
import { useGetPages } from '@/hooks/useGetPages'
import { useLocale } from '@/hooks/useLocale'
import { useSearchFilters } from '@/hooks/useSearchFilters'

const Home = (): JSX.Element => {
  const { locale, setLocale } = useLocale('fr')
  const { pages, categories }: { pages: PageData[], categories: Record<string, string[]> } = useGetPages(locale)
  const search = useSearchFilters()

  return (
    <main id={'page-content'} className={'main-container'}>
      <AsideBar
        locale={locale}
        setLocale={setLocale}
        statuses={{ searchStatuses: search.searchStatuses, setSearchStatuses: search.setSearchStatuses }}
        categories={{
          searchCategories: search.searchCategories,
          setSearchCategories: search.setSearchCategories,
          categories
        }}
      />
      <SectionContainer
        locale={locale}
        pages={pages}
        filters={search.filters}
        search={{ searchPath: search.searchPath, setSearchPath: search.setSearchPath }}
      />
    </main>
  )
}

export { Home }
