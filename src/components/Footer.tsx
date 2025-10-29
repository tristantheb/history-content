import { Heart } from 'lucide-react'

const currentYear = new Date().getFullYear()

const Footer = () => (
  <footer className="bg-zinc-900 text-white p-8 lg:p-16 mt-4 lg:mt-8">
    <p>
      <a
        className="underline"
        href="https://github.com/tristantheb/history-content"
        rel="external"
      >
        tristantheb/history-content
      </a>&nbsp;©&nbsp;2021-{currentYear}
    </p>
    <p>Made with <Heart color='currentColor' className={'text-red-400 fill-red-400/30 inline'} /> by the MDN Web Docs community.</p>
  </footer>
)

export { Footer }
