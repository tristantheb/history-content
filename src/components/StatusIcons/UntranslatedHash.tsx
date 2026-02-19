import { CircleDashed } from 'lucide-react'

const UntranslatedHash = ({ size = 32 }: { size?: number }) => (
  <span title={'Missing translation'}>
    <CircleDashed color={'currentColor'} size={size} />
    <span className={'sr-only'}>Missing translation</span>
  </span>
)

export { UntranslatedHash }
