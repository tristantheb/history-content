import { useMemo } from 'react'
import type { Status, Row, Counts } from '@/types'

const useComputedRows = (original: string[] = [], localized: string[] = []) => {
  const allRows = useMemo(() => {
    return original.map((el, i) => {
      const mPath = el.match(/(files\/.*?\.md)/)
      const pathName = mPath ? mPath[1] : ''

      const pathShort = pathName ? pathName.split('/').slice(2).join('/') : ''

      const dateStr = pathName ? el.substring(0, el.indexOf(pathName)).trim() : ''

      let dateLocaStr: string | undefined
      for (const l10n of localized) {
        if (l10n.includes(pathShort)) {
          const mLocPath = l10n.match(/(files\/.*?\.md)/)
          dateLocaStr = mLocPath ? l10n.substring(0, l10n.indexOf(mLocPath[1])).trim() : ''
          break
        }
      }

      const date1 = new Date(dateStr || '')
      const date2 = dateLocaStr ? new Date(dateLocaStr) : undefined

      let status: Status
      if (date2 === undefined) status = 'untranslated'
      else if (date1.getTime() < date2.getTime()) status = 'upToDate'
      else status = 'outOfDate'

      const enHashMatch = el.match(/([0-9a-fA-F]{40}|no_hash_commit)\s*$/)
      const enHash = enHashMatch ? enHashMatch[1] : undefined

      let locaHash: string | undefined
      if (dateLocaStr) {
        const locaLine = localized.find(l10n => l10n.includes(pathShort))
        const locaHashMatch = locaLine?.match(/([0-9a-fA-F]{40}|no_hash_commit)\s*$/)
        locaHash = locaHashMatch ? locaHashMatch[1] : undefined
      }

      let hashStatus: Status
      if (!locaHash || locaHash === 'no_hash_commit') hashStatus = 'untranslated'
      else if (enHash && locaHash === enHash) hashStatus = 'upToDate'
      else hashStatus = 'outOfDate'

      return {
        id: i + 1,
        pathName,
        dateLoca: dateLocaStr || '',
        status,
        hashStatus
      }
    })
  }, [original, localized])
  const counts = useMemo(() => {
    let upToDate = 0, outDated = 0, missing = 0, total = 0
    for (const r of allRows) {
      if (r.status === 'upToDate') upToDate++
      else if (r.status === 'outOfDate') outDated++
      else if (r.status === 'untranslated') missing++
      total++
    }
    return { upToDate, outDated, missing, total }
  }, [allRows])

  return { allRows: allRows as Row[], counts: counts as Counts }
}

export { useComputedRows }
