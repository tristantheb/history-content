import { TriangleAlert } from 'lucide-react'

const OutOfDate = () => (
  <span className="text-yellow-300 text-center inline-flex">
    <TriangleAlert color={'currentColor'} className={'fill-yellow-400/20'} size={32} />
    <span className="sr-only">Out of date</span>
  </span>
)

export { OutOfDate }
