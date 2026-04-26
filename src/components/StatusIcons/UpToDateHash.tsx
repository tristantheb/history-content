import type { JSX } from 'react'

const UpToDateHash = (): JSX.Element => (
  <span className={'status-name'}>
    <span className={'dot dot-translated'}></span>&nbsp;Up to date
  </span>
)

export { UpToDateHash }
