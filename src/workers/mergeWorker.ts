import { type MergeDataProps } from '@/hooks/useGetPages'
import { type PageData } from '@/types/HistoryDataType'
import { Status } from '@/types/Status'

/**
 * This worker is used to merge all MDN pages data to respond a clean data
 * object to use on table, search, filters, etc.
 * @param e Getting the event message content
 *
 * @returns {void} Post a message with the merged data to use it in the app.
 * @version 2.7.0
 */
self.onmessage = (e): void => {
  const { originalData, localData, popularityData, parityData } = e.data as MergeDataProps
  const mergedDate = [] as PageData[]

  const localizedMap = new Map(localData.map(line => [line['path'], line]))
  const parityMap = new Map(parityData.map(line => [line['path'], line]))
  const popularityMap = new Map(popularityData.map(line => [line['page'], line]))

  originalData.forEach((line, index) => {
    const localizedLine: Record<string, string> = localizedMap.get(line['path'])!
    const parityLine: Record<string, string> = parityMap.get(line['path'])!
    const popularityLine: Record<string, string> = popularityMap.get(line['path'])!

    let hashStatus: Status = Status.UNSTRANSLATED
    if (!!localizedLine) {
      if (
        (null !== parityLine['parityCount'] && Number(parityLine['parityCount']) > 0)
      ) {
        hashStatus = Status.OUTDATED
      } else if (localizedLine['sourceCommit'] === 'no_hash_commit') {
        hashStatus = Status.MISSING
      } else if (Number(parityLine['parityCount']) === 0) {
        hashStatus = Status.UP_TO_DATE
      }
    }

    const categories: string[] = line['categories']?.split('|') || ['Other']
    let pageData: PageData = {
      id: index,
      hashStatus,
      path: line['path'] as string,
      parent: {
        sourceCommit: line['sourceCommit'],
        categories: categories,
        parentCategories: categories[0]!
      },
      parity: Number(parityLine['parityCount']),
      popularity: Number(popularityLine?.['pageviews']) || null,
      sourceCommit: localizedLine ? localizedLine['sourceCommit'] : undefined
    }

    mergedDate.push(pageData)
  })

  self.postMessage({ mergedDate })
}
