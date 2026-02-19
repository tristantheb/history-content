import { CircleSlash } from 'lucide-react'
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
  pvCell?: ReactNode
  rowIndex?: number
}

const Line = ({
  row,
  pvCell = <CircleSlash
    className={'text-dark'}
    color={'currentColor'}
    strokeWidth={1.5} />,
  rowIndex
}: LineProps) => {
  const { id, pathName, hashStatus: rowHashStatus } = row
  const shortPath = pathName
    .replace('files/en-us/', '')
    .replace('/index.md', '')
  const hashStatus = hashStatusTypes[rowHashStatus as Status] ?? [Status.UNSTRANSLATED, <MissingHash />]
  return (
    <tr key={id} id={String(id)}
      className={`version-table-row ${hashStatus[0]}`}
      role={'row'} aria-rowindex={rowIndex}
    >
      <td role={'cell'}>{shortPath}</td>
      <td role={'cell'}>{pvCell}</td>
      <td role={'cell'}>{hashStatus[1]}</td>
    </tr>
  )
}

export { Line }
