import { useEffect, useState } from 'react'

type UseHistoryDataOptions = {
  baseUrl?: string
  lang?: string
  popularityFile?: string
}

const useHistoryData = ({ baseUrl, lang = 'fr', popularityFile = 'current' }: UseHistoryDataOptions = {}) => {
  const [original, setOriginal] = useState<string[]>([])
  const [localized, setLocalized] = useState<string[]>([])
  const [popularityCsv, setPopularityCsv] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
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
            if (!cancelled) setPopularityCsv(csv)
          }
        } catch {
          // optional
        }

        if (!cancelled) {
          setOriginal(enEntries)
          setLocalized(locaEntries)
        }
      } catch (e: unknown) {
        if (!cancelled) {
          if (e instanceof Error) setError(e.message)
          else setError(String(e))
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [baseUrl, lang, popularityFile])

  return { original, localized, popularityCsv, error }
}

export { useHistoryData }
