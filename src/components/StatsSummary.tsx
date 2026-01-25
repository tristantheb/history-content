import type { Counts } from '@/types'

const SUCCESS_BG = 'bg-green-200 dark:bg-green-900/30 text-green-900 dark:text-green-300'
const WARNING_BG = 'bg-yellow-200 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-300'
const DANGER_BG = 'bg-red-200 dark:bg-red-900/30 text-red-900 dark:text-red-200'

const StatsSummary = (
  {
    counts,
    customClass = ''
  }:
  {
    counts: Counts;
    customClass?: string;
  }
) => {
  const upPct = counts.total ? (counts.upToDate / counts.total) * 100 : 0
  const outPct = counts.total ? (counts.outDated / counts.total) * 100 : 0
  const unstrPct = counts.total ? (counts.unstranslated / counts.total) * 100 : 0

  return (
    <div className={`flex mt-4 rounded ring-1 ring-inset ring-white/10 shadow-lg overflow-hidden ${customClass}`}>
      <div
        className={`${SUCCESS_BG} transition-all duration-200 p-2`}
        style={{ width: `${upPct}%` }}
      >
        {counts.upToDate}
      </div>
      <div
        className={`${WARNING_BG} transition-all duration-200 p-2`}
        style={{ width: `${outPct}%` }}
      >
        {counts.outDated}
      </div>
      <div
        className={`${DANGER_BG} transition-all duration-200 p-2`}
        style={{ width: `${unstrPct}%` }}
      >
        {counts.unstranslated}
      </div>
    </div>
  )
}

export { StatsSummary }
