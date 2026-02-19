import { MissingHash } from '@/components/StatusIcons/MissingHash'
import { OutdatedHash } from '@/components/StatusIcons/OutdatedHash'
import { UntranslatedHash } from '@/components/StatusIcons/UntranslatedHash'
import { UpToDateHash } from '@/components/StatusIcons/UpToDateHash'

const QuickNav = () => (
  <aside className={'navigation-aside'}>
    <h2 id={'quick_navigation'}>
      Quick navigation
    </h2>
    <h3 id={'mdn_repositories'}>
      MDN Repositories
    </h3>
    <ul>
      <li>
        <a
          href={'https://github.com/mdn/content'}
          target={'_blank'}
          rel={'noreferrer'}>
          GitHub mdn/content
        </a>
      </li>
      <li>
        <a
          href={'https://github.com/mdn/translated-content'}
          target={'_blank'}
          rel={'noreferrer'}>
          GitHub mdn/translated-content
        </a>
      </li>
    </ul>
    <h2 id={'icons-explanation'}>
      Icons explanation
    </h2>
    <p>This is described as follows:</p>
    <ul>
      <li>
        <span className={'text-green'}><UpToDateHash size={20} /></span>&nbsp;
        The document use the latest hash commit of the original version.
      </li>
      <li>
        <span className={'text-red'}><OutdatedHash size={20} /></span>&nbsp;
        The document need to be updated to the latest hash commit of the original version.
      </li>
      <li>
        <span className={'text-yellow'}><MissingHash size={20} /></span>&nbsp;
        The document doesn't have a hash commit.
      </li>
      <li>
        <span className={'text-gray'}><UntranslatedHash size={20} /></span>&nbsp;
        The document has not been translated into your language.
      </li>
    </ul>
  </aside>
)

export { QuickNav }
