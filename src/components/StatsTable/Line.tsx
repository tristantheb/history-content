import type { JSX, ReactNode } from 'react'
import { CircleSlash, ExternalLink, GitCompareArrows } from 'lucide-react'
import { MissingHash } from '../StatusIcons/MissingHash'
import { OutdatedHash } from '../StatusIcons/OutdatedHash'
import { UntranslatedHash } from '../StatusIcons/UntranslatedHash'
import { UpToDateHash } from '../StatusIcons/UpToDateHash'
import { type PageData } from '@/types/HistoryDataType'
import { Status } from '@/types/Status'

const hashStatusTypes: Record<Status, [string, ReactNode]> = {
  [Status.MISSING]: [
    'tr-gray',
    <MissingHash />
  ],
  [Status.OUTDATED]: [
    'tr-yellow',
    <OutdatedHash />
  ],
  [Status.UP_TO_DATE]: [
    'tr-green',
    <UpToDateHash />
  ],
  [Status.UNSTRANSLATED]: [
    'tr-red',
    <UntranslatedHash />
  ]
}

type LineProps = {
  row: PageData
  lang: string
  rowIndex?: number
}

const Line = ({
  row,
  lang,
  rowIndex
}: LineProps): JSX.Element => {
  const hashStatus = hashStatusTypes[row.hashStatus as Status]
  const isEnglish = row.hashStatus === Status.UNSTRANSLATED
  return (
    <tr key={row.id} id={String(row.id)}
      className={`version-table-row ${hashStatus[0]}`}
      role={'row'} aria-rowindex={rowIndex}
    >
      <td
        role={'cell'}
        {...(isNaN(row.parity) ? { colSpan: 2 } : {})}
      >
        <a
          href={`https://developer.mozilla.org/${isEnglish ? 'en-us' : lang}/docs/${row.path}`}
          target={'_blank'}
          rel={'external noopener noreferrer'}>
          {row.path}&nbsp;
          {isEnglish && <sup>(angl.)</sup>}
          <ExternalLink size={16} />
        </a>
      </td>
      {!isNaN(row.parity) && (
        <td role={'cell'}>{row.parity}</td>
      )}
      <td role={'cell'}>{row.popularity?.toString() || (<CircleSlash
        className={'text-gray'}
        color={'currentColor'}
        strokeWidth={1.5} />)}</td>
      <td role={'cell'} className={'parity-anchor'}>
        {hashStatus[1]}
        <div className={'parity-anchor-container'}>
          <h4 className={'parity-anchor-container-title'}>Parity details</h4>
          {row.sourceCommit === row.parent.sourceCommit ? (
            <p>
              🎉 Hooray ! This page is up-to-date
            </p>
          ) : (
            <div>
              <p><strong>EN-US:</strong> {row.parent.sourceCommit}</p>
              <p>
                <strong>{lang.toUpperCase()}:</strong>&nbsp;
                {!isNaN(Number(row.parity)) ? row.sourceCommit : 'Not translated'}
              </p>
            </div>
          )}
          <div>
            <p><GitCompareArrows /></p>
          </div>
        </div>
      </td>
    </tr>
  )
}

export { Line }
