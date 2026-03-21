import { useEffect, useRef, useState } from 'react'
import { EnglishData, LocalizedData } from '@/types/HistoryDataType'

type UseHistoryDataOptions = {
  baseUrl?: string
  lang?: string
  popularityFile?: string
}

type HistoryState = {
  original: EnglishData[]
  localized: LocalizedData[]
  popularityCsv: string
  error: string | null
}

const camelToLowerCamel = (str: string): string =>
  str.charAt(0).toLowerCase() + str.slice(1)

const parseCsvToData = (csv: string): EnglishData[]|LocalizedData[] => {
  const [header, ...lines] = csv.replace(/\r\n?/g, '\n').split('\n')
  const keys = header.split(',').map(k => camelToLowerCamel(k.trim()))

  return lines?.map(line => {
    const values = line.split(',')
    const entry: Record<string, string> = {}
    keys.forEach((key, i) => {
      entry[key] = values[i]?.trim() ?? ''
    })
    return entry as unknown as EnglishData | LocalizedData
  }) || []
}

const getData = async (baseUrl: string, lang: string): Promise<[string, string]> => {
  const [originRessources, localRessources] = await Promise.all([
    fetch(`${baseUrl}history/logs-en-us.csv`),
    fetch(`${baseUrl}history/logs-${lang}.csv`)
  ])

  if (!originRessources.ok) throw new Error(`HTTP error logs-en-us: ${originRessources.status}`)
  if (!localRessources.ok) throw new Error(`HTTP error logs-${lang}: ${localRessources.status}`)

  return await Promise.all([originRessources.text(), localRessources.text()])
}

const useHistoryData = (
  { baseUrl = '', lang = 'fr', popularityFile = 'current' }:
  UseHistoryDataOptions
): HistoryState => {
  const [state, setState] = useState<HistoryState>({
    original: [],
    localized: [],
    popularityCsv: '',
    error: null
  })

  const cancelled = useRef(false)

  useEffect(() => {
    cancelled.current = false
    setState((p) => ({ ...p, original: [], localized: [], error: null }))

    async function load() {
      try {
        const [enText, locaText] = await getData(baseUrl, lang)
        const enEntries = parseCsvToData(enText)
        const locaEntries = parseCsvToData(locaText)

        await fetch(`${baseUrl}history/${popularityFile}.csv`)
          .then(res => {
            if (res.ok) return res.text()
          })
          .then(text => text ? text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n') : '')
          .then((text) => {
            if (!cancelled.current) setState((p) => ({ ...p, popularityCsv: text }))
          })

        if (!cancelled.current) {
          setState((p) => ({ ...p, original: enEntries as EnglishData[], localized: locaEntries as LocalizedData[] }))
        }
      } catch (e: unknown) {
        if (!cancelled.current) {
          const msg = e instanceof Error ? e.message : String(e)
          setState((p) => ({ ...p, error: msg }))
        }
      }
    }
    load()
    return () => { cancelled.current = true }
  }, [baseUrl, lang, popularityFile])

  return { ...state }
}

export { useHistoryData }
