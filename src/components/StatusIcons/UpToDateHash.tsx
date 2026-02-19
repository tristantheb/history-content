import { CircleDot } from 'lucide-react'

const UpToDateHash = ({ size = 32 }: { size?: number }) => (
  <span title={'Up to date hash commit'}>
    <CircleDot color={'currentColor'} size={size} />
    <span className={'sr-only'}>Up to date hash commit</span>
  </span>
)

export { UpToDateHash }
