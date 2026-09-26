type ContentIssueProps = {
  line?: number
  end_line?: number
  fields: [string, string][]
  spans: [string, string][]
}

type ContentIssueMap = Record<string, ContentIssueProps[]>

const DEX_PATH = '/home/runner/work/dex/dex/mdn'

export type { ContentIssueProps, ContentIssueMap }
export { DEX_PATH }
