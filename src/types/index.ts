import type { Status } from './Status'

type Row = {
  id: number
  pathName: string
  hashStatus: Status
}

type Counts = {
  upToDate: number
  outDated: number
  unstranslated: number
  total: number
}

export type { Status, Row, Counts }
