import type { JSX } from 'react'

const OutdatedHash = (): JSX.Element => (
  <div className={'status-name status-outdated'}>
    <span className={'dot'}></span><span className={'status-name-text'}>Outdated</span>
  </div>
)

export { OutdatedHash }
