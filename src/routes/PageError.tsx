import type { JSX } from 'react'

const PageError = (): JSX.Element => (
  <main className={'main-container'}>
    <aside className={'filters-bar'}>
      <div className={'filters-bar-item'}>
        <div className={'filters-bar-item-title'}>
          <h3>MDN Repositories</h3>
        </div>
        <div className={'filters-bar-item-content'}>
          <p>
            <a href={'https://github.com/mdn/content'} rel={'external nofollow noopener'} target={'_blank'}>
              @mdn/content
            </a>
          </p>
          <p>
            <a href={'https://github.com/mdn/translated-content'} rel={'external nofollow noopener'} target={'_blank'}>
              @mdn/translated-content
            </a>
          </p>
          <p>
            <a href={'https://github.com/mdn/data'} rel={'external nofollow noopener'} target={'_blank'}>
              @mdn/data
            </a>
          </p>
          <p>
            <a href={'https://github.com/mdn/fred'} rel={'external nofollow noopener'} target={'_blank'}>
              @mdn/fred
            </a>
          </p>
          <p>
            <a href={'https://github.com/mdn/rari'} rel={'external nofollow noopener'} target={'_blank'}>
              @mdn/rari
            </a>
          </p>
          <p>
            <a href={'https://github.com/mdn/dex'} rel={'external nofollow noopener'} target={'_blank'}>
              @mdn/dex
            </a>
          </p>
        </div>
      </div>
    </aside>
    <section className={'container'}>
      <h2>Something went wrong.</h2>
      <div className={'container-item error-decoration'}>
        <div className={'container-item-title'}>
          <h3>An error occurred!</h3>
        </div>
        <div className={'container-item-content'}>
          <p>
            Please try refreshing the page or contact us if the issue persists.
          </p>
        </div>
      </div>
    </section>
  </main>
)

export { PageError }
