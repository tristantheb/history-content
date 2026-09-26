import { useEffect, useState } from 'react'
import type { ContentIssueMap } from '@/types/ContentIssueType'

/**
 * Gets the content issues for the selected locale
 * @param {string} locale The selected locale to search
 *
 * @returns {ContentIssueMap} The map of content issues for the selected locale
 * @version 2.11.0
 */
const useContentIssues = (locale: string): ContentIssueMap => {
  const [issues, setIssues] = useState<ContentIssueMap>({})

  useEffect(() => {
    setIssues({})
    const worker = new Worker(
      new URL('../workers/contentIssuesWorker.ts', import.meta.url),
      { type: 'module' }
    )

    worker.onmessage = (event: MessageEvent<{ issues: ContentIssueMap }>): void => {
      setIssues(event.data.issues)
      worker.terminate()
    }

    worker.postMessage({ locale })
    return (): void => worker.terminate()
  }, [locale])

  return issues
}

export { useContentIssues }
