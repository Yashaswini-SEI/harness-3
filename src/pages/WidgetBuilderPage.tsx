import { useState } from 'react'
import {
  Text,
  Button,
  IconV2,
  Breadcrumb,
  StatusBadge,
  Tag,
  Table,
  Pagination,
  Select,
  Tabs,
  ToggleGroup,
  NumberInput,
} from '@harnessio/ui/components'

// ── Sample table data ──
const rows = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  checkDate: 'Jan 30, 2026, 7:00 PM',
  issueKey: 'AAP-10',
  integrationId: '91',
  statusStartTime: 'Jan 30, 2026, 7:00 PM',
  statusEndTime: 'Jan 30, 2026, 7:00 PM',
  project: 'AAP',
}))

export function WidgetBuilderPage() {
  const [timeRange, setTimeRange] = useState('12M')
  const [chartType, setChartType] = useState('table')
  const [activeTab, setActiveTab] = useState('builder')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <Breadcrumb.Root size="sm">
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#">Account: Harness.io</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#">Organization: Harness Analytics</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#">Project: Split FME Analytics</Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>

      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Text as="h1" variant="heading-hero" color="foreground-1">Issues by Projects</Text>
            <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
              <IconV2 name="edit-pencil" size="sm" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Text variant="body-normal" color="foreground-3">Widget represents issues by projects</Text>
            <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
              <IconV2 name="edit-pencil" size="sm" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">Cancel</Button>
          <Button size="sm">Add Widget</Button>
        </div>
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-10">
        <div className="flex flex-col gap-1">
          <Text variant="body-normal" color="foreground-3">Status</Text>
          <StatusBadge variant="outline" theme="info" size="sm">Draft</StatusBadge>
        </div>
        <div className="flex flex-col gap-1">
          <Text variant="body-normal" color="foreground-3">Created:</Text>
          <Text variant="body-normal" color="foreground-1">–</Text>
        </div>
        <div className="flex flex-col gap-1">
          <Text variant="body-normal" color="foreground-3">Updated:</Text>
          <Text variant="body-normal" color="foreground-1">–</Text>
        </div>
        <div className="flex flex-col gap-1">
          <Text variant="body-normal" color="foreground-3">Tags</Text>
          <Tag variant="outline" theme="gray" size="sm" value="Product hierarchy" />
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">
        {/* Time range tabs */}
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

        {/* Chart type toggles */}
        <ToggleGroup.Root
          type="single"
          value={chartType}
          onChange={(val: string) => { if (val) setChartType(val) }}
          size="sm"
        >
          <ToggleGroup.Item value="table" prefixIcon="view-grid" />
          <ToggleGroup.Item value="bar" prefixIcon="stats-up-square" />
          <ToggleGroup.Item value="line" prefixIcon="graph-up" />
          <ToggleGroup.Item value="stacked" prefixIcon="align-bottom" />
          <ToggleGroup.Item value="column" prefixIcon="bar-chart" />
          <ToggleGroup.Item value="flag" prefixIcon="page" />
          <ToggleGroup.Item value="hash" prefixIcon="hashtag" />
          <ToggleGroup.Item value="scatter" prefixIcon="percentage-square" />
          <ToggleGroup.Item value="settings" prefixIcon="settings" />
        </ToggleGroup.Root>
      </div>

      {/* Main content area */}
      <div className="flex gap-0">
        {/* Left: Table */}
        <div className="flex-1 min-w-0">
          <Table.Root variant="default" size="normal">
            <Table.Header>
              <Table.Row>
                <Table.Head>Check Date</Table.Head>
                <Table.Head>Issue Key</Table.Head>
                <Table.Head>Integration Id</Table.Head>
                <Table.Head>Status Start Time</Table.Head>
                <Table.Head>Status End Time</Table.Head>
                <Table.Head>Project</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rows.map((row) => (
                <Table.Row key={row.id}>
                  <Table.Cell>{row.checkDate}</Table.Cell>
                  <Table.Cell>{row.issueKey}</Table.Cell>
                  <Table.Cell>{row.integrationId}</Table.Cell>
                  <Table.Cell>{row.statusStartTime}</Table.Cell>
                  <Table.Cell>{row.statusEndTime}</Table.Cell>
                  <Table.Cell>{row.project}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {/* Pagination */}
          <div className="mt-2">
            <Pagination
              totalItems={8}
              pageSize={pageSize}
              currentPage={currentPage}
              goToPage={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 20, 50]}
            />
          </div>
        </div>

        {/* Right: Builder panel */}
        <div className="w-[280px] shrink-0 border-l border-subtle pl-5">
          {/* Builder / Query tabs */}
          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List variant="outlined">
              <Tabs.Trigger value="builder">Builder</Tabs.Trigger>
              <Tabs.Trigger value="query">Query</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="builder">
              <div className="flex flex-col gap-5 pt-4">
                {/* Data Source */}
                <div className="flex flex-col gap-1.5">
                  <Text variant="body-strong" color="foreground-1">Data Source</Text>
                  <Select
                    value="daily-open-issues"
                    options={[{ label: 'Daily Open Issues', value: 'daily-open-issues' }]}
                    onChange={() => {}}
                  />
                </div>

                {/* Selection Criteria */}
                <div className="flex flex-col gap-3 rounded border border-subtle p-3">
                  <div className="flex items-center justify-between">
                    <Text variant="body-strong" color="foreground-1">Selection Criteria</Text>
                    <Button variant="ghost" size="sm">
                      <IconV2 name="trash" size="sm" />
                      Remove
                    </Button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Text variant="caption-normal" color="foreground-3">Column</Text>
                    <Select
                      value="project"
                      options={[{ label: 'Project', value: 'project' }]}
                      onChange={() => {}}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Text variant="caption-normal" color="foreground-3">Aggregation</Text>
                    <Select
                      value="count"
                      options={[{ label: 'Count', value: 'count' }]}
                      onChange={() => {}}
                    />
                  </div>

                  <Button variant="ghost" size="sm" className="self-start">
                    <IconV2 name="plus" size="sm" />
                    <Text color="brand" variant="body-normal">Select Criteria</Text>
                  </Button>
                </div>

                {/* Filter Criteria */}
                <div className="flex flex-col gap-2 rounded border border-subtle p-3">
                  <Text variant="body-strong" color="foreground-1">
                    Filter Criteria <Text as="span" variant="body-normal" color="foreground-3">(Optional)</Text>
                  </Text>
                  <Button variant="ghost" size="sm" className="self-start">
                    <IconV2 name="plus" size="sm" />
                    <Text color="brand" variant="body-normal">Filter Criteria</Text>
                  </Button>
                </div>

                {/* Group by */}
                <div className="flex flex-col gap-2 rounded border border-subtle p-3">
                  <Text variant="body-strong" color="foreground-1">
                    Group by <Text as="span" variant="body-normal" color="foreground-3">(Optional)</Text>
                  </Text>
                  <Button variant="ghost" size="sm" className="self-start">
                    <IconV2 name="plus" size="sm" />
                    <Text color="brand" variant="body-normal">Group by</Text>
                  </Button>
                </div>

                {/* Sort by */}
                <div className="flex flex-col gap-2 rounded border border-subtle p-3">
                  <Text variant="body-strong" color="foreground-1">
                    Sort by <Text as="span" variant="body-normal" color="foreground-3">(Optional)</Text>
                  </Text>
                  <Button variant="ghost" size="sm" className="self-start">
                    <IconV2 name="plus" size="sm" />
                    <Text color="brand" variant="body-normal">Sort by</Text>
                  </Button>
                </div>

                {/* Limit */}
                <div className="flex flex-col gap-1.5">
                  <Text variant="body-strong" color="foreground-1">Limit</Text>
                  <NumberInput defaultValue={10} />
                </div>
              </div>
            </Tabs.Content>
            <Tabs.Content value="query">
              <div className="pt-4">
                <Text variant="body-normal" color="foreground-3">Query editor coming soon.</Text>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </div>
  )
}
