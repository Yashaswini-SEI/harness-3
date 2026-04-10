import { useState, useMemo } from 'react'
import {
  Text,
  Button,
  IconV2,
  Card,
  Table,
  Select,
  StatusBadge,
  Pagination,
} from '@harnessio/ui/components'
import { Nav2 } from '../components/Nav2'
import { OrgTreeNav } from '../components/OrgTreeNav'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'

// ── Types ──

type Stage = 'planning' | 'development' | 'build' | 'deployment'
type PlanningSubStage = 'todo' | 'needs-spec' | 'ready-for-dev'
type DevelopmentSubStage = 'pr-creation' | 'first-comment' | 'first-approval' | 'last-approval' | 'pr-merge'
type BuildSubStage = 'unit-tests' | 'security-scan' | 'push-image'
type DeploymentSubStage = 'deploy-dev' | 'deploy-qa' | 'deploy-cert' | 'deploy-prod'
type SubStage = PlanningSubStage | DevelopmentSubStage | BuildSubStage | DeploymentSubStage

interface StageExpansion {
  stage: Stage | null
  subStage: SubStage | null
}

// ── Constants ──

const STAGE_COLORS = {
  planning: 'var(--cn-comp-data-viz-01-blue, lch(65% 56 255))',
  development: 'var(--cn-comp-data-viz-02-purple, lch(58% 95 320))',
  build: 'var(--cn-comp-data-viz-04-green, lch(56% 78 125))',
  deployment: 'var(--cn-comp-data-viz-05-indigo, lch(51% 77.5 280))',
}

const SUBSTAGE_LABELS: Record<SubStage, string> = {
  'todo': 'To Do',
  'needs-spec': 'Needs Spec',
  'ready-for-dev': 'Ready for Dev',
  'pr-creation': 'PR Creation',
  'first-comment': 'First Comment',
  'first-approval': 'First Approval',
  'last-approval': 'Last Approval',
  'pr-merge': 'PR Merge',
  'unit-tests': 'Unit Tests',
  'security-scan': 'Security Scan',
  'push-image': 'Push Image',
  'deploy-dev': 'Deploy Dev',
  'deploy-qa': 'Deploy QA',
  'deploy-cert': 'Deploy Cert',
  'deploy-prod': 'Deploy Prod',
}

const STAGE_SUBSTAGES: Record<Stage, SubStage[]> = {
  planning: ['todo', 'needs-spec', 'ready-for-dev'],
  development: ['pr-creation', 'first-comment', 'first-approval', 'last-approval', 'pr-merge'],
  build: ['unit-tests', 'security-scan', 'push-image'],
  deployment: ['deploy-dev', 'deploy-qa', 'deploy-cert', 'deploy-prod'],
}

// ── Mock Data ──

const OVERVIEW_DATA = [
  { name: 'Total', planning: 2.5, development: 4.2, build: 1.3, deployment: 3.8 }
]

interface WorkItem {
  id: string
  summary: string
  prId?: string
  executionId?: string
  totalLeadTime: string
  planningTime?: string
  developmentTime?: string
  buildTime?: string
  deploymentTime?: string
  subStageTime?: string
  status: string
  startTime: string
  endTime: string
}

const WORK_ITEMS: WorkItem[] = [
  { id: 'ENG-1042', summary: 'SOC2 audit logging for auth service', prId: 'PR-542', executionId: 'exec-1201', totalLeadTime: '12d 4h', planningTime: '2d 6h', developmentTime: '4d 2h', buildTime: '1d 3h', deploymentTime: '3d 8h', status: 'Done', startTime: '2024-01-15 09:00', endTime: '2024-01-27 13:00' },
  { id: 'ENG-1038', summary: 'Add MFA enforcement for admin roles', prId: 'PR-539', executionId: 'exec-1198', totalLeadTime: '9d 2h', planningTime: '1d 4h', developmentTime: '3d 6h', buildTime: '1d 1h', deploymentTime: '2d 8h', status: 'Done', startTime: '2024-01-10 10:00', endTime: '2024-01-19 12:00' },
  { id: 'ENG-1051', summary: 'Real-time dashboard widget framework', prId: 'PR-548', executionId: 'exec-1207', totalLeadTime: '15d 6h', planningTime: '3d 2h', developmentTime: '6d 4h', buildTime: '1d 8h', deploymentTime: '4d 4h', status: 'Done', startTime: '2024-01-05 08:00', endTime: '2024-01-20 14:00' },
  { id: 'ENG-1047', summary: 'Webhook retry with exponential backoff', prId: 'PR-544', executionId: 'exec-1203', totalLeadTime: '8d 3h', planningTime: '1d 2h', developmentTime: '3d 1h', buildTime: '1d 0h', deploymentTime: '2d 6h', status: 'Done', startTime: '2024-01-12 11:00', endTime: '2024-01-20 14:00' },
  { id: 'ENG-1055', summary: 'Upgrade Node.js to v20 LTS', prId: 'PR-551', executionId: 'exec-1210', totalLeadTime: '6d 8h', planningTime: '0d 8h', developmentTime: '2d 4h', buildTime: '1d 2h', deploymentTime: '2d 2h', status: 'Done', startTime: '2024-01-18 09:00', endTime: '2024-01-24 17:00' },
  { id: 'ENG-1060', summary: 'Fix flaky integration test suite', prId: 'PR-555', executionId: 'exec-1214', totalLeadTime: '5d 4h', planningTime: '0d 6h', developmentTime: '2d 2h', buildTime: '0d 8h', deploymentTime: '1d 12h', status: 'Done', startTime: '2024-01-22 10:00', endTime: '2024-01-27 14:00' },
  { id: 'ENG-1063', summary: 'Investigate memory leak in worker pool', prId: 'PR-558', executionId: 'exec-1217', totalLeadTime: '10d 5h', planningTime: '2d 0h', developmentTime: '4d 3h', buildTime: '1d 4h', deploymentTime: '2d 10h', status: 'In Progress', startTime: '2024-01-08 08:00', endTime: '2024-01-18 13:00' },
  { id: 'ENG-1044', summary: 'GDPR data export endpoint', prId: 'PR-541', executionId: 'exec-1200', totalLeadTime: '11d 6h', planningTime: '2d 8h', developmentTime: '4d 4h', buildTime: '1d 6h', deploymentTime: '3d 0h', status: 'Done', startTime: '2024-01-07 09:00', endTime: '2024-01-18 15:00' },
  { id: 'ENG-1070', summary: 'API rate limiting per tenant', prId: 'PR-565', executionId: 'exec-1224', totalLeadTime: '13d 2h', planningTime: '3d 0h', developmentTime: '5d 2h', buildTime: '1d 8h', deploymentTime: '3d 4h', status: 'In Progress', startTime: '2024-01-03 10:00', endTime: '2024-01-16 12:00' },
  { id: 'ENG-1073', summary: 'Deprecate legacy REST v1 endpoints', prId: 'PR-568', executionId: 'exec-1227', totalLeadTime: '7d 8h', planningTime: '1d 6h', developmentTime: '2d 8h', buildTime: '1d 2h', deploymentTime: '2d 0h', status: 'Done', startTime: '2024-01-14 08:00', endTime: '2024-01-21 16:00' },
]

// ── Helper Functions ──

function formatTime(hours: number): string {
  const days = Math.floor(hours / 24)
  const hrs = hours % 24
  return days > 0 ? `${days}d ${hrs}h` : `${hrs}h`
}

function statusTheme(status: string): 'success' | 'warning' | 'info' | 'muted' {
  switch (status) {
    case 'Done': return 'success'
    case 'In Progress': return 'warning'
    case 'In Review': return 'info'
    default: return 'muted'
  }
}

// ── Sub-Components ──

function MetricCard({ label, value, computation }: { label: string; value: string; computation: string }) {
  return (
    <Card.Root size="sm">
      <Card.Content className="flex flex-col gap-1">
        <Text variant="caption-normal" color="foreground-3">{label}</Text>
        <div className="flex items-end gap-2">
          <span className="text-foreground-1 font-semibold" style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, lineHeight: 1 }}>
            {value}
          </span>
        </div>
        <Text variant="caption-normal" color="foreground-4">{computation}</Text>
      </Card.Content>
    </Card.Root>
  )
}

function StageCard({
  stage,
  label,
  time,
  isExpanded,
  onToggle,
  selectedSubStage,
  onSubStageClick
}: {
  stage: Stage
  label: string
  time: string
  isExpanded: boolean
  onToggle: () => void
  selectedSubStage: SubStage | null
  onSubStageClick: (subStage: SubStage) => void
}) {
  const subStages = STAGE_SUBSTAGES[stage]

  return (
    <Card.Root>
      <Card.Content className="p-0">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-cn-1 transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: STAGE_COLORS[stage] }}
            />
            <div>
              <Text variant="body-strong" color="foreground-1">{label}</Text>
              <Text variant="caption-normal" color="foreground-3">{time}</Text>
            </div>
          </div>
          <IconV2
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size="sm"
            className="text-foreground-3"
          />
        </div>

        {isExpanded && (
          <div className="border-t border-borders-2 p-4 bg-cn-05 space-y-2">
            <Text variant="caption-strong" color="foreground-2" className="mb-2">Sub-Stages</Text>
            <div className="grid grid-cols-2 gap-2">
              {subStages.map((subStage) => (
                <div
                  key={subStage}
                  className={`p-3 rounded-md border cursor-pointer transition-all ${
                    selectedSubStage === subStage
                      ? 'border-primary bg-primary-1 shadow-sm'
                      : 'border-borders-2 bg-white hover:border-borders-3'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSubStageClick(subStage)
                  }}
                >
                  <Text
                    variant="caption-normal"
                    color={selectedSubStage === subStage ? 'primary' : 'foreground-2'}
                    className="font-medium"
                  >
                    {SUBSTAGE_LABELS[subStage]}
                  </Text>
                  <Text variant="caption-normal" color="foreground-4" className="text-xs">
                    {Math.random() > 0.5 ? formatTime(Math.floor(Math.random() * 48) + 2) : '—'}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card.Content>
    </Card.Root>
  )
}

// ── Main Component ──

export function LeadTimeDrilldownPage() {
  const [selectedNodeId, setSelectedNodeId] = useState('harness-sei')
  const [timeRange, setTimeRange] = useState('6M')
  const [issueTypeFilter, setIssueTypeFilter] = useState('all')
  const [computation, setComputation] = useState('p50')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [expansion, setExpansion] = useState<StageExpansion>({
    stage: null,
    subStage: null,
  })

  const handleStageToggle = (stage: Stage) => {
    if (expansion.stage === stage) {
      setExpansion({ stage: null, subStage: null })
    } else {
      setExpansion({ stage, subStage: null })
    }
  }

  const handleSubStageClick = (subStage: SubStage) => {
    if (expansion.subStage === subStage) {
      setExpansion({ ...expansion, subStage: null })
    } else {
      setExpansion({ ...expansion, subStage })
    }
  }

  // Determine which columns to show based on expansion state
  const showStageColumns = expansion.stage !== null
  const showSubStageColumn = expansion.subStage !== null

  // Filter work items based on sub-stage selection
  const filteredWorkItems = useMemo(() => {
    if (!expansion.subStage) return WORK_ITEMS
    // In real implementation, filter items that have positive time in the selected sub-stage
    return WORK_ITEMS.filter(() => Math.random() > 0.3)
  }, [expansion.subStage])

  const paginatedWorkItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredWorkItems.slice(start, start + pageSize)
  }, [filteredWorkItems, page, pageSize])

  const computationLabel = {
    mean: 'Mean',
    median: 'Median',
    p50: 'P50',
    p90: 'P90',
    p95: 'P95',
  }[computation]

  return (
    <Nav2 activeSection="insights">
      <div className="flex flex-1 flex-col gap-5 overflow-auto px-5 pb-5 pt-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <Text as="h1" variant="heading-hero" color="foreground-1">Lead Time to Change</Text>
            <Text variant="body-normal" color="foreground-3">
              Drill down from high-level metrics into granular statuses and issue types to pinpoint workflow bottlenecks
            </Text>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={timeRange}
              options={[
                { label: 'Last 7 days', value: '7D' },
                { label: 'Last 1 month', value: '1M' },
                { label: 'Last 3 months', value: '3M' },
                { label: 'Last 6 months', value: '6M' },
                { label: 'Last 12 months', value: '12M' },
              ]}
              onChange={(val) => setTimeRange(val)}
            />
            <Select
              value={issueTypeFilter}
              options={[
                { label: 'All Issues', value: 'all' },
                { label: 'Features', value: 'features' },
                { label: 'Bugs', value: 'bugs' },
                { label: 'Technical Debt', value: 'tech-debt' },
              ]}
              onChange={(val) => setIssueTypeFilter(val)}
            />
            <Select
              value={computation}
              options={[
                { label: 'Mean', value: 'mean' },
                { label: 'Median', value: 'median' },
                { label: 'P50', value: 'p50' },
                { label: 'P90', value: 'p90' },
                { label: 'P95', value: 'p95' },
              ]}
              onChange={(val) => setComputation(val)}
            />
            <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
              <IconV2 name="more-horizontal" size="sm" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-5">
          <OrgTreeNav selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} />

          <div className="flex-1 flex flex-col gap-5 min-w-0">

            {/* Metric Cards */}
            <div className="grid grid-cols-4 gap-5">
              <MetricCard label="Total Lead Time" value="11.8d" computation={computationLabel} />
              <MetricCard label="Planning" value="2.5d" computation={computationLabel} />
              <MetricCard label="Development" value="4.2d" computation={computationLabel} />
              <MetricCard label="Build + Deploy" value="5.1d" computation={computationLabel} />
            </div>

            {/* Level 1: Stacked Bar Overview */}
            <Card.Root>
              <div className="flex items-start justify-between p-5 pb-0">
                <div className="flex flex-col gap-0.5">
                  <Text variant="body-strong" color="foreground-1">Lead Time Breakdown</Text>
                  <Text variant="caption-normal" color="foreground-3">Click stages below to expand sub-stages</Text>
                </div>
                <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
                  <IconV2 name="more-horizontal" size="sm" />
                </Button>
              </div>
              <div className="p-5 pt-3">
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={OVERVIEW_DATA} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--cn-border-2)" />
                    <XAxis type="number" stroke="var(--cn-border-2)" style={{ fontSize: 12, fill: '#6B7280' }} />
                    <YAxis type="category" dataKey="name" stroke="var(--cn-border-2)" style={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 13 }}
                      formatter={(value: number) => `${value.toFixed(1)}d`}
                    />
                    <Bar dataKey="planning" stackId="a" fill={STAGE_COLORS.planning} radius={[0, 0, 0, 4]} />
                    <Bar dataKey="development" stackId="a" fill={STAGE_COLORS.development} />
                    <Bar dataKey="build" stackId="a" fill={STAGE_COLORS.build} />
                    <Bar dataKey="deployment" stackId="a" fill={STAGE_COLORS.deployment} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Root>

            {/* Level 2: Stage Expansion Cards */}
            <div className="grid grid-cols-2 gap-4">
              <StageCard
                stage="planning"
                label="Planning"
                time="2.5 days"
                isExpanded={expansion.stage === 'planning'}
                onToggle={() => handleStageToggle('planning')}
                selectedSubStage={expansion.stage === 'planning' ? expansion.subStage : null}
                onSubStageClick={handleSubStageClick}
              />
              <StageCard
                stage="development"
                label="Development"
                time="4.2 days"
                isExpanded={expansion.stage === 'development'}
                onToggle={() => handleStageToggle('development')}
                selectedSubStage={expansion.stage === 'development' ? expansion.subStage : null}
                onSubStageClick={handleSubStageClick}
              />
              <StageCard
                stage="build"
                label="Build"
                time="1.3 days"
                isExpanded={expansion.stage === 'build'}
                onToggle={() => handleStageToggle('build')}
                selectedSubStage={expansion.stage === 'build' ? expansion.subStage : null}
                onSubStageClick={handleSubStageClick}
              />
              <StageCard
                stage="deployment"
                label="Deployment"
                time="3.8 days"
                isExpanded={expansion.stage === 'deployment'}
                onToggle={() => handleStageToggle('deployment')}
                selectedSubStage={expansion.stage === 'deployment' ? expansion.subStage : null}
                onSubStageClick={handleSubStageClick}
              />
            </div>

            {/* Level 3: Progressive Column Drilldown Table */}
            <Card.Root>
              <div className="flex items-start justify-between p-5 pb-3">
                <div className="flex flex-col gap-0.5">
                  <Text variant="body-strong" color="foreground-1">Work Items Drilldown</Text>
                  <Text variant="caption-normal" color="foreground-3">
                    {expansion.subStage
                      ? `Showing items with time in ${SUBSTAGE_LABELS[expansion.subStage]}`
                      : expansion.stage
                      ? `Showing all items in ${expansion.stage} stage`
                      : 'Click a stage or sub-stage to filter and see additional columns'}
                  </Text>
                </div>
                {(expansion.stage || expansion.subStage) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpansion({ stage: null, subStage: null })}
                  >
                    <IconV2 name="xmark" size="sm" />
                    Clear Filter
                  </Button>
                )}
              </div>

              <div className="overflow-x-auto">
                <Table.Root variant="default" size="normal">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Work Item ID</Table.Head>
                      <Table.Head>Summary</Table.Head>
                      {expansion.stage === 'development' && <Table.Head>PR ID</Table.Head>}
                      {(expansion.stage === 'build' || expansion.stage === 'deployment') && <Table.Head>Execution ID</Table.Head>}
                      {!showStageColumns && <Table.Head>Start Time</Table.Head>}
                      {!showStageColumns && <Table.Head>End Time</Table.Head>}
                      <Table.Head className="text-right">Total Lead Time</Table.Head>
                      {showStageColumns && (
                        <Table.Head className="text-right">
                          {expansion.stage === 'planning' ? 'Planning' :
                           expansion.stage === 'development' ? 'Development' :
                           expansion.stage === 'build' ? 'Build' : 'Deployment'}
                        </Table.Head>
                      )}
                      {showSubStageColumn && (
                        <Table.Head className="text-right">{SUBSTAGE_LABELS[expansion.subStage!]}</Table.Head>
                      )}
                      {!showStageColumns && <Table.Head>Status</Table.Head>}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedWorkItems.map((item) => (
                      <Table.Row key={item.id}>
                        <Table.Cell>
                          <Text variant="body-normal" color="foreground-1" className="font-mono text-xs">{item.id}</Text>
                        </Table.Cell>
                        <Table.Cell className="max-w-[300px]">
                          <Text variant="body-normal" color="foreground-1" className="truncate">{item.summary}</Text>
                        </Table.Cell>
                        {expansion.stage === 'development' && <Table.Cell>{item.prId}</Table.Cell>}
                        {(expansion.stage === 'build' || expansion.stage === 'deployment') && <Table.Cell>{item.executionId}</Table.Cell>}
                        {!showStageColumns && <Table.Cell className="text-xs text-foreground-3">{item.startTime}</Table.Cell>}
                        {!showStageColumns && <Table.Cell className="text-xs text-foreground-3">{item.endTime}</Table.Cell>}
                        <Table.Cell className="text-right font-medium">{item.totalLeadTime}</Table.Cell>
                        {showStageColumns && (
                          <Table.Cell className="text-right">
                            {expansion.stage === 'planning' ? item.planningTime :
                             expansion.stage === 'development' ? item.developmentTime :
                             expansion.stage === 'build' ? item.buildTime : item.deploymentTime}
                          </Table.Cell>
                        )}
                        {showSubStageColumn && (
                          <Table.Cell className="text-right text-foreground-3">
                            {formatTime(Math.floor(Math.random() * 24) + 1)}
                          </Table.Cell>
                        )}
                        {!showStageColumns && (
                          <Table.Cell>
                            <StatusBadge variant="outline" theme={statusTheme(item.status)} size="sm">
                              {item.status}
                            </StatusBadge>
                          </Table.Cell>
                        )}
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </div>

              <div className="rounded-b-cn-2 border border-t-0 border-borders-2 px-4 pb-3 pt-0.5">
                <Pagination
                  totalItems={filteredWorkItems.length}
                  pageSize={pageSize}
                  currentPage={page}
                  goToPage={setPage}
                  onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
                  pageSizeOptions={[5, 10, 20]}
                  className="!mt-cn-sm"
                />
              </div>
            </Card.Root>

          </div>
        </div>
      </div>
    </Nav2>
  )
}
