import { useState, useEffect, useMemo } from 'react'
import {
  Text,
  Button,
  IconV2,
  Tabs,
  Table,
  Select,
  StatusBadge,
  Tag,
  Pagination,
} from '@harnessio/ui/components'
import { Nav2 } from '../components/Nav2'
import { Breadcrumb2 } from '../components/Breadcrumb2'
import {
  ResponsiveContainer,
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  Line, ComposedChart,
} from 'recharts'

// ── Deterministic jitter ──

function jitter(seed: string, base: number, variance: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  const t = (Math.abs(h) % 1000) / 1000
  return Math.round(base + (t - 0.5) * 2 * variance)
}

// ── Time range profiles ──

const TIME_RANGE_PROFILES: Record<string, { scale: number; labels: string[] }> = {
  '7D': { scale: 0.12, labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  '1M': { scale: 0.35, labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'] },
  '3M': { scale: 0.55, labels: ['Jan', 'Feb', 'Mar'] },
  '6M': { scale: 0.78, labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
  '12M': { scale: 1, labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
  custom: { scale: 1, labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
}

// ── Chart styling constants ──

const TICK_STYLE = { fontSize: 12, fill: '#6B7280' }
const AXIS_LINE = { stroke: '#E5E7EB' }
const GRID_STROKE = 'var(--cn-border-2, #E5E7EB)'
const TOOLTIP_STYLE = { borderRadius: 8, fontSize: 13 }
const LEGEND_STYLE = { fontSize: 13, paddingTop: 12, fontFamily: "'JetBrains Mono', monospace" }
const CHART_MARGIN = { top: 8, right: 16, left: 0, bottom: 0 }

const legendFormatter = (value: string) => <span style={{ color: '#4B5563' }}>{value}</span>
const formatYAxis = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return String(value)
}

// ── Stage / segment colors ──

const STAGE_COLORS = {
  planning: 'var(--cn-comp-data-viz-01-blue, lch(65% 56 255))',
  coding: 'var(--cn-comp-data-viz-02-purple, lch(58% 95 320))',
  review: 'var(--cn-comp-data-viz-03-pink, lch(58% 70 350))',
  build: 'var(--cn-comp-data-viz-04-green, lch(56% 78 125))',
  deploy: 'var(--cn-comp-data-viz-05-indigo, lch(51% 77.5 280))',
}

const STAGE_SERIES = [
  { dataKey: 'planning', name: 'Planning', color: STAGE_COLORS.planning },
  { dataKey: 'coding', name: 'Coding', color: STAGE_COLORS.coding },
  { dataKey: 'review', name: 'Review', color: STAGE_COLORS.review },
  { dataKey: 'build', name: 'Build', color: STAGE_COLORS.build },
  { dataKey: 'deploy', name: 'Deploy', color: STAGE_COLORS.deploy },
]

// ── Deployment data pool ──

interface Deployment {
  deploymentId: string
  owner: string
  pipelineName: string
  status: string
  environment: string
  service: string
}

const DEPLOYMENT_POOL: Deployment[] = [
  { deploymentId: '2836', owner: 'promotabotprod', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'awsprod', service: 'fmBridexp' },
  { deploymentId: '83652', owner: 'David Warren', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'Prod1', service: 'Stage_3' },
  { deploymentId: '83651', owner: 'David Warren', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'Prod1', service: 'Stage_3' },
  { deploymentId: '83650', owner: 'promotabotprod', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'awsprod', service: 'webconsrc' },
  { deploymentId: '2070', owner: 'Conor Murray', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'Prod1', service: 'Stage_3' },
  { deploymentId: '2539', owner: 'Conor Murray', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'Prod1', service: 'Stage_3' },
  { deploymentId: '2055', owner: 'Matthew Sullivan', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'Prod1', service: 'Stage_3' },
  { deploymentId: '2054', owner: 'Matthew Sullivan', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'Prod1', service: 'Stage_3' },
  { deploymentId: '2494', owner: 'Matthew Sullivan', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'Prod1', service: 'Stage_3' },
  { deploymentId: '2038', owner: 'Harsh Sha', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'Prod1', service: 'Stage_3' },
  { deploymentId: '1982', owner: 'Alex Chen', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'awsprod', service: 'fmBridexp' },
  { deploymentId: '1956', owner: 'Sarah Kim', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'Prod1', service: 'Stage_3' },
  { deploymentId: '1901', owner: 'promotabotprod', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'awsprod', service: 'webconsrc' },
  { deploymentId: '1887', owner: 'David Warren', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'Prod1', service: 'Stage_3' },
  { deploymentId: '1845', owner: 'Conor Murray', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'Prod1', service: 'Stage_3' },
  { deploymentId: '1799', owner: 'Matthew Sullivan', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'awsprod', service: 'fmBridexp' },
  { deploymentId: '1753', owner: 'Harsh Sha', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'Prod1', service: 'Stage_3' },
  { deploymentId: '1721', owner: 'Alex Chen', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'awsprod', service: 'webconsrc' },
  { deploymentId: '1698', owner: 'Sarah Kim', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'Prod1', service: 'Stage_3' },
  { deploymentId: '1665', owner: 'promotabotprod', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'Prod1', service: 'Stage_3' },
  { deploymentId: '1632', owner: 'David Warren', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'awsprod', service: 'fmBridexp' },
  { deploymentId: '1598', owner: 'Conor Murray', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'Prod1', service: 'Stage_3' },
  { deploymentId: '1567', owner: 'Matthew Sullivan', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'Prod1', service: 'Stage_3' },
  { deploymentId: '1534', owner: 'Harsh Sha', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'awsprod', service: 'webconsrc' },
  { deploymentId: '1501', owner: 'Alex Chen', pipelineName: 'PROD/Harness_Split...', status: 'Completed', environment: 'Prod1', service: 'Stage_3' },
]

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr]
  let s = Math.abs(seed) || 1
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647
    const j = s % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// ── Metric card ──

const TIER_THEMES: Record<string, { bg: string; text: string }> = {
  Elite: { bg: '#ECFDF3', text: '#027A48' },
  High: { bg: '#EFF8FF', text: '#175CD3' },
  Medium: { bg: '#FFFAEB', text: '#B54708' },
  Low: { bg: '#FEF3F2', text: '#B42318' },
}

function DoraMetricCard({ label, value, trend, trendDirection, tier }: {
  label: string
  value: string
  trend: string
  trendDirection: 'up' | 'down'
  tier: string
}) {
  // For DORA metrics, red = bad regardless of direction
  const isRed = true
  const arrow = trendDirection === 'up' ? '↗' : '↘'
  const tierTheme = TIER_THEMES[tier] ?? TIER_THEMES.Low

  return (
    <div className="flex flex-col gap-2 rounded-cn-2 border border-borders-2 bg-white p-5 dark:bg-cn-1">
      <Text variant="caption-normal" color="foreground-3">{label}</Text>
      <div className="flex items-end gap-2">
        <span className="text-foreground-1 font-semibold" style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, lineHeight: 1 }}>
          {value}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {trend && (
          <span className={`text-xs font-medium ${isRed ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
            {arrow} {trend}
          </span>
        )}
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: tierTheme.bg, color: tierTheme.text }}
        >
          {tier}
        </span>
      </div>
    </div>
  )
}

// ── Development stage card ──

function StageCard({ icon, label, stages }: { icon: string; label: string; stages: { name: string; color: string; time: string }[] }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-3 rounded-cn-2 border border-borders-2 bg-white p-4 dark:bg-cn-1">
      <div className="flex flex-col items-center gap-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cn-3">
          <IconV2 name={icon as never} size="sm" className="text-foreground-3" />
        </div>
        <Text variant="caption-normal" color="foreground-3" className="text-center">{label}</Text>
      </div>
      <div className="flex w-full flex-col gap-2">
        {stages.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <span className="inline-block shrink-0 rounded-sm" style={{ width: 8, height: 8, backgroundColor: s.color }} />
            <Text variant="caption-normal" color="foreground-3" className="flex-1">{s.name}</Text>
            <Text variant="caption-normal" color="foreground-1" className="font-medium">{s.time}</Text>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main page ──

export function EfficiencyDoraPage() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )
  const [timeRange, setTimeRange] = useState('6M')
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null)
  const [drillPage, setDrillPage] = useState(1)
  const [drillPageSize, setDrillPageSize] = useState(10)
  const [showTrendline, setShowTrendline] = useState(false)

  const profile = TIME_RANGE_PROFILES[timeRange] ?? TIME_RANGE_PROFILES['6M']

  // ── Lead time chart data (segmented bar) ──
  const leadTimeRaw = useMemo(() => {
    return profile.labels.map((name, i) => ({
      name,
      planning: jitter(`plan${name}${i}`, Math.round(80 * profile.scale), 30),
      coding: jitter(`code${name}${i}`, Math.round(60 * profile.scale), 25),
      review: jitter(`rev${name}${i}`, Math.round(100 * profile.scale), 40),
      build: jitter(`bld${name}${i}`, Math.round(40 * profile.scale), 15),
      deploy: jitter(`dep${name}${i}`, Math.round(50 * profile.scale), 20),
    }))
  }, [profile])

  // Add gap spacing between segments (same technique as StackedBarChart)
  const leadTimeData = useMemo(() => {
    const maxTotal = Math.max(...leadTimeRaw.map(d => d.planning + d.coding + d.review + d.build + d.deploy))
    const gap = Math.round(maxTotal * 0.012) || 1
    return leadTimeRaw.map(d => ({ ...d, _gap: gap }))
  }, [leadTimeRaw])

  // Trendline: total hours per period
  const trendlineData = useMemo(() => {
    return leadTimeData.map(d => ({
      ...d,
      _trend: d.planning + d.coding + d.review + d.build + d.deploy - d._gap * 4,
    }))
  }, [leadTimeData])

  // ── Top-level DORA metrics (static from design) ──
  const doraMetrics = {
    leadTime: '26d 1h',
    leadTimeTrend: '1.45%',
    leadTimeTrendDir: 'up' as const,
    leadTimeTier: 'Medium',
    totalDeployments: '21',
    deploymentsTrend: '43.24%',
    deploymentsTrendDir: 'down' as const,
    deploymentsTier: 'Elite',
    changeFailureRate: '147.62%',
    changeFailureTrend: '506.88%',
    changeFailureTrendDir: 'up' as const,
    changeFailureTier: 'Low',
    mttr: '44d 16h',
    mttrTrend: '26.63%',
    mttrTrendDir: 'down' as const,
    mttrTier: 'Low',
  }

  // ── Average lead time bar segments ──
  const avgSegments = useMemo(() => {
    const totals = { planning: 0, coding: 0, review: 0, build: 0, deploy: 0 }
    leadTimeData.forEach(d => {
      totals.planning += d.planning
      totals.coding += d.coding
      totals.review += d.review
      totals.build += d.build
      totals.deploy += d.deploy
    })
    const grand = totals.planning + totals.coding + totals.review + totals.build + totals.deploy
    return {
      planning: (totals.planning / grand) * 100,
      coding: (totals.coding / grand) * 100,
      review: (totals.review / grand) * 100,
      build: (totals.build / grand) * 100,
      deploy: (totals.deploy / grand) * 100,
      totalTickets: 196,
    }
  }, [leadTimeData])

  // ── Deployment frequency chart data ──
  const deployFreqData = useMemo(() => {
    return profile.labels.map((name, i) => ({
      name,
      value: jitter(`deploy-freq-${name}${i}`, Math.round(400 * profile.scale), 200),
    }))
  }, [profile])

  // ── Deployment drilldown ──
  const drilldownData = useMemo(
    () => seededShuffle(DEPLOYMENT_POOL, (selectedBarIndex != null ? (selectedBarIndex + 1) * 4327 : 1)),
    [selectedBarIndex]
  )

  const paginatedDrilldown = useMemo(() => {
    const start = (drillPage - 1) * drillPageSize
    return drilldownData.slice(start, start + drillPageSize)
  }, [drilldownData, drillPage, drillPageSize])

  const handleDeployBarClick = (index: number) => {
    setSelectedBarIndex(prev => prev === index ? null : index)
    setDrillPage(1)
  }

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light-std-low', 'dark-std-low')
    root.classList.add(dark ? 'dark-std-low' : 'light-std-low')
  }, [dark])

  useEffect(() => {
    setSelectedBarIndex(null)
  }, [timeRange])

  // ── Development stage data ──
  const stageData = useMemo(() => [
    {
      icon: 'clipboard-list',
      label: 'To Do / Proposed',
      stages: [
        { name: 'Planning', color: STAGE_COLORS.planning, time: '4d days · 23h' },
      ],
    },
    {
      icon: 'clock',
      label: 'In Progress',
      stages: [
        { name: 'Coding', color: STAGE_COLORS.coding, time: '12h 55m' },
      ],
    },
    {
      icon: 'code-branch',
      label: 'First PR Created',
      stages: [
        { name: 'Review', color: STAGE_COLORS.review, time: '7h 21m' },
      ],
    },
    {
      icon: 'merge',
      label: 'Last PR Merged',
      stages: [
        { name: 'Build', color: STAGE_COLORS.build, time: '1d 13h' },
      ],
    },
    {
      icon: 'rocket',
      label: 'Done',
      stages: [
        { name: 'Deploy', color: STAGE_COLORS.deploy, time: '69d 4h' },
      ],
    },
  ], [])

  return (
    <div className="flex min-h-screen bg-cn-3">
      <Nav2 activeSection="insights" dark={dark} onThemeToggle={() => setDark(!dark)} />

      <div className="flex flex-1 flex-col gap-5 px-5 pb-5 pt-3">
        <Breadcrumb2 />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <Text as="h1" variant="heading-hero" color="foreground-1">DORA</Text>
            <Text variant="body-normal" color="foreground-3">
              DORA metrics measure software delivery performance.
            </Text>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
              <IconV2 name="more-horizontal" size="sm" />
            </Button>
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-10">
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Created:</Text>
            <Text variant="body-normal" color="foreground-1">20 Nov 2025, 03:16pm</Text>
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Updated:</Text>
            <Text variant="body-normal" color="foreground-1">16 Jan 2026, 09:38pm</Text>
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Team:</Text>
            <Text variant="body-normal" color="foreground-1">Harness SEI / Arvind Srinivaaolu / Abdul Asheem</Text>
          </div>
        </div>

        {/* Time range tabs */}
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
        </div>

        {/* Row 1: 4 DORA Metric Cards */}
        <div className="grid grid-cols-4 gap-5">
          <DoraMetricCard label="Lead Time for Changes" value={doraMetrics.leadTime} trend={doraMetrics.leadTimeTrend} trendDirection={doraMetrics.leadTimeTrendDir} tier={doraMetrics.leadTimeTier} />
          <DoraMetricCard label="Total Deployments" value={doraMetrics.totalDeployments} trend={doraMetrics.deploymentsTrend} trendDirection={doraMetrics.deploymentsTrendDir} tier={doraMetrics.deploymentsTier} />
          <DoraMetricCard label="Change Failure Rate" value={doraMetrics.changeFailureRate} trend={doraMetrics.changeFailureTrend} trendDirection={doraMetrics.changeFailureTrendDir} tier={doraMetrics.changeFailureTier} />
          <DoraMetricCard label="Mean Time to Restore" value={doraMetrics.mttr} trend={doraMetrics.mttrTrend} trendDirection={doraMetrics.mttrTrendDir} tier={doraMetrics.mttrTier} />
        </div>

        {/* Row 2: Lead Time for Changes — segmented bar chart */}
        <div className="group/card flex flex-col rounded-cn-2 border border-borders-2 bg-white dark:bg-cn-1">
          <div className="flex items-start justify-between p-5 pb-0">
            <div className="flex flex-col gap-0.5">
              <Text variant="body-strong" color="foreground-1">Lead Time for Changes</Text>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showTrendline ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowTrendline(!showTrendline)}
              >
                Show Trendline
              </Button>
              <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
                <IconV2 name="more-horizontal" size="sm" />
              </Button>
            </div>
          </div>

          {/* Segmented stacked bar chart */}
          <div className="p-5 pt-3">
            <svg width="0" height="0">
              <defs>
                {STAGE_SERIES.map((s) => (
                  <filter key={s.dataKey} id={`lead-shadow-${s.dataKey}`}>
                    <feDropShadow dx="0" dy="5" stdDeviation="6.5" floodColor={s.color} floodOpacity="0.25" />
                  </filter>
                ))}
              </defs>
            </svg>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={showTrendline ? trendlineData : leadTimeData} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="8 6" vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="name" tick={TICK_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                <YAxis
                  tickFormatter={formatYAxis}
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6B7280' } }}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend iconType="square" iconSize={10} wrapperStyle={LEGEND_STYLE} formatter={legendFormatter} />
                {STAGE_SERIES.map((s) => (
                  <Bar
                    key={s.dataKey}
                    dataKey={s.dataKey}
                    name={s.name}
                    fill={s.color}
                    stackId="lead"
                    radius={[4, 4, 4, 4]}
                    style={{ filter: `url(#lead-shadow-${s.dataKey})` }}
                    animationDuration={150}
                  />
                )).flatMap((bar, i) =>
                  i < STAGE_SERIES.length - 1
                    ? [bar, <Bar key={`_gap_${i}`} dataKey="_gap" stackId="lead" fill="transparent" legendType="none" tooltipType="none" animationDuration={0} />]
                    : [bar]
                )}
                {showTrendline && (
                  <Line
                    type="monotone"
                    dataKey="_trend"
                    name="Trend"
                    stroke="#0E1218"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    dot={false}
                    activeDot={{ r: 4 }}
                    animationDuration={300}
                    legendType="line"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Average lead time horizontal bar */}
          <div className="px-5 pb-2">
            <div className="mb-2 flex items-center gap-2">
              <Text variant="caption-normal" color="foreground-1" className="font-medium">
                {doraMetrics.leadTime} (Average) · {avgSegments.totalTickets} tickets
              </Text>
            </div>
            <div className="flex h-8 w-full" style={{ gap: 3 }}>
              <div style={{ width: `${avgSegments.planning}%`, backgroundColor: STAGE_COLORS.planning, borderRadius: 4 }} className="transition-all" />
              <div style={{ width: `${avgSegments.coding}%`, backgroundColor: STAGE_COLORS.coding, borderRadius: 4 }} className="transition-all" />
              <div style={{ width: `${avgSegments.review}%`, backgroundColor: STAGE_COLORS.review, borderRadius: 4 }} className="transition-all" />
              <div style={{ width: `${avgSegments.build}%`, backgroundColor: STAGE_COLORS.build, borderRadius: 4 }} className="transition-all" />
              <div style={{ width: `${avgSegments.deploy}%`, backgroundColor: STAGE_COLORS.deploy, borderRadius: 4 }} className="transition-all" />
            </div>
          </div>

          {/* Development stages visualization */}
          <div className="px-5 pb-5 pt-3">
            <div className="flex gap-3">
              {stageData.map((stage, i) => (
                <div key={stage.label} className="flex flex-1 items-center gap-0">
                  <StageCard icon={stage.icon} label={stage.label} stages={stage.stages} />
                  {i < stageData.length - 1 && (
                    <div className="flex shrink-0 items-center px-1">
                      <IconV2 name="nav-arrow-right" size="sm" className="text-foreground-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Deployment Frequency bar chart with drilldown */}
        <div className="group/card flex flex-col rounded-cn-2 border border-borders-2 bg-white dark:bg-cn-1">
          <div className="flex items-start justify-between p-5 pb-0">
            <div className="flex flex-col gap-0.5">
              <Text variant="body-strong" color="foreground-1">Deployment Frequency</Text>
            </div>
            <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
              <IconV2 name="more-horizontal" size="sm" />
            </Button>
          </div>

          <div className="p-5 pt-3">
            <svg width="0" height="0">
              <defs>
                <filter id="deploy-bar-shadow">
                  <feDropShadow dx="0" dy="5" stdDeviation="6.5" floodColor="rgba(41, 173, 255, 0.25)" floodOpacity="1" />
                </filter>
              </defs>
            </svg>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={deployFreqData}
                margin={CHART_MARGIN}
                onClick={(state: Record<string, unknown>) => {
                  const idx = state?.activeTooltipIndex
                  if (typeof idx === 'number') { handleDeployBarClick(idx); return }
                  const label = state?.activeLabel
                  if (label != null) {
                    const i = deployFreqData.findIndex(d => d.name === label)
                    if (i >= 0) handleDeployBarClick(i)
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <CartesianGrid strokeDasharray="8 6" vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="name" tick={TICK_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                <YAxis
                  tickFormatter={formatYAxis}
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  label={{ value: 'Deployments', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6B7280' } }}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(0, 0, 0, 0.06)' }} />
                <Bar
                  dataKey="value"
                  name="Deployments"
                  fill="var(--cn-comp-data-viz-01-blue, lch(65% 56 255))"
                  radius={[4, 4, 0, 0]}
                  barSize={48}
                  style={{ filter: 'url(#deploy-bar-shadow)' }}
                  animationDuration={150}
                  cursor="pointer"
                >
                  {selectedBarIndex != null && deployFreqData.map((_, i) => (
                    <Cell key={i} fillOpacity={i === selectedBarIndex ? 1 : 0.3} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Drilldown table */}
          <div className="border-t border-borders-2 p-5">
            <div className="flex items-center pb-3">
              <div className="flex items-center gap-1.5">
                <Text variant="body-strong" color="foreground-1">Drill-down</Text>
              </div>
              <div className="ml-auto flex items-center gap-3">
                {selectedBarIndex != null && (
                  <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip onClick={() => setSelectedBarIndex(null)}>
                    <IconV2 name="xmark" size="sm" />
                  </Button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table.Root variant="default" size="normal">
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Deployment ID</Table.Head>
                    <Table.Head>Owner</Table.Head>
                    <Table.Head>Pipeline Name</Table.Head>
                    <Table.Head>Status</Table.Head>
                    <Table.Head>Environment</Table.Head>
                    <Table.Head>Service</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedDrilldown.map((row) => (
                    <Table.Row key={row.deploymentId}>
                      <Table.Cell>
                        <Text variant="body-normal" color="foreground-1" className="font-mono text-xs">{row.deploymentId}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <div className="flex shrink-0 items-center justify-center bg-[rgba(0,109,234,0.15)] text-sm font-medium text-[#006DEA]" style={{ width: 32, height: 32, borderRadius: '50%' }}>
                            {row.owner.split(' ').map(n => n[0]).join('')}
                          </div>
                          <Text variant="body-normal" color="foreground-1" className="whitespace-nowrap">{row.owner}</Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Text variant="body-normal" color="foreground-1" className="whitespace-nowrap">{row.pipelineName}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <StatusBadge variant="outline" theme="success" size="sm">{row.status}</StatusBadge>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">{row.environment}</Table.Cell>
                      <Table.Cell className="whitespace-nowrap">{row.service}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </div>
            <div className="rounded-b-cn-2 border border-t-0 border-borders-2 px-4 pb-3 pt-0.5">
              <Pagination
                totalItems={drilldownData.length}
                pageSize={drillPageSize}
                currentPage={drillPage}
                goToPage={setDrillPage}
                onPageSizeChange={(size) => { setDrillPageSize(size); setDrillPage(1) }}
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
