import type { JSX} from 'react'
import { useEffect, useState } from 'react'
// @ts-ignore
import { type Highcharts } from '@highcharts/react'
import { StockChart, StockSeries } from '@highcharts/react/Stock'

const GROUPED_DAILY: Highcharts.DataGroupingOptionsObject = {
  forced: true,
  units: [['day', [1]]]
}

const GROUPED_WEEKLY: Highcharts.DataGroupingOptionsObject = {
  forced: true,
  units: [['week', [1]]]
}

const GROUPED_MONTHLY: Highcharts.DataGroupingOptionsObject = {
  forced: true,
  units: [['month', [1]]]
}

const baseUrl = import.meta.env.BASE_URL
const options: Highcharts.Options = {
  title: { text: 'Translation status over time' },
  xAxis: { type: 'datetime' },
  yAxis: { title: { text: 'Number of lines' }, crosshair: true },
  legend: { enabled: true },
  tooltip: {
    shared: true
  },
  plotOptions: {
    line: {
      marker: { enabled: true },
      showInNavigator: true
    }
  },
  rangeSelector: {
    buttons: [
      { type: 'week', count: 1, text: '1w', title: 'View 1 week', dataGrouping: GROUPED_DAILY },
      { type: 'month', count: 1, text: '1m', title: 'View 1 month', dataGrouping: GROUPED_DAILY },
      { type: 'month', count: 3, text: '3m', title: 'View 3 months', dataGrouping: GROUPED_WEEKLY },
      { type: 'month', count: 6, text: '6m', title: 'View 6 months', dataGrouping: GROUPED_WEEKLY },
      { type: 'ytd', text: 'YTD', title: 'View year to date', dataGrouping: GROUPED_WEEKLY },
      { type: 'year', count: 1, text: '1y', title: 'View 1 year', dataGrouping: GROUPED_WEEKLY },
      { type: 'all', text: 'All', title: 'View all data', dataGrouping: GROUPED_MONTHLY }
    ],
    selected: 4
  },
  credits: { text: 'Powered by Highcharts' }
}

type StatsData = {
  lines: {
    outdated: number[][]
    upToDate: number[][]
    untranslated: number[][]
  }
  dataTotal: number[][]
}

type GraphStatsProps = {
  lang?: string
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

        rawData.lines.outdated.push([new Date(dateStr as string).getTime(), parseInt(outdatedStr as string)])
        rawData.lines.upToDate.push([new Date(dateStr as string).getTime(), parseInt(upToDateStr as string)])
        rawData.lines.untranslated.push([new Date(dateStr as string).getTime(), parseInt(untranslatedStr as string)])

        rawData.dataTotal.push(
          [
            new Date(dateStr as string).getTime(),
            parseInt(outdatedStr as string),
            parseInt(upToDateStr as string)
          ]
        )
      })
    })

  return rawData
}

export const GraphStats = (
  {lang = 'fr'}: GraphStatsProps
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
      options={options}
    >
      <StockSeries
        type={'line'}
        data={data.lines.upToDate}
        options={{
          name: 'Up To Date',
          color: '#59ffbd'
        }}
      />
      <StockSeries
        type={'line'}
        data={data.lines.outdated}
        options={{
          name: 'Outdated',
          color: '#fff44f'
        }}
      />
      <StockSeries
        type={'line'}
        data={data.lines.untranslated}
        options={{
          name: 'Untranslated',
          color: '#ff4f5e'
        }}
      />
    </StockChart>
  )
}
