import { OctagonX } from 'lucide-react'

const Untranslated = () => (
  <span className={'text-red-300 text-center inline-flex'}>
    <OctagonX color={'currentColor'} className={'fill-red-400/20'} size={32} />
    <span className={'sr-only'}>Missing</span>
  </span>
)

export { Untranslated }
