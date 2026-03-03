import { useMemo } from 'react'
import type { Row, Counts } from '@/types'
import { Status } from '@/types/Status'

const useComputedRows = (original: string[][] = [], localized: string[][] = []) => {
  const allRows = useMemo(() => {
    return original.map((el, i) => {
      const path = el ? el[0] : ''
      const enHash = el[1].match(/([0-9a-fA-F]{40})\s*$/)?.toString()
      const locaLine = localized.find(l10n => l10n.includes(path))
      const locaHash = locaLine?.[1].match(/([0-9a-fA-F]{40}|no_hash_commit)\s*$/)?.toString() ?? undefined

      let hashStatus: Status
      if (!locaHash) hashStatus = Status.UNSTRANSLATED
      else if (locaHash === 'no_hash_commit') hashStatus = Status.MISSING
      else if (enHash && locaHash === enHash) hashStatus = Status.UP_TO_DATE
      else hashStatus = Status.OUTDATED

      return {
        id: i + 1,
        path,
        hashStatus
      }
    })
  }, [original, localized])
  const counts = useMemo(() => {
    let upToDate = 0, outDated = 0, unstranslated = 0, total = 0
    for (const r of allRows) {
      if (r.hashStatus === Status.UP_TO_DATE) upToDate++
      else if (r.hashStatus === Status.OUTDATED) outDated++
      else if (r.hashStatus === Status.MISSING) outDated++
      else unstranslated++
      total++
    }
    return { upToDate, outDated, unstranslated, total }
  }, [allRows])

  return { allRows: allRows as Row[], counts: counts as Counts }
}

export { useComputedRows }
