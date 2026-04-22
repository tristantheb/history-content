import type { JSX } from 'react'

const BarBackground = (): JSX.Element => (
  <>
    <div className={'nav-bar-left'} aria-hidden={true}></div>
    <div className={'nav-bar-right'} aria-hidden={true}></div>
  </>
)

export { BarBackground }
