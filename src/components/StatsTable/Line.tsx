import { CircleSlash, ExternalLink } from 'lucide-react'
import { MissingHash } from '../StatusIcons/MissingHash'
import { OutdatedHash } from '../StatusIcons/OutdatedHash'
import { UntranslatedHash } from '../StatusIcons/UntranslatedHash'
import { UpToDateHash } from '../StatusIcons/UpToDateHash'
import type { ReactNode } from 'react'
import type { Row } from '@/types'
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
  row: Row
  lang: string
  pvCell?: ReactNode
  rowIndex?: number
}

const Line = ({
  row,
  lang,
  pvCell = <CircleSlash
    className={'text-dark'}
    color={'currentColor'}
    strokeWidth={1.5} />,
  rowIndex
}: LineProps) => {
  const { id, path, hashStatus: rowHashStatus } = row
  const hashStatus = hashStatusTypes[rowHashStatus as Status] ?? [Status.UNSTRANSLATED, <MissingHash />]
  const isEnglish = rowHashStatus === Status.UNSTRANSLATED
  return (
    <tr key={id} id={String(id)}
      className={`version-table-row ${hashStatus[0]}`}
      role={'row'} aria-rowindex={rowIndex}
    >
      <td role={'cell'}>
        <a
          href={`https://developer.mozilla.org/${isEnglish ? 'en-us' : lang}/docs/${path}`}
          target={'_blank'}
          rel={'external noopener noreferrer'}>
          {path}&nbsp;
          {isEnglish && <sup>(angl.)</sup>}
          <ExternalLink size={16} />
        </a>
      </td>
      <td role={'cell'}>{pvCell}</td>
      <td role={'cell'}>{hashStatus[1]}</td>
    </tr>
  )
}

export { Line }
