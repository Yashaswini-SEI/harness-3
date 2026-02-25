import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import {
  Text,
  Button,
  IconV2,
  SearchInput,
  Tag,
  Card,
  Tabs,
  Select,
  TextInput,
} from '@harnessio/ui/components'
import imgEmptyState from '../assets/img-empty-state.svg'
import { Nav2 } from '../components/Nav2'

// Dashboard thumbnail imports (light variants)
import thumb1 from '../assets/dashboard-thumbnails/1-light.svg'
import thumb2 from '../assets/dashboard-thumbnails/2-light.svg'
import thumb3 from '../assets/dashboard-thumbnails/3-light.svg'
import thumb4 from '../assets/dashboard-thumbnails/4-light.svg'
import thumb5 from '../assets/dashboard-thumbnails/5-light.svg'
import thumb6 from '../assets/dashboard-thumbnails/6-light.svg'
import thumb7 from '../assets/dashboard-thumbnails/7-light.svg'
import thumb8 from '../assets/dashboard-thumbnails/8-light.svg'


// ── Org tree data ──
interface OrgNode {
  id: string
  name: string
  children?: OrgNode[]
}

const orgTreeData: OrgNode[] = [
  { id: 'harness-fme', name: 'Harness FME' },
  {
    id: 'harness-sei', name: 'Harness SEI', children: [
      {
        id: 'arvind', name: 'Arvind Srinivasulu', children: [
          { id: 'alex', name: 'Alex N Markov', children: [
            { id: 'alex-1', name: 'Deepak Patel' },
            { id: 'alex-2', name: 'Riya Sharma' },
          ]},
          { id: 'abdul', name: 'Abdul Asheem', children: [
            { id: 'abdul-1', name: 'Neha Gupta' },
            { id: 'abdul-2', name: 'Vikram Singh' },
            { id: 'abdul-3', name: 'Priya Nair' },
          ]},
          { id: 'kate', name: 'Kate Williams' },
        ],
      },
      {
        id: 'minash', name: 'Minash Ranjan', children: [
          { id: 'minash-1', name: 'Raj Mehta' },
          { id: 'minash-2', name: 'Anita Desai', children: [
            { id: 'anita-1', name: 'Suresh Kumar' },
            { id: 'anita-2', name: 'Meena Iyer' },
          ]},
        ],
      },
      {
        id: 'sachin', name: 'Sachin Walunj', children: [
          { id: 'sachin-1', name: 'Pooja Reddy' },
          { id: 'sachin-2', name: 'Manoj Tiwari' },
        ],
      },
      {
        id: 'adam', name: 'Adam England', children: [
          { id: 'adam-1', name: 'James Chen' },
          { id: 'adam-2', name: 'Sarah Mitchell' },
          { id: 'adam-3', name: 'David Park' },
        ],
      },
      {
        id: 'charu', name: 'Charu Swaroop', children: [
          { id: 'charu-1', name: 'Arun Joshi' },
          { id: 'charu-2', name: 'Kavitha Rao', children: [
            { id: 'kavitha-1', name: 'Lakshmi Menon' },
          ]},
        ],
      },
      { id: 'parvez', name: 'Parvez Husein', children: [
        { id: 'parvez-1', name: 'Omar Farooq' },
      ]},
      { id: 'frank', name: 'Frank Lino', children: [
        { id: 'frank-1', name: 'Maria Santos' },
      ]},
      { id: 'prasad', name: 'Prasad Vazhakkattil', children: [
        { id: 'prasad-1', name: 'Harish Nambiar' },
      ]},
      { id: 'shan', name: 'Shan Calhoun', children: [
        { id: 'shan-1', name: 'Tyler Brooks' },
      ]},
      { id: 'bob', name: 'Bob Coyle', children: [
        { id: 'bob-1', name: 'Linda Torres' },
        { id: 'bob-2', name: 'Mike Johnson' },
      ]},
      { id: 'promila', name: 'Promila Sagar', children: [
        { id: 'promila-1', name: 'Rekha Bhat' },
        { id: 'promila-2', name: 'Sanjay Verma' },
      ]},
      { id: 'jash', name: 'Jash Jeyasingh', children: [
        { id: 'jash-1', name: 'Kiran Rao' },
        { id: 'jash-2', name: 'Mohan Das' },
        { id: 'jash-3', name: 'Divya Pillai' },
      ]},
      { id: 'ajay', name: 'Ajay Kumar Singh', children: [
        { id: 'ajay-1', name: 'Rohit Agarwal' },
        { id: 'ajay-2', name: 'Sunita Pandey' },
      ]},
      { id: 'greg', name: 'Greg Bender', children: [
        { id: 'greg-1', name: 'Emily Watson' },
      ]},
      { id: 'sahil', name: 'Sahil Malhotra', children: [
        { id: 'sahil-1', name: 'Amit Kapoor' },
        { id: 'sahil-2', name: 'Nisha Arora' },
      ]},
      { id: 'ivan', name: 'Ivan de la Garza', children: [
        { id: 'ivan-1', name: 'Carlos Rivera' },
      ]},
      { id: 'reggie', name: 'Reggie Hawkins', children: [
        { id: 'reggie-1', name: 'Jordan Lee' },
      ]},
    ],
  },
  {
    id: 'harness-cicd', name: 'Harness CI/CD', children: [
      {
        id: 'rachel', name: 'Rachel Foster', children: [
          { id: 'rachel-1', name: 'Ben Nguyen' },
          { id: 'rachel-2', name: 'Sophie Clark' },
        ],
      },
      {
        id: 'marcus', name: 'Marcus Webb', children: [
          { id: 'marcus-1', name: 'Hannah Price' },
        ],
      },
    ],
  },
]


function nodeMatchesSearch(node: OrgNode, query: string): boolean {
  const q = query.toLowerCase()
  if (node.name.toLowerCase().includes(q)) return true
  if (node.children) return node.children.some((child) => nodeMatchesSearch(child, q))
  return false
}

function filterTree(nodes: OrgNode[], query: string): OrgNode[] {
  if (!query) return nodes
  const q = query.toLowerCase()
  return nodes.reduce<OrgNode[]>((acc, node) => {
    const directMatch = node.name.toLowerCase().includes(q)
    if (directMatch) {
      // Direct match: keep all children so user can select them
      acc.push(node)
    } else if (nodeMatchesSearch(node, query)) {
      // Descendant matches: filter children to show path to match
      const filteredChildren = node.children ? filterTree(node.children, query) : undefined
      acc.push({ ...node, children: filteredChildren })
    }
    return acc
  }, [])
}

function collectIds(nodes: OrgNode[]): string[] {
  return nodes.flatMap((n) => [n.id, ...(n.children ? collectIds(n.children) : [])])
}

function collectNodeIds(node: OrgNode): string[] {
  return [node.id, ...(node.children ? node.children.flatMap(collectNodeIds) : [])]
}

function getCheckState(node: OrgNode, checked: Set<string>): 'checked' | 'unchecked' | 'indeterminate' {
  const ids = collectNodeIds(node)
  const count = ids.filter((id) => checked.has(id)).length
  if (count === 0) return 'unchecked'
  if (count === ids.length) return 'checked'
  return 'indeterminate'
}

function OrgCheckboxTree({
  nodes,
  checked,
  onToggle,
  search,
  level = 0,
}: {
  nodes: OrgNode[]
  checked: Set<string>
  onToggle: (node: OrgNode) => void
  search: string
  level?: number
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    if (!search) return nodes
    return filterTree(nodes, search)
  }, [nodes, search])

  return (
    <>
      {filtered.map((node) => {
        const state = getCheckState(node, checked)
        const hasChildren = node.children && node.children.length > 0
        const isCollapsed = collapsed.has(node.id) && !search

        return (
          <div key={node.id}>
            <div
              className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-cn-2"
              style={{ paddingLeft: 8 + level * 20 }}
            >
              {/* Expand/collapse chevron */}
              <button
                className="flex h-4 w-4 shrink-0 items-center justify-center"
                onClick={() => {
                  if (!hasChildren) return
                  setCollapsed((prev) => {
                    const next = new Set(prev)
                    next.has(node.id) ? next.delete(node.id) : next.add(node.id)
                    return next
                  })
                }}
              >
                {hasChildren && (
                  <IconV2 name={isCollapsed ? 'nav-arrow-right' : 'nav-arrow-down'} size="xs" className="text-foreground-3" />
                )}
              </button>

              {/* Checkbox */}
              <button
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
                style={{
                  backgroundColor: state === 'checked' ? 'var(--cn-brand, #006DEA)' : state === 'indeterminate' ? 'var(--cn-brand, #006DEA)' : 'transparent',
                  borderColor: state !== 'unchecked' ? 'var(--cn-brand, #006DEA)' : '#D0D5DD',
                }}
                onClick={() => onToggle(node)}
              >
                {state === 'checked' && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {state === 'indeterminate' && (
                  <svg width="8" height="2" viewBox="0 0 8 2" fill="none">
                    <path d="M1 1H7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </button>

              {/* Label */}
              <span className="flex-1 truncate text-sm text-foreground-1">{node.name}</span>
              {hasChildren && (
                <span className="text-xs text-foreground-4">{node.children!.length}</span>
              )}
            </div>

            {/* Children */}
            {hasChildren && !isCollapsed && (
              <OrgCheckboxTree
                nodes={node.children!}
                checked={checked}
                onToggle={onToggle}
                search={search}
                level={level + 1}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

// ── Insight cards data ──
const harnessInsights = [
  {
    id: 'ai-insights',
    title: 'AI Insights',
    description: 'AI coding assistant adoption and impact insights for your teams.',
    tag: 'AI Insights',
    thumb: thumb1,
  },
  {
    id: 'efficiency-dora',
    title: 'DORA',
    description: 'DORA metrics measure software delivery performance.',
    tag: 'Efficiency',
    thumb: thumb2,
  },
  {
    id: 'efficiency-sprint-metrics',
    title: 'Sprint Metrics',
    description: 'Shows planning effectiveness, delivery consistency, and team predictability.',
    tag: 'Efficiency',
    thumb: thumb3,
  },
  {
    id: 'velocity',
    title: 'Velocity',
    description: 'Tracks delivery speed and throughput across the development cycle.',
    tag: 'Productivity',
    thumb: thumb4,
  },
  {
    id: 'quality',
    title: 'Quality',
    description: 'Monitors defects, test results, and code health.',
    tag: 'Productivity',
    thumb: thumb5,
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    description: 'Measures teamwork through code reviews, contributions, and communication patterns.',
    tag: 'Productivity',
    thumb: thumb6,
  },
  {
    id: 'business-alignment',
    title: 'Business Alignment',
    description: "Business alignment is the strategic fit between a company's software initiatives and its core business goals to maximize value and impact.",
    tag: 'Alignment',
    thumb: thumb7,
  },
  {
    id: 'productivity',
    title: 'Productivity',
    description: 'Measure and supercharge dev productivity with PR velocity, cycle time, work completed, and code rework metrics.',
    tag: 'Productivity',
    thumb: thumb8,
  },
]

function CanvasVariableRow({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [overridden, setOverridden] = useState(false)
  const [value, setValue] = useState(defaultValue)
  const savedValueRef = useRef(defaultValue)

  return (
    <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3 py-2.5">
      <TextInput value={name} disabled={!overridden} onChange={() => {}} />
      <Text variant="body-normal" color="foreground-4">=</Text>
      <TextInput
        value={value}
        disabled={!overridden}
        onChange={(e) => setValue(e.target.value)}
      />
      {overridden ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setValue(savedValueRef.current)
            setOverridden(false)
          }}
        >
          <IconV2 name="undo" size="xs" />
          Restore value
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            savedValueRef.current = value
            setOverridden(true)
          }}
        >
          <IconV2 name="overrides" size="xs" />
          Override
        </Button>
      )}
    </div>
  )
}

function findNodeName(nodes: OrgNode[], id: string): string | undefined {
  for (const node of nodes) {
    if (node.id === id) return node.name
    if (node.children) {
      const found = findNodeName(node.children, id)
      if (found) return found
    }
  }
}

export function InsightsPage2() {
  const location = useLocation()
  const savedInsight = (location.state as { insightSaved?: boolean; insightName?: string } | null)
  const [hasCustomInsight, setHasCustomInsight] = useState(false)
  const customInsightName = savedInsight?.insightName || 'Process Efficiency'

  useEffect(() => {
    if (savedInsight?.insightSaved) {
      setHasCustomInsight(true)
    }
  }, [savedInsight])

  const [search, setSearch] = useState('')
  const [settingsNode, setSettingsNode] = useState<string | null>(null)
  const [panelVisible, setPanelVisible] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [harnessInsightsOpen, setHarnessInsightsOpen] = useState(true)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>()

  // Org tree dropdown state
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false)
  const [orgSearch, setOrgSearch] = useState('')
  const [checkedOrgIds, setCheckedOrgIds] = useState<Set<string>>(new Set())
  const orgDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!orgDropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(e.target as Node)) {
        setOrgDropdownOpen(false)
        setOrgSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [orgDropdownOpen])

  const closeSettings = useCallback(() => {
    setPanelOpen(false)
    // Wait for the transition to finish before unmounting
    closeTimerRef.current = setTimeout(() => {
      setPanelVisible(false)
      setSettingsNode(null)
    }, 300)
  }, [])


  return (
    <Nav2 activeSection="insights">
      {/* Page content */}
      <div className="flex flex-1 flex-col gap-5 overflow-auto px-5 pb-5 pt-6">
        {/* Page title */}
        <Text as="h1" variant="heading-hero" color="foreground-1">Insights</Text>

        {/* Filter bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchInput
              placeholder="Search org tree names, team names and insight name"
              searchValue={search}
              onChange={(value) => setSearch(value)}
            />
          </div>
          <div className="relative" ref={orgDropdownRef}>
            <Button variant="outline" size="md" onClick={() => { setOrgDropdownOpen((p) => !p); setOrgSearch('') }}>
              <IconV2 name={'organization-solid' as never} size="sm" />
              Org Tree
              {checkedOrgIds.size > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cn-brand px-1 text-xs text-white">
                  {checkedOrgIds.size}
                </span>
              )}
              <IconV2 name="nav-arrow-down" size="sm" />
            </Button>

            {orgDropdownOpen && (
              <div
                className="absolute left-0 top-full z-50 mt-1 flex w-[360px] flex-col rounded-lg border border-borders-2"
                style={{ backgroundColor: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.04)', borderRadius: 8 }}
                ref={(el) => {
                  if (!el) return
                  const rect = el.parentElement!.getBoundingClientRect()
                  const spaceBelow = window.innerHeight - rect.bottom - 16
                  const spaceAbove = rect.top - 16
                  if (spaceBelow >= spaceAbove) {
                    el.style.top = '100%'
                    el.style.bottom = 'auto'
                    el.style.maxHeight = `${spaceBelow}px`
                    el.style.marginTop = '4px'
                    el.style.marginBottom = '0'
                  } else {
                    el.style.top = 'auto'
                    el.style.bottom = '100%'
                    el.style.maxHeight = `${spaceAbove}px`
                    el.style.marginTop = '0'
                    el.style.marginBottom = '4px'
                  }
                }}
              >
                {/* Search */}
                <div className="border-b border-borders-2 p-2">
                  <SearchInput
                    placeholder="Search org tree..."
                    searchValue={orgSearch}
                    onChange={(v) => setOrgSearch(v)}
                  />
                </div>

                {/* Select all / Clear */}
                <div className="flex items-center justify-between border-b border-borders-2 px-3 py-1.5">
                  <button
                    className="text-xs text-foreground-3 hover:text-foreground-1"
                    onClick={() => setCheckedOrgIds(new Set(collectIds(orgTreeData)))}
                  >
                    Select all
                  </button>
                  <button
                    className="text-xs text-foreground-3 hover:text-foreground-1"
                    onClick={() => setCheckedOrgIds(new Set())}
                  >
                    Clear
                  </button>
                </div>

                {/* Tree */}
                <div className="flex-1 overflow-y-auto py-1">
                  <OrgCheckboxTree
                    nodes={orgTreeData}
                    checked={checkedOrgIds}
                    onToggle={(node) => {
                      setCheckedOrgIds((prev) => {
                        const next = new Set(prev)
                        const ids = collectNodeIds(node)
                        const allChecked = ids.every((id) => next.has(id))
                        if (allChecked) {
                          ids.forEach((id) => next.delete(id))
                        } else {
                          ids.forEach((id) => next.add(id))
                        }
                        return next
                      })
                    }}
                    search={orgSearch}
                  />
                </div>
              </div>
            )}
          </div>
          <Button variant="outline" size="md">
            Tag
            <IconV2 name="nav-arrow-down" size="sm" />
          </Button>
          <Button variant="outline" size="md">
            Owner
            <IconV2 name="nav-arrow-down" size="sm" />
          </Button>
          <Button variant="outline" size="md">
            <IconV2 name="arrows-updown" size="sm" />
            Most Recent
            <IconV2 name="nav-arrow-down" size="sm" />
          </Button>
        </div>

        {/* Insights overview */}
        <div className="flex flex-col gap-5">
            {/* "Insights by Harness" collapsible section */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <button className="flex items-center gap-2" onClick={() => setHarnessInsightsOpen((v) => !v)}>
                  <IconV2 name={harnessInsightsOpen ? 'nav-arrow-down' : 'nav-arrow-right'} size="sm" />
                  <Text as="h2" variant="heading-subsection" color="foreground-1">
                    Insights by Harness
                  </Text>
                </button>
                <div className={`flex items-center gap-2${harnessInsightsOpen ? '' : ' invisible'}`}>
                  <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
                    <IconV2 name="nav-arrow-left" size="sm" />
                  </Button>
                  <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
                    <IconV2 name="nav-arrow-right" size="sm" />
                  </Button>
                </div>
              </div>
              {harnessInsightsOpen && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {harnessInsights.map((insight) => (
                    <Link key={insight.id} to={`/module/sei/insights/harness/${insight.id}`} className="rounded-lg no-underline">
                      <Card.Root size="sm" orientation="horizontal" className="border-0 shadow-none transition-colors hover:bg-cn-2 cursor-pointer">
                        <Card.Content>
                          <div className="flex gap-4">
                            <div className="shrink-0 flex items-center justify-center w-[85px] h-[73px] rounded">
                              <img src={insight.thumb} alt={insight.title} className="h-full w-full object-contain" />
                            </div>
                            <div className="flex flex-col gap-3 min-w-0">
                              <div className="flex flex-col gap-1">
                                <Text variant="body-strong" color="foreground-1">{insight.title}</Text>
                                <Text variant="body-normal" color="foreground-3">{insight.description}</Text>
                              </div>
                              <div>
                                <Tag variant="outline" theme="gray" size="sm" value={insight.tag} />
                              </div>
                            </div>
                          </div>
                        </Card.Content>
                      </Card.Root>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* "Custom insights" section */}
            <div className="flex flex-col gap-4">
              <Text as="h2" variant="heading-subsection" color="foreground-1">
                Custom insights
              </Text>
              {hasCustomInsight ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  <a href="/module/sei/insights/custom/1" className="rounded-lg">
                    <Card.Root size="sm" orientation="horizontal" className="border-0 shadow-none transition-colors hover:bg-cn-2 cursor-pointer">
                      <Card.Content>
                        <div className="flex gap-4">
                          <div className="shrink-0 flex items-center justify-center w-[85px] h-[73px] rounded">
                            <img src={thumb5} alt={customInsightName} className="h-full w-full object-contain" />
                          </div>
                          <div className="flex flex-col gap-3 min-w-0">
                            <div className="flex flex-col gap-1">
                              <Text variant="body-strong" color="foreground-1">{customInsightName}</Text>
                              <Text variant="body-normal" color="foreground-3">Custom insight with issues by project widget.</Text>
                            </div>
                            <div>
                              <Tag variant="outline" theme="gray" size="sm" value="Custom" />
                            </div>
                          </div>
                        </div>
                      </Card.Content>
                    </Card.Root>
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-20">
                  <img src={imgEmptyState} alt="No custom insights" />
                  <Text variant="heading-subsection" color="foreground-3">
                    You don&apos;t have any custom insights.
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Settings side panel */}
      {panelVisible && (
        <>
          {/* Backdrop mask */}
          <div
            className="fixed inset-0 z-40 transition-opacity duration-300 ease-in-out"
            style={{
              backgroundColor: panelOpen ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)',
            }}
            onClick={closeSettings}
          />
          {/* Panel */}
          <div
            className="fixed right-2 top-2 bottom-2 z-50 flex w-2/3 min-w-[640px] flex-col overflow-hidden border border-cn-1 bg-cn-3 shadow-xl"
            style={{
              borderRadius: 16,
              transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 300ms ease-in-out',
            }}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <Text variant="heading-subsection" color="foreground-1">
                {findNodeName(orgTreeData, settingsNode!)} Settings
              </Text>
              <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip onClick={closeSettings}>
                <IconV2 name="xmark" size="sm" />
              </Button>
            </div>
            <Tabs.Root defaultValue="details" className="flex flex-1 flex-col overflow-hidden">
              <div className="px-5">
                <Tabs.List variant="underlined">
                  <Tabs.Trigger value="details">Details</Tabs.Trigger>
                  <Tabs.Trigger value="integrations">Integrations</Tabs.Trigger>
                  <Tabs.Trigger value="developers">Developers</Tabs.Trigger>
                  <Tabs.Trigger value="issue-management">Issue management</Tabs.Trigger>
                  <Tabs.Trigger value="source-code-manager">Source code manager</Tabs.Trigger>
                  <Tabs.Trigger value="ci-cd">CI & CD</Tabs.Trigger>
                  <Tabs.Trigger value="itsm">ITSM</Tabs.Trigger>
                  <Tabs.Trigger value="canvas">Canvas</Tabs.Trigger>
                </Tabs.List>
              </div>
              <Tabs.Content value="details" className="flex-1 overflow-y-auto p-5">
                <div className="flex flex-col gap-5">
                  <Text variant="heading-subsection" color="foreground-1">Variables</Text>
                  <div className="flex flex-col gap-1.5">
                    <Text variant="body-strong" color="foreground-1">Team name</Text>
                    <Select
                      value="engineering"
                      options={[
                        { label: 'Engineering', value: 'engineering' },
                        { label: 'Design', value: 'design' },
                        { label: 'Product', value: 'product' },
                        { label: 'Marketing', value: 'marketing' },
                      ]}
                      onChange={() => {}}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1">
                      <Text variant="body-strong" color="foreground-1">Team owner</Text>
                      <IconV2 name="info-circle" size="xs" className="text-foreground-4" />
                    </div>
                    <Select
                      value="sarah-johnson"
                      options={[
                        { label: 'Sarah Johnson (Engineering Manager)', value: 'sarah-johnson' },
                        { label: 'Alex N Markov (Tech Lead)', value: 'alex-markov' },
                        { label: 'Kate Williams (Director)', value: 'kate-williams' },
                      ]}
                      onChange={() => {}}
                    />
                  </div>
                </div>
              </Tabs.Content>
              <Tabs.Content value="integrations" className="flex-1 overflow-y-auto p-5">
              </Tabs.Content>
              <Tabs.Content value="developers" className="flex-1 overflow-y-auto p-5">
              </Tabs.Content>
              <Tabs.Content value="issue-management" className="flex-1 overflow-y-auto p-5">
              </Tabs.Content>
              <Tabs.Content value="source-code-manager" className="flex-1 overflow-y-auto p-5">
              </Tabs.Content>
              <Tabs.Content value="ci-cd" className="flex-1 overflow-y-auto p-5">
              </Tabs.Content>
              <Tabs.Content value="itsm" className="flex-1 overflow-y-auto p-5">
              </Tabs.Content>
              <Tabs.Content value="canvas" className="flex-1 overflow-y-auto p-5">
                <div className="flex flex-col gap-4">
                  <Text variant="heading-subsection" color="foreground-1">Variables</Text>
                  <div className="flex flex-col">
                    {/* Header */}
                    <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3 pb-2">
                      <Text variant="body-strong" color="foreground-1">Name</Text>
                      <span />
                      <Text variant="body-strong" color="foreground-1">Value</Text>
                      <span />
                    </div>
                    {/* Rows */}
                    {[
                      { name: 'account.rev', value: '0' },
                      { name: 'custom.account.size', value: '0' },
                      { name: 'custom.account.age', value: '0' },
                    ].map((variable) => (
                      <CanvasVariableRow key={variable.name} name={variable.name} defaultValue={variable.value} />
                    ))}
                  </div>
                </div>
              </Tabs.Content>
            </Tabs.Root>
            <div className="flex items-center justify-end gap-3 border-t border-cn-1 px-5 py-3">
              <Button variant="outline" size="sm" onClick={closeSettings}>Cancel</Button>
              <Button size="sm">Save</Button>
            </div>
          </div>
        </>
      )}
    </Nav2>
  )
}
