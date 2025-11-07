import { OctagonX } from 'lucide-react'

const UntranslatedL10n = () => (
  <span className={'text-red-700 dark:text-red-300 text-center inline-flex'}>
    <OctagonX color={'currentColor'} className={'fill-red-400/20'} size={32} />
    <span className={'sr-only'}>Missing translation</span>
  </span>
)

export { UntranslatedL10n }
