import { JSX, useEffect, useState } from 'react'
import { StockChart, StockSeries } from '@highcharts/react/Stock'

const baseUrl = import.meta.env.BASE_URL

type StatsData = {
  lines: {
    outdated: number[][]
    upToDate: number[][]
    untranslated: number[][]
  }
  dataTotal: number[][]
}

const loadedData = async (lang: string = 'fr'): Promise<StatsData> => {
  const rawData: StatsData = {
    lines: {
      outdated: [],
      upToDate: [],
      untranslated: []
    },
    dataTotal: []
  }

  await fetch(`${baseUrl}statistics/stats-${lang.toString()}.csv`)
    .then(response => response.text())
    .then(csvText => {
      const lines = csvText.trim().split('\n')
      // Remove header
      lines.shift()

      lines.forEach(line => {
        const [dateStr, outdatedStr, upToDateStr, untranslatedStr] = line.split(',')

        rawData.lines.outdated.push([new Date(dateStr).getTime(), parseInt(outdatedStr)])
        rawData.lines.upToDate.push([new Date(dateStr).getTime(), parseInt(upToDateStr)])
        rawData.lines.untranslated.push([new Date(dateStr).getTime(), parseInt(untranslatedStr)])

        rawData.dataTotal.push(
          [
            new Date(dateStr).getTime(),
            parseInt(outdatedStr),
            parseInt(upToDateStr)
          ]
        )
      })
    })

  return rawData
}

export const GraphStats = (
  {lang = 'fr'}: {lang?: string}
): JSX.Element => {
  const [data, setData] = useState<StatsData>({
    lines: { outdated: [], upToDate: [], untranslated: [] }, dataTotal: []
  })
  const rawData = loadedData(lang)

  useEffect(() => {
    rawData.then(setData)
  }, [lang])

  return (
    <StockChart
      options={{
        title: { text: 'Translation status over time' },
        xAxis: { type: 'datetime' },
        yAxis: { title: { text: 'Number of lines' }, crosshair: true },
        legend: { enabled: true },
        tooltip: {
          shared: true
        },
        plotOptions: {
          area: {
            marker: { enabled: true },
            stacking: 'normal'
          }
        },
        credits: { enabled: false }
      }}
    >
      <StockSeries
        type={'area'}
        data={data.lines.upToDate}
        options={{
          name: 'Up To Date',
          color: 'green',
          opacity: 0.3,
          showInNavigator: true
        }}
      />
      <StockSeries
        type={'area'}
        data={data.lines.outdated}
        options={{
          name: 'Outdated',
          color: 'orange',
          opacity: 0.3,
          showInNavigator: true
        }}
      />
      <StockSeries
        type={'area'}
        data={data.lines.untranslated}
        options={{
          name: 'Untranslated',
          color: 'red',
          opacity: 0.3,
          showInNavigator: true
        }}
      />
    </StockChart>
  )
}
