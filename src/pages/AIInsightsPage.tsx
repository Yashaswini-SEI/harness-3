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
import { Nav2 } from '../components/Nav2'
import { Breadcrumb2 } from '../components/Breadcrumb2'
import { DonutChart, StackedBarChart, formatYAxis } from '../components/Charts'

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

// ── Chart constants ──

const WINDSURF_COLOR = '#2DA6FF'
const CURSOR_COLOR = '#D946EF'

const ASSISTANT_SERIES = [
  { dataKey: 'windsurf', name: 'Windsurf', color: WINDSURF_COLOR },
  { dataKey: 'cursor', name: 'Cursor', color: CURSOR_COLOR },
]

// ── Donut metric card ──

function DonutMetricCard({ title, subtitle, data, metric, color, trend, children }: {
  title: string
  subtitle: string
  data: { name: string; value: number }[]
  metric: string
  color: string
  trend: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col rounded-cn-2 border border-borders-2 bg-white dark:bg-cn-1">
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-0.5">
          <Text variant="body-strong" color="foreground-1">{title}</Text>
          <Text variant="caption-normal" color="foreground-3">{subtitle}</Text>
        </div>
        <DonutChart data={data} height={168} color={color} metric={metric} trend={trend} />
      </div>
      {children}
    </div>
  )
}

// ── Chart card wrapper ──

function ChartCard({ title, subtitle, children }: {
  title: string
  subtitle: string
  children: React.ReactNode
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
          <DonutMetricCard
            title="AI Adoption Rate"
            subtitle="Last 12 months"
            data={adoptionData}
            metric="75%"
            color="#10B981"
            trend="+21%"
          >
            <div className="border-t border-borders-2">
              {[
                { label: 'Total developers', value: '145', change: '+21%', positive: true },
                { label: 'Active developers', value: '109', change: '+21%', positive: true },
                { label: 'Inactive developers', value: '36', change: '+21%', positive: true },
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
            title="Usage: Acceptance Rate"
            subtitle="Last 12 months"
            data={acceptanceData}
            metric="70.6%"
            color="#10B981"
            trend="+8.3%"
          >
            <div className="border-t border-borders-2">
              {[
                { label: 'Lines suggested / Active Contrib...', value: '2,338', change: '+18.5%', positive: true },
                { label: 'Lines accepted / Active Contrib...', value: '1,650', change: '+21%', positive: true },
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
            title="Quality: Code Rework"
            subtitle="Last 12 months"
            data={reworkData}
            metric="19.8%"
            color="#EF4444"
            trend="-4.2%"
          >
            <div className="border-t border-borders-2">
              {[
                { label: 'Recent rework in 30 days', value: '13.1%', change: '', positive: true },
                { label: 'Legacy rework', value: '6.7%', change: '', positive: true },
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
          <ChartCard title="Daily Active Users by Assistant" subtitle="Last 12 months">
            <StackedBarChart data={dailyActiveData} series={ASSISTANT_SERIES} height={240} yAxisFormatter={(v) => String(v)} />
          </ChartCard>
          <ChartCard title="Net Lines Added Per Contributor" subtitle="Last 12 months">
            <StackedBarChart data={netLinesData} series={ASSISTANT_SERIES} height={240} yAxisFormatter={formatYAxis} />
          </ChartCard>
        </div>

        {/* Adoption & Acceptance rate by team */}
        <div className="grid grid-cols-2 gap-5">
          <ChartCard title="Adoption Rate by Team" subtitle="Last 12 months">
            <StackedBarChart data={teamData} series={ASSISTANT_SERIES} height={240} yAxisFormatter={(v) => `${v}%`} />
          </ChartCard>
          <ChartCard title="Acceptance Rate" subtitle="Last 12 months">
            <StackedBarChart data={acceptanceByTeamData} series={ASSISTANT_SERIES} height={240} yAxisFormatter={(v) => `${v}%`} />
          </ChartCard>
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
