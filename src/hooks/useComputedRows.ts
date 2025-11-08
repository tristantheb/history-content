import { useMemo } from 'react'
import type { Row, Counts } from '@/types'
import { Status } from '@/types/Status'

const useComputedRows = (original: string[] = [], localized: string[] = []) => {
  const allRows = useMemo(() => {
    return original.map((el, i) => {
      const mPath = el.match(/(files\/.*?\.md)/)
      const pathName = mPath ? mPath[1] : ''

      const pathShort = pathName ? pathName.split('/').slice(2).join('/') : ''

      const enHashMatch = el.match(/([0-9a-fA-F]{40}|no_hash_commit)\s*$/)
      const enHash = enHashMatch ? enHashMatch[1] : undefined

      let locaHash: string | undefined

      const locaLine = localized.find(l10n => l10n.includes(pathShort))
      const locaHashMatch = locaLine?.match(/([0-9a-fA-F]{40}|no_hash_commit)\s*$/)
      locaHash = locaHashMatch ? locaHashMatch[1] : undefined

      let hashStatus: Status
      if (!locaHash) hashStatus = Status.UNSTRANSLATED
      else if (locaHash === 'no_hash_commit') hashStatus = Status.MISSING
      else if (enHash && locaHash === enHash) hashStatus = Status.UP_TO_DATE
      else hashStatus = Status.OUTDATED

      return {
        id: i + 1,
        pathName,
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
