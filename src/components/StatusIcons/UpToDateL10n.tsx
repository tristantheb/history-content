import { CircleCheck } from 'lucide-react'

const UpToDateL10n = () => (
  <span className={'text-green-700 dark:text-green-300 text-center inline-flex'}>
    <CircleCheck color={'currentColor'} className={'fill-green-400/20'} size={32} />
    <span className={'sr-only'}>Up to date</span>
  </span>
)

export { UpToDateL10n }
