import { useState, useEffect } from 'react'
import {
  Text,
  Button,
  Tabs,
  DropdownMenu,
  IconV2,
} from '@harnessio/ui/components'
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
      </div>
    </div>
  )
}
