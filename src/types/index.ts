import type { Status } from './Status'

type Row = {
  id: number
  categories: string[]
  path: string
  hashStatus: Status
}

type Counts = {
  upToDate: number
  outDated: number
  unstranslated: number
  total: number
}

export type { Row, Counts }
