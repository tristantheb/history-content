import React, { useEffect, useMemo, useState } from 'react'

const lang = 'fr'

export default function StatusSVG() {
  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const [svg, setSvg] = useState('')

  useEffect(() => {
    async function run() {
      let pageKey = params.get('page')
      let pageName = 'No page'
      let dateOrigStr = ''
      let dateLocaStr = ''
      let statusLabel = 'Unknown'
      let color = 'unknown'

      const statusToSVG = (p) => {
        const { color, pageName, dateOrigStr, dateLocaStr, statusLabel } = p
        if (color === 'unknown') {
          return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="180" viewBox="0 0 480 180">
            <rect x="1" y="1" width="476" height="176" rx="24" fill="#1e293b" stroke="#334155" stroke-width="4"/>
            <text x="32" y="48" font-size="32" font-family="sans-serif" font-weight="bold" fill="#f1f5f9">MDN Page Status</text>
            <text x="32" y="85" font-size="20" font-family="sans-serif" font-weight="bold" fill="#e0e7ef">${pageName}</text>
            <text x="32" y="115" font-size="16" font-family="sans-serif" fill="#94a3b8">Last translation date</text>
            <text x="32" y="140" font-size="18" font-family="sans-serif" font-weight="bold" fill="#f1f5f9">Unknown</text>
            <g>
              <circle cx="410" cy="85" r="36" fill="#334155"/>
              <text x="410" y="97" font-size="36" font-family="sans-serif" font-weight="bold" fill="#fff" text-anchor="middle">?</text>
            </g>
          </svg>`
        }
        const statusColor = (color === 'green' ? 'oklch(87.1% .15 154.449)' : color === 'yellow' ? 'oklch(90.5% .182 98.111)' : 'oklch(70.4% .191 22.216)')
        const statusBgColor = (color === 'green' ? 'oklch(39.3% .095 152.535)' : color === 'yellow' ? 'oklch(42.1% .095 57.708)' : 'oklch(39.6% .141 25.723)')
        return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="180" viewBox="0 0 480 180">
          <rect x="1" y="1" width="476" height="176" rx="24" fill="#1e293b" stroke="#334155" stroke-width="4"/>
          <text x="32" y="48" font-size="32" font-family="sans-serif" font-weight="bold" fill="#f1f5f9">MDN Page Status</text>
          <text x="32" y="85" font-size="20" font-family="sans-serif" font-weight="bold" fill="#e0e7ef">${pageName}</text>
          <text x="32" y="115" font-size="16" font-family="sans-serif" fill="#94a3b8">Last translation date</text>
          <text x="32" y="140" font-size="18" font-family="sans-serif" font-weight="bold" fill="#f1f5f9">${dateLocaStr || (dateOrigStr ? 'Never translated' : 'Page removed')}</text>
          <g>
            <circle cx="410" cy="85" r="40" fill="${statusBgColor}" stroke="${statusColor}" stroke-width="2" />
            <circle cx="410" cy="85" r="35" fill="${statusBgColor}" stroke="${statusColor}" stroke-width="2" />
            ${color === 'green'
              ? `<path d="M392 87 l10 10 l25 -25" fill="none" stroke="${statusColor}" stroke-width="6" stroke-linecap="round" />`
              : color === 'yellow'
              ? `<path d="M410 65 v25" fill="none" stroke="${statusColor}" stroke-width="6" stroke-linecap="round" /><circle cx="410" cy="105" r="5" fill="${statusColor}"/>`
              : `<path d="M395 72 l30 30 m-30 0 l30 -30" fill="none" stroke="${statusColor}" stroke-width="6" stroke-linecap="round" />`}
          </g>
        </svg>`
      }

      setSvg(statusToSVG({ color, pageName, dateOrigStr, dateLocaStr, statusLabel }))

      if (!pageKey) return
      if (!pageKey.includes('/index.md')) pageKey = pageKey + '/index.md'

      try {
        const [origRes, locaRes] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}history/logs-en-us.txt`),
          fetch(`${import.meta.env.BASE_URL}history/logs-${lang}.txt`),
        ])
        const [origText, locaText] = await Promise.all([origRes.text(), locaRes.text()])
        const filterValid = (arr) => arr.filter((e) => !/\/conflicting\//.test(e) && !/\/orphaned\//.test(e))
        const origEntries = filterValid(origText.match(/^(.*\.md)$/gm) || [])
        const locaEntries = filterValid(locaText.match(/^(.*\.md)$/gm) || [])
        const findPageEntry = (entries, key) =>
          entries.find((e) => {
            const match = e.match(/(files\/.*)/)
            if (!match) return false
            return match[1].toLowerCase().includes(key.toLowerCase())
          })
        const origEntry = findPageEntry(origEntries, pageKey)
        const locaEntry = findPageEntry(locaEntries, pageKey)
        const parseLogDate = (entry) => {
          if (!entry) return null
          const match = entry.match(/^(.*) files\//)
          if (!match) return null
          const raw = match[1].trim()
          const parts = raw.split(' ')
          if (parts.length < 6) return null
          const dateStr = parts.slice(1, 5).join(' ')
          return new Date(dateStr)
        }
        const cleanPageName = (path) => {
          if (!path) return pageKey || 'No page'
          return path.replace(/^files\/fr\//, '').replace(/\/index\.md$/, '').replace(/^files\/en-us\//, '')
        }
        const extractRawDate = (entry) => {
          if (!entry) return ''
          const match = entry.match(/^(.*) files\//)
          return match ? match[1].trim() : ''
        }
        const formatDateString = (raw) => {
          if (!raw) return ''
          const parts = raw.split(' ')
          if (parts.length < 6) return raw
          const monthMap = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' }
          const day = parts[2]
          const month = monthMap[parts[1]] || parts[1]
          const year = parts[4]
          const time = parts[3].slice(0, 5)
          return `${month} ${day}, ${year} at ${time}`
        }

        color = 'unknown'
        statusLabel = 'Unknown'
        pageName = cleanPageName(
          (origEntry && origEntry.match(/(files\/.*)/) && origEntry.match(/(files\/.*)/)[1]) ||
            (locaEntry && locaEntry.match(/(files\/.*)/) && locaEntry.match(/(files\/.*)/)[1]) ||
            pageKey
        )
        dateOrigStr = formatDateString(extractRawDate(origEntry))
        dateLocaStr = formatDateString(extractRawDate(locaEntry))
        if (!origEntry) {
          color = 'gray'
          statusLabel = 'Removed'
        } else if (!locaEntry) {
          color = 'red'
          statusLabel = 'Missing'
        } else {
          const d1 = parseLogDate(origEntry)
          const d2 = parseLogDate(locaEntry)
          if (d1 && d2 && d2 > d1) {
            color = 'green'
            statusLabel = 'Up-to-date'
          } else {
            color = 'yellow'
            statusLabel = 'Outdated'
          }
        }
        setSvg(statusToSVG({ color, pageName, dateOrigStr, dateLocaStr, statusLabel }))
      } catch (e) {
        // fallback keeps Unknown rendered
        console.error(e)
      }
    }
    run()
  }, [params])

  return (
    <div dangerouslySetInnerHTML={{ __html: svg }} />
  )
}
