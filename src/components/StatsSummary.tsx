import type { JSX } from 'react'
import type { Counts } from '@/types/CountType'

const StatsSummary = (counts: Counts): JSX.Element => {
  const upPct = counts.total ? (counts.upToDate / counts.total) * 100 : 0
  const msnPct = counts.total ? (counts.missing / counts.total) * 100 : 0
  const outPct = counts.total ? (counts.outDated / counts.total) * 100 : 0
  const unstrPct = counts.total ? (counts.untranslated / counts.total) * 100 : 0
  const psnPct = counts.total ? (counts.poisoned / counts.total) * 100 : 0

  return (
    <div>
      <p>
        <strong>Total pages:</strong>&nbsp;
        {counts.total} total, for {counts.upToDate + counts.outDated} currently
        translated ({(upPct + outPct + msnPct).toFixed(2)}%).
      </p>
      <br />
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
          className={'stats-bar-missing'}
          style={{ width: `${msnPct}%` }}
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
        {counts.upToDate > 0 &&
          <p><span className={'dot dot-translated'}></span> {counts.upToDate} up to date</p>
        }
        {counts.outDated > 0 &&
          <p><span className={'dot dot-outdated'}></span> {counts.outDated} outdated</p>
        }
        {counts.missing > 0 &&
          <p><span className={'dot dot-missing'}></span> {counts.missing} without hash</p>
        }
        {counts.untranslated > 0 &&
          <p><span className={'dot dot-untranslated'}></span> {counts.untranslated} untranslated</p>
        }
        {counts.poisoned > 0 &&
          <p><span className={'dot dot-poisoned'}></span> {counts.poisoned} poisoned</p>
        }
      </div>
    </div>
  )
}

export { StatsSummary }
