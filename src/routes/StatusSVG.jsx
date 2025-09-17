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
            <rect x="0" y="0" width="480" height="180" rx="24" fill="#64748b" stroke="#334155" stroke-width="2"/>
            <text x="32" y="48" font-size="32" font-family="sans-serif" font-weight="bold" fill="#f1f5f9">MDN Page Status</text>
            <text x="32" y="85" font-size="20" font-family="sans-serif" font-weight="bold" fill="#e0e7ef">${pageName}</text>
            <text x="32" y="115" font-size="16" font-family="sans-serif" fill="#94a3b8">Last translation date</text>
            <text x="32" y="140" font-size="18" font-family="sans-serif" font-weight="bold" fill="#f1f5f9">Unknown</text>
            <g>
              <rect x="340" y="60" width="110" height="60" rx="18" fill="#64748b" stroke="#334155" stroke-width="2"/>
              <text x="395" y="95" font-size="18" font-family="sans-serif" font-weight="bold" fill="#fff" text-anchor="middle">Unknown</text>
              <circle cx="375" cy="90" r="18" fill="#334155"/>
              <text x="375" y="97" font-size="18" font-family="sans-serif" font-weight="bold" fill="#fff" text-anchor="middle">?</text>
            </g>
          </svg>`
        }
        const statusColor = (color === 'green' ? '#059669' : color === 'yellow' ? '#eab308' : '#dc2626')
        return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="180" viewBox="0 0 480 180">
          <rect x="0" y="0" width="480" height="180" rx="24" fill="#1e293b" stroke="#334155" stroke-width="2"/>
          <text x="32" y="48" font-size="32" font-family="sans-serif" font-weight="bold" fill="#f1f5f9">MDN Page Status</text>
          <text x="32" y="85" font-size="20" font-family="sans-serif" font-weight="bold" fill="#e0e7ef">${pageName}</text>
          <text x="32" y="115" font-size="16" font-family="sans-serif" fill="#94a3b8">Last translation date</text>
          <text x="32" y="140" font-size="18" font-family="sans-serif" font-weight="bold" fill="#f1f5f9">${dateLocaStr || (dateOrigStr ? 'Never translated' : 'Page removed')}</text>
          <g>
            <rect x="370" y="60" width="80" height="80" rx="18" fill="${statusColor}" stroke="${statusColor}"/>
            ${color === 'green'
              ? '<path d="M380 100 l20 20 l40 -40" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>'
              : color === 'yellow'
              ? '<path d="M410 80 v25" fill="none" stroke="#fff" stroke-width="6"/><circle cx="410" cy="115" r="5" fill="#fff" stroke-linecap="round"/>'
              : '<path d="M385 75 l50 50 m-50 0 l50 -50" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>'}
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
