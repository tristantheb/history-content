const QuickNav = () => (
  <aside className={'lg:order-1 lg:col-span-1'}>
    <h2 id={'quick_navigation'} className={'font-semibold text-white text-xl md:text-2xl xl:text-3xl mb-3'}>
      Quick navigation
    </h2>
    <h3 id={'mdn_repositories'} className={'text-lg text-slate-100 md:text-xl xl:text-2xl mb-2'}>
      MDN Repositories
    </h3>
    <ul className={'mb-2'}>
      <li>
        <a
          href={'https://github.com/mdn/content'}
          target={'_blank'}
          rel={'noreferrer'}
          className={'text-blue-300 hover:text-blue-50 visited:text-purple-500'}>
          GitHub mdn/content
        </a>
      </li>
      <li>
        <a
          href={'https://github.com/mdn/translated-content'}
          target={'_blank'}
          rel={'noreferrer'}
          className={'text-blue-300 hover:text-blue-50 visited:text-purple-500'}>
          GitHub mdn/translated-content
        </a>
      </li>
    </ul>
  </aside>
)

export { QuickNav }
