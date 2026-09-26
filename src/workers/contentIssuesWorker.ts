import type { ContentIssueProps, ContentIssueMap } from '@/types/ContentIssueType'

const normalizePath = (path: string): string => path
  .toLowerCase()
  .replace(/\/index\.md$/, '')

self.onmessage = async (event: MessageEvent<{ locale: string }>): Promise<void> => {
  const { locale } = event.data
  const localeMarker = `/translated-content/files/${locale.toLowerCase()}/`

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}history/issues.json`)
    if (!response.ok) {
      throw new Error(`Failed to fetch content issues: ${response.status}`)
    }

    const fileIssues = await response.json() as Record<string, ContentIssueProps[]>
    const issues: ContentIssueMap = {}

    Object.entries(fileIssues).forEach(([filePath, rawIssues]) => {
      const normalizedFilePath = filePath.toLowerCase()
      const localeIndex = normalizedFilePath.lastIndexOf(localeMarker)
      if (localeIndex < 0 || !Array.isArray(rawIssues)) return

      const pagePath = normalizePath(filePath.slice(localeIndex + localeMarker.length))
      const normalizedIssues = rawIssues.map((rawIssue): ContentIssueProps => {
        // Fields contain source, url and redirect
        const fields: [string, string][] = rawIssue.fields.map(([key, value]): [string, string] => [
          key,
          String(value)
        ])

        // Spans contain templ, slug, locale, slug and locale
        const spans: [string, string][] = rawIssue.spans.map(([key, value]): [string, string] => [
          key,
          String(value)
        ])

        return {
          ...(typeof rawIssue.line === 'number' ? { line: rawIssue.line } : {}),
          ...(typeof rawIssue.end_line === 'number' ? { end_line: rawIssue.end_line } : {}),
          fields,
          spans
        }
      })

      issues[pagePath] = [...(issues[pagePath] ?? []), ...normalizedIssues]
    })

    self.postMessage({ issues })
  } catch {
    self.postMessage({ issues: {} })
  }
}
