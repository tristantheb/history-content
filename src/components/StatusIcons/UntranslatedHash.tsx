import { GitPullRequestClosed } from 'lucide-react'

const UntranslatedHash = () => (
  <span className={'text-red-300 text-center inline-flex'} title={'Missing translation'}>
    <GitPullRequestClosed color={'currentColor'} size={32} />
    <span className={'sr-only'}>Missing translation</span>
  </span>
)

export { UntranslatedHash }
