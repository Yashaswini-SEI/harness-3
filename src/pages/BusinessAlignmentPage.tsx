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
import { StackedBarChart } from '../components/Charts'

// ── Deterministic jitter ──

function jitter(seed: string, base: number, variance: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  const t = (Math.abs(h) % 1000) / 1000
  return Math.round(base + (t - 0.5) * 2 * variance)
}

// ── Time range profiles ──

const TIME_RANGE_PROFILES: Record<string, {
  scale: number
  labels: string[]
}> = {
  '7D': { scale: 0.12, labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  '1M': { scale: 0.35, labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'] },
  '3M': { scale: 0.55, labels: ['Dec', 'Jan', 'Feb'] },
  '6M': { scale: 0.78, labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'] },
  '12M': { scale: 1, labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'] },
  custom: { scale: 1, labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'] },
}

// ── Stacked bar series ──

const CATEGORY_COLORS = {
  compliance: 'var(--cn-comp-data-viz-01-blue, lch(65% 56 255))',
  newCapability: 'var(--cn-comp-data-viz-02-purple, lch(58% 95 320))',
  ktlo: 'var(--cn-comp-data-viz-03-pink, lch(58% 70 350))',
  quality: 'var(--cn-comp-data-viz-04-green, lch(56% 78 125))',
  uncategorized: 'var(--cn-comp-data-viz-05-indigo, lch(51% 77.5 280))',
}

const ALIGNMENT_SERIES = [
  { dataKey: 'compliance', name: 'Data & Security Compliance', color: CATEGORY_COLORS.compliance },
  { dataKey: 'newCapability', name: 'New Capability', color: CATEGORY_COLORS.newCapability },
  { dataKey: 'ktlo', name: 'KTLO', color: CATEGORY_COLORS.ktlo },
  { dataKey: 'quality', name: 'Quality Improvements', color: CATEGORY_COLORS.quality },
  { dataKey: 'uncategorized', name: 'Uncategorized', color: CATEGORY_COLORS.uncategorized },
]

// Base values per metric type — produces different chart distributions
const METRIC_TYPE_BASES: Record<string, { compliance: number; newCapability: number; ktlo: number; quality: number; uncategorized: number }> = {
  'ticket-count': { compliance: 18, newCapability: 30, ktlo: 22, quality: 15, uncategorized: 8 },
  'story-points': { compliance: 24, newCapability: 22, ktlo: 16, quality: 20, uncategorized: 6 },
  'ticket-time-spent': { compliance: 14, newCapability: 26, ktlo: 28, quality: 18, uncategorized: 10 },
}

const SERIES_KEYS = ['compliance', 'newCapability', 'ktlo', 'quality', 'uncategorized'] as const

// ── Ticket data pool ──

interface Ticket {
  ticket: string
  title: string
  category: string
  team: string
  owner: string
  status: string
  effort: string
  priority: string
}

const TICKET_POOL: Ticket[] = [
  { ticket: 'ENG-1042', title: 'SOC2 audit logging for auth service', category: 'Data & Security Compliance', team: 'Platform', owner: 'Harshil Garg', status: 'Done', effort: '5 SP', priority: 'High' },
  { ticket: 'ENG-1038', title: 'Add MFA enforcement for admin roles', category: 'Data & Security Compliance', team: 'Identity', owner: 'Priya Nair', status: 'Done', effort: '8 SP', priority: 'Critical' },
  { ticket: 'ENG-1051', title: 'Real-time dashboard widget framework', category: 'New Capability', team: 'Frontend', owner: 'Arjun Singh', status: 'In Progress', effort: '13 SP', priority: 'High' },
  { ticket: 'ENG-1047', title: 'Webhook retry with exponential backoff', category: 'New Capability', team: 'Backend', owner: 'Challa Reddy', status: 'Done', effort: '5 SP', priority: 'Medium' },
  { ticket: 'ENG-1055', title: 'Upgrade Node.js to v20 LTS', category: 'KTLO', team: 'Platform', owner: 'Karthik Nayak', status: 'In Review', effort: '3 SP', priority: 'Medium' },
  { ticket: 'ENG-1060', title: 'Fix flaky integration test suite', category: 'Quality Improvements', team: 'QA', owner: 'Meet Rathod', status: 'Done', effort: '5 SP', priority: 'High' },
  { ticket: 'ENG-1063', title: 'Investigate memory leak in worker pool', category: 'Uncategorized', team: 'Backend', owner: 'Jyoti Arora', status: 'In Progress', effort: '8 SP', priority: 'High' },
  { ticket: 'ENG-1044', title: 'GDPR data export endpoint', category: 'Data & Security Compliance', team: 'Platform', owner: 'Riyas P', status: 'Done', effort: '8 SP', priority: 'Medium' },
  { ticket: 'ENG-1070', title: 'API rate limiting per tenant', category: 'New Capability', team: 'Backend', owner: 'Mahesh Sankaran', status: 'In Progress', effort: '8 SP', priority: 'High' },
  { ticket: 'ENG-1073', title: 'Deprecate legacy REST v1 endpoints', category: 'KTLO', team: 'Platform', owner: 'Shashwat Pandey', status: 'Done', effort: '5 SP', priority: 'Low' },
  { ticket: 'ENG-1076', title: 'Add E2E tests for onboarding flow', category: 'Quality Improvements', team: 'QA', owner: 'Rajarshee Chatterjee', status: 'Done', effort: '5 SP', priority: 'Medium' },
  { ticket: 'ENG-1079', title: 'Implement SSO SAML provider', category: 'Data & Security Compliance', team: 'Identity', owner: 'Harshil Garg', status: 'In Review', effort: '13 SP', priority: 'Critical' },
  { ticket: 'ENG-1082', title: 'Customer-facing changelog page', category: 'New Capability', team: 'Frontend', owner: 'Arjun Singh', status: 'In Progress', effort: '5 SP', priority: 'Medium' },
  { ticket: 'ENG-1085', title: 'Database connection pool tuning', category: 'KTLO', team: 'Backend', owner: 'Challa Reddy', status: 'Done', effort: '3 SP', priority: 'Low' },
  { ticket: 'ENG-1088', title: 'Reduce CI pipeline build time', category: 'Quality Improvements', team: 'Platform', owner: 'Karthik Nayak', status: 'Done', effort: '5 SP', priority: 'Medium' },
  { ticket: 'ENG-1091', title: 'Unplanned spike: debug auth failures', category: 'Uncategorized', team: 'Identity', owner: 'Priya Nair', status: 'Done', effort: '3 SP', priority: 'High' },
  { ticket: 'ENG-1094', title: 'Terraform module for new staging env', category: 'KTLO', team: 'Platform', owner: 'Riyas P', status: 'In Progress', effort: '8 SP', priority: 'Medium' },
  { ticket: 'ENG-1097', title: 'GraphQL schema federation setup', category: 'New Capability', team: 'Backend', owner: 'Mahesh Sankaran', status: 'In Review', effort: '13 SP', priority: 'High' },
  { ticket: 'ENG-1100', title: 'Accessibility audit and fixes', category: 'Quality Improvements', team: 'Frontend', owner: 'Jyoti Arora', status: 'In Progress', effort: '8 SP', priority: 'Medium' },
  { ticket: 'ENG-1103', title: 'Investigate 3rd-party SDK update', category: 'Uncategorized', team: 'Mobile', owner: 'Meet Rathod', status: 'Done', effort: '3 SP', priority: 'Low' },
  { ticket: 'ENG-1106', title: 'Rotate secrets and API keys', category: 'Data & Security Compliance', team: 'Platform', owner: 'Karthik Nayak', status: 'Done', effort: '3 SP', priority: 'High' },
  { ticket: 'ENG-1109', title: 'Build notification preferences UI', category: 'New Capability', team: 'Frontend', owner: 'Jyoti Arora', status: 'In Progress', effort: '8 SP', priority: 'Medium' },
  { ticket: 'ENG-1112', title: 'Migrate cron jobs to k8s CronJob', category: 'KTLO', team: 'Platform', owner: 'Riyas P', status: 'Done', effort: '5 SP', priority: 'Medium' },
  { ticket: 'ENG-1115', title: 'Add contract tests for billing API', category: 'Quality Improvements', team: 'Backend', owner: 'Challa Reddy', status: 'Done', effort: '5 SP', priority: 'High' },
  { ticket: 'ENG-1118', title: 'Spike: evaluate feature flag providers', category: 'Uncategorized', team: 'Platform', owner: 'Shashwat Pandey', status: 'Done', effort: '3 SP', priority: 'Low' },
  { ticket: 'ENG-1121', title: 'Implement RBAC for project settings', category: 'Data & Security Compliance', team: 'Identity', owner: 'Priya Nair', status: 'In Progress', effort: '13 SP', priority: 'Critical' },
  { ticket: 'ENG-1124', title: 'Multi-region failover support', category: 'New Capability', team: 'Platform', owner: 'Harshil Garg', status: 'In Review', effort: '13 SP', priority: 'High' },
  { ticket: 'ENG-1127', title: 'Consolidate logging libraries', category: 'KTLO', team: 'Backend', owner: 'Mahesh Sankaran', status: 'Done', effort: '3 SP', priority: 'Low' },
  { ticket: 'ENG-1130', title: 'Load test checkout flow at 10x scale', category: 'Quality Improvements', team: 'QA', owner: 'Meet Rathod', status: 'In Progress', effort: '8 SP', priority: 'High' },
  { ticket: 'ENG-1133', title: 'Research gRPC migration feasibility', category: 'Uncategorized', team: 'Backend', owner: 'Arjun Singh', status: 'Done', effort: '5 SP', priority: 'Medium' },
  { ticket: 'ENG-1136', title: 'PCI DSS compliance for payment module', category: 'Data & Security Compliance', team: 'Backend', owner: 'Challa Reddy', status: 'In Progress', effort: '13 SP', priority: 'Critical' },
  { ticket: 'ENG-1139', title: 'In-app guided product tour', category: 'New Capability', team: 'Frontend', owner: 'Rajarshee Chatterjee', status: 'Done', effort: '8 SP', priority: 'Medium' },
  { ticket: 'ENG-1142', title: 'Bump Postgres to v16', category: 'KTLO', team: 'Platform', owner: 'Karthik Nayak', status: 'Done', effort: '5 SP', priority: 'Medium' },
  { ticket: 'ENG-1145', title: 'Mutation testing for core domain', category: 'Quality Improvements', team: 'QA', owner: 'Rajarshee Chatterjee', status: 'In Review', effort: '8 SP', priority: 'Medium' },
  { ticket: 'ENG-1148', title: 'Triage backlog of stale issues', category: 'Uncategorized', team: 'Mobile', owner: 'Jyoti Arora', status: 'Done', effort: '2 SP', priority: 'Low' },
  { ticket: 'ENG-1151', title: 'Encrypt PII fields at rest', category: 'Data & Security Compliance', team: 'Backend', owner: 'Mahesh Sankaran', status: 'Done', effort: '8 SP', priority: 'High' },
  { ticket: 'ENG-1154', title: 'Bulk import/export for admin panel', category: 'New Capability', team: 'Frontend', owner: 'Shashwat Pandey', status: 'In Progress', effort: '8 SP', priority: 'Medium' },
  { ticket: 'ENG-1157', title: 'Pin CI runner image versions', category: 'KTLO', team: 'Platform', owner: 'Riyas P', status: 'Done', effort: '2 SP', priority: 'Low' },
  { ticket: 'ENG-1160', title: 'Visual regression testing pipeline', category: 'Quality Improvements', team: 'Frontend', owner: 'Arjun Singh', status: 'Done', effort: '5 SP', priority: 'High' },
  { ticket: 'ENG-1163', title: 'Prototype AI search suggestions', category: 'Uncategorized', team: 'Backend', owner: 'Harshil Garg', status: 'In Progress', effort: '5 SP', priority: 'Medium' },
]

// Deterministic seeded shuffle — returns a new array order for each seed
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

// ── Helpers ──

function statusTheme(status: string): 'success' | 'warning' | 'info' | 'muted' {
  switch (status) {
    case 'Done': return 'success'
    case 'In Progress': return 'warning'
    case 'In Review': return 'info'
    default: return 'muted'
  }
}

// ── Metric card ──

function MetricCard({ label, value, trend, color }: { label: string; value: string; trend: string; color: string }) {
  const isNegative = trend.startsWith('-')

  return (
    <div className="flex flex-col gap-1 rounded-cn-2 border border-borders-2 bg-white p-5 dark:bg-cn-1">
      <div className="flex items-center gap-1.5">
        <span className="inline-block shrink-0 rounded-sm" style={{ width: 8, height: 8, backgroundColor: color }} />
        <Text variant="caption-normal" color="foreground-3">{label}</Text>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-foreground-1 font-semibold" style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, lineHeight: 1 }}>
          {value}
        </span>
        {trend && (
          <span className={`mb-0.5 text-xs font-medium ${isNegative ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Main page ──

export function BusinessAlignmentPage() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )
  const [timeRange, setTimeRange] = useState('12M')
  const [metricType, setMetricType] = useState('ticket-count')
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null)
  const [drillPage, setDrillPage] = useState(1)
  const [drillPageSize, setDrillPageSize] = useState(10)

  const profile = TIME_RANGE_PROFILES[timeRange] ?? TIME_RANGE_PROFILES['12M']

  // Generate chart data from profile labels + metric type
  const chartData = useMemo(() => {
    const bases = METRIC_TYPE_BASES[metricType] ?? METRIC_TYPE_BASES['ticket-count']
    return profile.labels.map((name, i) => ({
      name,
      compliance: jitter(`comp${name}${i}${metricType}`, Math.round(bases.compliance * profile.scale) + i, 5),
      newCapability: jitter(`cap${name}${i}${metricType}`, Math.round(bases.newCapability * profile.scale) + i * 2, 8),
      ktlo: jitter(`ktlo${name}${i}${metricType}`, Math.round(bases.ktlo * profile.scale) + i, 6),
      quality: jitter(`qual${name}${i}${metricType}`, Math.round(bases.quality * profile.scale) + i, 4),
      uncategorized: jitter(`uncat${name}${i}${metricType}`, Math.round(bases.uncategorized * profile.scale), 3),
    }))
  }, [profile, metricType])

  // Derive metric card percentages from chart totals
  const metricValues = useMemo(() => {
    const totals = Object.fromEntries(SERIES_KEYS.map(k => [k, chartData.reduce((s, d) => s + (d[k] as number), 0)])) as Record<typeof SERIES_KEYS[number], number>
    const grand = Object.values(totals).reduce((a, b) => a + b, 0)
    return Object.fromEntries(SERIES_KEYS.map(k => [k, grand > 0 ? ((totals[k] / grand) * 100).toFixed(2) + '%' : '0%'])) as Record<typeof SERIES_KEYS[number], string>
  }, [chartData])

  // Trends vary by metric type + time range
  const metricTrends = useMemo(() =>
    Object.fromEntries(SERIES_KEYS.map(k => {
      const v = jitter(`trend-${k}-${metricType}-${timeRange}`, 0, 120) / 100
      return [k, v === 0 ? '' : (v > 0 ? '+' : '') + v.toFixed(2) + '%']
    })) as Record<typeof SERIES_KEYS[number], string>,
    [metricType, timeRange]
  )

  const handleBarClick = (index: number) => {
    setSelectedBarIndex(prev => prev === index ? null : index)
    setDrillPage(1)
  }

  // Drilldown table — seeded by selected bar + metric type so it "refreshes" on changes
  const metricSeed = metricType === 'story-points' ? 7919 : metricType === 'ticket-time-spent' ? 15373 : 1
  const drilldownData = useMemo(
    () => seededShuffle(TICKET_POOL, (selectedBarIndex != null ? (selectedBarIndex + 1) * 4327 : 1) + metricSeed),
    [selectedBarIndex, metricSeed]
  )

  const paginatedDrilldown = useMemo(() => {
    const start = (drillPage - 1) * drillPageSize
    return drilldownData.slice(start, start + drillPageSize)
  }, [drilldownData, drillPage, drillPageSize])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light-std-low', 'dark-std-low')
    root.classList.add(dark ? 'dark-std-low' : 'light-std-low')
  }, [dark])

  // Reset selected bar when time range or metric type changes
  useEffect(() => {
    setSelectedBarIndex(null)
  }, [timeRange, metricType])

  return (
    <div className="flex min-h-screen bg-cn-3">
      <Nav2 activeSection="insights" dark={dark} onThemeToggle={() => setDark(!dark)} />

      <div className="flex flex-1 flex-col gap-5 px-5 pb-5 pt-3">
        <Breadcrumb2 />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <Text as="h1" variant="heading-hero" color="foreground-1">Business Alignment</Text>
            <Text variant="body-normal" color="foreground-3">
              Business alignment is the strategic fit between a company's software initiatives and its core business goals to maximize value and impact.
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
            <Text variant="body-normal" color="foreground-1">15 Dec 2025, 10:22am</Text>
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Updated:</Text>
            <Text variant="body-normal" color="foreground-1">18 Feb 2026, 02:15pm</Text>
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Org</Text>
            <Text variant="body-normal" color="foreground-1">Harness SEI</Text>
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Tags</Text>
            <Tag variant="outline" theme="gray" size="sm" value="Alignment" />
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
          <Select
            value={metricType}
            options={[
              { label: 'Showing Story Points', value: 'story-points' },
              { label: 'Showing Ticket Count', value: 'ticket-count' },
              { label: 'Showing Ticket Time Spent', value: 'ticket-time-spent' },
            ]}
            onChange={(val) => setMetricType(val)}
          />
        </div>

        {/* Row 1: Metric cards */}
        <div className="grid grid-cols-5 gap-5">
          <MetricCard label="Security and Compliance" value={metricValues.compliance} trend={metricTrends.compliance} color={CATEGORY_COLORS.compliance} />
          <MetricCard label="New Capability" value={metricValues.newCapability} trend={metricTrends.newCapability} color={CATEGORY_COLORS.newCapability} />
          <MetricCard label="KTLO" value={metricValues.ktlo} trend={metricTrends.ktlo} color={CATEGORY_COLORS.ktlo} />
          <MetricCard label="Quality Improvements" value={metricValues.quality} trend={metricTrends.quality} color={CATEGORY_COLORS.quality} />
          <MetricCard label="Uncategorized" value={metricValues.uncategorized} trend={metricTrends.uncategorized} color={CATEGORY_COLORS.uncategorized} />
        </div>

        {/* Row 2: Interactive stacked bar chart */}
        <div className="group/card flex flex-col rounded-cn-2 border border-borders-2 bg-white dark:bg-cn-1">
          <div className="flex items-start justify-between p-5 pb-0">
            <div className="flex flex-col gap-0.5">
              <Text variant="body-strong" color="foreground-1">Work Categorization Over Time</Text>
              <Text variant="caption-normal" color="foreground-3">Click a bar to see ticket-level breakdown</Text>
            </div>
            <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
              <IconV2 name="more-horizontal" size="sm" />
            </Button>
          </div>
          <div className="p-5 pt-3">
            <StackedBarChart
              data={chartData}
              series={ALIGNMENT_SERIES}
              height={300}
              onBarClick={handleBarClick}
              selectedIndex={selectedBarIndex}
            />
          </div>
          {/* Drilldown table */}
          <div className="border-t border-borders-2 p-5">
            <div className="flex items-center pb-3">
              <div className="flex items-center gap-1.5">
                <Text variant="body-strong" color="foreground-1">Business Alignment Drilldown</Text>
                <div className="relative opacity-0 transition-opacity group-hover/card:opacity-100">
                  <div className="group/tip">
                    <IconV2 name="info-circle" size="xs" className="text-foreground-4 cursor-help" />
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-hover/tip:pointer-events-auto group-hover/tip:opacity-100">
                      <div className="w-80 rounded-lg bg-cn-0 px-4 py-3 text-xs text-foreground-2 shadow-lg border border-borders-2 space-y-3">
                        <div>
                          <strong className="text-foreground-1">Definition</strong>
                          <p className="mt-1">Ticket-level view of engineering work categorized by business alignment, showing how individual efforts map to strategic objectives.</p>
                        </div>
                        <div>
                          <strong className="text-foreground-1">How to read this</strong>
                          <p className="mt-1">Each row represents a single ticket. Use the category filter to focus on specific alignment areas and identify uncategorized work that may need classification.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <Select
                  value=""
                  options={[
                    { label: 'All Categories', value: '' },
                    { label: 'Data & Security Compliance', value: 'compliance' },
                    { label: 'New Capability', value: 'new-capability' },
                    { label: 'KTLO', value: 'ktlo' },
                    { label: 'Quality Improvements', value: 'quality' },
                    { label: 'Uncategorized', value: 'uncategorized' },
                  ]}
                  onChange={() => {}}
                />
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
                      <Table.Head>Ticket</Table.Head>
                      <Table.Head>Title</Table.Head>
                      <Table.Head>Category</Table.Head>
                      <Table.Head>Team</Table.Head>
                      <Table.Head>Owner</Table.Head>
                      <Table.Head>Status</Table.Head>
                      <Table.Head className="text-right">{metricType === 'ticket-time-spent' ? 'Time Spent' : metricType === 'story-points' ? 'Story Points' : 'Count'}</Table.Head>
                      <Table.Head>Priority</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedDrilldown.map((row) => (
                      <Table.Row key={row.ticket}>
                        <Table.Cell>
                          <Text variant="body-normal" color="foreground-1" className="font-mono text-xs">{row.ticket}</Text>
                        </Table.Cell>
                        <Table.Cell className="max-w-[300px]">
                          <Text variant="body-normal" color="foreground-1" className="truncate">{row.title}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Tag variant="outline" theme="gray" size="sm" value={row.category} />
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap">{row.team}</Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            <div className="flex shrink-0 items-center justify-center bg-[rgba(0,109,234,0.15)] text-sm font-medium text-[#006DEA]" style={{ width: 32, height: 32, borderRadius: '50%' }}>
                              {row.owner.split(' ').map(n => n[0]).join('')}
                            </div>
                            <Text variant="body-normal" color="foreground-1" className="whitespace-nowrap">{row.owner}</Text>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <StatusBadge variant="outline" theme={statusTheme(row.status)} size="sm">{row.status}</StatusBadge>
                        </Table.Cell>
                        <Table.Cell className="text-right">
                          {metricType === 'story-points' ? row.effort
                            : metricType === 'ticket-time-spent' ? (parseInt(row.effort) * 4) + 'h'
                            : '1'}
                        </Table.Cell>
                        <Table.Cell>
                          <Tag
                            variant="outline"
                            theme={row.priority === 'Critical' ? 'red' : row.priority === 'High' ? 'yellow' : row.priority === 'Medium' ? 'blue' : 'gray'}
                            size="sm"
                            value={row.priority}
                          />
                        </Table.Cell>
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
