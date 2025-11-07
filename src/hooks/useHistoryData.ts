import { useEffect, useRef, useState } from 'react'

type UseHistoryDataOptions = {
  baseUrl?: string
  lang?: string
  popularityFile?: string
}

type HistoryState = {
  original: string[]
  localized: string[]
  popularityCsv: string
  error: string | null
}

const useHistoryData = ({ baseUrl = '', lang = 'fr', popularityFile = 'current' }: UseHistoryDataOptions = {}) => {
  const [state, setState] = useState<HistoryState>({
    original: [],
    localized: [],
    popularityCsv: '',
    error: null
  })

  const cancelled = useRef(false)

  useEffect(() => {
    cancelled.current = false

    async function load() {
      try {
        const [originRessources, localRessources] = await Promise.all([
          fetch(`${baseUrl}history/logs-en-us.txt`),
          fetch(`${baseUrl}history/logs-${lang}.txt`)
        ])

        if (!originRessources.ok) throw new Error(`HTTP error logs-en-us: ${originRessources.status}`)
        if (!localRessources.ok) throw new Error(`HTTP error logs-${lang}: ${localRessources.status}`)

        const [enText, locaText] = await Promise.all([originRessources.text(), localRessources.text()])
        const enEntries = enText.match(/^(.*\.md)$/gm) || []
        const locaEntriesRaw = locaText.match(/^(.*\.md)$/gm) || []
        const locaEntries = locaEntriesRaw.filter((s) => !s.includes('/conflicting/') && !s.includes('/orphaned/'))

        try {
          const popRes = await fetch(`${baseUrl}history/${popularityFile}.csv`)
          if (popRes.ok) {
            const csv = (await popRes.text()).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')
            if (!cancelled.current) setState((p) => ({ ...p, popularityCsv: csv }))
          }
        } catch {
          // optional
        }

        if (!cancelled.current) {
          setState((p) => ({ ...p, original: enEntries, localized: locaEntries }))
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
