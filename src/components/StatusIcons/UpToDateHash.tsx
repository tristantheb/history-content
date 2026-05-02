import type { JSX } from 'react'

const UpToDateHash = (): JSX.Element => (
  <div className={'status-name status-translated'}>
    <span className={'dot'}></span><span className={'status-name-text'}>Up-to-date</span>
  </div>
)

export { UpToDateHash }
