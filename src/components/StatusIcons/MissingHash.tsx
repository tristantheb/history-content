import type { JSX } from 'react'

const MissingHash = (): JSX.Element => (
  <span className={'status-name'}>
    <span className={'dot dot-missing'}></span>&nbsp;Missing hash
  </span>
)

export { MissingHash }
