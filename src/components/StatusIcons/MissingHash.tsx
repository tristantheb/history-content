import type { JSX } from 'react'

const MissingHash = (): JSX.Element => (
  <div className={'status-name status-missing'}>
    <span className={'dot'}></span><span className={'status-name-text'}>Missing</span>
  </div>
)

export { MissingHash }
