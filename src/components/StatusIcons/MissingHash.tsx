import { GitPullRequestDraft } from 'lucide-react'

const MissingHash = () => (
  <span className={'text-slate-300 text-center inline-flex'} title={'Missing commit hash'}>
    <GitPullRequestDraft color={'currentColor'} size={32} />
    <span className={'sr-only'}>Missing commit hash</span>
  </span>
)

export { MissingHash }
