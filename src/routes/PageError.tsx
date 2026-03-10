import { JSX } from 'react'

const PageError = (): JSX.Element => (
  <main className={'error-page'}>
    <h2>Something went wrong.</h2>
    <p>Please try refreshing the page or contact support if the issue persists.</p>
  </main>
)

export { PageError }
