import { useMemo } from 'react'
import type { Row, Counts } from '@/types'

const useComputedRows = (original: string[] = [], localized: string[] = []) => {
  const allRows = useMemo(() => {
    return original.map((el, i) => {
      const date = el.match(/^(.*) /g)
      const mPath = el.match(/(files\/.*)$/)
      const pathName = mPath ? mPath[0] : ''
      const pathShort = pathName ? pathName.slice(11) : ''

      let dateLoca
      for (const l10n of localized) {
        if (l10n.includes(pathShort)) {
          dateLoca = l10n.match(/^(.*) /g)
          break
        }
      }

      const date1 = new Date(date?.[0]?.trim() || '')
      const date2 = dateLoca ? new Date(dateLoca?.[0]?.trim() || '') : undefined

      let status
      if (date2 === undefined) status = 'untranslated'
      else if (date1.getTime() < date2.getTime()) status = 'upToDate'
      else status = 'outOfDate'

      return {
        id: i + 1,
        pathName,
        dateLoca: dateLoca ? dateLoca[0].trim() : '',
        status
      }
    })
  }, [original, localized])

  const counts = useMemo(() => {
    let upToDate = 0, outDated = 0, missing = 0, total = 0
    for (const el of original) {
      const date = el.match(/^(.*) /g)
      const mPath = el.match(/(files\/.*)$/)
      const pathName = mPath ? mPath[0] : ''
      const pathShort = pathName ? pathName.slice(11) : ''
      let dateLoca
      for (const l10n of localized) {
        if (l10n.includes(pathShort)) {
          dateLoca = l10n.match(/^(.*) /g)
          break
        }
      }
      const date1 = new Date(date?.[0]?.trim() || '')
      const date2 = dateLoca ? new Date(dateLoca?.[0]?.trim() || '') : undefined
      let status
      if (date2 === undefined) status = 'missing'
      else if (date1.getTime() < date2.getTime()) status = 'upToDate'
      else status = 'outDated'
      if (status === 'upToDate') upToDate++
      else if (status === 'outDated') outDated++
      else if (status === 'missing') missing++
      total++
    }
    return { upToDate, outDated, missing, total }
  }, [original, localized])

  return { allRows: allRows as Row[], counts: counts as Counts }
}

export { useComputedRows }
