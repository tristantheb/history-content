import type { JSX, ReactNode } from 'react'
import { CircleSlash, Earth, FolderGit2, GitCompareArrows } from 'lucide-react'
import { MissingHash } from '../StatusIcons/MissingHash'
import { OutdatedHash } from '../StatusIcons/OutdatedHash'
import { PoisonedHash } from '../StatusIcons/PoisonedHash'
import { UntranslatedHash } from '../StatusIcons/UntranslatedHash'
import { UpToDateHash } from '../StatusIcons/UpToDateHash'
import { type PageData } from '@/types/HistoryDataType'
import { Status } from '@/types/Status'

const hashStatusTypes: Record<Status, ReactNode> = {
  [Status.MISSING]: <MissingHash />,
  [Status.OUTDATED]: <OutdatedHash />,
  [Status.UP_TO_DATE]: <UpToDateHash />,
  [Status.UNTRANSLATED]: <UntranslatedHash />,
  [Status.POISONED]: <PoisonedHash />
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
  const isEnglish = row.hashStatus === Status.UNTRANSLATED
  return (
    <tr key={row.id} id={String(row.id)}
      aria-rowindex={rowIndex}
    >
      <td
        {...(isNaN(row.parity) ? { colSpan: 2 } : {})}
      >
        <a
          href={`https://developer.mozilla.org/${isEnglish ? 'en-us' : lang}/docs/${row.path}`}
          target={'_blank'}
          rel={'external noopener noreferrer'}>
          {row.path}
          {isEnglish && <>&nbsp;<sup>(angl.)</sup></>}
        </a>
        <br />
        {!isEnglish && <a
          href={`https://developer.mozilla.org/en-us/docs/${row.path}`}
          className={'text-small'}
          target={'_blank'}
          rel={'external noopener noreferrer'}>
          <Earth size={12} /> See in english
        </a>}
        &nbsp;
        <a
          href={`https://github.com/mdn/content/blob/main/files/en-us/${row.path}/index.md?plain=1`}
          className={'text-small'}
          target={'_blank'}
          rel={'external noopener noreferrer'}>
          <FolderGit2 size={12} /> See source code
        </a>
      </td>
      {!isNaN(row.parity) && (
        <td>{row.parity}</td>
      )}
      <td className={'parity-anchor'}>
        {hashStatus}
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
      <td>{row.popularity?.toString() || (<CircleSlash
        className={'text-gray'}
        color={'currentColor'}
        strokeWidth={1.5} />)}</td>
    </tr>
  )
}

export { Line }
