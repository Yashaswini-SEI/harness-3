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

// ── Datasource options ──
const DATASOURCE_METADATA: { name: string; value: string; description: string }[] = [
  { name: 'Account', value: 'account', description: 'Root entity representing a Harness account' },
  { name: 'Artifact', value: 'artifact', description: 'Specific version or tag of an image, representing a deployable artifact' },
  { name: 'AWS KMS Connector', value: 'aws-kms-connector', description: 'AWS Key Management Service secret manager connector' },
  { name: 'AWS Secrets Manager Connector', value: 'aws-secrets-manager', description: 'AWS Secrets Manager secret manager connector' },
  { name: 'Azure Key Vault Connector', value: 'azure-key-vault', description: 'Azure Key Vault secret manager connector' },
  { name: 'Billing Metrics Config', value: 'billing-metrics-config', description: 'Configuration for billing metrics collection' },
  { name: 'Daily Open Issues', value: 'daily-open-issues', description: 'Daily snapshot of open issues across projects' },
  { name: 'Deployment', value: 'deployment', description: 'A single deployment execution record' },
  { name: 'Environment', value: 'environment', description: 'Target environment for service deployments' },
  { name: 'GCP Connector', value: 'gcp-connector', description: 'Google Cloud Platform integration connector' },
  { name: 'Issues by Project', value: 'issues-by-project', description: 'Aggregated issue counts grouped by project over a given time range' },
  { name: 'Pipeline', value: 'pipeline', description: 'CI/CD pipeline definition and execution data' },
  { name: 'Service', value: 'service', description: 'Microservice or application component' },
]

// ── Table datasets keyed by datasource ──
type TableDataset = { headers: string[]; rows: Record<string, string>[] }

const DATASOURCE_TABLES: Record<string, TableDataset> = {
  'daily-open-issues': {
    headers: ['Check Date', 'Issue Key', 'Integration Id', 'Status Start Time', 'Status End Time', 'Project'],
    rows: [
      { 'Check Date': 'Jan 30, 2026, 7:00 PM', 'Issue Key': 'AAP-10', 'Integration Id': '91', 'Status Start Time': 'Jan 30, 2026, 7:00 PM', 'Status End Time': 'Jan 31, 2026, 9:15 AM', Project: 'AAP' },
      { 'Check Date': 'Jan 29, 2026, 3:42 PM', 'Issue Key': 'FME-384', 'Integration Id': '91', 'Status Start Time': 'Jan 28, 2026, 11:30 AM', 'Status End Time': 'Jan 29, 2026, 3:42 PM', Project: 'FME' },
      { 'Check Date': 'Jan 29, 2026, 1:18 PM', 'Issue Key': 'CDE-1027', 'Integration Id': '84', 'Status Start Time': 'Jan 27, 2026, 9:00 AM', 'Status End Time': 'Jan 29, 2026, 1:18 PM', Project: 'CDE' },
      { 'Check Date': 'Jan 28, 2026, 10:05 AM', 'Issue Key': 'DEVOPS-562', 'Integration Id': '91', 'Status Start Time': 'Jan 26, 2026, 2:00 PM', 'Status End Time': 'Jan 28, 2026, 10:05 AM', Project: 'DEVOPS' },
      { 'Check Date': 'Jan 28, 2026, 8:30 AM', 'Issue Key': 'BT-2190', 'Integration Id': '72', 'Status Start Time': 'Jan 25, 2026, 4:45 PM', 'Status End Time': 'Jan 28, 2026, 8:30 AM', Project: 'BT' },
      { 'Check Date': 'Jan 27, 2026, 5:22 PM', 'Issue Key': 'ENGTAI-88', 'Integration Id': '91', 'Status Start Time': 'Jan 27, 2026, 10:00 AM', 'Status End Time': 'Jan 27, 2026, 5:22 PM', Project: 'ENGTAI' },
      { 'Check Date': 'Jan 27, 2026, 2:10 PM', 'Issue Key': 'COE-415', 'Integration Id': '84', 'Status Start Time': 'Jan 24, 2026, 8:00 AM', 'Status End Time': 'Jan 27, 2026, 2:10 PM', Project: 'COE' },
      { 'Check Date': 'Jan 26, 2026, 11:47 AM', 'Issue Key': 'FLAM-73', 'Integration Id': '72', 'Status Start Time': 'Jan 23, 2026, 3:30 PM', 'Status End Time': 'Jan 26, 2026, 11:47 AM', Project: 'FLAM' },
    ],
  },
  account: {
    headers: ['Account Name', 'Company', 'Status', 'Created', 'Licenses'],
    rows: [
      { 'Account Name': 'harness-prod', Company: 'Harness Inc.', Status: 'Active', Created: 'Mar 12, 2024', Licenses: '250' },
      { 'Account Name': 'harness-staging', Company: 'Harness Inc.', Status: 'Active', Created: 'Mar 12, 2024', Licenses: '50' },
      { 'Account Name': 'acme-corp', Company: 'Acme Corp', Status: 'Active', Created: 'Jun 01, 2024', Licenses: '120' },
      { 'Account Name': 'globex-main', Company: 'Globex Corp', Status: 'Suspended', Created: 'Sep 15, 2024', Licenses: '80' },
      { 'Account Name': 'initech-dev', Company: 'Initech', Status: 'Active', Created: 'Nov 20, 2024', Licenses: '45' },
      { 'Account Name': 'wayne-ent', Company: 'Wayne Enterprises', Status: 'Active', Created: 'Jan 05, 2025', Licenses: '300' },
    ],
  },
  deployment: {
    headers: ['Deployment Id', 'Service', 'Environment', 'Status', 'Started', 'Duration'],
    rows: [
      { 'Deployment Id': 'DEP-4821', Service: 'payment-svc', Environment: 'prod-us-east', Status: 'Success', Started: 'Feb 15, 2026, 3:12 PM', Duration: '4m 22s' },
      { 'Deployment Id': 'DEP-4820', Service: 'auth-svc', Environment: 'prod-us-east', Status: 'Success', Started: 'Feb 15, 2026, 2:45 PM', Duration: '3m 10s' },
      { 'Deployment Id': 'DEP-4819', Service: 'frontend-app', Environment: 'staging', Status: 'Failed', Started: 'Feb 15, 2026, 1:30 PM', Duration: '1m 55s' },
      { 'Deployment Id': 'DEP-4818', Service: 'analytics-worker', Environment: 'prod-eu-west', Status: 'Success', Started: 'Feb 14, 2026, 11:20 AM', Duration: '6m 05s' },
      { 'Deployment Id': 'DEP-4817', Service: 'notification-svc', Environment: 'prod-us-east', Status: 'Rolled Back', Started: 'Feb 14, 2026, 9:00 AM', Duration: '2m 48s' },
      { 'Deployment Id': 'DEP-4816', Service: 'payment-svc', Environment: 'staging', Status: 'Success', Started: 'Feb 13, 2026, 5:15 PM', Duration: '4m 01s' },
      { 'Deployment Id': 'DEP-4815', Service: 'user-svc', Environment: 'prod-us-east', Status: 'Success', Started: 'Feb 13, 2026, 2:30 PM', Duration: '3m 33s' },
    ],
  },
  pipeline: {
    headers: ['Pipeline', 'Trigger', 'Status', 'Started', 'Duration', 'Stages'],
    rows: [
      { Pipeline: 'deploy-prod', Trigger: 'Manual', Status: 'Success', Started: 'Feb 16, 2026, 9:00 AM', Duration: '12m 34s', Stages: '5/5' },
      { Pipeline: 'ci-main', Trigger: 'Push to main', Status: 'Running', Started: 'Feb 16, 2026, 8:45 AM', Duration: '—', Stages: '3/4' },
      { Pipeline: 'nightly-tests', Trigger: 'Cron', Status: 'Failed', Started: 'Feb 16, 2026, 2:00 AM', Duration: '45m 12s', Stages: '7/10' },
      { Pipeline: 'deploy-staging', Trigger: 'PR Merge', Status: 'Success', Started: 'Feb 15, 2026, 4:30 PM', Duration: '8m 20s', Stages: '4/4' },
      { Pipeline: 'security-scan', Trigger: 'Cron', Status: 'Success', Started: 'Feb 15, 2026, 1:00 AM', Duration: '22m 05s', Stages: '3/3' },
      { Pipeline: 'ci-feature-xyz', Trigger: 'Push', Status: 'Success', Started: 'Feb 14, 2026, 3:15 PM', Duration: '6m 48s', Stages: '4/4' },
    ],
  },
  artifact: {
    headers: ['Artifact', 'Version', 'Registry', 'Size', 'Pushed', 'Pulled'],
    rows: [
      { Artifact: 'payment-svc', Version: 'v2.14.0', Registry: 'docker-hub', Size: '245 MB', Pushed: 'Feb 15, 2026', Pulled: '1,204' },
      { Artifact: 'auth-svc', Version: 'v3.2.1', Registry: 'gcr.io', Size: '182 MB', Pushed: 'Feb 15, 2026', Pulled: '892' },
      { Artifact: 'frontend-app', Version: 'v5.0.0-rc.2', Registry: 'ecr', Size: '78 MB', Pushed: 'Feb 14, 2026', Pulled: '341' },
      { Artifact: 'analytics-worker', Version: 'v1.8.3', Registry: 'docker-hub', Size: '310 MB', Pushed: 'Feb 13, 2026', Pulled: '567' },
      { Artifact: 'notification-svc', Version: 'v2.1.0', Registry: 'gcr.io', Size: '156 MB', Pushed: 'Feb 12, 2026', Pulled: '723' },
    ],
  },
  service: {
    headers: ['Service Name', 'Type', 'Environment', 'Instances', 'Health', 'Last Deployed'],
    rows: [
      { 'Service Name': 'payment-svc', Type: 'Kubernetes', Environment: 'prod', Instances: '6', Health: 'Healthy', 'Last Deployed': 'Feb 15, 2026' },
      { 'Service Name': 'auth-svc', Type: 'Kubernetes', Environment: 'prod', Instances: '4', Health: 'Healthy', 'Last Deployed': 'Feb 15, 2026' },
      { 'Service Name': 'frontend-app', Type: 'ECS', Environment: 'staging', Instances: '2', Health: 'Degraded', 'Last Deployed': 'Feb 14, 2026' },
      { 'Service Name': 'analytics-worker', Type: 'Kubernetes', Environment: 'prod', Instances: '3', Health: 'Healthy', 'Last Deployed': 'Feb 13, 2026' },
      { 'Service Name': 'notification-svc', Type: 'Lambda', Environment: 'prod', Instances: '—', Health: 'Healthy', 'Last Deployed': 'Feb 12, 2026' },
      { 'Service Name': 'user-svc', Type: 'Kubernetes', Environment: 'prod', Instances: '4', Health: 'Healthy', 'Last Deployed': 'Feb 10, 2026' },
      { 'Service Name': 'search-indexer', Type: 'Kubernetes', Environment: 'prod', Instances: '2', Health: 'Healthy', 'Last Deployed': 'Feb 08, 2026' },
    ],
  },
  environment: {
    headers: ['Environment', 'Type', 'Region', 'Services', 'Status', 'Last Updated'],
    rows: [
      { Environment: 'prod-us-east', Type: 'Production', Region: 'us-east-1', Services: '12', Status: 'Healthy', 'Last Updated': 'Feb 16, 2026' },
      { Environment: 'prod-eu-west', Type: 'Production', Region: 'eu-west-1', Services: '8', Status: 'Healthy', 'Last Updated': 'Feb 16, 2026' },
      { Environment: 'staging', Type: 'Pre-Production', Region: 'us-east-1', Services: '14', Status: 'Degraded', 'Last Updated': 'Feb 15, 2026' },
      { Environment: 'qa', Type: 'QA', Region: 'us-west-2', Services: '10', Status: 'Healthy', 'Last Updated': 'Feb 14, 2026' },
      { Environment: 'dev', Type: 'Development', Region: 'us-west-2', Services: '15', Status: 'Healthy', 'Last Updated': 'Feb 16, 2026' },
    ],
  },
  'issues-by-project': {
    headers: ['Project', 'Open Issues', 'Closed Issues', 'Avg Resolution (days)', 'Last Activity'],
    rows: [
      { Project: 'AAP', 'Open Issues': '42', 'Closed Issues': '1,205', 'Avg Resolution (days)': '3.2', 'Last Activity': 'Feb 16, 2026' },
      { Project: 'FME', 'Open Issues': '118', 'Closed Issues': '4,832', 'Avg Resolution (days)': '5.1', 'Last Activity': 'Feb 16, 2026' },
      { Project: 'CDE', 'Open Issues': '67', 'Closed Issues': '2,341', 'Avg Resolution (days)': '4.8', 'Last Activity': 'Feb 15, 2026' },
      { Project: 'DEVOPS', 'Open Issues': '23', 'Closed Issues': '987', 'Avg Resolution (days)': '2.1', 'Last Activity': 'Feb 16, 2026' },
      { Project: 'BT', 'Open Issues': '89', 'Closed Issues': '3,456', 'Avg Resolution (days)': '6.3', 'Last Activity': 'Feb 14, 2026' },
      { Project: 'ENGTAI', 'Open Issues': '15', 'Closed Issues': '521', 'Avg Resolution (days)': '1.8', 'Last Activity': 'Feb 16, 2026' },
      { Project: 'COE', 'Open Issues': '31', 'Closed Issues': '1,102', 'Avg Resolution (days)': '4.0', 'Last Activity': 'Feb 13, 2026' },
      { Project: 'FLAM', 'Open Issues': '54', 'Closed Issues': '2,018', 'Avg Resolution (days)': '3.7', 'Last Activity': 'Feb 15, 2026' },
    ],
  },
}

// Default fallback dataset
const DEFAULT_DATASET = DATASOURCE_TABLES['daily-open-issues']

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
  const [datasource, setDatasource] = useState<string | undefined>(undefined)
  const activeDataset = (datasource && DATASOURCE_TABLES[datasource]) || DEFAULT_DATASET
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
    <div className="flex min-h-screen bg-cn-0">
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
      <div className="flex flex-1 flex-col gap-5 bg-cn-0 p-8">
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
          <div className="overflow-hidden rounded-md border border-borders-2">
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

              <div className="border-t border-borders-2 px-4 py-2.5">
                <Pagination
                  totalItems={criteriaRows.length}
                  pageSize={pageSize}
                  currentPage={currentPage}
                  goToPage={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[10, 20, 50]}
                  className="!mt-0"
                />
              </div>
              </>
            ) : (
              <>
                <Table.Root variant="default" size="normal">
                  <Table.Header>
                    <Table.Row>
                      {activeDataset.headers.map((h) => (
                        <Table.Head key={h}>{h}</Table.Head>
                      ))}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {activeDataset.rows.map((row, i) => (
                      <Table.Row key={i}>
                        {activeDataset.headers.map((h) => (
                          <Table.Cell key={h}>{row[h]}</Table.Cell>
                        ))}
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>

              <div className="border-t border-borders-2 px-4 py-2.5">
                <Pagination
                  totalItems={activeDataset.rows.length}
                  pageSize={pageSize}
                  currentPage={currentPage}
                  goToPage={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[10, 20, 50]}
                  className="!mt-0"
                />
              </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Builder panel */}
        <div className="w-1/3 min-w-0 border-l border-subtle pl-5">
          {/* Builder / Query tabs */}
          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List variant="outlined" className="w-full">
              <Tabs.Trigger value="builder" className="flex-1 justify-center">Builder</Tabs.Trigger>
              <Tabs.Trigger value="query" className="flex-1 justify-center">Query</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="builder">
              <div className="flex flex-col gap-5 pt-4">
                {/* Datasource */}
                <div className="flex flex-col gap-1.5">
                  <Text variant="body-strong" color="foreground-1">Datasource</Text>
                  <Select
                    value={datasource}
                    placeholder="Select a datasource"
                    options={DATASOURCE_METADATA.map((ds) => ({
                      label: (
                        <div className="flex flex-col gap-0.5">
                          <span>{ds.name}</span>
                          <span className="ds-desc">
                            <Text variant="caption-normal" color="foreground-3">{ds.description}</Text>
                          </span>
                        </div>
                      ),
                      value: ds.value,
                    }))}
                    allowSearch
                    contentWidth="triggerWidth"
                    triggerClassName="[&_.ds-desc]:hidden"
                    onChange={setDatasource}
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
