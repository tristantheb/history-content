import type { JSX } from 'react'

const Header = (): JSX.Element => (
  <header id={'page-head'} className={'heading-container'}>
    <p className={'heading-container-decoration'}>mdn/community-tool</p>
    <h1 className={'heading-container-title'}>MDN History content</h1>
    <h2 className={'heading-container-subtitle'}>The translation dashboard of the community</h2>
    <p className={'description'}>
      This history manager groups the <strong>main changes</strong> that are made
      or to be made regarding pages in the <abbr title={'Mozilla Developer Network'}>MDN</abbr> Web Docs.
    </p>
  </header>
)

export { Header }
