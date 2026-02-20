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

// ── Phase icons (inline SVGs for brand logos) ──

function JiraIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12.005 2C12.005 5.376 14.592 8.124 17.834 8.124H19.09V9.44C19.09 12.816 21.678 15.564 24.92 15.564V3.06C24.92 2.475 24.445 2 23.86 2H12.005Z" transform="scale(0.85) translate(1.5, 1.5)" fill="#2684FF"/>
      <path d="M8.87 5.2C8.87 8.576 11.458 11.324 14.7 11.324H15.956V12.64C15.956 16.016 18.544 18.764 21.786 18.764V6.26C21.786 5.675 21.311 5.2 20.726 5.2H8.87Z" transform="scale(0.85) translate(1.5, 1.5)" fill="url(#jira-grad-1)"/>
      <path d="M5.74 8.4C5.74 11.776 8.328 14.524 11.57 14.524H12.826V15.84C12.826 19.216 15.414 21.964 18.656 21.964V9.46C18.656 8.875 18.181 8.4 17.596 8.4H5.74Z" transform="scale(0.85) translate(1.5, 1.5)" fill="url(#jira-grad-2)"/>
      <defs>
        <linearGradient id="jira-grad-1" x1="21.13" y1="5.27" x2="13.2" y2="12.61" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0052CC"/>
          <stop offset="1" stopColor="#2684FF"/>
        </linearGradient>
        <linearGradient id="jira-grad-2" x1="18.04" y1="8.44" x2="9.64" y2="15.52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0052CC"/>
          <stop offset="1" stopColor="#2684FF"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function GitHubIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-foreground-1">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
  )
}

function PipelineIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="text-foreground-3">
      <path d="M4 5h16M4 12h16M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="8" cy="5" r="2" fill="currentColor"/>
      <circle cx="16" cy="12" r="2" fill="currentColor"/>
      <circle cx="12" cy="19" r="2" fill="currentColor"/>
    </svg>
  )
}

function FlagIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-foreground-3">
      <path d="M5 3v18M5 3h12l-3 4 3 4H5"/>
    </svg>
  )
}

type PhaseIconType = 'jira' | 'github' | 'pipeline' | 'flag'

function PhaseIcon({ type }: { type: PhaseIconType }) {
  switch (type) {
    case 'jira': return <JiraIcon />
    case 'github': return <GitHubIcon />
    case 'pipeline': return <PipelineIcon />
    case 'flag': return <FlagIcon />
  }
}

// ── Main page ──

export function EfficiencyDoraPage() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )
  const [timeRange, setTimeRange] = useState('6M')
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null)
  const [drillPage, setDrillPage] = useState(1)
  const [drillPageSize, setDrillPageSize] = useState(25)
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

  // ── Development stage data (matches Figma phases) ──
  const stageData: { iconType: PhaseIconType; label: string; stageName: string; stageColor: string; time: string }[] = [
    { iconType: 'jira', label: 'To Do / Proposed', stageName: 'Planning', stageColor: STAGE_COLORS.planning, time: '4d days · 23h' },
    { iconType: 'jira', label: 'In Progress', stageName: 'Coding', stageColor: STAGE_COLORS.coding, time: '12h 55m' },
    { iconType: 'github', label: 'First PR Created', stageName: 'Review', stageColor: STAGE_COLORS.review, time: '7h 21m' },
    { iconType: 'github', label: 'Last PR Merged', stageName: 'Build', stageColor: STAGE_COLORS.build, time: '1d 13h' },
    { iconType: 'pipeline', label: 'Last PR Merged', stageName: 'Deploy', stageColor: STAGE_COLORS.deploy, time: '69d 4h' },
    { iconType: 'flag', label: 'Done', stageName: '', stageColor: '', time: '' },
  ]

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
          <div className="mx-5 mb-2 rounded-lg bg-cn-2 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Text variant="body-normal" color="foreground-1" className="font-medium">
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
          <div className="mx-5 mb-5 mt-3 rounded-lg bg-cn-2 p-5">
            {(() => {
              const stages = stageData.filter(s => s.stageName)
              const tipSize = 16
              const clipFirst = `polygon(0 0, calc(100% - ${tipSize}px) 0, 100% 50%, calc(100% - ${tipSize}px) 100%, 0 100%)`
              const clipMiddle = `polygon(0 0, calc(100% - ${tipSize}px) 0, 100% 50%, calc(100% - ${tipSize}px) 100%, 0 100%, ${tipSize}px 50%)`
              return (
                <div className="flex items-stretch gap-1">
                  {stages.map((stage, i) => {
                    const isFirst = i === 0
                    const phase = stageData[i]
                    // Left edge of the arrow content area
                    const edgeOffset = isFirst ? 0 : tipSize
                    return (
                      <div key={`${stage.stageName}-${i}`} className="flex flex-1 flex-col">
                        {/* Phase icon + label with connector line at arrow's left edge */}
                        <div className="relative pb-2" style={{ marginLeft: edgeOffset }}>
                          <div className="flex items-center gap-1.5">
                            <PhaseIcon type={phase.iconType} />
                            <Text variant="caption-normal" color="foreground-3" className="whitespace-nowrap" style={{ fontSize: 11 }}>
                              {phase.label}
                            </Text>
                          </div>
                          {/* Vertical connector line */}
                          <div className="mt-1 h-3 border-l border-borders-2" style={{ width: 0, marginLeft: 11 }} />
                        </div>
                        {/* Chevron arrow */}
                        <div style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.06))' }}>
                          <div
                            className="flex flex-col justify-center gap-0.5 py-3"
                            style={{
                              backgroundColor: '#fff',
                              clipPath: isFirst ? clipFirst : clipMiddle,
                              paddingLeft: isFirst ? 16 : tipSize + 12,
                              paddingRight: tipSize + 8,
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="inline-block shrink-0 rounded-sm" style={{ width: 8, height: 8, backgroundColor: stage.stageColor }} />
                              <Text variant="caption-normal" color="foreground-3">{stage.stageName}</Text>
                            </div>
                            <Text variant="body-normal" color="foreground-1" className="pl-4 font-semibold">{stage.time}</Text>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {/* Done phase — no arrow, just the icon/label with line */}
                  <div className="flex flex-col pb-2">
                    <div className="flex items-center gap-1.5">
                      <PhaseIcon type="flag" />
                      <Text variant="caption-normal" color="foreground-3" className="whitespace-nowrap" style={{ fontSize: 11 }}>
                        Done
                      </Text>
                    </div>
                    <div className="mt-1 h-3 border-l border-borders-2" style={{ width: 0, marginLeft: 11 }} />
                  </div>
                </div>
              )
            })()}
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
                        <StatusBadge variant="outline" theme="success" size="sm" icon="check">{row.status}</StatusBadge>
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
                totalItems={5075}
                pageSize={drillPageSize}
                currentPage={drillPage}
                goToPage={setDrillPage}
                onPageSizeChange={(size) => { setDrillPageSize(size); setDrillPage(1) }}
                pageSizeOptions={[10, 25, 50]}
                className="!mt-cn-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
