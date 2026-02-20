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
} from '@harnessio/ui/components'
import { Nav2 } from '../components/Nav2'
import { Breadcrumb2 } from '../components/Breadcrumb2'
import { DonutChart, GroupedBarChart } from '../components/Charts'

// ── Time range config ──
// Shorter ranges show earlier/lower adoption, fewer users, less volume

const TIME_RANGE_PROFILES: Record<string, {
  scale: number           // multiplier for volume metrics (lines, users)
  adoptionRate: number    // donut %
  acceptanceRate: number
  reworkRate: number
  totalDevs: number
  activeDevs: number
  linesSuggested: number
  linesAccepted: number
  recentRework: number
  legacyRework: number
  adoptionTrend: string
  acceptanceTrend: string
  reworkTrend: string
  devTrend: string
  linesTrend: string
  labels: string[]        // x-axis labels for time-series charts
}> = {
  '7D': {
    scale: 0.12, adoptionRate: 71, acceptanceRate: 65.2, reworkRate: 22.4,
    totalDevs: 138, activeDevs: 92, linesSuggested: 420, linesAccepted: 280,
    recentRework: 16.8, legacyRework: 5.6,
    adoptionTrend: '+1.2%', acceptanceTrend: '-0.8%', reworkTrend: '+2.1%',
    devTrend: '+3%', linesTrend: '+5.2%',
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  '1M': {
    scale: 0.35, adoptionRate: 72, acceptanceRate: 67.1, reworkRate: 21.5,
    totalDevs: 140, activeDevs: 98, linesSuggested: 1_180, linesAccepted: 810,
    recentRework: 15.4, legacyRework: 6.1,
    adoptionTrend: '+4.8%', acceptanceTrend: '+2.1%', reworkTrend: '+0.9%',
    devTrend: '+8%', linesTrend: '+9.4%',
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  },
  '3M': {
    scale: 0.55, adoptionRate: 73, acceptanceRate: 68.4, reworkRate: 20.8,
    totalDevs: 142, activeDevs: 102, linesSuggested: 1_650, linesAccepted: 1_120,
    recentRework: 14.2, legacyRework: 6.6,
    adoptionTrend: '+9.5%', acceptanceTrend: '+4.7%', reworkTrend: '-1.2%',
    devTrend: '+12%', linesTrend: '+14.1%',
    labels: ['Dec', 'Jan', 'Feb'],
  },
  '6M': {
    scale: 0.78, adoptionRate: 74, acceptanceRate: 69.8, reworkRate: 20.1,
    totalDevs: 143, activeDevs: 106, linesSuggested: 1_980, linesAccepted: 1_380,
    recentRework: 13.6, legacyRework: 6.5,
    adoptionTrend: '+15.2%', acceptanceTrend: '+6.3%', reworkTrend: '-2.8%',
    devTrend: '+17%', linesTrend: '+16.8%',
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
  },
  '12M': {
    scale: 1, adoptionRate: 75, acceptanceRate: 70.6, reworkRate: 19.8,
    totalDevs: 145, activeDevs: 109, linesSuggested: 2_338, linesAccepted: 1_650,
    recentRework: 13.1, legacyRework: 6.7,
    adoptionTrend: '+21%', acceptanceTrend: '+8.3%', reworkTrend: '-4.2%',
    devTrend: '+21%', linesTrend: '+18.5%',
    labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
  },
  custom: {
    scale: 1, adoptionRate: 75, acceptanceRate: 70.6, reworkRate: 19.8,
    totalDevs: 145, activeDevs: 109, linesSuggested: 2_338, linesAccepted: 1_650,
    recentRework: 13.1, legacyRework: 6.7,
    adoptionTrend: '+21%', acceptanceTrend: '+8.3%', reworkTrend: '-4.2%',
    devTrend: '+21%', linesTrend: '+18.5%',
    labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
  },
}

// Deterministic pseudo-random jitter from a seed string
function jitter(seed: string, base: number, variance: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  const t = (Math.abs(h) % 1000) / 1000 // 0..1
  return Math.round(base + (t - 0.5) * 2 * variance)
}


// ── Team data (percentages scale slightly with time range) ──

function generateTeamData(scale: number, base: typeof TEAM_BASE_DATA) {
  return base.map(t => ({
    name: t.name,
    windsurf: Math.round(t.windsurf * (0.85 + 0.15 * scale)),
    cursor: Math.round(t.cursor * (0.85 + 0.15 * scale)),
  }))
}

const TEAM_BASE_DATA = [
  { name: 'Platform', windsurf: 82, cursor: 18 },
  { name: 'Product', windsurf: 65, cursor: 35 },
  { name: 'Mobile', windsurf: 58, cursor: 42 },
  { name: 'Data Science', windsurf: 45, cursor: 55 },
  { name: 'Frontend', windsurf: 72, cursor: 28 },
  { name: 'Backend', windsurf: 78, cursor: 22 },
]

// ── Active users table data ──

const BASE_ACTIVE_USERS = [
  { name: 'Harshil Garg', email: 'harshil.garg@harness.io', team: 'diana hughes', activeDays: 1, codingDays: 23, assistant: 'Cursor', linesSuggested: 722, linesAccepted: 142, acceptanceRate: '19.67%', prMerged: 21, newWork: '80.25%', legacyRework: '0%', recentRework: '19.75%', features: 37, defects: 'NA', avgPrCycle: '22h 6m' },
  { name: 'Mahesh Sankaran', email: 'mahesh.sankaran@harness.io', team: 'dominic wallace', activeDays: 1, codingDays: 23, assistant: 'Cursor', linesSuggested: 227, linesAccepted: 227, acceptanceRate: '100%', prMerged: 29, newWork: '93.50%', legacyRework: '0%', recentRework: '6.50%', features: 4, defects: 7, avgPrCycle: '1d 9h' },
  { name: 'Rajarshee Chatterjee', email: 'rajarshee.chatterjee@harness.io', team: 'samantha wright', activeDays: 2, codingDays: 21, assistant: 'Cursor', linesSuggested: 966, linesAccepted: 966, acceptanceRate: '100%', prMerged: 42, newWork: '80.59%', legacyRework: '0%', recentRework: '19.41%', features: 15, defects: 21, avgPrCycle: '2d 20h' },
  { name: 'Shashwat Pandey', email: 'shashwat.pandey@harness.io', team: 'samantha wright', activeDays: 2, codingDays: 19, assistant: 'Cursor', linesSuggested: 1_515, linesAccepted: 1_496, acceptanceRate: '98.75%', prMerged: 22, newWork: '91.64%', legacyRework: '0%', recentRework: '8.36%', features: 13, defects: 3, avgPrCycle: '1d 8h' },
  { name: 'Karthik Nayak', email: 'karthik.nayak@harness.io', team: 'gabriel martinez', activeDays: 0, codingDays: 18, assistant: 'Windsurf', linesSuggested: 0, linesAccepted: 0, acceptanceRate: '0%', prMerged: 16, newWork: '98.94%', legacyRework: '0%', recentRework: '1.06%', features: 16, defects: 2, avgPrCycle: '17h 8m' },
  { name: 'Meet Rathod', email: 'rathod.meetsatish@harness.io', team: 'marcus thompson', activeDays: 0, codingDays: 18, assistant: 'Windsurf', linesSuggested: 0, linesAccepted: 0, acceptanceRate: '0%', prMerged: 10, newWork: '84.73%', legacyRework: '0%', recentRework: '15.27%', features: 11, defects: 7, avgPrCycle: '1d 11h' },
  { name: 'Challa Reddy', email: 'challa.reddy@harness.io', team: 'gabriel martinez', activeDays: 2, codingDays: 17, assistant: 'Windsurf', linesSuggested: 1_151, linesAccepted: 1_114, acceptanceRate: '96.79%', prMerged: 12, newWork: '85.06%', legacyRework: '0%', recentRework: '14.94%', features: 9, defects: 2, avgPrCycle: '16h 45m' },
  { name: 'Arjun Singh', email: 'arjun.singh@harness.io', team: 'gabriel martinez', activeDays: 1, codingDays: 17, assistant: 'Windsurf', linesSuggested: 496, linesAccepted: 496, acceptanceRate: '100%', prMerged: 28, newWork: '93.64%', legacyRework: '0%', recentRework: '6.36%', features: 6, defects: 1, avgPrCycle: '1d 20h' },
  { name: 'Jyoti Arora', email: 'jyoti.arora@harness.io', team: 'dominic wallace', activeDays: 2, codingDays: 16, assistant: 'Cursor', linesSuggested: 0, linesAccepted: 0, acceptanceRate: '0%', prMerged: 24, newWork: '88.52%', legacyRework: '0%', recentRework: '11.48%', features: 6, defects: 24, avgPrCycle: '1d 15h' },
  { name: 'Riyas P', email: 'riyas.yash@harness.io', team: 'Direct Reports of...', activeDays: 2, codingDays: 15, assistant: 'Cursor', linesSuggested: 728, linesAccepted: 689, acceptanceRate: '94.64%', prMerged: 13, newWork: '92.68%', legacyRework: '0%', recentRework: '7.32%', features: 36, defects: 'NA', avgPrCycle: '1d 17h' },
]

const INACTIVE_USERS = [
  { name: 'Vikram Patel', email: 'vikram.patel@harness.io', team: 'samantha wright', activeDays: 0, codingDays: 0, assistant: 'Cursor', linesSuggested: 0, linesAccepted: 0, acceptanceRate: '0%', prMerged: 0, newWork: '0%', legacyRework: '0%', recentRework: '0%', features: 0, defects: 0, avgPrCycle: 'NA' },
  { name: 'Sneha Gupta', email: 'sneha.gupta@harness.io', team: 'dominic wallace', activeDays: 0, codingDays: 0, assistant: 'Windsurf', linesSuggested: 0, linesAccepted: 0, acceptanceRate: '0%', prMerged: 0, newWork: '0%', legacyRework: '0%', recentRework: '0%', features: 0, defects: 0, avgPrCycle: 'NA' },
  { name: 'Amit Desai', email: 'amit.desai@harness.io', team: 'gabriel martinez', activeDays: 0, codingDays: 2, assistant: 'Cursor', linesSuggested: 14, linesAccepted: 3, acceptanceRate: '21.43%', prMerged: 0, newWork: '0%', legacyRework: '0%', recentRework: '0%', features: 0, defects: 0, avgPrCycle: 'NA' },
  { name: 'Priya Nair', email: 'priya.nair@harness.io', team: 'marcus thompson', activeDays: 0, codingDays: 1, assistant: 'Windsurf', linesSuggested: 0, linesAccepted: 0, acceptanceRate: '0%', prMerged: 0, newWork: '0%', legacyRework: '0%', recentRework: '0%', features: 0, defects: 0, avgPrCycle: 'NA' },
]

const UNLICENSED_USERS = [
  { name: 'Rohan Mehta', email: 'rohan.mehta@harness.io', team: 'diana hughes', activeDays: 3, codingDays: 12, assistant: 'Unassigned', linesSuggested: 0, linesAccepted: 0, acceptanceRate: '0%', prMerged: 8, newWork: '76.30%', legacyRework: '0%', recentRework: '23.70%', features: 5, defects: 3, avgPrCycle: '2d 4h' },
  { name: 'Deepa Krishnan', email: 'deepa.krishnan@harness.io', team: 'samantha wright', activeDays: 2, codingDays: 9, assistant: 'Unassigned', linesSuggested: 0, linesAccepted: 0, acceptanceRate: '0%', prMerged: 5, newWork: '82.14%', legacyRework: '0%', recentRework: '17.86%', features: 3, defects: 2, avgPrCycle: '1d 22h' },
  { name: 'Sanjay Iyer', email: 'sanjay.iyer@harness.io', team: 'gabriel martinez', activeDays: 1, codingDays: 7, assistant: 'Unassigned', linesSuggested: 0, linesAccepted: 0, acceptanceRate: '0%', prMerged: 4, newWork: '91.20%', legacyRework: '0%', recentRework: '8.80%', features: 2, defects: 1, avgPrCycle: '3d 1h' },
]

// ── Chart constants ──

const WINDSURF_COLOR = '#2DA6FF'
const CURSOR_COLOR = '#D946EF'

const ASSISTANT_SERIES = [
  { dataKey: 'windsurf', name: 'Windsurf', color: WINDSURF_COLOR },
  { dataKey: 'cursor', name: 'Cursor', color: CURSOR_COLOR },
]

const ALL_COLOR = '#6366F1'
const ADOPTION_SERIES = [
  { dataKey: 'windsurf', name: 'Windsurf', color: WINDSURF_COLOR },
  { dataKey: 'cursor', name: 'Cursor', color: CURSOR_COLOR },
  { dataKey: 'all', name: 'All', color: ALL_COLOR },
]

// ── AI Summary panel ──

function AISummaryPanel() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-cn-2 border border-borders-2 bg-white dark:bg-cn-1">
      {/* Animated gradient left border */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${loading ? 'ai-gradient-border' : 'ai-gradient-border-static'}`} />

      <div className="py-4 pl-6 pr-5">
        {/* Header: Summary title + feedback controls */}
        <div className="mb-3 flex items-center">
          <Text variant="heading-section" color="foreground-1">AI's Summary</Text>
          <div className="ml-auto flex items-center gap-0.5">
            <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
              <IconV2 name="thumbs-up" size="sm" />
            </Button>
            <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
              <IconV2 name="thumbs-down" size="sm" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            <div className="ai-shimmer h-3 w-full" />
            <div className="ai-shimmer h-3 w-11/12" />
            <div className="ai-shimmer h-3 w-4/5" />
            <div className="mt-1 ai-shimmer h-4 w-40" />
            <div className="ai-shimmer h-3 w-full" />
            <div className="ai-shimmer h-3 w-10/12" />
            <div className="mt-1 ai-shimmer h-4 w-36" />
            <div className="ai-shimmer h-3 w-full" />
            <div className="ai-shimmer h-3 w-9/12" />
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-sm text-foreground-2">
            <div>
              <p>
                AI coding assistant adoption has reached <strong className="text-foreground-1">75%</strong> across the organization with a strong upward trend of +21%.
                The acceptance rate stands at <strong className="text-foreground-1">70.6%</strong>, indicating developers are finding AI suggestions highly relevant.
                Code rework has decreased to <strong className="text-foreground-1">19.8%</strong>, suggesting improving code quality from AI-assisted development.
                Windsurf is the dominant assistant across most teams, with <strong className="text-foreground-1">109 active developers</strong> out of 145 total.
              </p>
            </div>

            <div>
              <Text variant="body-strong" color="foreground-1" className="mb-1 block uppercase tracking-wide" style={{ fontSize: 11 }}>
                Actionable Insights
              </Text>
              <ul className="list-disc pl-4 space-y-1">
                <li>Platform and Backend teams lead Windsurf adoption at 82% and 78% respectively, while Data Science favors Cursor at 55%.</li>
                <li>Top contributors are generating over 5,000 lines of AI-assisted code per period — these power users can champion adoption for remaining teams.</li>
                <li>Daily active users show consistent weekly growth across both assistants, but Cursor growth is accelerating faster in recent weeks.</li>
              </ul>
            </div>

            <div>
              <Text variant="body-strong" color="foreground-1" className="mb-1 block uppercase tracking-wide" style={{ fontSize: 11 }}>
                Recommendations
              </Text>
              <ul className="list-disc pl-4 space-y-1">
                <li>Expand Windsurf enablement sessions for the Data Science team where Cursor currently dominates — aligning on a primary tool could improve cross-team collaboration.</li>
                <li>Investigate the 19.8% rework rate with targeted code review practices to push it below 15%.</li>
                <li>Leverage top performers like Priya Sharma and Emily Rodriguez as AI champions to accelerate adoption among the remaining 25% of non-adopters.</li>
              </ul>
            </div>

            <p className="text-foreground-4" style={{ fontSize: 11 }}>
              This summary was generated by AI based on dashboard data and may contain inaccuracies.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Card title with hover info tooltip ──

function CardTitle({ title, subtitle, tooltip }: { title: string; subtitle: string; tooltip?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <Text variant="body-strong" color="foreground-1">{title}</Text>
        {tooltip && (
          <div className="relative opacity-0 transition-opacity group-hover/card:opacity-100">
            <div className="group/tip">
              <IconV2 name="info-circle" size="xs" className="text-foreground-4 cursor-help" />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-hover/tip:pointer-events-auto group-hover/tip:opacity-100">
                <div className="w-56 rounded-lg bg-cn-0 px-3 py-2 text-xs text-foreground-2 shadow-lg border border-borders-2">
                  {tooltip}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Text variant="caption-normal" color="foreground-3">{subtitle}</Text>
    </div>
  )
}

// ── Donut metric card ──

function DonutMetricCard({ title, subtitle, data, metric, metricLabel, color, trend, tooltip, children }: {
  title: string
  subtitle: string
  data: { name: string; value: number }[]
  metric: string
  metricLabel?: string
  color: string
  trend: string
  tooltip?: string
  children?: React.ReactNode
}) {
  return (
    <div className="group/card flex flex-col rounded-cn-2 border border-borders-2 bg-white dark:bg-cn-1">
      <div className="flex flex-col gap-4 p-5">
        <CardTitle title={title} subtitle={subtitle} tooltip={tooltip} />
        <DonutChart data={data} height={210} color={color} metric={metric} metricLabel={metricLabel} trend={trend} />
      </div>
      {children}
    </div>
  )
}

// ── Chart card wrapper ──

function ChartCard({ title, subtitle, tooltip, children }: {
  title: string
  subtitle: string
  tooltip?: string
  children: React.ReactNode
}) {
  return (
    <div className="group/card flex flex-col gap-4 rounded-cn-2 border border-borders-2 bg-white p-5 dark:bg-cn-1">
      <div className="flex items-start justify-between">
        <CardTitle title={title} subtitle={subtitle} tooltip={tooltip} />
        <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
          <IconV2 name="more-horizontal" size="sm" />
        </Button>
      </div>
      {children}
    </div>
  )
}

// ── Main page ──

export function AIInsightsPage() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )
  const [timeRange, setTimeRange] = useState('12M')
  const [assistantFilter, setAssistantFilter] = useState('all')
  const [devTab, setDevTab] = useState('active')

  const profile = TIME_RANGE_PROFILES[timeRange] ?? TIME_RANGE_PROFILES['12M']

  const adoptionData = useMemo(() => [
    { name: 'Adopted', value: profile.adoptionRate },
    { name: 'Remaining', value: 100 - profile.adoptionRate },
  ], [profile])

  const acceptanceData = useMemo(() => [
    { name: 'Accepted', value: profile.acceptanceRate },
    { name: 'Remaining', value: +(100 - profile.acceptanceRate).toFixed(1) },
  ], [profile])

  const reworkData = useMemo(() => [
    { name: 'Rework', value: profile.reworkRate },
    { name: 'Remaining', value: +(100 - profile.reworkRate).toFixed(1) },
  ], [profile])

  const adoptionTimeData = useMemo(
    () => profile.labels.map((name, i) => {
      const w = jitter(`aw${name}${i}`, Math.round(62 * profile.scale) + i * 2, 8)
      const c = jitter(`ac${name}${i}`, Math.round(48 * profile.scale) + i * 2, 6)
      return { name, windsurf: w, cursor: c, all: w + c }
    }),
    [profile]
  )

  const teamAdoptionData = useMemo(
    () => TEAM_BASE_DATA.map(t => {
      const w = Math.round(t.windsurf * (0.85 + 0.15 * profile.scale))
      const c = Math.round(t.cursor * (0.85 + 0.15 * profile.scale))
      return { name: t.name, windsurf: w, cursor: c, all: w + c }
    }),
    [profile]
  )

  const devTableData = devTab === 'inactive' ? INACTIVE_USERS : devTab === 'unlicensed' ? UNLICENSED_USERS : BASE_ACTIVE_USERS

  const filteredUsers = useMemo(
    () => assistantFilter === 'all' ? devTableData : devTableData.filter(u => u.assistant.toLowerCase() === assistantFilter),
    [assistantFilter, devTableData]
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light-std-low', 'dark-std-low')
    root.classList.add(dark ? 'dark-std-low' : 'light-std-low')
  }, [dark])

  return (
    <div className="flex min-h-screen bg-cn-3">
      <Nav2 activeSection="insights" dark={dark} onThemeToggle={() => setDark(!dark)} />

      <div className="flex flex-1 flex-col gap-5 px-5 pb-5 pt-3">
        <Breadcrumb2 />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <Text as="h1" variant="heading-hero" color="foreground-1">AI Insights</Text>
            <Text variant="body-normal" color="foreground-3">
              AI coding assistant adoption and impact insights for your teams.
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
            <Text variant="body-normal" color="foreground-3">Status</Text>
            <StatusBadge variant="outline" theme="success" size="sm">Published</StatusBadge>
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Created:</Text>
            <Text variant="body-normal" color="foreground-1">01 Nov 2025, 03:19pm</Text>
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Updated:</Text>
            <Text variant="body-normal" color="foreground-1">01 Jan 2026, 09:38am</Text>
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Org</Text>
            <Text variant="body-normal" color="foreground-1">Harness SEI</Text>
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Tags</Text>
            <Tag variant="outline" theme="gray" size="sm" value="AI Insights" />
          </div>
        </div>

        {/* Controls bar */}
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
          <Select
            value={assistantFilter}
            options={[
              { label: 'All Assistants', value: 'all' },
              { label: 'Windsurf', value: 'windsurf' },
              { label: 'Cursor', value: 'cursor' },
            ]}
            onChange={(val) => { if (val) setAssistantFilter(val) }}
          />
        </div>

        {/* AI Summary */}
        <AISummaryPanel />

        {/* Donut metrics row */}
        <div className="grid grid-cols-3 gap-5">
          <DonutMetricCard
            title="Adoption"
            subtitle=""
            tooltip="Percentage of developers actively using AI coding assistants out of total developers on the team."
            data={adoptionData}
            metric={`${profile.adoptionRate}%`}
            metricLabel="Adoption Rate"
            color="#10B981"
            trend={profile.adoptionTrend}
          >
            <div className="border-t border-borders-2">
              {[
                { label: 'Total developers', value: String(profile.totalDevs), change: profile.devTrend, positive: true },
                { label: 'Active developers', value: String(profile.activeDevs), change: profile.devTrend, positive: true },
                { label: 'Inactive developers', value: String(profile.totalDevs - profile.activeDevs), change: profile.devTrend, positive: true },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-borders-2 px-4 py-3 last:border-b-0">
                  <Text variant="body-normal" color="foreground-3">{row.label}</Text>
                  <div className="flex items-center gap-2">
                    <Text variant="body-strong" color="foreground-1">{row.value}</Text>
                    <Text variant="caption-normal" color={row.positive ? 'success' : 'danger'}>{row.change}</Text>
                  </div>
                </div>
              ))}
            </div>
          </DonutMetricCard>
          <div className="group/card flex flex-col rounded-cn-2 border border-borders-2 bg-white dark:bg-cn-1">
            <div className="flex flex-col gap-4 p-5">
              <CardTitle title="Velocity" subtitle="" tooltip="Average PRs merged per developer in this period" />
              <div className="flex items-center justify-center" style={{ height: 210 }}>
                <div className="flex flex-col items-center" style={{ gap: 2 }}>
                  <span className="text-foreground-1 font-semibold" style={{ fontFamily: "'Inter', sans-serif", fontSize: 42, lineHeight: 1 }}>
                    {profile.acceptanceRate}%
                  </span>
                  <span className="text-foreground-3" style={{ fontSize: 13, lineHeight: 1 }}>PRs/developer/week</span>
                  <span className={`text-xs font-medium ${profile.acceptanceTrend.startsWith('+') ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {profile.acceptanceTrend}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-borders-2">
              {[
                { label: 'Cursor', value: '4.7', change: '+9.95%', color: 'success' as const },
                { label: 'Windsurf', value: '0.0', change: 'No change', color: 'foreground-3' as const },
                { label: 'Unlicensed', value: '1.2', change: 'No change', color: 'foreground-3' as const },
                { label: 'All', value: '5.7', change: '-15.67%', color: 'danger' as const },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-borders-2 px-4 py-3 last:border-b-0">
                  <Text variant="body-normal" color="foreground-3">{row.label}</Text>
                  <div className="flex items-center gap-2">
                    <Text variant="body-strong" color="foreground-1">{row.value}</Text>
                    <Text variant="caption-normal" color={row.color}>{row.change}</Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DonutMetricCard
            title="Quality"
            subtitle=""
            tooltip="Percentage of code being rewritten per developer in this period."
            data={reworkData}
            metric={`${profile.reworkRate}%`}
            metricLabel="Code Rework"
            color="#EF4444"
            trend={profile.reworkTrend}
          >
            <div className="border-t border-borders-2">
              {[
                { label: 'Cursor', value: '21.43%', change: '+9.95%', color: 'danger' as const },
                { label: 'Windsurf', value: '0.0%', change: 'No change', color: 'foreground-3' as const },
                { label: 'Unlicensed', value: '25.0%', change: 'No change', color: 'foreground-3' as const },
                { label: 'All', value: '22.22%', change: '-15.67%', color: 'success' as const },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-borders-2 px-4 py-3 last:border-b-0">
                  <Text variant="body-normal" color="foreground-3">{row.label}</Text>
                  <div className="flex items-center gap-2">
                    <Text variant="body-strong" color="foreground-1">{row.value}</Text>
                    <Text variant="caption-normal" color={row.color}>{row.change}</Text>
                  </div>
                </div>
              ))}
            </div>
          </DonutMetricCard>
        </div>

        {/* Adoption charts */}
        <div className="grid grid-cols-2 gap-5">
          <ChartCard title="Adoption" subtitle="" tooltip="AI coding assistant adoption rate over time by assistant.">
            <GroupedBarChart data={adoptionTimeData} series={ADOPTION_SERIES} height={240} yAxisFormatter={(v) => `${v}%`} />
          </ChartCard>
          <ChartCard title="Team Adoption" subtitle="" tooltip="AI coding assistant adoption breakdown by team.">
            <GroupedBarChart data={teamAdoptionData} series={ADOPTION_SERIES} height={240} yAxisFormatter={(v) => `${v}%`} />
          </ChartCard>
        </div>

        {/* Active users table */}
        <div className="group/card rounded-cn-2 border border-borders-2 bg-white p-5 dark:bg-cn-1">
          <div className="flex items-center pb-3">
            <div className="flex items-center gap-1.5">
              <Text variant="body-strong" color="foreground-1">Developers</Text>
              <div className="relative opacity-0 transition-opacity group-hover/card:opacity-100">
                <div className="group/tip">
                  <IconV2 name="info-circle" size="xs" className="text-foreground-4 cursor-help" />
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-hover/tip:pointer-events-auto group-hover/tip:opacity-100">
                    <div className="w-96 rounded-lg bg-cn-0 px-4 py-3 text-xs text-foreground-2 shadow-lg border border-borders-2 space-y-3">
                      <div>
                        <strong className="text-foreground-1">Definition</strong>
                        <p className="mt-1">Developer-level usage and productivity metrics for all developers across teams under the currently selected node, showing how each individual is contributing to the codebase and interacting with AI coding assistants.</p>
                      </div>
                      <div>
                        <strong className="text-foreground-1">How to read this</strong>
                        <p className="mt-1">Each row represents a single developer. Metrics are aggregated over the selected duration and can be sorted to compare usage, productivity, and outcomes across individuals.</p>
                        <p className="mt-1"><strong className="text-foreground-1">Assistant</strong> — Indicates the AI coding assistant associated with the developer: Named assistants (e.g., Cursor, Windsurf) reflect an active license. <em>All</em> indicates multiple assistants. <em>Unassigned</em> indicates no active AI assistant license detected.</p>
                      </div>
                      <div>
                        <strong className="text-foreground-1">Key metrics</strong>
                        <ul className="mt-1 list-disc pl-3.5 space-y-0.5">
                          <li><strong>Days Active:</strong> Number of days the developer had SCM activity in the selected period</li>
                          <li><strong>Lines Added:</strong> Total lines of code added by the developer</li>
                          <li><strong>Lines Suggested:</strong> Total lines suggested by the AI assistant</li>
                          <li><strong>Acceptance %:</strong> Percentage of AI-suggested lines accepted by the developer</li>
                          <li><strong>PRs:</strong> Number of pull requests merged</li>
                          <li><strong>Work Resolved:</strong> Number of work items completed and closed</li>
                        </ul>
                      </div>
                      <div>
                        <strong className="text-foreground-1">What does this metric mean to me?</strong>
                        <p className="mt-1">Provides visibility into individual-level AI usage and productivity patterns, helping teams understand adoption, impact, and areas for enablement — without optimizing for raw output alone.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-auto">
              <Tabs.Root value={devTab} onValueChange={setDevTab}>
                <Tabs.List variant="outlined">
                  <Tabs.Trigger value="active">Active</Tabs.Trigger>
                  <Tabs.Trigger value="inactive">Inactive</Tabs.Trigger>
                  <Tabs.Trigger value="unlicensed">Unlicensed</Tabs.Trigger>
                </Tabs.List>
              </Tabs.Root>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table.Root variant="default" size="normal">
              <Table.Header>
                <Table.Row>
                  <Table.Head>User</Table.Head>
                  <Table.Head>Team</Table.Head>
                  <Table.Head className="text-right">Active Days</Table.Head>
                  <Table.Head className="text-right">Coding Days</Table.Head>
                  <Table.Head>Assistant</Table.Head>
                  <Table.Head className="text-right">Lines Suggested</Table.Head>
                  <Table.Head className="text-right">Lines Accepted</Table.Head>
                  <Table.Head className="text-right">Acceptance Rate</Table.Head>
                  <Table.Head className="text-right">PR Merged</Table.Head>
                  <Table.Head className="text-right">New Work</Table.Head>
                  <Table.Head className="text-right">Legacy Rework</Table.Head>
                  <Table.Head className="text-right">Recent Rework</Table.Head>
                  <Table.Head className="text-right">Features</Table.Head>
                  <Table.Head className="text-right">Defects</Table.Head>
                  <Table.Head className="text-right">Avg PR Cycle</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredUsers.map((user) => (
                  <Table.Row key={user.name}>
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        <div className="flex shrink-0 items-center justify-center bg-[rgba(0,109,234,0.15)] text-sm font-medium text-[#006DEA]" style={{ width: 32, height: 32, borderRadius: '50%' }}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex flex-col">
                          <Text variant="body-normal" color="foreground-1" className="whitespace-nowrap">{user.name}</Text>
                          <Text variant="caption-normal" color="foreground-4" className="whitespace-nowrap">{user.email}</Text>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">{user.team}</Table.Cell>
                    <Table.Cell className="text-right">{user.activeDays}</Table.Cell>
                    <Table.Cell className="text-right">{user.codingDays}</Table.Cell>
                    <Table.Cell>
                      <Tag
                        variant="outline"
                        theme={user.assistant === 'Windsurf' ? 'blue' : 'purple'}
                        size="sm"
                        value={user.assistant}
                      />
                    </Table.Cell>
                    <Table.Cell className="text-right">{user.linesSuggested.toLocaleString()}</Table.Cell>
                    <Table.Cell className="text-right">{user.linesAccepted.toLocaleString()}</Table.Cell>
                    <Table.Cell className="text-right">{user.acceptanceRate}</Table.Cell>
                    <Table.Cell className="text-right">{user.prMerged}</Table.Cell>
                    <Table.Cell className="text-right">{user.newWork}</Table.Cell>
                    <Table.Cell className="text-right">{user.legacyRework}</Table.Cell>
                    <Table.Cell className="text-right">{user.recentRework}</Table.Cell>
                    <Table.Cell className="text-right">{user.features}</Table.Cell>
                    <Table.Cell className="text-right">{user.defects}</Table.Cell>
                    <Table.Cell className="text-right whitespace-nowrap">{user.avgPrCycle}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>
        </div>
      </div>
    </div>
  )
}
