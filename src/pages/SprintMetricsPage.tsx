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
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { Nav2 } from '../components/Nav2'
import { Breadcrumb2 } from '../components/Breadcrumb2'
import { InsightMetricCard } from '../components/InsightMetricCard'

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

export function SprintMetricsPage() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )
  const [timeRange, setTimeRange] = useState('6M')
  const [selectedSprintBar, setSelectedSprintBar] = useState<number | null>(null)
  const [sprintDrillPage, setSprintDrillPage] = useState(1)
  const [sprintDrillPageSize, setSprintDrillPageSize] = useState(10)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light-std-low', 'dark-std-low')
    root.classList.add(dark ? 'dark-std-low' : 'light-std-low')
  }, [dark])

  // ── Chart styling constants ──
  const TICK_STYLE = { fontSize: 12, fill: '#6B7280' }
  const AXIS_LINE = { stroke: '#E5E7EB' }
  const GRID_STROKE = 'var(--cn-border-2, #E5E7EB)'
  const TOOLTIP_STYLE = { borderRadius: 8, fontSize: 13 }
  const LEGEND_STYLE = { fontSize: 13, paddingTop: 12, fontFamily: "'JetBrains Mono', monospace" }
  const CHART_MARGIN = { top: 8, right: 16, left: 0, bottom: 0 }
  const legendFormatter = (value: string) => <span style={{ color: '#4B5563' }}>{value}</span>
  const formatYAxis = (value: number) => {
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
    return String(value)
  }

  const COMMIT_COLOR = 'var(--cn-comp-data-viz-01-blue, lch(65% 56 255))'
  const CREEP_COLOR = 'var(--cn-comp-data-viz-02-purple, lch(58% 95 320))'
  const DELIVERED_COMMIT_COLOR = 'var(--cn-comp-data-viz-04-green, lch(56% 78 125))'
  const DELIVERED_CREEP_COLOR = 'var(--cn-comp-data-viz-03-pink, lch(58% 70 350))'

  // ── Sprint details chart data ──
  const sprintLabels = ['Sprint 67', 'Sprint 68', 'Sprint 69', 'Sprint 70', 'Sprint 71', 'Sprint 72']
  const sprintChartData = useMemo(() => {
    return sprintLabels.map((name) => ({
      name,
      sprintCommit: Math.round(300 + Math.random() * 200),
      sprintCreep: Math.round(200 + Math.random() * 300),
      deliveredCommit: Math.round(250 + Math.random() * 200),
      deliveredCreep: Math.round(150 + Math.random() * 300),
    }))
  }, [timeRange]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSprintBarClick = (index: number) => {
    setSelectedSprintBar(prev => prev === index ? null : index)
    setSprintDrillPage(1)
  }

  // ── Sprint drilldown data ──
  const SPRINT_DRILL_POOL = useMemo(() => [
    { sprint: 'Artifact Spri...', startDate: '31 Jan, 2026', endDate: '14 Feb, 2026', sprintCommit: '10 story poi...', deliveredCommit: '10 story poi...', sprintCreep: '30 story poi...', deliveredCreep: '30 story poi...', committedWorkDelivered: '100 %', totalWorkDelivered: '100 %', creepWorkDelivered: '100 %', workRemovalRate: '0 %' },
    { sprint: 'CLI-IAC 11', startDate: '02 Jan, 2026', endDate: '13 Feb, 2026', sprintCommit: '16 story poi...', deliveredCommit: '7 story points', sprintCreep: '31.7 story po...', deliveredCreep: '25.2 story p...', committedWorkDelivered: '43.75 %', totalWorkDelivered: '67.51 %', creepWorkDelivered: '79.5 %', workRemovalRate: '0 %' },
    { sprint: 'Franco', startDate: '08 Feb, 2026', endDate: '12 Feb, 2026', sprintCommit: '0 story points', deliveredCommit: '0 story points', sprintCreep: '4 story points', deliveredCreep: '4 story points', committedWorkDelivered: '0 %', totalWorkDelivered: '100 %', creepWorkDelivered: '100 %', workRemovalRate: '0 %' },
    { sprint: 'CDS Sprint 2...', startDate: '31 Jan, 2026', endDate: '12 Feb, 2026', sprintCommit: '84 story poi...', deliveredCommit: '83 story poi...', sprintCreep: '171 story poi...', deliveredCreep: '161 story poi...', committedWorkDelivered: '98.81 %', totalWorkDelivered: '95.69 %', creepWorkDelivered: '94.15 %', workRemovalRate: '0 %' },
    { sprint: 'PIPE Sprint ...', startDate: '30 Jan, 2026', endDate: '12 Feb, 2026', sprintCommit: '15 story poin...', deliveredCommit: '14 story poi...', sprintCreep: '93 story poi...', deliveredCreep: '87 story poi...', committedWorkDelivered: '93.33 %', totalWorkDelivered: '93.52 %', creepWorkDelivered: '93.55 %', workRemovalRate: '0 %' },
  ], [])

  const sprintDrilldownData = useMemo(() => {
    return SPRINT_DRILL_POOL
  }, [SPRINT_DRILL_POOL])

  const paginatedSprintDrill = useMemo(() => {
    const start = (sprintDrillPage - 1) * sprintDrillPageSize
    return sprintDrilldownData.slice(start, start + sprintDrillPageSize)
  }, [sprintDrilldownData, sprintDrillPage, sprintDrillPageSize])

  return (
    <div className="flex min-h-screen bg-cn-3">
      <Nav2 activeSection="insights" dark={dark} onThemeToggle={() => setDark(!dark)} />

      <div className="flex flex-1 flex-col gap-5 px-5 pb-5 pt-3">
        <Breadcrumb2 />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <Text as="h1" variant="heading-hero" color="foreground-1">Sprint Metrics</Text>
            <Text variant="body-normal" color="foreground-3">
              Sprint metrics measure team velocity, commitment accuracy, and scope creep across agile sprints.
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
            <Text variant="body-normal" color="foreground-1">10 Jan 2026, 09:30am</Text>
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Updated:</Text>
            <Text variant="body-normal" color="foreground-1">18 Feb 2026, 04:12pm</Text>
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

        {/* Metric cards — 4-col grid */}
        <div className="grid grid-cols-4 gap-5">
          {/* Row 1 */}
          <InsightMetricCard
            label="Sprint Commit"
            value="2401.1"
            subtitle="story points"
            trend="↑ 3"
            trendPositive
            badge="Work"
            infoTooltip="Total number of tickets committed at the start of the sprint."
          />
          <InsightMetricCard
            label="Sprint Creep"
            value="2855.5"
            subtitle="story points"
            trend="↓ 3"
            trendPositive
            badge="Work"
            infoTooltip="Number of tickets added to the sprint after it started. Tracks scope creep at the ticket level."
          />
          <InsightMetricCard
            label="Sprint Size"
            value="5256.6"
            subtitle="story points"
            trend="↑ 8%"
            trendPositive
            badge="Delivery"
            infoTooltip="Total story points committed at the start of the sprint."
          />
          <InsightMetricCard
            label="Average Sprint Size"
            value="73.01"
            subtitle="story points"
            trend="↑ 5%"
            trendPositive
            badge="Analysis"
            infoTooltip="Average story points per ticket in the sprint. Helps identify if work is being broken down into appropriately sized items."
          />
          {/* Row 2 */}
          <InsightMetricCard
            label="Scope Creep"
            value="118.92%"
            subtitle="of total work"
            trend="↓ 33%"
            trendPositive
            badge="Work"
            infoTooltip="Percentage of work added to the sprint after it started. Lower values indicate better sprint planning discipline."
          />
          <InsightMetricCard
            label="Delivered Commit"
            value="1887.1"
            subtitle="story points"
            trend="↑ 2"
            trendPositive
            badge="Delivery"
            infoTooltip="Number of committed tickets that were completed during the sprint."
          />
          <InsightMetricCard
            label="Missed Commit"
            value="514"
            subtitle="story points"
            trend="↓ 1"
            trendPositive
            badge="Work"
            infoTooltip="Number of committed tickets that were not completed by sprint end."
          />
          <InsightMetricCard
            label="Delivered Creep"
            value="2482"
            subtitle="story points"
            trend="↑ 33%"
            trendPositive
            badge="Delivery"
            infoTooltip="Number of creep tickets that were completed during the sprint."
          />
          {/* Row 3 */}
          <InsightMetricCard
            label="Missed Creep"
            value="373.5"
            subtitle="story points"
            trend="↓ 33%"
            trendPositive
            badge="Work"
            infoTooltip="Number of creep tickets that were not completed by sprint end."
          />
          <InsightMetricCard
            label="Work Delivered"
            value="4369.1"
            subtitle="story points"
            trend="↑ 4%"
            trendPositive
            badge="Delivery"
            infoTooltip="Total story points delivered in the sprint, including both committed and creep work."
          />
          <InsightMetricCard
            label="Sprint Velocity"
            value="60.68"
            subtitle="story points per sprint"
            trend="↑ 4%"
            trendPositive
            badge="Analysis"
            infoTooltip="Average number of story points completed per sprint. Tracks team throughput over time."
          />
          <InsightMetricCard
            label="Total Delivered Work vs Committed Work"
            value="1.82"
            subtitle="ratio"
            trend="↑ 0.03pts"
            trendPositive
            badge="Work"
            infoTooltip="Ratio of completed work to committed work. A value of 1.0 means the team delivered exactly what was planned."
          />
          {/* Row 4 */}
          <InsightMetricCard
            label="Churn Rate"
            value="126.5%"
            subtitle=""
            trend="↓ 12%"
            trendPositive
            badge="Analysis"
            infoTooltip="Story points added or removed from the sprint after it began. Measures sprint scope instability."
          />
          <InsightMetricCard
            label="Predictability Range"
            value="1.18"
            subtitle="story points"
            trend="↑ 33%"
            trendPositive
            badge="Analysis"
            infoTooltip="Range within which the team's delivery falls relative to their commitment. Higher values indicate more consistent delivery."
          />
          <InsightMetricCard
            label="Predictability %"
            value="40.48%"
            subtitle=""
            trend="↑ 4%"
            trendPositive
            badge="Analysis"
            infoTooltip="Percentage of committed items that were completed. Measures sprint predictability and follow-through."
          />
        </div>

        {/* Sprint Details — grouped & segmented bar chart */}
        <div className="group/card flex flex-col rounded-cn-2 border border-borders-2 bg-white dark:bg-cn-1">
          <div className="flex items-start justify-between p-5 pb-0">
            <Text variant="body-strong" color="foreground-1">Sprint Details</Text>
            <ExportMenu />
          </div>

          {/* 3 metric cards */}
          <div className="grid grid-cols-3 gap-4 px-5 pt-4">
            <InsightMetricCard
              label="Total Work Delivered"
              value="83.12%"
              badge="Delivery"
              infoTooltip="Percentage of total work (committed + creep) that was delivered during the sprint."
            />
            <InsightMetricCard
              label="Committed Work Delivered (%)"
              value="78.59%"
              badge="Work"
              infoTooltip="Percentage of originally committed work that was completed during the sprint."
            />
            <InsightMetricCard
              label="Creep Work Delivered"
              value="86.92%"
              badge="Work"
              infoTooltip="Percentage of scope creep work that was completed during the sprint."
            />
          </div>

          {/* Grouped + segmented bar chart */}
          <div className="p-5 pt-3">
            <svg width="0" height="0">
              <defs>
                <filter id="sprint-shadow-commit"><feDropShadow dx="0" dy="5" stdDeviation="6.5" floodColor={COMMIT_COLOR} floodOpacity="0.25" /></filter>
                <filter id="sprint-shadow-creep"><feDropShadow dx="0" dy="5" stdDeviation="6.5" floodColor={CREEP_COLOR} floodOpacity="0.25" /></filter>
                <filter id="sprint-shadow-delcommit"><feDropShadow dx="0" dy="5" stdDeviation="6.5" floodColor={DELIVERED_COMMIT_COLOR} floodOpacity="0.25" /></filter>
                <filter id="sprint-shadow-delcreep"><feDropShadow dx="0" dy="5" stdDeviation="6.5" floodColor={DELIVERED_CREEP_COLOR} floodOpacity="0.25" /></filter>
              </defs>
            </svg>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={sprintChartData}
                margin={CHART_MARGIN}
                barGap={2}
                onClick={(state: Record<string, unknown>) => {
                  const idx = state?.activeTooltipIndex
                  if (typeof idx === 'number') handleSprintBarClick(idx)
                }}
                style={{ cursor: 'pointer' }}
              >
                <CartesianGrid strokeDasharray="8 6" vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="name" tick={TICK_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                <YAxis tickFormatter={formatYAxis} tick={TICK_STYLE} axisLine={false} tickLine={false} width={48} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(0, 0, 0, 0.06)' }} />
                <Legend iconType="square" iconSize={10} wrapperStyle={LEGEND_STYLE} formatter={legendFormatter} />
                {/* Group 1: Sprint Commit + Sprint Creep (stacked) */}
                <Bar dataKey="sprintCommit" name="Sprint Commit" fill={COMMIT_COLOR} stackId="planned" radius={[0, 0, 4, 4]} barSize={36} style={{ filter: 'url(#sprint-shadow-commit)' }} animationDuration={150} cursor="pointer">
                  {selectedSprintBar != null && sprintChartData.map((_, i) => (
                    <Cell key={i} fillOpacity={i === selectedSprintBar ? 1 : 0.3} />
                  ))}
                </Bar>
                <Bar dataKey="sprintCreep" name="Sprint Creep" fill={CREEP_COLOR} stackId="planned" radius={[4, 4, 0, 0]} barSize={36} style={{ filter: 'url(#sprint-shadow-creep)' }} animationDuration={150} cursor="pointer">
                  {selectedSprintBar != null && sprintChartData.map((_, i) => (
                    <Cell key={i} fillOpacity={i === selectedSprintBar ? 1 : 0.3} />
                  ))}
                </Bar>
                {/* Group 2: Delivered Commit + Delivered Creep (stacked) */}
                <Bar dataKey="deliveredCommit" name="Delivered Commit" fill={DELIVERED_COMMIT_COLOR} stackId="delivered" radius={[0, 0, 4, 4]} barSize={36} style={{ filter: 'url(#sprint-shadow-delcommit)' }} animationDuration={150} cursor="pointer">
                  {selectedSprintBar != null && sprintChartData.map((_, i) => (
                    <Cell key={i} fillOpacity={i === selectedSprintBar ? 1 : 0.3} />
                  ))}
                </Bar>
                <Bar dataKey="deliveredCreep" name="Delivered Creep" fill={DELIVERED_CREEP_COLOR} stackId="delivered" radius={[4, 4, 0, 0]} barSize={36} style={{ filter: 'url(#sprint-shadow-delcreep)' }} animationDuration={150} cursor="pointer">
                  {selectedSprintBar != null && sprintChartData.map((_, i) => (
                    <Cell key={i} fillOpacity={i === selectedSprintBar ? 1 : 0.3} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Drilldown table */}
          <div className="px-5 pb-5 pt-2">
            <div className="flex items-center pb-2">
              <Text variant="body-strong" color="foreground-1">Drill-down</Text>
              {selectedSprintBar != null && (
                <div className="ml-auto">
                  <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip onClick={() => setSelectedSprintBar(null)}>
                    <IconV2 name="xmark" size="sm" />
                  </Button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <Table.Root variant="default" size="normal">
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Sprint</Table.Head>
                    <Table.Head>Start Date</Table.Head>
                    <Table.Head>End Date</Table.Head>
                    <Table.Head>Sprint Commit</Table.Head>
                    <Table.Head>Delivered Commit</Table.Head>
                    <Table.Head>Sprint Creep</Table.Head>
                    <Table.Head>Delivered Creep</Table.Head>
                    <Table.Head>Committed Work Delivered</Table.Head>
                    <Table.Head>Total Work Delivered</Table.Head>
                    <Table.Head>Creep Work Delivered</Table.Head>
                    <Table.Head>Work Removal Rate</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedSprintDrill.map((row) => (
                    <Table.Row key={row.sprint}>
                      <Table.Cell>
                        <span className="text-xs whitespace-nowrap" style={{ color: 'var(--cn-brand, #006DEA)' }}>{row.sprint}</span>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        <Text variant="body-normal" color="foreground-3">{row.startDate}</Text>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        <Text variant="body-normal" color="foreground-3">{row.endDate}</Text>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">{row.sprintCommit}</Table.Cell>
                      <Table.Cell className="whitespace-nowrap">{row.deliveredCommit}</Table.Cell>
                      <Table.Cell className="whitespace-nowrap">{row.sprintCreep}</Table.Cell>
                      <Table.Cell className="whitespace-nowrap">{row.deliveredCreep}</Table.Cell>
                      <Table.Cell className="whitespace-nowrap">{row.committedWorkDelivered}</Table.Cell>
                      <Table.Cell className="whitespace-nowrap">{row.totalWorkDelivered}</Table.Cell>
                      <Table.Cell className="whitespace-nowrap">{row.creepWorkDelivered}</Table.Cell>
                      <Table.Cell className="whitespace-nowrap">{row.workRemovalRate}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </div>
            <div className="rounded-b-cn-2 border border-t-0 border-borders-2 px-4 pb-3 pt-0.5">
              <Pagination
                totalItems={sprintDrilldownData.length}
                pageSize={sprintDrillPageSize}
                currentPage={sprintDrillPage}
                goToPage={setSprintDrillPage}
                onPageSizeChange={(size) => { setSprintDrillPageSize(size); setSprintDrillPage(1) }}
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
