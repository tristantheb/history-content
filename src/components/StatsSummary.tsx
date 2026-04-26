import type { JSX } from 'react'
import type { Counts } from '@/types/CountType'

const StatsSummary = (counts: Counts): JSX.Element => {
  const upPct = counts.total ? (counts.upToDate / counts.total) * 100 : 0
  const outPct = counts.total ? (counts.outDated / counts.total) * 100 : 0
  const unstrPct = counts.total ? (counts.unstranslated / counts.total) * 100 : 0
  const psnPct = counts.total ? (counts.poisoned / counts.total) * 100 : 0

  return (
    <div>
      <div className={'stats-bar'}>
        <div
          className={'stats-bar-translated'}
          style={{ width: `${upPct}%` }}
        ></div>
        <div
          className={'stats-bar-outdated'}
          style={{ width: `${outPct}%` }}
        ></div>
        <div
          className={'stats-bar-untranslated'}
          style={{ width: `${unstrPct}%` }}
        ></div>
        <div
          className={'stats-bar-poisoned'}
          style={{ width: `${psnPct}%` }}
        ></div>
      </div>
      <div className={'stats-details'}>
        <p><span className={'dot dot-translated'}></span> {counts.upToDate} up to date</p>
        <p><span className={'dot dot-outdated'}></span> {counts.outDated} outdated</p>
        <p><span className={'dot dot-untranslated'}></span> {counts.unstranslated} untranslated</p>
        <p><span className={'dot dot-poisoned'}></span> {counts.poisoned} poisoned</p>
      </div>
    </div>
  )
}

export { StatsSummary }
