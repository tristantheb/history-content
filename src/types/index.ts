type Status = 'untranslated' | 'upToDate' | 'outOfDate' | 'missing' | 'removed'

type Row = {
  id: number
  pathName: string
  dateLoca: string
  status: Status
}

type Counts = {
  upToDate: number
  outDated: number
  missing: number
  total: number
}

export type { Status, Row, Counts }
