import type { Status } from './Status'

type Row = {
  id: number
  path: string
  lastModified: string
  lastModifiedLocale?: string
  categories: string[]
  hashStatus: Status
}

type Counts = {
  upToDate: number
  outDated: number
  unstranslated: number
  total: number
}

export type { Row, Counts }
