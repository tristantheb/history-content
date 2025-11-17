import type { Counts } from '@/types'

const StatsSummary = ({ counts }: { counts: Counts }) => {
  const upPct = counts.total ? (counts.upToDate / counts.total) * 100 : 0
  const outPct = counts.total ? (counts.outDated / counts.total) * 100 : 0
  const unstrPct = counts.total ? (counts.unstranslated / counts.total) * 100 : 0

  return (
    <div className={'flex my-4 rounded ring-1 ring-inset ring-white/10 shadow-lg overflow-hidden'}>
      <div
        className={'bg-green-200 dark:bg-green-900/30 text-green-900 dark:text-green-300 p-2'}
        style={{ width: `${upPct}%` }}
      >
        {counts.upToDate}
      </div>
      <div
        className={'bg-yellow-200 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-300 p-2'}
        style={{ width: `${outPct}%` }}
      >
        {counts.outDated}
      </div>
      <div
        className={'bg-red-200 dark:bg-red-900/30 text-red-900 dark:text-red-200 p-2'}
        style={{ width: `${unstrPct}%` }}
      >
        {counts.unstranslated}
      </div>
    </div>
  )
}

export { StatsSummary }
