import { useState, useEffect, useMemo } from 'react'
import {
  Text,
  Button,
  Tabs,
  Table,
  DropdownMenu,
  IconV2,
  Pagination,
} from '@harnessio/ui/components'
import {
  ResponsiveContainer,
  ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { Nav2 } from '../components/Nav2'
import { Breadcrumb2 } from '../components/Breadcrumb2'
import { InsightMetricCard } from '../components/InsightMetricCard'

// ── Deterministic jitter ──

function jitter(seed: string, base: number, variance: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  const t = (Math.abs(h) % 1000) / 1000
  return Math.round(base + (t - 0.5) * 2 * variance)
}

function linearRegression(values: number[]): number[] {
  const n = values.length
  if (n === 0) return []
  const xMean = (n - 1) / 2
  const yMean = values.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean)
    den += (i - xMean) * (i - xMean)
  }
  const slope = den !== 0 ? num / den : 0
  const intercept = yMean - slope * xMean
  return values.map((_, i) => Math.round((slope * i + intercept) * 100) / 100)
}

// ── Chart constants ──

const TICK_STYLE = { fontSize: 12, fill: '#6B7280' }
const AXIS_LINE = { stroke: '#E5E7EB' }
const GRID_STROKE = 'var(--cn-border-2, #E5E7EB)'
const LEGEND_STYLE = { fontSize: 13, paddingTop: 12, fontFamily: "'JetBrains Mono', monospace" }
const CHART_MARGIN = { top: 8, right: 16, left: 0, bottom: 0 }
const legendFormatter = (value: string) => <span style={{ color: '#4B5563' }}>{value}</span>
const formatYAxis = (value: number) => {
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return String(value)
}

const SMALL_PR_COLOR = 'var(--cn-comp-data-viz-01-blue, lch(65% 56 255))'
const MEDIUM_PR_COLOR = 'var(--cn-comp-data-viz-02-purple, lch(58% 95 320))'
const LARGE_PR_COLOR = 'var(--cn-comp-data-viz-03-pink, lch(58% 70 350))'

const TIME_RANGE_PROFILES: Record<string, { scale: number; labels: string[] }> = {
  '7D': { scale: 0.12, labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  '1M': { scale: 0.35, labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'] },
  '3M': { scale: 0.55, labels: ['Jan', 'Feb', 'Mar'] },
  '6M': { scale: 0.78, labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
  '12M': { scale: 1, labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
  custom: { scale: 1, labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
}

// ── Export menu ──

function ExportMenu({ variant = 'ghost' }: { variant?: 'ghost' | 'outline' }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant={variant} size="sm" iconOnly ignoreIconOnlyTooltip>
          <IconV2 name="more-horizontal" size="sm" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item>Export PDF</DropdownMenu.Item>
        <DropdownMenu.Item>Export CSV</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

// ── Main page ──

export function ProductivityPage() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )
  const [timeRange, setTimeRange] = useState('6M')
  const [showTrendline, setShowTrendline] = useState(false)
  const [prDrillPage, setPrDrillPage] = useState(1)
  const [prDrillPageSize, setPrDrillPageSize] = useState(10)

  const profile = TIME_RANGE_PROFILES[timeRange] ?? TIME_RANGE_PROFILES['6M']

  const PR_DRILL_POOL = useMemo(() => [
    { developer: 'Sahildeep Singh', smallPRs: 12, mediumPRs: 5, largePRs: 2, totalPRs: 19, avgPRSize: '142 lines', reviewTime: '4h 12m' },
    { developer: 'Rajarshee Chatterjee', smallPRs: 18, mediumPRs: 8, largePRs: 1, totalPRs: 27, avgPRSize: '98 lines', reviewTime: '2h 45m' },
    { developer: 'Sumit Kumar', smallPRs: 8, mediumPRs: 6, largePRs: 4, totalPRs: 18, avgPRSize: '215 lines', reviewTime: '6h 30m' },
    { developer: 'Mauro Javier Giambianchi', smallPRs: 15, mediumPRs: 3, largePRs: 1, totalPRs: 19, avgPRSize: '87 lines', reviewTime: '3h 15m' },
    { developer: 'Sujeesh Madathil', smallPRs: 10, mediumPRs: 7, largePRs: 3, totalPRs: 20, avgPRSize: '178 lines', reviewTime: '5h 20m' },
    { developer: 'Arvind Srinivaaolu', smallPRs: 22, mediumPRs: 4, largePRs: 0, totalPRs: 26, avgPRSize: '65 lines', reviewTime: '1h 50m' },
    { developer: 'Abdul Asheem', smallPRs: 9, mediumPRs: 9, largePRs: 5, totalPRs: 23, avgPRSize: '245 lines', reviewTime: '7h 10m' },
    { developer: 'David Warren', smallPRs: 14, mediumPRs: 6, largePRs: 2, totalPRs: 22, avgPRSize: '132 lines', reviewTime: '3h 55m' },
    { developer: 'Conor Murray', smallPRs: 7, mediumPRs: 4, largePRs: 6, totalPRs: 17, avgPRSize: '310 lines', reviewTime: '8h 25m' },
    { developer: 'Matthew Sullivan', smallPRs: 16, mediumPRs: 5, largePRs: 1, totalPRs: 22, avgPRSize: '105 lines', reviewTime: '2h 30m' },
    { developer: 'Harsh Sha', smallPRs: 11, mediumPRs: 8, largePRs: 3, totalPRs: 22, avgPRSize: '188 lines', reviewTime: '5h 45m' },
    { developer: 'Alex Chen', smallPRs: 20, mediumPRs: 2, largePRs: 0, totalPRs: 22, avgPRSize: '52 lines', reviewTime: '1h 20m' },
    { developer: 'Sarah Kim', smallPRs: 13, mediumPRs: 7, largePRs: 2, totalPRs: 22, avgPRSize: '155 lines', reviewTime: '4h 40m' },
    { developer: 'Karthik Nayak', smallPRs: 6, mediumPRs: 5, largePRs: 4, totalPRs: 15, avgPRSize: '268 lines', reviewTime: '6h 55m' },
    { developer: 'Priya Nair', smallPRs: 17, mediumPRs: 6, largePRs: 1, totalPRs: 24, avgPRSize: '92 lines', reviewTime: '2h 15m' },
  ], [])

  const paginatedPrDrill = useMemo(() => {
    const start = (prDrillPage - 1) * prDrillPageSize
    return PR_DRILL_POOL.slice(start, start + prDrillPageSize)
  }, [PR_DRILL_POOL, prDrillPage, prDrillPageSize])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light-std-low', 'dark-std-low')
    root.classList.add(dark ? 'dark-std-low' : 'light-std-low')
  }, [dark])

  // ── PR Velocity chart data ──
  const prVelocityData = useMemo(() => {
    const raw = profile.labels.map((name, i) => ({
      name,
      smallPRs: jitter(`small-${name}${i}`, Math.round(12 * profile.scale), 5),
      mediumPRs: jitter(`med-${name}${i}`, Math.round(8 * profile.scale), 4),
      largePRs: jitter(`large-${name}${i}`, Math.round(4 * profile.scale), 3),
    }))
    const maxTotal = Math.max(...raw.map(d => d.smallPRs + d.mediumPRs + d.largePRs))
    const gap = Math.max(1, Math.round(maxTotal * 0.015))
    const totals = raw.map(d => d.smallPRs + d.mediumPRs + d.largePRs)
    const regression = linearRegression(totals)
    return raw.map((d, i) => ({ ...d, _gap: gap, _trend: regression[i] }))
  }, [profile])

  const PR_SERIES = [
    { dataKey: 'smallPRs', name: 'Small PRs', color: SMALL_PR_COLOR },
    { dataKey: 'mediumPRs', name: 'Medium PRs', color: MEDIUM_PR_COLOR },
    { dataKey: 'largePRs', name: 'Large PRs', color: LARGE_PR_COLOR },
  ]

  return (
    <div className="flex min-h-screen bg-cn-3">
      <Nav2 activeSection="insights" dark={dark} onThemeToggle={() => setDark(!dark)} />

      <div className="flex flex-1 flex-col gap-5 px-5 pb-5 pt-3">
        <Breadcrumb2 />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <Text as="h1" variant="heading-hero" color="foreground-1">Productivity</Text>
            <Text variant="body-normal" color="foreground-3">
              Measure and supercharge dev productivity.
            </Text>
          </div>
          <div className="flex items-center gap-3">
            <ExportMenu variant="outline" />
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-10">
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Created:</Text>
            <Text variant="body-normal" color="foreground-1">05 Jan 2026, 11:00am</Text>
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Updated:</Text>
            <Text variant="body-normal" color="foreground-1">19 Feb 2026, 03:45pm</Text>
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Team:</Text>
            <Text variant="body-normal" color="foreground-1">Harness SEI / Arvind Srinivaaolu / Abdul Asheem</Text>
          </div>
        </div>

        {/* Time range tabs + trendline */}
        <div className="flex items-center gap-3">
          <Tabs.Root value={timeRange} onValueChange={setTimeRange}>
            <Tabs.List variant="outlined">
              <Tabs.Trigger value="7D">7D</Tabs.Trigger>
              <Tabs.Trigger value="1M">1M</Tabs.Trigger>
              <Tabs.Trigger value="3M">3M</Tabs.Trigger>
              <Tabs.Trigger value="6M">6M</Tabs.Trigger>
              <Tabs.Trigger value="12M">12M</Tabs.Trigger>
              <Tabs.Trigger value="custom" icon="calendar">Custom</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTrendline(!showTrendline)}
            >
              {showTrendline ? 'Hide Trendline' : 'Show Trendline'}
            </Button>
          </div>
        </div>

        {/* PR Velocity Per Dev */}
        <div className="group/card flex flex-col rounded-cn-2 border border-borders-2 bg-white dark:bg-cn-1">
          <div className="flex items-start justify-between p-5 pb-0">
            <Text variant="body-strong" color="foreground-1">PR Velocity Per Dev</Text>
            <ExportMenu />
          </div>

          {/* Metric card */}
          <div className="mx-5 mt-3 w-1/5">
            <InsightMetricCard
              label="PRs"
              value="3.98"
              subtitle="per week"
              trend="↓ 11.67%"
            />
          </div>

          {/* Segmented bar chart */}
          <div className="p-5 pt-3">
            <svg width="0" height="0">
              <defs>
                {PR_SERIES.map((s) => (
                  <filter key={s.dataKey} id={`pr-shadow-${s.dataKey}`}>
                    <feDropShadow dx="0" dy="5" stdDeviation="6.5" floodColor={s.color} floodOpacity="0.25" />
                  </filter>
                ))}
              </defs>
            </svg>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={prVelocityData} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="8 6" vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="name" tick={TICK_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                <YAxis tickFormatter={formatYAxis} tick={TICK_STYLE} axisLine={false} tickLine={false} width={48} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                <Legend iconType="square" iconSize={10} wrapperStyle={LEGEND_STYLE} formatter={legendFormatter} />
                {PR_SERIES.map((s) => (
                  <Bar
                    key={s.dataKey}
                    dataKey={s.dataKey}
                    name={s.name}
                    fill={s.color}
                    stackId="pr"
                    radius={[4, 4, 4, 4]}
                    style={{ filter: `url(#pr-shadow-${s.dataKey})` }}
                    animationDuration={150}
                  />
                )).flatMap((bar, i) =>
                  i < PR_SERIES.length - 1
                    ? [bar, <Bar key={`_gap_${i}`} dataKey="_gap" stackId="pr" fill="transparent" legendType="none" tooltipType="none" animationDuration={0} />]
                    : [bar]
                )}
                {showTrendline && (
                  <Line
                    type="linear"
                    dataKey="_trend"
                    name="Trend"
                    stroke="#0E1218"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    dot={false}
                    activeDot={false}
                    animationDuration={300}
                    legendType="line"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Drilldown table */}
          <div className="px-5 pb-5 pt-2">
            <div className="flex items-center pb-2">
              <Text variant="body-strong" color="foreground-1">Drill-down</Text>
            </div>
            <div className="overflow-x-auto">
              <Table.Root variant="default" size="normal">
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Developer</Table.Head>
                    <Table.Head className="text-right">Small PRs</Table.Head>
                    <Table.Head className="text-right">Medium PRs</Table.Head>
                    <Table.Head className="text-right">Large PRs</Table.Head>
                    <Table.Head className="text-right">Total PRs</Table.Head>
                    <Table.Head className="text-right">Avg PR Size</Table.Head>
                    <Table.Head className="text-right">Review Time</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedPrDrill.map((row) => (
                    <Table.Row key={row.developer}>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <div className="flex shrink-0 items-center justify-center bg-[rgba(0,109,234,0.15)] text-sm font-medium text-[#006DEA]" style={{ width: 32, height: 32, borderRadius: '50%' }}>
                            {row.developer.split(' ').map(n => n[0]).join('')}
                          </div>
                          <Text variant="body-normal" color="foreground-1" className="whitespace-nowrap">{row.developer}</Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-right">{row.smallPRs}</Table.Cell>
                      <Table.Cell className="text-right">{row.mediumPRs}</Table.Cell>
                      <Table.Cell className="text-right">{row.largePRs}</Table.Cell>
                      <Table.Cell className="text-right font-medium">{row.totalPRs}</Table.Cell>
                      <Table.Cell className="text-right">{row.avgPRSize}</Table.Cell>
                      <Table.Cell className="text-right whitespace-nowrap">{row.reviewTime}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </div>
            <div className="rounded-b-cn-2 border border-t-0 border-borders-2 px-4 pb-3 pt-0.5">
              <Pagination
                totalItems={PR_DRILL_POOL.length}
                pageSize={prDrillPageSize}
                currentPage={prDrillPage}
                goToPage={setPrDrillPage}
                onPageSizeChange={(size) => { setPrDrillPageSize(size); setPrDrillPage(1) }}
                pageSizeOptions={[10, 20, 50]}
                className="!mt-cn-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
