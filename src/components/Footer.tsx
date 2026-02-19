import { Heart } from 'lucide-react'

const currentYear = new Date().getFullYear()

const Footer = () => (
  <footer className={'footer-banner'}>
    <p>
      <a
        href={'https://github.com/tristantheb/history-content'}
        rel={'external'}
      >
        tristantheb/history-content
      </a>
      &nbsp;©&nbsp;2021-{currentYear}
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
  </footer>
)

export { Footer }
