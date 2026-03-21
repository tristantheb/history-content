type LocalizedData = {
  path: string
  sourceCommit: string
  lastModified: string
}

type EnglishData = LocalizedData & {
  categories: string
}

export type { LocalizedData, EnglishData }
