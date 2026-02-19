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
import { DonutChart, StackedBarChart, formatYAxis } from '../components/Charts'

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

// ── Base data generators ──

function generateTimeSeriesData(labels: string[], baseWindsurf: number, baseCursor: number, variance: number) {
  return labels.map((name, i) => ({
    name,
    windsurf: jitter(`w${name}${i}`, baseWindsurf + i * (variance * 0.3), variance),
    cursor: jitter(`c${name}${i}`, baseCursor + i * (variance * 0.2), variance),
  }))
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

const ACCEPTANCE_BASE_DATA = [
  { name: 'Platform', windsurf: 76, cursor: 24 },
  { name: 'Product', windsurf: 68, cursor: 32 },
  { name: 'Mobile', windsurf: 62, cursor: 38 },
  { name: 'Data Science', windsurf: 52, cursor: 48 },
  { name: 'Frontend', windsurf: 71, cursor: 29 },
  { name: 'Backend', windsurf: 74, cursor: 26 },
]

// ── Active users table data ──

const BASE_ACTIVE_USERS = [
  { name: 'Priya Sharma', email: 'p.sharma@sei.io', role: 'Staff Engineer', team: 'Product Engineering', assistant: 'Windsurf', lines: 5_320 },
  { name: 'Emily Rodriguez', email: 'e.rodriguez@sei.io', role: 'Staff Engineer', team: 'Product Engineering', assistant: 'Windsurf', lines: 5_120 },
  { name: 'Jessica Taylor', email: 'j.taylor@sei.io', role: 'Senior Software Engineer', team: 'Data Science', assistant: 'Windsurf', lines: 4_890 },
  { name: 'James Chen', email: 'j.chen@sei.io', role: 'Senior Software Engineer', team: 'Platform Engineering', assistant: 'Cursor', lines: 4_650 },
  { name: 'Sarah Chen', email: 's.chen@sei.io', role: 'Staff Engineer', team: 'Platform Engineering', assistant: 'Cursor', lines: 4_320 },
  { name: 'David Park', email: 'd.park@sei.io', role: 'Software Engineer', team: 'Product Engineering', assistant: 'Cursor', lines: 4_100 },
  { name: 'Ryan O\'Connor', email: 'r.oconnor@sei.io', role: 'Software Engineer', team: 'Product Engineering', assistant: 'Cursor', lines: 3_950 },
  { name: 'Marcus Williams', email: 'm.williams@sei.io', role: 'Senior Software Engineer', team: 'Product Engineering', assistant: 'Cursor', lines: 3_800 },
  { name: 'Olivia Martinez', email: 'o.martinez@sei.io', role: 'Software Engineer', team: 'Data Science', assistant: 'Cursor', lines: 3_500 },
  { name: 'Daniel Patel', email: 'd.patel@sei.io', role: 'Software Engineer', team: 'Mobile Development', assistant: 'Cursor', lines: 2_970 },
  { name: 'Michael Zhang', email: 'm.zhang@sei.io', role: 'Software Engineer', team: 'Quality Engineering', assistant: 'Cursor', lines: 2_890 },
]

// ── Chart constants ──

const WINDSURF_COLOR = '#2DA6FF'
const CURSOR_COLOR = '#D946EF'

const ASSISTANT_SERIES = [
  { dataKey: 'windsurf', name: 'Windsurf', color: WINDSURF_COLOR },
  { dataKey: 'cursor', name: 'Cursor', color: CURSOR_COLOR },
]

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

  const dailyActiveData = useMemo(
    () => generateTimeSeriesData(profile.labels, Math.round(55 * profile.scale), Math.round(38 * profile.scale), Math.round(12 * profile.scale)),
    [profile]
  )

  const netLinesData = useMemo(
    () => generateTimeSeriesData(profile.labels, Math.round(16000 * profile.scale), Math.round(11000 * profile.scale), Math.round(3000 * profile.scale)),
    [profile]
  )

  const teamData = useMemo(() => generateTeamData(profile.scale, TEAM_BASE_DATA), [profile])
  const acceptanceByTeamData = useMemo(() => generateTeamData(profile.scale, ACCEPTANCE_BASE_DATA), [profile])

  const activeUsers = useMemo(
    () => BASE_ACTIVE_USERS.map(u => ({ ...u, lines: Math.round(u.lines * profile.scale) })),
    [profile]
  )

  const filterData = useMemo(() => {
    if (assistantFilter === 'all') return (d: Record<string, string | number>[]) => d
    return (d: Record<string, string | number>[]) =>
      d.map(row => {
        const filtered = { ...row }
        for (const s of ASSISTANT_SERIES) {
          if (s.dataKey !== assistantFilter) filtered[s.dataKey] = 0
        }
        return filtered
      })
  }, [assistantFilter])

  const filteredUsers = useMemo(
    () => assistantFilter === 'all' ? activeUsers : activeUsers.filter(u => u.assistant.toLowerCase() === assistantFilter),
    [assistantFilter, activeUsers]
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
          <DonutMetricCard
            title="Velocity"
            subtitle=""
            tooltip="Ratio of AI-suggested code lines that were accepted by developers versus total suggestions."
            data={acceptanceData}
            metric={`${profile.acceptanceRate}%`}
            metricLabel="Acceptance Rate"
            color="#10B981"
            trend={profile.acceptanceTrend}
          >
            <div className="border-t border-borders-2">
              {[
                { label: 'Lines suggested / Active Contrib...', value: profile.linesSuggested.toLocaleString(), change: profile.linesTrend, positive: true },
                { label: 'Lines accepted / Active Contrib...', value: profile.linesAccepted.toLocaleString(), change: profile.devTrend, positive: true },
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
          <DonutMetricCard
            title="Quality"
            subtitle=""
            tooltip="Percentage of AI-generated code that required rework or was reverted within 30 days of being merged."
            data={reworkData}
            metric={`${profile.reworkRate}%`}
            metricLabel="Code Rework"
            color="#EF4444"
            trend={profile.reworkTrend}
          >
            <div className="border-t border-borders-2">
              {[
                { label: 'Recent rework in 30 days', value: `${profile.recentRework}%`, change: '', positive: true },
                { label: 'Legacy rework', value: `${profile.legacyRework}%`, change: '', positive: true },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-borders-2 px-4 py-3 last:border-b-0">
                  <Text variant="body-normal" color="foreground-3">{row.label}</Text>
                  <div className="flex items-center gap-2">
                    <Text variant="body-strong" color="foreground-1">{row.value}</Text>
                    {row.change && <Text variant="caption-normal" color={row.positive ? 'success' : 'danger'}>{row.change}</Text>}
                  </div>
                </div>
              ))}
            </div>
          </DonutMetricCard>
        </div>

        {/* Daily Active Users + Net Lines charts */}
        <div className="grid grid-cols-2 gap-5">
          <ChartCard title="Daily Active Users by Assistant" subtitle="" tooltip="Number of unique developers using each AI assistant per day, averaged weekly.">
            <StackedBarChart data={filterData(dailyActiveData)} series={ASSISTANT_SERIES} height={240} yAxisFormatter={(v) => String(v)} />
          </ChartCard>
          <ChartCard title="Net Lines Added Per Contributor" subtitle="" tooltip="Average net lines of code added per active contributor, broken down by AI assistant.">
            <StackedBarChart data={filterData(netLinesData)} series={ASSISTANT_SERIES} height={240} yAxisFormatter={formatYAxis} />
          </ChartCard>
        </div>

        {/* Adoption & Acceptance rate by team */}
        <div className="grid grid-cols-2 gap-5">
          <ChartCard title="Adoption Rate by Team" subtitle="" tooltip="Breakdown of AI assistant adoption across teams, showing Windsurf vs Cursor usage.">
            <StackedBarChart data={filterData(teamData)} series={ASSISTANT_SERIES} height={240} yAxisFormatter={(v) => `${v}%`} />
          </ChartCard>
          <ChartCard title="Acceptance Rate" subtitle="" tooltip="Code suggestion acceptance rate by team, comparing Windsurf and Cursor assistants.">
            <StackedBarChart data={filterData(acceptanceByTeamData)} series={ASSISTANT_SERIES} height={240} yAxisFormatter={(v) => `${v}%`} />
          </ChartCard>
        </div>

        {/* Active users table */}
        <div className="rounded-cn-2 border border-borders-2 bg-white p-5 dark:bg-cn-1">
          <div className="pb-3">
            <Text variant="body-strong" color="foreground-1">Active users in team</Text>
            <Text variant="body-normal" color="foreground-3" className="mt-0.5">
              Team members actively using AI coding assistances with detailed productivity metrics
            </Text>
          </div>
          <Table.Root variant="default" size="normal">
            <Table.Header>
              <Table.Row>
                <Table.Head>User</Table.Head>
                <Table.Head>Role</Table.Head>
                <Table.Head>Team</Table.Head>
                <Table.Head>Assistant</Table.Head>
                <Table.Head className="text-right">Lines</Table.Head>
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
                        <Text variant="body-normal" color="foreground-1">{user.name}</Text>
                        <Text variant="caption-normal" color="foreground-4">{user.email}</Text>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{user.role}</Table.Cell>
                  <Table.Cell>{user.team}</Table.Cell>
                  <Table.Cell>
                    <Tag
                      variant="outline"
                      theme={user.assistant === 'Windsurf' ? 'blue' : 'purple'}
                      size="sm"
                      value={user.assistant}
                    />
                  </Table.Cell>
                  <Table.Cell className="text-right">{user.lines.toLocaleString()}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      </div>
    </div>
  )
}
