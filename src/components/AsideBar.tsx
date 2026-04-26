import type { JSX } from 'react'
import { SelectLocale } from '@/components/SelectLocale'
import { SearchCategories } from './Search/SearchCategories'
import { type SearchFilters, SearchStatus } from './Search/SearchStatus'

type AsideBarProps = {
  locale: string
  setLocale: (lang: string) => void
  statuses: {
    setSearchStatuses: (statuses: SearchFilters[]) => void
  }
  categories: {
    searchCategories: string[]
    setSearchCategories: (categories: string[]) => void
    categories: Record<string, string[]>
  }
}

const AsideBar = ({ locale, setLocale, ...props }: AsideBarProps): JSX.Element => (
  <aside className={'filters-bar'}>
    <div className={'filters-bar-item'}>
      <div className={'filters-bar-item-content'}>
        <SelectLocale value={locale} onChange={(lang) => setLocale(lang)} />
      </div>
    </div>
    <div className={'filters-bar-item'}>
      <div className={'filters-bar-item-title'}>
        <h3>MDN Repositories</h3>
      </div>
      <div className={'filters-bar-item-content'}>
        <p>
          <a href={'https://github.com/mdn/content'} rel={'external nofollow noopener'} target={'_blank'}>
            @mdn/content
          </a>
        </p>
        <p>
          <a href={'https://github.com/mdn/translated-content'} rel={'external nofollow noopener'} target={'_blank'}>
            @mdn/translated-content
          </a>
        </p>
        <p>
          <a href={'https://github.com/mdn/data'} rel={'external nofollow noopener'} target={'_blank'}>
            @mdn/data
          </a>
        </p>
        <p>
          <a href={'https://github.com/mdn/fred'} rel={'external nofollow noopener'} target={'_blank'}>
            @mdn/fred
          </a>
        </p>
        <p>
          <a href={'https://github.com/mdn/rari'} rel={'external nofollow noopener'} target={'_blank'}>
            @mdn/rari
          </a>
        </p>
        <p>
          <a href={'https://github.com/mdn/dex'} rel={'external nofollow noopener'} target={'_blank'}>
            @mdn/dex
          </a>
        </p>
      </div>
    </div>
    <div className={'filters-bar-item'}>
      <div className={'filters-bar-item-title'}>
        <h3>Status filter</h3>
      </div>
      <div className={'filters-bar-item-content'}>
        <SearchStatus onChange={props.statuses.setSearchStatuses} />
      </div>
      <div className={'filters-bar-item-hint'}>
        <p>Use <kbd>L-click</kbd> forward → | <kbd>R-click</kbd> backward ← to switch statuses.</p>
      </div>
    </div>
    <div className={'filters-bar-item'}>
      <div className={'filters-bar-item-title'}>
        <h3>Categories filter</h3>
      </div>
      <div className={'filters-bar-item-content'}>
        <SearchCategories
          value={props.categories.searchCategories}
          onChange={props.categories.setSearchCategories}
          categories={props.categories.categories}
        />
      </div>
    </div>
  </aside>
)

export { AsideBar }
