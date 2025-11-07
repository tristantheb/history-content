import { CircleSlash/*, Copy*/ } from 'lucide-react'
import { OutOfDate } from '../StatusIcons/OutOfDate'
import { Untranslated } from '../StatusIcons/Untranslated'
import { UpToDate } from '../StatusIcons/UpToDate'
import type { Row } from '@/types'
import type { ReactNode } from 'react'

type StatusInfo = { color?: string; element?: ReactNode }

const statusTypes: Record<string, StatusInfo> = {
  upToDate: {
    color: 'updated bg-green-900/30 text-green-300',
    element: <UpToDate />
  },
  outOfDate: {
    color: 'outdated bg-yellow-900/30 text-yellow-300',
    element: <OutOfDate />
  },
  untranslated: {
    color: 'missing bg-red-900/30 text-red-300',
    element: <Untranslated />
  },
  removed: {}
}

type LineProps = {
  row: Row
  pvCell?: ReactNode
}

const Line = ({
  row,
  pvCell = <CircleSlash className={'fill-slate-300/20 text-white inline'} color={'currentColor'} strokeWidth={1.5} />
}: LineProps) => {
  const { id, pathName, dateLoca, status: rowStatus } = row
  const status = statusTypes[String(rowStatus)] || {}
  return (
    <tr key={id} id={String(id)} className={`${status.color} text-sm`}>
      <td className={'px-3 py-2'}>{pathName.replace('files/en-us/', '').replace('/index.md', '')}</td>
      <td className={'px-3 py-2'}>{dateLoca.replace(/[+-][0-9]+$/, '')}</td>
      <td className={'px-3 py-2 text-right'}>{pvCell}</td>
      <td className={'px-3 py-2 text-center'}>{status.element}</td>
      {/*<td className={'p-3 text-center'}>
        <a href={'#'} className={'text-slate-100/50 hover:text-slate-100'}>
          <Copy className={'inline'} />
        </a>
      </td>*/}
    </tr>
  )
}

export { Line }
