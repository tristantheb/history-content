import type { JSX } from 'react'

const PoisonedHash = (): JSX.Element => (
  <div className={'status-name status-poisoned'}>
    <span className={'dot'}></span><span className={'status-name-text'}>Poisoned</span>
  </div>
)

export { PoisonedHash }
