import { TriangleAlert } from 'lucide-react'

const OutdatedL10n = () => (
  <span className={'text-yellow-700 dark:text-yellow-300 text-center inline-flex'}>
    <TriangleAlert color={'currentColor'} className={'fill-yellow-400/20'} size={32} />
    <span className={'sr-only'}>Outdated translation</span>
  </span>
)

export { OutdatedL10n }
