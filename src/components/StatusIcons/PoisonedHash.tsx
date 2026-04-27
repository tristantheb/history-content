import type { JSX } from 'react'

const PoisonedHash = (): JSX.Element => (
  <span className={'status-name'}>
    <span className={'dot dot-poisoned'}></span>&nbsp;Poisoned hash
  </span>
)

export { PoisonedHash }
