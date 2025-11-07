type Status = 'untranslated' | 'upToDate' | 'outOfDate' | 'missing'

type Row = {
  id: number
  pathName: string
  dateLoca: string
  status: Status
  hashStatus: Status
}

type Counts = {
  upToDate: number
  outDated: number
  missing: number
  total: number
}

export type { Status, Row, Counts }
