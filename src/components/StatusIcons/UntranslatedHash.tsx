import type { JSX } from 'react'

const UntranslatedHash = (): JSX.Element => (
  <span className={'status-name'}>
    <span className={'dot dot-untranslated'}></span>&nbsp;Not translated
  </span>
)

export { UntranslatedHash }
