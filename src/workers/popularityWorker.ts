self.onmessage = (e) => {
  const csv = String(e.data || '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')
  const lines = csv.split('\n')

  let i = 0
  if (lines.length && /^"?Page"?\s*,\s*"?Pageviews"?\s*$/i.test(lines[0].trim())) i = 1

  const map = Object.create(null)

  for (; i < lines.length; i++) {
    const raw = lines[i]
    if (!raw) continue

    const idx = raw.indexOf(',')
    if (idx === -1) continue

    const pageRaw = raw.slice(0, idx).replace(/^"|"$/g, '').trim()
    const viewsRaw = raw.slice(idx + 1).replace(/^"|"$/g, '').trim()

    if (!/^\/en-US\/docs\//.test(pageRaw)) continue

    const key = pageRaw.toLowerCase().replace(/\/index\.md$/i, '').replace(/\/$/, '')
    const views = Number(viewsRaw.replace(/[^\d]/g, ''))
    if (!Number.isFinite(views)) continue

    // keep max in case of duplicates
    map[key] = map[key] ? Math.max(map[key], views) : views
  }

  postMessage(map)
}
