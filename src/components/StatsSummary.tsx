const StatsSummary = ({ counts }) => {
  return (
    <div className="flex my-4 rounded ring-1 ring-inset ring-white/10 shadow-lg overflow-hidden">
      <div className="bg-green-900/30 text-green-300 p-2" style={{ width: `${counts.total ? (counts.upToDate / counts.total) * 100 : 0}%` }}>{counts.upToDate}</div>
      <div className="bg-yellow-900/30 text-yellow-300 p-2" style={{ width: `${counts.total ? (counts.outDated / counts.total) * 100 : 0}%` }}>{counts.outDated}</div>
      <div className="bg-red-900/30 text-red-200 p-2" style={{ width: `${counts.total ? (counts.missing / counts.total) * 100 : 0}%` }}>{counts.missing}</div>
    </div>
  )
}

export { StatsSummary }
