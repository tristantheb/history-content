import { CircleDot } from 'lucide-react'

const UpToDateHash = () => (
  <span className={'text-green-700 dark:text-green-300 text-center inline-flex'} title={'Up to date hash commit'}>
    <CircleDot color={'currentColor'} size={32} />
    <span className={'sr-only'}>Up to date hash commit</span>
  </span>
)

export { UpToDateHash }
