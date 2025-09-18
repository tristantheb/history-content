// generate-badges.cjs
const fs = require('fs')
const path = require('path')

const LOGS_DIR = path.resolve(__dirname, '../history')

const lang = process.argv[2] || 'fr'
const logFile = path.join(LOGS_DIR, `logs-${lang}.txt`)
if (!fs.existsSync(logFile)) {
  console.error(`Log file not found: ${logFile}`)
  process.exit(1)
}
const log = fs.readFileSync(logFile, 'utf8')
const enLogFile = path.join(LOGS_DIR, 'logs-en-us.txt')
const enLog = fs.existsSync(enLogFile) ? fs.readFileSync(enLogFile, 'utf8') : ''

const OUT_DIR = path.resolve(__dirname, `../site/public/badges/${lang}`)

function getEntry(log, pageKey) {
  const entries = (log.match(/^(.*\.md)$/gm) || []).filter(e => !/\/conflicting\//.test(e) && !/\/orphaned\//.test(e))
  return entries.find(e => {
    const match = e.match(/(files\/.*)/)
    if (!match) return false
    return match[1].toLowerCase().includes(pageKey.toLowerCase())
  })
}

function parseLogDate(entry) {
  if (!entry) return null
  const match = entry.match(/^(.*) files\//)
  if (!match) return null
  const raw = match[1].trim()
  const parts = raw.split(' ')
  if (parts.length < 6) return null
  const dateStr = parts.slice(1, 5).join(' ')
  return new Date(dateStr)
}

function cleanPageName(path) {
  if (!path) return 'No page'
  return path.replace(/^files\/fr\//, '').replace(/\/index\.md$/, '').replace(/^files\/en-us\//, '')
}

function extractRawDate(entry) {
  if (!entry) return ''
  const match = entry.match(/^(.*) files\//)
  return match ? match[1].trim() : ''
}

function formatDateString(raw) {
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

function statusToSVG({ color, pageName, dateOrigStr, dateLocaStr, statusLabel }) {
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
  const statusColor = (color === 'green' ? 'oklch(87.1% .15 154.449)' : color === 'yellow' ? 'oklch(90.5% .182 98.111)' : 'oklch(70.4% .191 22.216)')
  const statusBgColor = (color === 'green' ? 'oklch(39.3% .095 152.535)' : color === 'yellow' ? 'oklch(42.1% .095 57.708)' : 'oklch(39.6% .141 25.723)')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="180" viewBox="0 0 480 180">
    <rect x="0" y="0" width="480" height="180" rx="24" fill="#1e293b" stroke="#334155" stroke-width="2"/>
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

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

function getEntries(log) {
  return (log.match(/^(.*\.md)$/gm) || []).filter(e => !/\/conflicting\//.test(e) && !/\/orphaned\//.test(e))
}
const entries = getEntries(log)
const enEntries = getEntries(enLog)

for (const entry of entries) {
  // Get pageKey from entry
  const match = entry.match(/(files\/.*)/)
  if (!match) continue
  const pageKey = match[1]
  let color = 'unknown', statusLabel = 'Unknown', pageName = pageKey, dateOrigStr = '', dateLocaStr = ''
  // Find original entry in enLog
  const origEntry = enEntries.find(e => {
    const m = e.match(/(files\/.*)/)
    return m && m[1].toLowerCase() === pageKey.toLowerCase().replace(/^files\/fr\//, 'files/en-us/')
  })
  const locaEntry = entry
  pageName = cleanPageName(pageKey)
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
  // Slugify page for filename
  const slug = pageKey.replace(/^files\//, '').replace(/\//g, '_').replace(/\.md$/, '')
  const svg = statusToSVG({ color, pageName, dateOrigStr, dateLocaStr, statusLabel })
  fs.writeFileSync(path.join(OUT_DIR, slug + '.svg'), svg, 'utf8')
  console.log('Generated badge:', path.join(lang, slug + '.svg'))
}
