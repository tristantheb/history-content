import { useEffect, useRef, useState } from 'react'
import { type PageData } from '@/types/HistoryDataType'

const baseUrl = import.meta.env.BASE_URL

type HistoryState = {
  pages: PageData[]
  categories: Record<string, string[]>
  error: string | null
}

type LoadProps = {
  locale: string,
  onStateChange?: (state: HistoryState) => void,
  status: { current: boolean }
}

/**
 * Utility function to convert a camelCase string to lowerCamelCase.
 * @param {string} str The content to lower
 *
 * @returns {string} The lower content.
 * @version 2.7.0
 */
const camelToLowerCamel = (str: string): string =>
  str.charAt(0).toLowerCase() + str.slice(1)

/**
 * Utility function to parse CSV data into an array of objects for
 * @tristantheb/history-content-data csv.
 * @param {string} csv The csv content to parse.
 *
 * @returns {Record<string, string>[]} The parsed data as an array of objects
 * with keys from the header and values from the lines.
 * @version 2.7.0
 */
const parseCsvData = (csv: string): Record<string, string>[] => {
  const [header, ...lines] = csv.replace(/\r\n?/g, '\n').split('\n')
  const keys = header!.split(',').map(k => camelToLowerCamel(k.trim()))

  return lines.map(line => {
    if (!line.trim()) {
      return {}
    }

    const values = line.split(',').map(v => v.trim())
    const obj: Record<string, string> = {}
    keys.forEach((key, i) => {
      obj[key] = values[i] || ''
    })
    return obj
  })
}

/**
 * Special parsing for popularity data, to filter only en-us pages and format
 * the path as in the other data for easier merging.
 * @param {string} csv The csv content to parse.
 *
 * @returns {Record<string, string>[]} The parsed data as an array of objects
 * with keys from the header and values from the lines.
 * @version 2.7.0
 */
const parsePopCsvData = (csv: string): Record<string, string>[] => {
  const [header, ...lines] = csv.replace(/\r\n?/g, '\n').split('\n')
  const keys = header!.split(',').map(k => camelToLowerCamel(k.trim()))

  const filteredLines = lines.filter(line => line.includes('/en-US/'))

  return filteredLines.map(line => {
    if (!line.trim()) {
      return {}
    }

    let values = line.split(',').map(v => v.trim())
    values[0] = values[0]!
      .replace(/\/en-US\/docs\//, '')
      .replace(/::/, '_doublecolon_')
      .replace(/:/, '_colon_')
      .toLowerCase()

    const obj: Record<string, string> = {}
    keys.forEach((key, i) => {
      obj[key] = values[i] || ''
    })
    return obj
  })
}

type OriginalRessources = string
type LocalRessources = string
type PopularityRessources = string
type ParityRessources = string
type GetDataResult = Promise<[
  OriginalRessources,
  LocalRessources,
  PopularityRessources,
  ParityRessources
]>

/**
 * Fetches the original resources, localized resources, popularity and parity
 * data as raw CSV strings.
 * @param {string} locale The locale of the visitor, used to fetch the right
 * localized data.
 *
 * @returns {Promise<GetDataResult>} A promise that resolves to the raw CSV data
 * of the original resources, localized resources, popularity and parity.
 * @version 2.7.0
 */
const getData = async (locale: string): Promise<GetDataResult> => {
  const [
    originRessources,
    localRessources,
    popularityRessources,
    parityRessources
  ] = await Promise.all([
    // Data header is : Path,SourceCommit,Categories
    fetch(`${baseUrl}history/logs-en-us.csv`),
    // Data header is : Path,SourceCommit
    fetch(`${baseUrl}history/logs-${locale}.csv`),
    // Data header is : Page,Pageviews
    fetch(`${baseUrl}history/current.csv`),
    // Data header is : Path,ParityCount
    fetch(`${baseUrl}statistics/parity-${locale}.csv`)
  ]).catch(e => {
    throw new Error(`Failed to fetch data: ${e instanceof Error ? e.message : String(e)}`)
  })

  return await Promise.all([
    originRessources.text(),
    localRessources.text(),
    popularityRessources.text(),
    parityRessources.text()
  ])
}

type MergeDataProps = {
  originalData: Record<string, string>[]
  localData: Record<string, string>[]
  popularityData: Record<string, string>[]
  parityData: Record<string, string>[]
}

/**
 * This function is the worker function, it's here the worker merge all data.
 * @param originalData The data of the original pages in en-us, with path,
 * source commit and categories.
 * @param localData The data of the localized pages, with path and source
 * commit.
 * @param popularityData The data of the page popularity, with page and
 * pageviews.
 * @param parityData The data of the parity between the localized pages and the
 * original ones, with path and parity count.
 *
 * @returns {Promise<PageData[]>} The merged data of all the pages with all the
 * useful information to display in the table and global stats.
 * @version 2.7.0
 */
const mergeData = async ({
  originalData,
  localData,
  popularityData,
  parityData
}: MergeDataProps): Promise<PageData[]> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('@/workers/mergeWorker.ts', import.meta.url),
      { type: 'module' }
    ) as Worker

    worker.onmessage = (e: MessageEvent): void => {
      resolve(e.data.mergedDate as PageData[])
      worker.terminate()
    }

    try {
      worker.postMessage({ originalData, localData, popularityData, parityData })
    } catch (err) {
      reject(err)
      worker.terminate()
    }
  })
}

type ParentCategories = string
type Categories = string[]

/**
 * Load function to fetch, parse and merge all data, then update the state of
 * the component using the hook with the final pages data or any error message.
 * @param {string} locale The locale of the visitor, used to fetch the right
 * localized data.
 * @param {function} onStateChange A callback function to update the state of
 * the component using the hook with the pages data and any error message.
 * @param {object} status An object with a `current` property to check if the
 * component is still mounted before updating the state, to avoid memory leaks.
 *
 * @returns {Promise<void>}
 * @version 2.7.0
 */
const load = async (
  { locale, onStateChange, status }: LoadProps
): Promise<void> => {
  try {
    const [originRessources, localRessources, popularityRessources, parityRessources] = await getData(locale)
    const originalData: Record<string, string>[] = parseCsvData(originRessources)
    const localData: Record<string, string>[] = parseCsvData(localRessources)
    const popularityData: Record<string, string>[] = parsePopCsvData(popularityRessources)
    const parityData: Record<string, string>[] = parseCsvData(parityRessources)

    const finalRows: PageData[] = await mergeData({ originalData, localData, popularityData, parityData })

    const categories: Record<ParentCategories, Categories> = {}
    finalRows.forEach(row => {
      const parentCategory = row.parent?.parentCategories ?? 'Other'
      const category = Array.isArray(row.parent?.categories) ? row.parent.categories : []

      categories[parentCategory] = categories[parentCategory] ?? []
      category.forEach(category => {
        if (!category) return
        if (!categories[parentCategory]!.includes(category)) {
          categories[parentCategory]!.push(category)
        }
      })
    })

    if (!status.current) {
      if (onStateChange) {
        onStateChange({ pages: finalRows, categories: categories, error: null })
      }
    }
  } catch (e: unknown) {
    if (!status.current) {
      const msg = e instanceof Error ? e.message : String(e)
      if (onStateChange) {
        onStateChange({ pages: [], categories: {}, error: msg })
      }
    }
  }
}

/**
 * Custom hook to fetch and manage page data.
 * @param {string} locale The current locale of the visitor.
 *
 * @returns {HistoryState} An object containing the pages data and any error
 * message.
 * @version 2.7.0
 */
const useGetPages = (locale: string): HistoryState => {
  const cancelled = useRef(false)
  const [state, setState] = useState<HistoryState>({
    pages: [],
    categories: {},
    error: null
  })

  useEffect(() => {
    cancelled.current = false
    load({ locale, onStateChange: setState, status: cancelled })
    return (): void => {
      cancelled.current = true
    }
  }, [locale])

  return { ...state }
}

export { type MergeDataProps, type HistoryState, useGetPages }
