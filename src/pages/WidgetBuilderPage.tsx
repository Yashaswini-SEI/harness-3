import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Text,
  Button,
  IconV2,
  StatusBadge,
  Tag,
  Table,
  Pagination,
  Select,
  Tabs,
  NumberInput,
  TextInput,
} from '@harnessio/ui/components'
import { Nav2 } from '../components/Nav2'
import { Breadcrumb2 } from '../components/Breadcrumb2'
import splitIcon from '../assets/icon-split.svg'
import tableIcon from '../assets/icon-table.svg'
import chartIcon from '../assets/icon-chart.svg'
import table2Icon from '../assets/icon-table-2.svg'
import scatterIcon from '../assets/icon-scatter.svg'
import areaChartIcon from '../assets/icon-area-chart.svg'
import donutIcon from '../assets/icon-donut.svg'
import metricIcon from '../assets/icon-metric.svg'
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

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

// Simple deterministic hash for generating simulated aggregated data
function simHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// Scale factors per time range so switching tabs visibly changes data magnitude
const TIME_RANGE_SCALE: Record<string, number> = {
  '7D': 0.019,
  '1M': 0.083,
  '3M': 0.25,
  '6M': 0.5,
  '12M': 1,
  custom: 1,
}

const formatYAxis = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return String(value)
}

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
  const [viewMode, setViewMode] = useState<'split' | 'table' | 'chart'>('split')
  const [chartHeight, setChartHeight] = useState(280)
  const dragging = useRef(false)
  const dragStartY = useRef(0)
  const dragStartH = useRef(280)
  const [activeTab, setActiveTab] = useState('builder')
  const [criteriaAdded, setCriteriaAdded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [datasource, setDatasource] = useState<string | undefined>(undefined)
  const activeDataset = (datasource && DATASOURCE_TABLES[datasource]) || DEFAULT_DATASET
  const [criteriaColumn, setCriteriaColumn] = useState('Project')
  const [criteria2Column, setCriteria2Column] = useState<string | undefined>(undefined)
  const [criteriaInteracted, setCriteriaInteracted] = useState(false)
  const [sorted, setSorted] = useState(false)
  const [querySeed, setQuerySeed] = useState(0)
  const columnOptions = activeDataset.headers.map(h => ({ label: h, value: h }))
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

  // Variable name input autocomplete state
  const [varSuggestIndex, setVarSuggestIndex] = useState<number | null>(null)
  const [varSuggestSelected, setVarSuggestSelected] = useState(0)

  const varSuggestFiltered = varSuggestIndex !== null
    ? VARIABLE_SUGGESTIONS.filter(s => s.toLowerCase().includes((variables[varSuggestIndex]?.name ?? '').toLowerCase()))
    : []

  const filteredSuggestions = VARIABLE_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(suggestionFilter.toLowerCase())
  )

  // Reset criteria when datasource changes
  useEffect(() => {
    if (datasource === undefined) return
    const ds = DATASOURCE_TABLES[datasource] || DEFAULT_DATASET
    setCriteriaColumn(ds.headers[0] || 'Project')
    setCriteria2Column(undefined)
    setCriteriaAdded(false)
    setCriteriaInteracted(false)
  }, [datasource])

  // Generate aggregated criteria data dynamically, scaled by time range
  const scale = TIME_RANGE_SCALE[timeRange] ?? 1
  const criteriaData = useMemo(() => {
    const seen = new Set<string>()
    const results: { name: string; count: number; count2?: number }[] = []
    for (const row of activeDataset.rows) {
      const val = row[criteriaColumn]
      if (val && !seen.has(val)) {
        seen.add(val)
        const base = (simHash(val + criteriaColumn + '::' + querySeed) % 50_000_000) + 1_000
        results.push({
          name: val,
          count: Math.round(base * scale),
        })
      }
    }
    results.sort((a, b) => a.name.localeCompare(b.name))
    if (criteriaAdded && criteria2Column) {
      for (const r of results) {
        const base2 = (simHash(r.name + '_' + criteria2Column + '::' + querySeed) % 50_000_000) + 1_000
        r.count2 = Math.round(base2 * scale)
      }
    }
    return results
  }, [criteriaColumn, criteria2Column, criteriaAdded, activeDataset, scale, querySeed])

  const chartData = (sorted
    ? [...criteriaData].sort((a, b) => b.count - a.count)
    : criteriaData
  ).map(d => ({
    name: d.name,
    value: d.count,
  }))

  const scatterData = useMemo(() =>
    chartData.map((d, i) => ({
      x: i + 1,
      y: d.value,
      name: d.name,
    })),
  [chartData])

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

  // Resize handle drag logic
  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    dragStartY.current = e.clientY
    dragStartH.current = chartHeight

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      const delta = ev.clientY - dragStartY.current
      setChartHeight(Math.max(120, Math.min(600, dragStartH.current + delta)))
    }
    const onUp = () => {
      dragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [chartHeight])

  return (
    <div className="flex min-h-screen bg-cn-3">
      <Nav2 activeSection="insights" dark={dark} onThemeToggle={() => setDark(!dark)} />

      {/* Page content */}
      <div className="flex flex-1 flex-col gap-5 bg-cn-3 p-8">
      {/* Breadcrumb */}
      <Breadcrumb2 items={[
        { label: 'Account: Harness.io', href: '#' },
        { label: 'Organization: Harness Analytics', href: '#' },
        { label: 'Project: Split FME Analytics', href: '#' },
      ]} />

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
                <Tabs.Trigger value="table"><img src={table2Icon} alt="Table" className="h-4 w-4" /></Tabs.Trigger>
                <Tabs.Trigger value="line" icon="line-chart" />
                <Tabs.Trigger value="area"><img src={areaChartIcon} alt="Area chart" className="h-4 w-4" /></Tabs.Trigger>
                <Tabs.Trigger value="bar" icon="bar-vertical" />
                <Tabs.Trigger value="horizontal-bar" icon="bar-horizontal" />
                <Tabs.Trigger value="scatter"><img src={scatterIcon} alt="Scatter plot" className="h-4 w-4" /></Tabs.Trigger>
                <Tabs.Trigger value="donut"><img src={donutIcon} alt="Donut chart" className="h-4 w-4" /></Tabs.Trigger>
                <Tabs.Trigger value="metric"><img src={metricIcon} alt="Metric" className="h-4 w-4" /></Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>
          </div>
          {chartType === 'line' && viewMode !== 'table' && (
            <div className="p-6">
              <svg width="0" height="0">
                <defs>
                  <filter id="line-shadow">
                    <feDropShadow dx="0" dy="5" stdDeviation="6.5" floodColor="rgba(41, 173, 255, 0.25)" floodOpacity="1" />
                  </filter>
                </defs>
              </svg>
              <ResponsiveContainer width="100%" height={chartHeight * 1.5}>
                <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="8 6" vertical={false} stroke="var(--cn-border-2, #E5E7EB)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatYAxis}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), 'Count']}
                    contentStyle={{ borderRadius: 8, fontSize: 13 }}
                  />
                  <Legend
                    iconType="square"
                    iconSize={10}
                    wrapperStyle={{ fontSize: 13, paddingTop: 12, fontFamily: "'JetBrains Mono', monospace" }}
                    formatter={(value) => <span style={{ color: '#4B5563' }}>{value}</span>}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Count"
                    stroke="var(--cn-comp-data-viz-01-blue, #2DA6FF)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                    style={{ filter: 'url(#line-shadow)' }}
                    animationDuration={150}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {chartType === 'bar' && viewMode !== 'table' && (
            <div className="p-6">
              <svg width="0" height="0">
                <defs>
                  <filter id="bar-shadow">
                    <feDropShadow dx="0" dy="5" stdDeviation="6.5" floodColor="rgba(41, 173, 255, 0.25)" floodOpacity="1" />
                  </filter>
                </defs>
              </svg>
              <ResponsiveContainer width="100%" height={chartHeight * 1.5}>
                <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barGap={12}>
                  <CartesianGrid strokeDasharray="8 6" vertical={false} stroke="var(--cn-border-2, #E5E7EB)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatYAxis}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), 'Count']}
                    contentStyle={{ borderRadius: 8, fontSize: 13 }}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
                  />
                  <Legend
                    iconType="square"
                    iconSize={10}
                    wrapperStyle={{ fontSize: 13, paddingTop: 12, fontFamily: "'JetBrains Mono', monospace" }}
                    formatter={(value) => <span style={{ color: '#4B5563' }}>{value}</span>}
                  />
                  <Bar
                    dataKey="value"
                    name="Count"
                    fill="var(--cn-comp-data-viz-01-blue, #2DA6FF)"
                    radius={[4, 4, 0, 0]}
                    barSize={32}
                    style={{ filter: 'url(#bar-shadow)' }}
                    animationDuration={150}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {chartType === 'donut' && viewMode !== 'table' && (
            <div className="p-6 overflow-visible">
              <svg width="0" height="0">
                <defs>
                  {['#2DA6FF', '#6366F1', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'].map((color, i) => (
                    <filter key={i} id={`donut-shadow-${i}`}>
                      <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor={color} floodOpacity="0.35" />
                    </filter>
                  ))}
                </defs>
              </svg>
              <ResponsiveContainer width="100%" height={chartHeight * 1.5} style={{ overflow: 'visible' }}>
                <PieChart style={{ overflow: 'visible' }}>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="80%"
                    paddingAngle={2}
                    animationDuration={150}
                  >
                    {chartData.map((_, index) => {
                      const colors = ['#2DA6FF', '#6366F1', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6']
                      const ci = index % 8
                      return (
                        <Cell
                          key={index}
                          fill={colors[ci]}
                          style={{ filter: `url(#donut-shadow-${ci})` }}
                        />
                      )
                    })}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), 'Count']}
                    contentStyle={{ borderRadius: 8, fontSize: 13 }}
                  />
                  <Legend
                    iconType="square"
                    iconSize={10}
                    wrapperStyle={{ fontSize: 13, paddingTop: 12, fontFamily: "'JetBrains Mono', monospace" }}
                    formatter={(value) => <span style={{ color: '#4B5563' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {chartType === 'horizontal-bar' && viewMode !== 'table' && (
            <div className="p-6">
              <ResponsiveContainer width="100%" height={chartHeight * 1.5}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barGap={12}>
                  <CartesianGrid strokeDasharray="8 6" horizontal={false} stroke="var(--cn-border-2, #E5E7EB)" />
                  <XAxis
                    type="number"
                    tickFormatter={formatYAxis}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), 'Count']}
                    contentStyle={{ borderRadius: 8, fontSize: 13 }}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
                  />
                  <Legend
                    iconType="square"
                    iconSize={10}
                    wrapperStyle={{ fontSize: 13, paddingTop: 12, fontFamily: "'JetBrains Mono', monospace" }}
                    formatter={(value) => <span style={{ color: '#4B5563' }}>{value}</span>}
                  />
                  <Bar
                    dataKey="value"
                    name="Count"
                    fill="var(--cn-comp-data-viz-01-blue, #2DA6FF)"
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                    animationDuration={150}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {chartType === 'area' && viewMode !== 'table' && (
            <div className="p-6">
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2DA6FF" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#2DA6FF" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
              </svg>
              <ResponsiveContainer width="100%" height={chartHeight * 1.5}>
                <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="8 6" vertical={false} stroke="var(--cn-border-2, #E5E7EB)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatYAxis}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), 'Count']}
                    contentStyle={{ borderRadius: 8, fontSize: 13 }}
                  />
                  <Legend
                    iconType="square"
                    iconSize={10}
                    wrapperStyle={{ fontSize: 13, paddingTop: 12, fontFamily: "'JetBrains Mono', monospace" }}
                    formatter={(value) => <span style={{ color: '#4B5563' }}>{value}</span>}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Count"
                    stroke="#2DA6FF"
                    strokeWidth={2}
                    fill="url(#area-gradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#2DA6FF' }}
                    animationDuration={150}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          {chartType === 'scatter' && viewMode !== 'table' && (
            <div className="p-6">
              <ResponsiveContainer width="100%" height={chartHeight * 1.5}>
                <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="8 6" stroke="var(--cn-border-2, #E5E7EB)" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Index"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Count"
                    tickFormatter={formatYAxis}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    formatter={(value: number) => value.toLocaleString()}
                    contentStyle={{ borderRadius: 8, fontSize: 13 }}
                    cursor={{ strokeDasharray: '4 4' }}
                  />
                  <Legend
                    iconType="square"
                    iconSize={10}
                    wrapperStyle={{ fontSize: 13, paddingTop: 12, fontFamily: "'JetBrains Mono', monospace" }}
                    formatter={(value) => <span style={{ color: '#4B5563' }}>{value}</span>}
                  />
                  <Scatter
                    name="Count"
                    data={scatterData}
                    fill="#8B5CF6"
                    animationDuration={150}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
          {chartType === 'metric' && (
            <div className="flex items-center justify-center p-6" style={{ height: chartHeight * 1.5 }}>
              <div className="flex flex-col items-center gap-2">
                <span className="text-foreground-1" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 64, fontWeight: 600, lineHeight: 1 }}>
                  {chartData.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
                </span>
                <span className="text-sm text-foreground-3">Total Count</span>
              </div>
            </div>
          )}
          {/* View mode control — horizontal rule with centered tabs overlay */}
          {(chartType === 'line' || chartType === 'bar' || chartType === 'horizontal-bar' || chartType === 'donut' || chartType === 'area' || chartType === 'scatter') && (
            <div className="relative flex items-center justify-center mb-6">
              {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
              <div className="absolute inset-x-0 -top-1.5 bottom-0 cursor-row-resize" onMouseDown={onResizeStart} />
              <hr className="absolute inset-x-0 border-borders-2 pointer-events-none" />
              <div className="relative z-10">
                <Tabs.Root value={viewMode} onValueChange={(v) => setViewMode(v as 'split' | 'table' | 'chart')}>
                  <Tabs.List variant="outlined">
                    <Tabs.Trigger value="split"><img src={splitIcon} alt="Split view" className="h-4 w-4" /></Tabs.Trigger>
                    <Tabs.Trigger value="table"><img src={tableIcon} alt="Table only" className="h-4 w-4" /></Tabs.Trigger>
                    <Tabs.Trigger value="chart"><img src={chartIcon} alt="Chart only" className="h-4 w-4" /></Tabs.Trigger>
                  </Tabs.List>
                </Tabs.Root>
              </div>
            </div>
          )}
          {viewMode !== 'chart' && <div className="overflow-hidden rounded-lg border border-borders-2">
            {criteriaInteracted ? (
              <>
                <Table.Root variant="default" size="normal">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>{criteriaColumn}</Table.Head>
                      <Table.Head>Count</Table.Head>
                      {criteriaAdded && criteria2Column && (
                        <Table.Head>{criteria2Column} Count</Table.Head>
                      )}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {criteriaData.map((row) => (
                      <Table.Row key={row.name}>
                        <Table.Cell>{row.name}</Table.Cell>
                        <Table.Cell>{row.count.toLocaleString()}</Table.Cell>
                        {criteriaAdded && criteria2Column && (
                          <Table.Cell>{(row.count2 ?? 0).toLocaleString()}</Table.Cell>
                        )}
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>

              <div className="border-t border-borders-2 px-4 py-2.5">
                <Pagination
                  totalItems={criteriaData.length}
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
          </div>}
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
                    triggerClassName="[&_.ds-desc]:hidden"
                    onChange={setDatasource}
                  />
                </div>

                {/* Selection Criteria */}
                <div className="flex flex-col gap-3 rounded-lg border border-subtle p-3">
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
                      value={criteriaColumn}
                      options={columnOptions}
                      onChange={(val) => {
                        if (val) {
                          setCriteriaColumn(val)
                          setCriteriaInteracted(true)
                        }
                      }}
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
                    <Button variant="ghost" size="sm" className="self-start" onClick={() => {
                      setCriteriaAdded(true)
                      setCriteriaInteracted(true)
                      const otherHeaders = activeDataset.headers.filter(h => h !== criteriaColumn)
                      setCriteria2Column(otherHeaders[0] || activeDataset.headers[0])
                    }}>
                      <IconV2 name="plus" size="sm" />
                      <Text color="brand" variant="body-normal">Select Criteria</Text>
                    </Button>
                  )}
                </div>

                {/* Second Selection Criteria (shown after clicking Select Criteria) */}
                {criteriaAdded && (
                  <div className="flex flex-col gap-3 rounded-lg border border-subtle p-3">
                    <div className="flex items-center justify-between">
                      <Text variant="body-strong" color="foreground-1">Selection Criteria</Text>
                      <Button variant="ghost" size="sm" onClick={() => { setCriteriaAdded(false); setCriteria2Column(undefined) }}>
                        <IconV2 name="trash" size="sm" />
                        Remove
                      </Button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Text variant="caption-normal" color="foreground-3">Column</Text>
                      <Select
                        value={criteria2Column}
                        options={columnOptions}
                        onChange={(val) => { if (val) setCriteria2Column(val) }}
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
                <div className="flex flex-col gap-2 rounded-lg border border-subtle p-3">
                  <Text variant="body-strong" color="foreground-1">
                    Filter Criteria <Text as="span" variant="body-normal" color="foreground-3">(Optional)</Text>
                  </Text>
                  <Button variant="ghost" size="sm" className="self-start">
                    <IconV2 name="plus" size="sm" />
                    <Text color="brand" variant="body-normal">Filter Criteria</Text>
                  </Button>
                </div>

                {/* Group by */}
                <div className="flex flex-col gap-2 rounded-lg border border-subtle p-3">
                  <Text variant="body-strong" color="foreground-1">
                    Group by <Text as="span" variant="body-normal" color="foreground-3">(Optional)</Text>
                  </Text>
                  <Button variant="ghost" size="sm" className="self-start">
                    <IconV2 name="plus" size="sm" />
                    <Text color="brand" variant="body-normal">Group by</Text>
                  </Button>
                </div>

                {/* Sort by */}
                <div className="flex flex-col gap-2 rounded-lg border border-subtle p-3">
                  <Text variant="body-strong" color="foreground-1">
                    Sort by <Text as="span" variant="body-normal" color="foreground-3">(Optional)</Text>
                  </Text>
                  {sorted ? (
                    <div className="flex items-center justify-between">
                      <Text variant="body-normal" color="foreground-1">Count — Descending</Text>
                      <Button variant="ghost" size="sm" onClick={() => setSorted(false)}>
                        <IconV2 name="trash" size="sm" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" className="self-start" onClick={() => { setSorted(true); setCriteriaInteracted(true) }}>
                      <IconV2 name="plus" size="sm" />
                      <Text color="brand" variant="body-normal">Sort by</Text>
                    </Button>
                  )}
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
                  <div className="relative mb-cn-sm">
                    <div className="flex w-full overflow-hidden rounded-md border border-borders-2 bg-cn-0">
                      <div
                        className="shrink-0 select-none bg-cn-2 px-2 pt-[9px] text-right font-mono text-sm leading-[20px] text-foreground-3"
                        aria-hidden
                      >
                        {queryText.split('\n').map((_, i) => (
                          <div key={i}>{i + 1}</div>
                        ))}
                      </div>
                      <textarea
                        ref={textareaRef}
                        value={queryText}
                        onChange={handleQueryChange}
                        onKeyDown={handleQueryKeyDown}
                        onBlur={() => {
                          // Delay to allow click on suggestion
                          setTimeout(() => setShowSuggestions(false), 150)
                        }}
                        className="min-w-0 flex-1 w-full resize-none bg-cn-0 p-2 pt-[9px] font-mono text-sm leading-[20px] text-foreground-1 outline-none"
                        rows={8}
                      />
                    </div>
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-md border border-borders-2 bg-cn-1 shadow-lg">
                        {filteredSuggestions.map((name, i) => {
                          const iconColor = i % 2 === 0 ? '#8B5CF6' : '#2DA6FF'
                          const parts = name.split(/(account)/g)
                          return (
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
                                <span style={{ color: iconColor }}><IconV2 name="variables" size="sm" /></span>
                                <span className="text-foreground-1">
                                  {parts.map((part, j) =>
                                    part === 'account' ? <span key={j} className="font-semibold">{part}</span> : <span key={j}>{part}</span>
                                  )}
                                </span>
                              </span>
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#9CA3AF' }}>${'{'}${name}{'}'}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <Text variant="body-normal" color="foreground-3">
                    {'Use ${variableName} syntax in your query'}
                  </Text>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => { setQuerySeed(s => s + 1); setCriteriaInteracted(true) }}>
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
                      <div className="relative flex-1">
                        {index === 0 && (
                          <Text variant="body-normal" color="foreground-1" className="mb-1 block">Name</Text>
                        )}
                        <TextInput
                          value={variable.name}
                          onChange={(e) => {
                            const next = [...variables]
                            next[index] = { ...next[index], name: e.target.value }
                            setVariables(next)
                            setVarSuggestIndex(index)
                            setVarSuggestSelected(0)
                          }}
                          onFocus={() => { setVarSuggestIndex(index); setVarSuggestSelected(0) }}
                          onBlur={() => setTimeout(() => setVarSuggestIndex(null), 150)}
                          onKeyDown={(e) => {
                            if (varSuggestIndex !== index || varSuggestFiltered.length === 0) return
                            if (e.key === 'ArrowDown') { e.preventDefault(); setVarSuggestSelected(i => Math.min(i + 1, varSuggestFiltered.length - 1)) }
                            else if (e.key === 'ArrowUp') { e.preventDefault(); setVarSuggestSelected(i => Math.max(i - 1, 0)) }
                            else if (e.key === 'Enter' || e.key === 'Tab') {
                              e.preventDefault()
                              const next = [...variables]
                              next[index] = { ...next[index], name: varSuggestFiltered[varSuggestSelected] }
                              setVariables(next)
                              setVarSuggestIndex(null)
                            }
                            else if (e.key === 'Escape') setVarSuggestIndex(null)
                          }}
                        />
                        {varSuggestIndex === index && varSuggestFiltered.length > 0 && (
                          <div className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-md border border-borders-2 bg-cn-1 shadow-lg">
                            {varSuggestFiltered.map((name, i) => {
                              const iconColor = i % 2 === 0 ? '#8B5CF6' : '#2DA6FF'
                              const parts = name.split(/(account)/g)
                              return (
                                <button
                                  key={name}
                                  type="button"
                                  className={`z-10 flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm ${
                                    i === varSuggestSelected ? 'bg-cn-hover' : 'hover:bg-cn-hover'
                                  }`}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    const next = [...variables]
                                    next[index] = { ...next[index], name }
                                    setVariables(next)
                                    setVarSuggestIndex(null)
                                  }}
                                  onMouseEnter={() => setVarSuggestSelected(i)}
                                >
                                  <span className="flex items-center gap-2">
                                    <span style={{ color: iconColor }}><IconV2 name="variables" size="sm" /></span>
                                    <span className="text-foreground-1">
                                      {parts.map((part, j) =>
                                        part === 'account' ? <span key={j} className="font-semibold">{part}</span> : <span key={j}>{part}</span>
                                      )}
                                    </span>
                                  </span>
                                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#9CA3AF' }}>${'{'}${name}{'}'}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}
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

                <div className="flex justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVariables([...variables, { name: '', defaultValue: '' }])}
                  >
                    <IconV2 name="plus" size="sm" />
                    New Variable
                  </Button>
                  {/* <Text variant="body-normal" color="foreground-3">
                    {'Also add by typing ${variableName} above.'}
                  </Text> */}
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
