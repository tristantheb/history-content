import { CircleSlash/*, Copy*/ } from 'lucide-react'
import { MissingHash } from '../StatusIcons/MissingHash'
import { OutdatedHash } from '../StatusIcons/OutdatedHash'
import { UntranslatedHash } from '../StatusIcons/UntranslatedHash'
import { UpToDateHash } from '../StatusIcons/UpToDateHash'
import type { ReactNode } from 'react'
import type { Row } from '@/types'
import { Status } from '@/types/Status'

const hashStatusTypes: Record<Status, [string, ReactNode]> = {
  [Status.MISSING]: [
    'bg-yellow-200 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    <MissingHash />
  ],
  [Status.OUTDATED]: [
    'bg-yellow-200 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    <OutdatedHash />
  ],
  [Status.UP_TO_DATE]: [
    'bg-green-200 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    <UpToDateHash />
  ],
  [Status.UNSTRANSLATED]: [
    'bg-red-200 dark:bg-red-900/30 text-red-800 dark:text-red-300',
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
    className={'dark:fill-slate-300/20 dark:text-white inline'}
    color={'currentColor'}
    strokeWidth={1.5} />,
  rowIndex
}: LineProps) => {
  const { id, pathName, hashStatus: rowHashStatus } = row
  const hashStatus = hashStatusTypes[rowHashStatus as Status] ?? [Status.UNSTRANSLATED, <MissingHash />]
  return (
    <tr key={id} id={String(id)}
      className={`${hashStatus[0]} text-sm`}
      role={'row'} aria-rowindex={rowIndex}
    >
      <td className={'px-3 py-2'} role={'cell'}>
        {
          pathName
            .replace('files/en-us/', '')
            .replace('/index.md', '')
        }
      </td>
      <td className={'px-3 py-2 text-right'} role={'cell'}>{pvCell}</td>
      <td className={'px-3 py-2 text-center'} role={'cell'}>{hashStatus[1]}</td>
      {/*<td className={'p-3 text-center'}>
        <a href={'#'} className={'text-slate-100/50 hover:text-slate-100'}>
          <Copy className={'inline'} />
        </a>
      </td>*/}
    </tr>
  )
}

export { Line }
