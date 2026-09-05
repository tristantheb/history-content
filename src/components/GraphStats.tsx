import { type JSX } from 'react'
import { useEffect, useMemo, useState } from 'react'
// @ts-ignore
import { type Highcharts } from '@highcharts/react'
import { type PageData } from '@/types/HistoryDataType'
import { StockChart, StockSeries } from '@highcharts/react/Stock'
import { useComputedRows } from '@/hooks/useComputedRows'

type ChartPoint = [number, number]

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

const DAY_IN_MS = 24 * 60 * 60 * 1000

const baseUrl = import.meta.env.BASE_URL
const options: Highcharts.Options = {
  title: { text: 'Translation status over time' },
  xAxis: { type: 'datetime' },
  yAxis: { title: { text: 'Number of lines' }, crosshair: true },
  legend: { enabled: true },
  tooltip: { shared: true },
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
    outdated: ChartPoint[]
    upToDate: ChartPoint[]
    untranslated: ChartPoint[]
  }
  dataTotal: number[][]
}

type GraphStatsProps = {
  pages: PageData[]
  lang?: string
}

/**
 * Build a two-point forecast series from the last historical point and the
 * next count value supplied by the hook.
 *
 * @param {ChartPoint[]} sourcePoints The current historical series points.
 * @param {number} nextValue The next-day count to display.
 *
 * @returns {ChartPoint[]} The two points used to render the forecast line.
 */
const buildForecastSeries = (
  sourcePoints: ChartPoint[],
  nextValue: number
): ChartPoint[] => {
  if (sourcePoints.length === 0)
    return []

  const lastPoint = sourcePoints[sourcePoints.length - 1]!

  return [lastPoint, [lastPoint[0] + DAY_IN_MS, nextValue]]
}

/**
 * Format the tooltip for the forecast points and hide the first point so the
 * forecast line stays readable when it starts on the last historical point.
 *
 * @this Highcharts.Point
 *
 * @returns {string} The formatted tooltip HTML or an empty string.
 */
const forecastPointFormatter = function (this: Highcharts.Point): string {
  const firstPoint = this.series.points[0]
  if (firstPoint && this.x === firstPoint.x)
    return ''

  return `<span style="color:${String(this.color)}">●</span> ${this.series.name}: <b>${this.y ?? 0}</b><br/>`
}

/**
 * Load the historical statistics CSV for the selected language and transform
 * it into chart points.
 *
 * @param {string} lang The locale code used to select the CSV file.
 *
 * @returns {Promise<StatsData>} The parsed chart data.
 */
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

/**
 * The GraphStats component renders a Highcharts stock chart showing the
 * translation status over time.
 *
 * @param {GraphStatsProps} props The component props.
 *
 * @returns {JSX.Element} The chart element.
 */
export const GraphStats = (
  {lang = 'fr', pages}: GraphStatsProps
): JSX.Element => {
  const { counts } = useComputedRows(pages)
  const [data, setData] = useState<StatsData>({
    lines: { outdated: [], upToDate: [], untranslated: [] },
    dataTotal: []
  })
  const rawData = loadedData(lang)
  const hookForecast = useMemo(() => ({
    outdated: buildForecastSeries(data.lines.outdated, counts.outDated + counts.missing),
    upToDate: buildForecastSeries(data.lines.upToDate, counts.upToDate),
    untranslated: buildForecastSeries(data.lines.untranslated, counts.untranslated)
  }), [
    counts.outDated,
    counts.upToDate,
    counts.untranslated,
    data.lines.outdated,
    data.lines.upToDate,
    data.lines.untranslated
  ])

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
          id: 'up-to-date',
          name: 'Up To Date',
          color: '#59ffbd'
        }}
      />
      <StockSeries
        type={'line'}
        data={hookForecast.upToDate}
        options={{
          name: 'Up To Date forecast',
          linkedTo: 'up-to-date',
          color: '#59ffbd',
          dashStyle: 'Dash',
          enableMouseTracking: true,
          marker: { enabled: false },
          showInLegend: false,
          tooltip: {
            pointFormatter: forecastPointFormatter
          }
        }}
      />
      <StockSeries
        type={'line'}
        data={data.lines.outdated}
        options={{
          id: 'outdated',
          name: 'Outdated',
          color: '#fff44f'
        }}
      />
      <StockSeries
        type={'line'}
        data={hookForecast.outdated}
        options={{
          name: 'Outdated forecast',
          linkedTo: 'outdated',
          color: '#fff44f',
          dashStyle: 'Dash',
          enableMouseTracking: true,
          marker: { enabled: false },
          showInLegend: false,
          tooltip: {
            pointFormatter: forecastPointFormatter
          }
        }}
      />
      <StockSeries
        type={'line'}
        data={data.lines.untranslated}
        options={{
          id: 'untranslated',
          name: 'Untranslated',
          color: '#ff4f5e'
        }}
      />
      <StockSeries
        type={'line'}
        data={hookForecast.untranslated}
        options={{
          name: 'Untranslated forecast',
          linkedTo: 'untranslated',
          color: '#ff4f5e',
          dashStyle: 'Dash',
          enableMouseTracking: true,
          marker: { enabled: false },
          showInLegend: false,
          tooltip: {
            pointFormatter: forecastPointFormatter
          }
        }}
      />
    </StockChart>
  )
}
