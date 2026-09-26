import type { JSX, ReactNode } from 'react'
import { CircleSlash, Earth, FileWarning, FolderGit2, GitCompareArrows } from 'lucide-react'
import { MissingHash } from '../StatusIcons/MissingHash'
import { OutdatedHash } from '../StatusIcons/OutdatedHash'
import { PoisonedHash } from '../StatusIcons/PoisonedHash'
import { UntranslatedHash } from '../StatusIcons/UntranslatedHash'
import { UpToDateHash } from '../StatusIcons/UpToDateHash'
import { type ContentIssueProps, DEX_PATH } from '@/types/ContentIssueType'
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
  issues?: ContentIssueProps[]
  rowIndex?: number
}

const Line = ({
  row,
  lang,
  issues = [],
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
        {issues.length > 0 && (
          <details className={'content-issues'}>
            <summary>
              {issues.length} content issue{issues.length === 1 ? '' : 's'}
              &nbsp;
              <span className={'experimental-badge'}>Experimental</span>
            </summary>
            <ul>
              {issues.map((issue, index) => {
                const issueType = issue.fields.find(([key]) => key === 'source')?.[1] || 'Content issue'
                const message = issue.fields.find(([key]) => key === 'message')?.[1]
                  .replace(DEX_PATH, '')
                const templ = issue.spans.find(([key]) => key === 'templ')?.[1]
                const url = issue.fields.find(([key]) => key === 'url')?.[1]
                const redirect = issue.fields.find(([key]) => key === 'redirect')?.[1]
                const lineLabel = issue.line === undefined
                  ? 'Line unavailable'
                  : issue.end_line && issue.end_line !== issue.line
                    ? `Lines ${issue.line}-${issue.end_line}`
                    : `Line ${issue.line}`

                return (
                  <li key={`${issueType}-row${row.id}-issue${index}`}>
                    <strong className={'status-name status-outdated'}>
                      <FileWarning size={16} /> {issueType}
                    </strong> ({lineLabel})
                    {message && <span>: {message}</span>}
                    {templ && <span>: {templ}</span>}
                    {url && <span><br />{url}</span>}
                    {redirect && <span> → {redirect}</span>}
                  </li>
                )
              })}
            </ul>
          </details>
        )}
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
