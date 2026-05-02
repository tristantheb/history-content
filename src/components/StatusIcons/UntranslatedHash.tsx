import type { JSX } from 'react'

const UntranslatedHash = (): JSX.Element => (
  <div className={'status-name status-untranslated'}>
    <span className={'dot'}></span><span className={'status-name-text'}>Untranslated</span>
  </div>
)

export { UntranslatedHash }
