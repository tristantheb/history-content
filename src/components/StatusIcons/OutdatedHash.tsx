import type { JSX } from 'react'

const OutdatedHash = (): JSX.Element => (
  <span className={'status-name'}>
    <span className={'dot dot-outdated'}></span>&nbsp;Outdated hash
  </span>
)

export { OutdatedHash }
