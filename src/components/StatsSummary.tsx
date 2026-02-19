import type { Counts } from '@/types'

const StatsSummary = (
  { counts, customClass = '' }:
  {
    counts: Counts;
    customClass?: string;
  }
) => {
  const upPct = counts.total ? (counts.upToDate / counts.total) * 100 : 0
  const outPct = counts.total ? (counts.outDated / counts.total) * 100 : 0
  const unstrPct = counts.total ? (counts.unstranslated / counts.total) * 100 : 0

  return (
    <div className={`stats ${customClass}`}>
      <div
        className={'green'}
        style={{ width: `${upPct}%` }}
      >
        {counts.upToDate}
      </div>
      <div
        className={'yellow'}
        style={{ width: `${outPct}%` }}
      >
        {counts.outDated}
      </div>
      <div
        className={'red'}
        style={{ width: `${unstrPct}%` }}
      >
        {counts.unstranslated}
      </div>
    </div>
  )
}

export { StatsSummary }
