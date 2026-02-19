import { RefreshCcwDot } from 'lucide-react'

const OutdatedHash = ({ size = 32 }: { size?: number }) => (
  <span title={'Outdated hash commit'}>
    <RefreshCcwDot color={'currentColor'} size={size} />
    <span className={'sr-only'}>Outdated hash commit</span>
  </span>
)

export { OutdatedHash }
