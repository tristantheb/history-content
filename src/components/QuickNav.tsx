import { MissingHash } from '@/components/StatusIcons/MissingHash'
import { OutdatedHash } from '@/components/StatusIcons/OutdatedHash'
import { UntranslatedHash } from '@/components/StatusIcons/UntranslatedHash'
import { UpToDateHash } from '@/components/StatusIcons/UpToDateHash'
import { OutdatedL10n as Outdated } from '@/components/StatusIcons/OutdatedL10n'
import { UntranslatedL10n as Untranslated } from '@/components/StatusIcons/UntranslatedL10n'
import { UpToDateL10n as UpToDate } from '@/components/StatusIcons/UpToDateL10n'

const QuickNav = () => (
  <aside className={'lg:order-1 lg:col-span-1'}>
    <h2 id={'quick_navigation'} className={'font-semibold text-xl md:text-2xl xl:text-3xl mb-3'}>
      Quick navigation
    </h2>
    <h3 id={'mdn_repositories'} className={'text-lg md:text-xl xl:text-2xl mb-2'}>
      MDN Repositories
    </h3>
    <ul className={'mb-2'}>
      <li>
        <a
          href={'https://github.com/mdn/content'}
          target={'_blank'}
          rel={'noreferrer'}
          className={'text-blue-300 hover:text-blue-500 dark:hover:text-blue-50 visited:text-purple-500'}>
          GitHub mdn/content
        </a>
      </li>
      <li>
        <a
          href={'https://github.com/mdn/translated-content'}
          target={'_blank'}
          rel={'noreferrer'}
          className={'text-blue-300 hover:text-blue-500 dark:hover:text-blue-50 visited:text-purple-500'}>
          GitHub mdn/translated-content
        </a>
      </li>
    </ul>
    <h2 id={'icons-explanation'} className={'font-semibold text-xl md:text-2xl xl:text-3xl mb-3'}>
      Icons explanation
    </h2>
    <details className={'bg-red-600/10 rounded p-2 mb-2'}>
      <summary className={'text-red-800 dark:text-red-300'}>
        <span className={'bg-red-400/10 dark:bg-red-100/10 leading-8 text-sm font-bold px-2 py-1'}>
          Deprecated
        </span>&nbsp;
        This feature will be removed in future versions. It is recommended to use the hash commit status instead.
      </summary>
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
    </details>
    <details className={'bg-sky-600/10 rounded p-2 mb-2'}>
      <summary className={'text-sky-800 dark:text-sky-300'}>
        <span className={'bg-sky-400/10 dark:bg-sky-100/10 leading-8 text-sm font-bold px-2 py-1'}>
          Experimental
        </span>&nbsp;
        This feature is experimental and may change in future versions.
      </summary>
      <p className={'mb-2'}>This is described as follows:</p>
      <ul className={'mb-2 pl-4'}>
        <li className={'py-1'}>
          <UpToDateHash />&nbsp;The document use the latest hash commit of the original version.
        </li>
        <li className={'py-1'}>
          <OutdatedHash />&nbsp;The document need to be updated to the latest hash commit of the original version.
        </li>
        <li className={'py-1'}>
          <MissingHash />&nbsp;The document doesn't have a hash commit.
        </li>
        <li className={'py-1'}>
          <UntranslatedHash />&nbsp;The document has not been translated into your language.
        </li>
      </ul>
    </details>
  </aside>
)

export { QuickNav }
