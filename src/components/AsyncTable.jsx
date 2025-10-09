import React, { Suspense } from 'react';

const LazyTable = React.lazy(() => import('./StatsTable/Table.jsx').then(m => ({ default: m.Table })));

export default function AsyncTable(props) {
  return (
    <Suspense fallback={<div className="bg-sky-400/20 text-sky-400 p-3 my-8 rounded">Chargement du tableau…</div>}>
      <LazyTable {...props} />
    </Suspense>
  );
}
