import { CircleDotDashed } from 'lucide-react'

const MissingHash = ({ size = 32 }: { size?: number }) => (
  <span title={'Missing commit hash'}>
    <CircleDotDashed color={'currentColor'} size={size} />
    <span className={'sr-only'}>Missing commit hash</span>
  </span>
)

export { MissingHash }
