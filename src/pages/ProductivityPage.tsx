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

  const [expandedDevRows, setExpandedDevRows] = useState<Set<string>>(new Set())
  const toggleDevRow = (name: string) => {
    setExpandedDevRows(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const PR_DRILL_POOL = useMemo(() => [
    { name: 'c_jyoti patel', prs: 7, workTypes: { bug: 0, story: 7, task: 0, other: 0 }, prSizes: { small: 0, medium: 4, large: 3 }, avgTimeToMerge: '6d 18h', totalLines: 14191, additions: 12892, deletions: 1299 },
    { name: 'c_rahul sharma', prs: 12, workTypes: { bug: 2, story: 8, task: 1, other: 1 }, prSizes: { small: 3, medium: 6, large: 3 }, avgTimeToMerge: '4d 6h', totalLines: 8450, additions: 7200, deletions: 1250 },
    { name: 'c_anita desai', prs: 5, workTypes: { bug: 1, story: 3, task: 1, other: 0 }, prSizes: { small: 2, medium: 2, large: 1 }, avgTimeToMerge: '3d 12h', totalLines: 5320, additions: 4800, deletions: 520 },
    { name: 'c_vikram singh', prs: 15, workTypes: { bug: 3, story: 9, task: 2, other: 1 }, prSizes: { small: 5, medium: 7, large: 3 }, avgTimeToMerge: '5d 4h', totalLines: 18900, additions: 16500, deletions: 2400 },
    { name: 'c_priya menon', prs: 9, workTypes: { bug: 0, story: 6, task: 3, other: 0 }, prSizes: { small: 4, medium: 3, large: 2 }, avgTimeToMerge: '2d 22h', totalLines: 6780, additions: 5900, deletions: 880 },
    { name: 'c_amit kumar', prs: 3, workTypes: { bug: 1, story: 1, task: 0, other: 1 }, prSizes: { small: 1, medium: 1, large: 1 }, avgTimeToMerge: '8d 2h', totalLines: 22400, additions: 19800, deletions: 2600 },
    { name: 'c_sneha reddy', prs: 11, workTypes: { bug: 2, story: 7, task: 2, other: 0 }, prSizes: { small: 6, medium: 3, large: 2 }, avgTimeToMerge: '3d 8h', totalLines: 7100, additions: 6300, deletions: 800 },
    { name: 'c_deepak joshi', prs: 8, workTypes: { bug: 1, story: 5, task: 1, other: 1 }, prSizes: { small: 2, medium: 4, large: 2 }, avgTimeToMerge: '5d 14h', totalLines: 11200, additions: 9800, deletions: 1400 },
    { name: 'c_kavita nair', prs: 6, workTypes: { bug: 0, story: 4, task: 2, other: 0 }, prSizes: { small: 3, medium: 2, large: 1 }, avgTimeToMerge: '4d 1h', totalLines: 4500, additions: 3900, deletions: 600 },
    { name: 'c_ravi patel', prs: 14, workTypes: { bug: 4, story: 8, task: 1, other: 1 }, prSizes: { small: 4, medium: 6, large: 4 }, avgTimeToMerge: '7d 5h', totalLines: 25600, additions: 22100, deletions: 3500 },
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
                    <Table.Head>PR ID</Table.Head>
                    <Table.Head className="text-right">PRs</Table.Head>
                    <Table.Head>Work Types</Table.Head>
                    <Table.Head>PR Sizes</Table.Head>
                    <Table.Head>Average Time to Merge</Table.Head>
                    <Table.Head>Code Changes</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedPrDrill.map((row) => {
                    const addPct = row.totalLines > 0 ? (row.additions / row.totalLines) * 100 : 50
                    const delPct = 100 - addPct
                    return (<>
                    <Table.Row key={row.name} className="cursor-pointer" onClick={() => toggleDevRow(row.name)}>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <IconV2 name={expandedDevRows.has(row.name) ? 'nav-arrow-down' : 'nav-arrow-right'} size="xs" className="text-foreground-4" />
                          <div className="flex shrink-0 items-center justify-center bg-[rgba(0,109,234,0.15)] text-sm font-medium text-[#006DEA]" style={{ width: 28, height: 28, borderRadius: '50%' }}>
                            {row.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <Text variant="body-normal" color="foreground-1" className="whitespace-nowrap">{row.name}</Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-right">{row.prs}</Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          {row.workTypes.bug > 0 && <span className="rounded bg-[#FEF3F2] px-1.5 py-0.5 text-xs text-[#B42318]">Bug {row.workTypes.bug}</span>}
                          {row.workTypes.story > 0 && <span className="rounded bg-[#EFF8FF] px-1.5 py-0.5 text-xs text-[#175CD3]">Story {row.workTypes.story}</span>}
                          {row.workTypes.task > 0 && <span className="rounded bg-[#F9F5FF] px-1.5 py-0.5 text-xs text-[#6941C6]">Task {row.workTypes.task}</span>}
                          {row.workTypes.other > 0 && <span className="rounded bg-[#F2F4F7] px-1.5 py-0.5 text-xs text-foreground-3">Other {row.workTypes.other}</span>}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          {row.prSizes.small > 0 && <span className="rounded bg-[#ECFDF3] px-1.5 py-0.5 text-xs text-[#027A48]">S {row.prSizes.small}</span>}
                          {row.prSizes.medium > 0 && <span className="rounded bg-[#FFFAEB] px-1.5 py-0.5 text-xs text-[#B54708]">M {row.prSizes.medium}</span>}
                          {row.prSizes.large > 0 && <span className="rounded bg-[#FEF3F2] px-1.5 py-0.5 text-xs text-[#B42318]">L {row.prSizes.large}</span>}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">{row.avgTimeToMerge}</Table.Cell>
                      <Table.Cell style={{ minWidth: 160 }}>
                        <div className="flex flex-col gap-1">
                          <Text variant="caption-normal" color="foreground-3">{row.totalLines.toLocaleString()} lines</Text>
                          <div className="flex h-2 w-full" style={{ gap: 3 }}>
                            <div style={{ width: `${addPct}%`, backgroundColor: '#10B981', borderRadius: 4 }} />
                            <div style={{ width: `${delPct}%`, backgroundColor: '#EF4444', borderRadius: 4 }} />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: '#10B981' }} />
                              <Text variant="caption-normal" color="foreground-3">+{row.additions.toLocaleString()}</Text>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: '#EF4444' }} />
                              <Text variant="caption-normal" color="foreground-3">-{row.deletions.toLocaleString()}</Text>
                            </div>
                          </div>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                    {expandedDevRows.has(row.name) && (
                      <Table.Row>
                        <Table.Cell colSpan={6} className="!p-0">
                          <div className="bg-cn-2 px-8 py-3">
                            <Text variant="caption-normal" color="foreground-3">PR details for {row.name} — subtable coming soon</Text>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    )}
                    </>)
                  })}
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
