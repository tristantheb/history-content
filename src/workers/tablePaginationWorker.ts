let allRows = []

self.onmessage = function (e) {
  const { type, data } = e.data
  if (type === 'init') {
    allRows = data.rows
    self.postMessage({ type: 'ready', total: allRows.length })
  }

  if (type === 'getPage') {
    const { page, perPage } = data
    const start = (page - 1) * perPage
    const end = start + perPage
    const pageRows = allRows.slice(start, end)
    self.postMessage({ type: 'page', page, perPage, rows: pageRows, total: allRows.length })
  }
}
