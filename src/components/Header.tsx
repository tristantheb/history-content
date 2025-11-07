const Header = () => (
  <header id="page-head" className="bg-slate-900 p-8 lg:p-16 mb-4 lg:mb-8">
    <div className="container mx-auto">
      <h1 className="font-bold text-white xl:font-extrabold text-3xl md:text-4xl xl:text-6xl mb-4">
        Editing history of the MDN pages
      </h1>
      <p className="text-lg">
        This history manager groups the <strong>main changes</strong> that are made
        or to be made regarding pages in the <abbr title="Mozilla Developer Network">MDN</abbr> Web Docs.
      </p>
    </div>
  </header>
)

export { Header }
