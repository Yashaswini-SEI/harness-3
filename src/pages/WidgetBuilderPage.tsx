import { useState, useEffect, useRef, useCallback } from 'react'
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
  NumberInput,
  Textarea,
  TextInput,
} from '@harnessio/ui/components'

// ── Available variable suggestions ──
const VARIABLE_SUGGESTIONS = [
  'account.companyName',
  'account.name',
  'variable.account.id',
  'variable.account.acc',
  'variable.account.status',
]

// ── Sample table data ──
const defaultRows = [
  { id: 0, checkDate: 'Jan 30, 2026, 7:00 PM', issueKey: 'AAP-10', integrationId: '91', statusStartTime: 'Jan 30, 2026, 7:00 PM', statusEndTime: 'Jan 31, 2026, 9:15 AM', project: 'AAP' },
  { id: 1, checkDate: 'Jan 29, 2026, 3:42 PM', issueKey: 'FME-384', integrationId: '91', statusStartTime: 'Jan 28, 2026, 11:30 AM', statusEndTime: 'Jan 29, 2026, 3:42 PM', project: 'FME' },
  { id: 2, checkDate: 'Jan 29, 2026, 1:18 PM', issueKey: 'CDE-1027', integrationId: '84', statusStartTime: 'Jan 27, 2026, 9:00 AM', statusEndTime: 'Jan 29, 2026, 1:18 PM', project: 'CDE' },
  { id: 3, checkDate: 'Jan 28, 2026, 10:05 AM', issueKey: 'DEVOPS-562', integrationId: '91', statusStartTime: 'Jan 26, 2026, 2:00 PM', statusEndTime: 'Jan 28, 2026, 10:05 AM', project: 'DEVOPS' },
  { id: 4, checkDate: 'Jan 28, 2026, 8:30 AM', issueKey: 'BT-2190', integrationId: '72', statusStartTime: 'Jan 25, 2026, 4:45 PM', statusEndTime: 'Jan 28, 2026, 8:30 AM', project: 'BT' },
  { id: 5, checkDate: 'Jan 27, 2026, 5:22 PM', issueKey: 'ENGTAI-88', integrationId: '91', statusStartTime: 'Jan 27, 2026, 10:00 AM', statusEndTime: 'Jan 27, 2026, 5:22 PM', project: 'ENGTAI' },
  { id: 6, checkDate: 'Jan 27, 2026, 2:10 PM', issueKey: 'COE-415', integrationId: '84', statusStartTime: 'Jan 24, 2026, 8:00 AM', statusEndTime: 'Jan 27, 2026, 2:10 PM', project: 'COE' },
  { id: 7, checkDate: 'Jan 26, 2026, 11:47 AM', issueKey: 'FLAM-73', integrationId: '72', statusStartTime: 'Jan 23, 2026, 3:30 PM', statusEndTime: 'Jan 26, 2026, 11:47 AM', project: 'FLAM' },
]

const criteriaRows = [
  { project: 'ASP', issueKeyCount: '247,084' },
  { project: 'BT', issueKeyCount: '3,182,451' },
  { project: 'CDE', issueKeyCount: '545,508' },
  { project: 'COE', issueKeyCount: '7,035' },
  { project: 'DEVOPS', issueKeyCount: '2,901,210' },
  { project: 'ENGTAI', issueKeyCount: '43,320,752' },
  { project: 'DS', issueKeyCount: '3,104' },
  { project: 'EXP', issueKeyCount: '751,102' },
  { project: 'FLAM', issueKeyCount: '146,328' },
  { project: 'FME', issueKeyCount: '8,569,736' },
]

export function WidgetBuilderPage() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light-std-low', 'dark-std-low')
    root.classList.add(dark ? 'dark-std-low' : 'light-std-low')
  }, [dark])

  const [timeRange, setTimeRange] = useState('12M')
  const [chartType, setChartType] = useState('table')
  const [activeTab, setActiveTab] = useState('builder')
  const [criteriaAdded, setCriteriaAdded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [queryText, setQueryText] = useState(
    `find entity sei:sonarqube_metrics\n  | filter metric in ["coverage", "branch_coverage", "line_coverage"] and branch\n      is null\n  | select {\n      metric,\n      avg(value_numeric) as $average_across_projects,\n      count() as $account`
  )
  const [variables, setVariables] = useState([
    { name: 'account.rev', defaultValue: '0' },
    { name: 'custom.account.size', defaultValue: '0' },
    { name: 'custom.account.age', defaultValue: '0' },
  ])

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionFilter, setSuggestionFilter] = useState('')
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const [tokenStart, setTokenStart] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const filteredSuggestions = VARIABLE_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(suggestionFilter.toLowerCase())
  )

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart ?? value.length
    setQueryText(value)

    // Look backwards from cursor for an unclosed `${`
    const before = value.slice(0, cursorPos)
    const dollarIdx = before.lastIndexOf('${')
    if (dollarIdx !== -1 && !before.slice(dollarIdx).includes('}')) {
      const partial = before.slice(dollarIdx + 2)
      setSuggestionFilter(partial)
      setSuggestionIndex(0)
      setTokenStart(dollarIdx)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [])

  const insertSuggestion = useCallback((variableName: string) => {
    const before = queryText.slice(0, tokenStart)
    const after = queryText.slice(
      tokenStart + 2 + suggestionFilter.length
    )
    const newText = `${before}\${${variableName}}${after}`
    setQueryText(newText)
    setShowSuggestions(false)

    // Restore focus and cursor position
    requestAnimationFrame(() => {
      const ta = textareaRef.current
      if (ta) {
        ta.focus()
        const pos = tokenStart + variableName.length + 3 // ${ + name + }
        ta.setSelectionRange(pos, pos)
      }
    })
  }, [queryText, tokenStart, suggestionFilter])

  const handleQueryKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSuggestionIndex((i) => Math.min(i + 1, filteredSuggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSuggestionIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      insertSuggestion(filteredSuggestions[suggestionIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }, [showSuggestions, filteredSuggestions, suggestionIndex, insertSuggestion])

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar nav */}
      <nav className="flex w-[56px] shrink-0 flex-col items-center justify-between py-4" style={{ backgroundColor: '#051A33' }}>
        <div className="flex flex-col items-center gap-4">
          {/* Logo */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#42AB45]">
            <IconV2 name="nav-arrow-right" size="sm" className="text-white" />
          </div>
          <hr className="w-6 border-white/20" />
          {/* Nav icons */}
          {[
            { icon: 'box', active: true },
            { icon: 'lightbulb' },
            { icon: 'grid-4' },
            { icon: 'settings' },
            { icon: 'link-chain' },
            { icon: 'grid-dots' },
            { icon: 'connectors' },
          ].map(({ icon, active }) => (
            <button
              key={icon}
              className={`flex h-8 w-8 items-center justify-center rounded-md ${
                active ? 'bg-white/15' : 'hover:bg-white/10'
              }`}
            >
              <IconV2 name={icon as never} size="sm" className={active ? 'text-white' : 'text-white/60'} />
            </button>
          ))}
          <hr className="w-6 border-white/20" />
          <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10">
            <IconV2 name="scissor" size="sm" className="text-white/60" />
          </button>
        </div>
        <div className="flex flex-col items-center gap-3">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10"
            onClick={() => setDark(!dark)}
          >
            <IconV2 name={dark ? 'sun-light' : 'half-moon'} size="sm" className="text-white/60" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10">
            <IconV2 name="chat-bubble" size="sm" className="text-white/60" />
          </button>
          <div className="h-6 w-6 rounded-full bg-[#6C63FF]" />
        </div>
      </nav>

      {/* Page content */}
      <div className="flex flex-1 flex-col gap-5 p-8">
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

      {/* Main content area */}
      <div className="flex gap-0">
        {/* Left: Table */}
        <div className="flex-1 min-w-0 pr-5">
          {/* Controls bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
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

            {/* Chart type tabs */}
            <Tabs.Root value={chartType} onValueChange={setChartType}>
              <Tabs.List variant="outlined">
                <Tabs.Trigger value="table" icon="table-rows" />
                <Tabs.Trigger value="line" icon="line-chart" />
                <Tabs.Trigger value="donut" icon="pie-chart" />
                <Tabs.Trigger value="bar" icon="bar-vertical" />
                <Tabs.Trigger value="horizontal-bar" icon="bar-horizontal" />
                <Tabs.Trigger value="metric" icon="stats-up-square" />
                <Tabs.Trigger value="data" icon="database-stats" />
              </Tabs.List>
            </Tabs.Root>
          </div>
          {criteriaAdded ? (
            <>
              <Table.Root variant="default" size="normal">
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Project</Table.Head>
                    <Table.Head>Issue Key Count</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {criteriaRows.map((row) => (
                    <Table.Row key={row.project}>
                      <Table.Cell>{row.project}</Table.Cell>
                      <Table.Cell>{row.issueKeyCount}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              {/* Pagination */}
              <div className="mt-2">
                <Pagination
                  totalItems={criteriaRows.length}
                  pageSize={pageSize}
                  currentPage={currentPage}
                  goToPage={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[10, 20, 50]}
                />
              </div>
            </>
          ) : (
            <>
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
                  {defaultRows.map((row) => (
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
                  totalItems={defaultRows.length}
                  pageSize={pageSize}
                  currentPage={currentPage}
                  goToPage={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[10, 20, 50]}
                />
              </div>
            </>
          )}
        </div>

        {/* Right: Builder panel */}
        <div className="w-1/3 min-w-0 border-l border-subtle pl-5">
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

                  {!criteriaAdded && (
                    <Button variant="ghost" size="sm" className="self-start" onClick={() => setCriteriaAdded(true)}>
                      <IconV2 name="plus" size="sm" />
                      <Text color="brand" variant="body-normal">Select Criteria</Text>
                    </Button>
                  )}
                </div>

                {/* Second Selection Criteria (shown after clicking Select Criteria) */}
                {criteriaAdded && (
                  <div className="flex flex-col gap-3 rounded border border-subtle p-3">
                    <div className="flex items-center justify-between">
                      <Text variant="body-strong" color="foreground-1">Selection Criteria</Text>
                      <Button variant="ghost" size="sm" onClick={() => setCriteriaAdded(false)}>
                        <IconV2 name="trash" size="sm" />
                        Remove
                      </Button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Text variant="caption-normal" color="foreground-3">Column</Text>
                      <Select
                        value="issue-keys"
                        options={[{ label: 'Issue keys', value: 'issue-keys' }]}
                        onChange={() => {}}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Text variant="caption-normal" color="foreground-3">Aggregation (Optional)</Text>
                      <Select
                        value="count"
                        options={[{ label: 'Count', value: 'count' }]}
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                )}

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
              <div className="flex flex-col gap-4 pt-4">
                {/* Code editor section */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm">
                      <IconV2 name="code" size="sm" />
                      Format
                    </Button>
                  </div>
                  <div className="relative">
                    <Textarea
                      ref={textareaRef}
                      value={queryText}
                      onChange={handleQueryChange}
                      onKeyDown={handleQueryKeyDown}
                      onBlur={() => {
                        // Delay to allow click on suggestion
                        setTimeout(() => setShowSuggestions(false), 150)
                      }}
                      className="font-mono text-sm"
                      rows={8}
                    />
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-md border border-borders-2 bg-cn-1 shadow-lg">
                        {filteredSuggestions.map((name, i) => (
                          <button
                            key={name}
                            type="button"
                            className={`z-10 flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm ${
                              i === suggestionIndex ? 'bg-cn-hover' : 'hover:bg-cn-hover'
                            }`}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              insertSuggestion(name)
                            }}
                            onMouseEnter={() => setSuggestionIndex(i)}
                          >
                            <span className="flex items-center gap-2">
                              <IconV2 name="variables" size="sm" />
                              <span className="text-foreground-1">{name}</span>
                            </span>
                            <span className="text-foreground-3">${name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Text variant="body-normal" color="foreground-3">
                    {'Use ${variableName} syntax in your query'}
                  </Text>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm">
                    <IconV2 name="play" size="sm" />
                    Run query
                  </Button>
                  <Button variant="link" size="sm">Reset to last applied</Button>
                </div>

                {/* Separator */}
                <hr className="border-borders-2" />

                {/* Variables section */}
                <Text variant="heading-subsection" color="foreground-1">Variables</Text>
                <div className="flex flex-col gap-2">
                  {variables.map((variable, index) => (
                    <div key={index} className="flex items-end gap-2">
                      <div className="flex-1">
                        {index === 0 && (
                          <Text variant="body-normal" color="foreground-1" className="mb-1 block">Name</Text>
                        )}
                        <TextInput
                          value={variable.name}
                          onChange={(e) => {
                            const next = [...variables]
                            next[index] = { ...next[index], name: e.target.value }
                            setVariables(next)
                          }}
                        />
                      </div>
                      <Text variant="body-normal" color="foreground-3" className="pb-2">=</Text>
                      <div className="flex-1">
                        {index === 0 && (
                          <Text variant="body-normal" color="foreground-1" className="mb-1 block">Default Value</Text>
                        )}
                        <TextInput
                          value={variable.defaultValue}
                          onChange={(e) => {
                            const next = [...variables]
                            next[index] = { ...next[index], defaultValue: e.target.value }
                            setVariables(next)
                          }}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        iconOnly
                        ignoreIconOnlyTooltip
                        onClick={() => setVariables(variables.filter((_, i) => i !== index))}
                      >
                        <IconV2 name="trash" size="sm" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVariables([...variables, { name: '', defaultValue: '' }])}
                  >
                    <IconV2 name="plus" size="sm" />
                    New Variable
                  </Button>
                  <Text variant="body-normal" color="foreground-3">
                    {'Also add by typing ${variableName} above.'}
                  </Text>
                </div>

                <div className="flex justify-end">
                  <Button size="sm" disabled>Save Variables</Button>
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
      </div>
    </div>
  )
}
