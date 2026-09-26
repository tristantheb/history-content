import type { JSX } from 'react'
import { Heart } from 'lucide-react'
import { version } from '../../package.json'

const currentYear = new Date().getFullYear()

const Footer = (): JSX.Element => (
  <footer className={'footer-container'}>
    <p>
      <a
        href={'https://github.com/tristantheb/history-content'}
        rel={'external'}
      >
        @tristantheb/history-content
      </a>
      &nbsp;
      <small>(
        <a href={`https://github.com/tristantheb/history-content/releases/tag/v${version}`} rel={'external'}>
          v{version}
        </a>)
      </small>
      &nbsp;&copy;&nbsp;2021-{currentYear}
    </p>
    <p>
      Made with
      {' '}
      <Heart
        color={'currentColor'}
        className={'heart'} />
      {' '}
      by the MDN Web Docs community.
    </p>
    <hr />
    <p>
      Font Zilla Slab &copy; Mozilla Foundation.<br />
      popularities.csv data &copy; MDN Web Docs.<br />
      issues.json data &copy; MDN Web Docs.
    </p>
  </footer>
)

export { Footer }
