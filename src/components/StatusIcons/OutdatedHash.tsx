import { RefreshCcwDot } from 'lucide-react'

const OutdatedHash = () => (
  <span className={'text-yellow-700 dark:text-yellow-300 text-center inline-flex'} title={'Outdated hash commit'}>
    <RefreshCcwDot color={'currentColor'} size={32} />
    <span className={'sr-only'}>Outdated hash commit</span>
  </span>
)

export { OutdatedHash }
