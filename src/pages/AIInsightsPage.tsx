import { useState, useEffect } from 'react'
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
import {
  ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { Nav2 } from '../components/Nav2'
import { Breadcrumb2 } from '../components/Breadcrumb2'

// ── Donut chart data ──

const adoptionData = [
  { name: 'Adopted', value: 75 },
  { name: 'Remaining', value: 25 },
]
const acceptanceData = [
  { name: 'Accepted', value: 70.6 },
  { name: 'Remaining', value: 29.4 },
]
const reworkData = [
  { name: 'Rework', value: 19.8 },
  { name: 'Remaining', value: 80.2 },
]

// ── Daily active users data ──

const dailyActiveData = [
  { name: 'Jan 6', windsurf: 42, cursor: 28 },
  { name: 'Jan 13', windsurf: 48, cursor: 31 },
  { name: 'Jan 20', windsurf: 55, cursor: 35 },
  { name: 'Jan 27', windsurf: 51, cursor: 38 },
  { name: 'Feb 3', windsurf: 60, cursor: 42 },
  { name: 'Feb 10', windsurf: 58, cursor: 45 },
  { name: 'Feb 17', windsurf: 65, cursor: 48 },
]

// ── Net lines added data ──

const netLinesData = [
  { name: 'Jan 6', windsurf: 12400, cursor: 8200 },
  { name: 'Jan 13', windsurf: 15800, cursor: 9100 },
  { name: 'Jan 20', windsurf: 14200, cursor: 10500 },
  { name: 'Jan 27', windsurf: 16900, cursor: 11800 },
  { name: 'Feb 3', windsurf: 18200, cursor: 13200 },
  { name: 'Feb 10', windsurf: 17400, cursor: 14600 },
  { name: 'Feb 17', windsurf: 19800, cursor: 15100 },
]

// ── Adoption & acceptance rate by team ──

const teamData = [
  { name: 'Platform', windsurf: 82, cursor: 18 },
  { name: 'Product', windsurf: 65, cursor: 35 },
  { name: 'Mobile', windsurf: 58, cursor: 42 },
  { name: 'Data Science', windsurf: 45, cursor: 55 },
  { name: 'Frontend', windsurf: 72, cursor: 28 },
  { name: 'Backend', windsurf: 78, cursor: 22 },
]

const acceptanceByTeamData = [
  { name: 'Platform', windsurf: 76, cursor: 24 },
  { name: 'Product', windsurf: 68, cursor: 32 },
  { name: 'Mobile', windsurf: 62, cursor: 38 },
  { name: 'Data Science', windsurf: 52, cursor: 48 },
  { name: 'Frontend', windsurf: 71, cursor: 29 },
  { name: 'Backend', windsurf: 74, cursor: 26 },
]

// ── Active users table data ──

const activeUsers = [
  { name: 'Priya Sharma', role: 'Staff Engineer', team: 'Product Engineering', assistant: 'Windsurf', lines: 5_320 },
  { name: 'Emily Rodriguez', role: 'Staff Engineer', team: 'Product Engineering', assistant: 'Windsurf', lines: 5_120 },
  { name: 'Jessica Taylor', role: 'Senior Software Engineer', team: 'Data Science', assistant: 'Windsurf', lines: 4_890 },
  { name: 'James Chen', role: 'Senior Software Engineer', team: 'Platform Engineering', assistant: 'Cursor', lines: 4_650 },
  { name: 'Sarah Chen', role: 'Staff Engineer', team: 'Platform Engineering', assistant: 'Cursor', lines: 4_320 },
  { name: 'David Park', role: 'Software Engineer', team: 'Product Engineering', assistant: 'Cursor', lines: 4_100 },
  { name: 'Ryan O\'Connor', role: 'Software Engineer', team: 'Product Engineering', assistant: 'Cursor', lines: 3_950 },
  { name: 'Marcus Williams', role: 'Senior Software Engineer', team: 'Product Engineering', assistant: 'Cursor', lines: 3_800 },
  { name: 'Olivia Martinez', role: 'Software Engineer', team: 'Data Science', assistant: 'Cursor', lines: 3_500 },
  { name: 'Daniel Patel', role: 'Software Engineer', team: 'Mobile Development', assistant: 'Cursor', lines: 2_970 },
  { name: 'Michael Zhang', role: 'Software Engineer', team: 'Quality Engineering', assistant: 'Cursor', lines: 2_890 },
]

// ── Shared chart constants ──

const TICK_STYLE = { fontSize: 12, fill: '#6B7280' }
const AXIS_LINE = { stroke: '#E5E7EB' }
const GRID_STROKE = 'var(--cn-border-2, #E5E7EB)'
const TOOLTIP_STYLE = { borderRadius: 8, fontSize: 13 }
const LEGEND_STYLE = { fontSize: 13, paddingTop: 12, fontFamily: "'JetBrains Mono', monospace" }
const WINDSURF_COLOR = '#2DA6FF'
const CURSOR_COLOR = '#D946EF'

const formatYAxis = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

const legendFormatter = (value: string) => <span style={{ color: '#4B5563' }}>{value}</span>

// ── Donut metric card ──

function DonutMetric({ title, subtitle, data, value, color, trend }: {
  title: string
  subtitle: string
  data: { name: string; value: number }[]
  value: string
  color: string
  trend: string
}) {
  const isPositive = trend.startsWith('+')
  return (
    <div className="flex flex-col items-center gap-3 rounded-cn-2 border border-borders-2 bg-white p-5 dark:bg-cn-1">
      <Text variant="body-strong" color="foreground-1">{title}</Text>
      <Text variant="caption-normal" color="foreground-3">{subtitle}</Text>
      <div className="relative" style={{ width: 140, height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="95%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              animationDuration={150}
            >
              <Cell fill={color} />
              <Cell fill="var(--cn-border-2, #E5E7EB)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: 1 }}>
          <Text variant="heading-section" color="foreground-1" className="font-semibold" style={{ marginTop: 6 }}>{value}</Text>
          <span className={`text-xs font-medium ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {trend}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Stacked bar chart card ──

function StackedBarCard({ title, subtitle, data, yAxisFormatter }: {
  title: string
  subtitle: string
  data: { name: string; windsurf: number; cursor: number }[]
  yAxisFormatter?: (value: number) => string
}) {
  return (
    <div className="flex flex-col gap-4 rounded-cn-2 border border-borders-2 bg-white p-5 dark:bg-cn-1">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <Text variant="body-strong" color="foreground-1">{title}</Text>
          <Text variant="caption-normal" color="foreground-3">{subtitle}</Text>
        </div>
        <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
          <IconV2 name="more-horizontal" size="sm" />
        </Button>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="8 6" vertical={false} stroke={GRID_STROKE} />
          <XAxis dataKey="name" tick={TICK_STYLE} axisLine={AXIS_LINE} tickLine={false} />
          <YAxis
            tickFormatter={yAxisFormatter ?? ((v: number) => `${v}%`)}
            tick={TICK_STYLE}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend iconType="square" iconSize={10} wrapperStyle={LEGEND_STYLE} formatter={legendFormatter} />
          <Bar dataKey="windsurf" name="Windsurf" fill={WINDSURF_COLOR} stackId="a" radius={[0, 0, 0, 0]} animationDuration={150} />
          <Bar dataKey="cursor" name="Cursor" fill={CURSOR_COLOR} stackId="a" radius={[4, 4, 0, 0]} animationDuration={150} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Main page ──

export function AIInsightsPage() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )
  const [timeRange, setTimeRange] = useState('12M')

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
        <div className="flex items-center justify-between">
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
            value="all"
            options={[
              { label: 'All Assistants', value: 'all' },
              { label: 'Windsurf', value: 'windsurf' },
              { label: 'Cursor', value: 'cursor' },
            ]}
            onChange={() => {}}
          />
        </div>

        {/* Donut metrics row */}
        <div className="grid grid-cols-3 gap-5">
          <DonutMetric
            title="AI Adoption Rate"
            subtitle="Last 12 months"
            data={adoptionData}
            value="75%"
            color="#10B981"
            trend="+21%"
          />
          <DonutMetric
            title="Usage: Acceptance Rate"
            subtitle="Last 12 months"
            data={acceptanceData}
            value="70.6%"
            color="#10B981"
            trend="+8.3%"
          />
          <DonutMetric
            title="Quality: Code Rework"
            subtitle="Last 12 months"
            data={reworkData}
            value="19.8%"
            color="#EF4444"
            trend="-4.2%"
          />
        </div>

        {/* Stats row below donuts */}
        <div className="grid grid-cols-3 gap-5">
          <div className="flex justify-between rounded-cn-2 border border-borders-2 bg-white px-5 py-3 dark:bg-cn-1">
            <div className="flex flex-col">
              <Text variant="caption-normal" color="foreground-3">Total developers</Text>
              <div className="flex items-baseline gap-1">
                <Text variant="heading-subsection" color="foreground-1">145</Text>
                <Text variant="caption-normal" color="success">+21%</Text>
              </div>
            </div>
            <div className="flex flex-col">
              <Text variant="caption-normal" color="foreground-3">Active developers</Text>
              <div className="flex items-baseline gap-1">
                <Text variant="heading-subsection" color="foreground-1">109</Text>
                <Text variant="caption-normal" color="success">+21%</Text>
              </div>
            </div>
            <div className="flex flex-col">
              <Text variant="caption-normal" color="foreground-3">Unadopted developers</Text>
              <div className="flex items-baseline gap-1">
                <Text variant="heading-subsection" color="foreground-1">36</Text>
              </div>
            </div>
          </div>
          <div className="flex justify-between rounded-cn-2 border border-borders-2 bg-white px-5 py-3 dark:bg-cn-1">
            <div className="flex flex-col">
              <Text variant="caption-normal" color="foreground-3">Lines suggested / Active Contrib...</Text>
              <div className="flex items-baseline gap-1">
                <Text variant="heading-subsection" color="foreground-1">2,338</Text>
                <Text variant="caption-normal" color="success">+18.5%</Text>
              </div>
            </div>
            <div className="flex flex-col">
              <Text variant="caption-normal" color="foreground-3">Lines accepted / Active Contrib...</Text>
              <div className="flex items-baseline gap-1">
                <Text variant="heading-subsection" color="foreground-1">1,650</Text>
                <Text variant="caption-normal" color="success">+21%</Text>
              </div>
            </div>
          </div>
          <div className="flex justify-between rounded-cn-2 border border-borders-2 bg-white px-5 py-3 dark:bg-cn-1">
            <div className="flex flex-col">
              <Text variant="caption-normal" color="foreground-3">Recent rework in 30 days</Text>
              <div className="flex items-baseline gap-1">
                <Text variant="heading-subsection" color="foreground-1">13.1%</Text>
              </div>
            </div>
            <div className="flex flex-col">
              <Text variant="caption-normal" color="foreground-3">Legacy rework</Text>
              <div className="flex items-baseline gap-1">
                <Text variant="heading-subsection" color="foreground-1">6.7%</Text>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Active Users + Net Lines charts */}
        <div className="grid grid-cols-2 gap-5">
          <StackedBarCard
            title="Daily Active Users by Assistant"
            subtitle="Last 12 months"
            data={dailyActiveData}
            yAxisFormatter={(v) => String(v)}
          />
          <StackedBarCard
            title="Net Lines Added Per Contributor"
            subtitle="Last 12 months"
            data={netLinesData}
            yAxisFormatter={formatYAxis}
          />
        </div>

        {/* Adoption & Acceptance rate by team */}
        <div className="grid grid-cols-2 gap-5">
          <StackedBarCard
            title="Adoption Rate by Team"
            subtitle="Last 12 months"
            data={teamData}
          />
          <StackedBarCard
            title="Acceptance Rate"
            subtitle="Last 12 months"
            data={acceptanceByTeamData}
          />
        </div>

        {/* Active users table */}
        <div className="rounded-cn-2 border border-borders-2 bg-white dark:bg-cn-1">
          <div className="p-5 pb-3">
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
              {activeUsers.map((user) => (
                <Table.Row key={user.name}>
                  <Table.Cell>{user.name}</Table.Cell>
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
