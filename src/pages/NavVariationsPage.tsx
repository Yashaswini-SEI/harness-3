import { useState, type ReactNode } from 'react'
import { IconV2, Text } from '@harnessio/ui/components'

// ── Shared data: 4-level hierarchy ──

interface NavNode {
  id: string
  label: string
  icon: string
  description?: string
  children?: NavNode[]
}

const navTree: NavNode[] = [
  {
    id: 'devops', label: 'DevOps', icon: 'pipeline', children: [
      {
        id: 'pipelines', label: 'Pipelines', icon: 'pipeline', description: 'Automate flag and experiment workflows', children: [
          { id: 'pipeline-list', label: 'All Pipelines', icon: 'list', description: 'View and manage all pipelines' },
          { id: 'pipeline-triggers', label: 'Triggers', icon: 'clock', description: 'Automated pipeline triggers' },
          { id: 'pipeline-templates', label: 'Templates', icon: 'copy', description: 'Reusable pipeline templates' },
        ]
      },
      { id: 'repositories', label: 'Repositories', icon: 'repository', description: 'Integrated git experience' },
      { id: 'deployments', label: 'Deployments', icon: 'deployments', description: 'Deploy faster and secure' },
    ]
  },
  {
    id: 'fme', label: 'Feature Management', icon: 'feature-flags', children: [
      {
        id: 'feature-flags', label: 'Feature Flags', icon: 'feature-flags', description: 'Create, toggle, and manage flags', children: [
          { id: 'ff-list', label: 'All Flags', icon: 'list', description: 'View all feature flags' },
          { id: 'ff-targeting', label: 'Targeting Rules', icon: 'settings', description: 'Configure targeting rules' },
          { id: 'ff-approvals', label: 'Approvals', icon: 'shield', description: 'Pending flag approvals' },
          { id: 'ff-audit', label: 'Audit Log', icon: 'clock', description: 'Flag change history' },
        ]
      },
      {
        id: 'experiments', label: 'Experiments', icon: 'flag', description: 'Run A/B tests and multivariate experiments', children: [
          { id: 'exp-active', label: 'Active Experiments', icon: 'list', description: 'Currently running experiments' },
          { id: 'exp-results', label: 'Results', icon: 'bar-chart', description: 'Experiment results and analysis' },
          { id: 'exp-archive', label: 'Archive', icon: 'copy', description: 'Completed experiments' },
        ]
      },
      { id: 'segments', label: 'Segments', icon: 'group-1', description: 'Define reusable user groups' },
      { id: 'environments', label: 'Environments', icon: 'environments', description: 'Manage target environments' },
      { id: 'metrics', label: 'Metrics', icon: 'line-chart', description: 'Track evaluations and results' },
    ]
  },
  {
    id: 'security', label: 'Security', icon: 'shield', children: [
      { id: 'security-tests', label: 'Security Tests', icon: 'security-tests', description: 'Shift left security testing' },
      { id: 'supply-chain', label: 'Supply Chain', icon: 'connectors', description: 'Artifact integrity and governance' },
      { id: 'runtime', label: 'Runtime Security', icon: 'shield', description: 'Runtime threat detection' },
    ]
  },
  {
    id: 'efficiency', label: 'Efficiency', icon: 'engineering-insights', children: [
      { id: 'eng-insights', label: 'Engineering Insights', icon: 'engineering-insights', description: 'Actionable insights on SDLC' },
      { id: 'cloud-costs', label: 'Cloud Costs', icon: 'cloud-costs', description: 'Optimize cloud spend' },
    ]
  },
]

// ── Shared UI primitives ──

function NavItem({ node, active, onClick, hasArrow, depth = 0 }: {
  node: NavNode; active?: boolean; onClick?: () => void; hasArrow?: boolean; depth?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors ${active ? 'bg-cn-2' : 'hover:bg-cn-1'}`}
      style={{ paddingLeft: 8 + depth * 16 }}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-borders-2 bg-white">
        <IconV2 name={node.icon as never} size="sm" className="text-foreground-4" />
      </div>
      <div className="min-w-0 flex-1">
        <Text variant="body-strong" color={active ? 'foreground-1' : 'foreground-2'} className="text-[13px]">{node.label}</Text>
        {node.description && (
          <Text variant="caption-normal" color="foreground-4" className="block truncate text-[11px]">{node.description}</Text>
        )}
      </div>
      {hasArrow && <IconV2 name="nav-arrow-right" size="xs" className="shrink-0 text-foreground-4" />}
    </button>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text variant="caption-normal" color="foreground-4" className="px-2 pb-1 pt-3 text-[11px] uppercase tracking-wider">{children}</Text>
  )
}

function Panel({ title, onBack, children, width = 300 }: {
  title?: string; onBack?: () => void; children: ReactNode; width?: number
}) {
  return (
    <div className="shrink-0 overflow-y-auto rounded-xl border border-borders-2 bg-white" style={{ width }}>
      {(title || onBack) && (
        <div className="flex items-center gap-2 border-b border-borders-1 px-3 py-2">
          {onBack && (
            <button onClick={onBack} className="flex h-6 w-6 items-center justify-center rounded hover:bg-cn-1">
              <IconV2 name="nav-arrow-left" size="xs" className="text-foreground-3" />
            </button>
          )}
          {title && <Text variant="body-strong" color="foreground-1" className="text-[13px]">{title}</Text>}
        </div>
      )}
      <div className="flex flex-col gap-0.5 p-2">
        {children}
      </div>
    </div>
  )
}

// ── Variation 1: Cascading Panels ──
// Each level opens a new panel to the right (like macOS Finder columns)

function Variation1() {
  const [l1, setL1] = useState<string | null>('fme')
  const [l2, setL2] = useState<string | null>('feature-flags')
  const [l3, setL3] = useState<string | null>(null)

  const l1Node = navTree.find(n => n.id === l1)
  const l2Node = l1Node?.children?.find(n => n.id === l2)

  return (
    <div className="flex gap-1">
      <Panel width={260}>
        {navTree.map(node => (
          <NavItem
            key={node.id}
            node={node}
            active={l1 === node.id}
            hasArrow={!!node.children?.length}
            onClick={() => { setL1(node.id); setL2(null); setL3(null) }}
          />
        ))}
      </Panel>
      {l1Node?.children && (
        <Panel title={l1Node.label} width={280}>
          {l1Node.children.map(node => (
            <NavItem
              key={node.id}
              node={node}
              active={l2 === node.id}
              hasArrow={!!node.children?.length}
              onClick={() => { setL2(node.id); setL3(null) }}
            />
          ))}
        </Panel>
      )}
      {l2Node?.children && (
        <Panel title={l2Node.label} width={260}>
          {l2Node.children.map(node => (
            <NavItem
              key={node.id}
              node={node}
              active={l3 === node.id}
              onClick={() => setL3(node.id)}
            />
          ))}
        </Panel>
      )}
    </div>
  )
}

// ── Variation 2: Drill-Down (single panel with back navigation) ──
// One panel that replaces content on each drill, with breadcrumb trail

function Variation2() {
  const [path, setPath] = useState<string[]>(['fme', 'feature-flags'])

  function getCurrentNodes(): { nodes: NavNode[]; title: string } {
    let nodes = navTree
    let title = 'Navigation'
    for (const id of path) {
      const found = nodes.find(n => n.id === id)
      if (found?.children) {
        title = found.label
        nodes = found.children
      } else break
    }
    return { nodes, title }
  }

  const { nodes, title } = getCurrentNodes()
  const canGoBack = path.length > 0

  return (
    <Panel
      title={title}
      onBack={canGoBack ? () => setPath(p => p.slice(0, -1)) : undefined}
      width={320}
    >
      {path.length === 0 && navTree.map(node => (
        <NavItem
          key={node.id}
          node={node}
          hasArrow={!!node.children?.length}
          onClick={() => node.children ? setPath([node.id]) : undefined}
        />
      ))}
      {path.length > 0 && nodes.map(node => (
        <NavItem
          key={node.id}
          node={node}
          hasArrow={!!node.children?.length}
          onClick={() => node.children ? setPath(p => [...p, node.id]) : undefined}
        />
      ))}
    </Panel>
  )
}

// ── Variation 3: Accordion / Tree ──
// All levels in a single panel, expandable inline

function Variation3() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['fme', 'feature-flags']))

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function renderTree(nodes: NavNode[], depth: number) {
    return nodes.map(node => (
      <div key={node.id}>
        <button
          onClick={() => node.children ? toggle(node.id) : undefined}
          className={`flex w-full items-center gap-2 rounded-lg py-1.5 text-left transition-colors hover:bg-cn-1`}
          style={{ paddingLeft: 8 + depth * 20, paddingRight: 8 }}
        >
          {node.children ? (
            <IconV2
              name={expanded.has(node.id) ? 'nav-arrow-down' : 'nav-arrow-right'}
              size="xs"
              className="shrink-0 text-foreground-4"
            />
          ) : (
            <span className="w-3.5 shrink-0" />
          )}
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-borders-2 bg-white">
            <IconV2 name={node.icon as never} size="sm" className="text-foreground-4" />
          </div>
          <div className="min-w-0 flex-1">
            <Text variant={depth === 0 ? 'body-strong' : 'body-normal'} color="foreground-2" className="text-[13px]">
              {node.label}
            </Text>
            {depth === 0 && node.description && (
              <Text variant="caption-normal" color="foreground-4" className="block text-[11px]">{node.description}</Text>
            )}
          </div>
        </button>
        {node.children && expanded.has(node.id) && (
          <div className="flex flex-col gap-0.5">
            {renderTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <Panel title="Navigation" width={340}>
      {renderTree(navTree, 0)}
    </Panel>
  )
}

// ── Variation 4: Grouped flat list + slide-over detail ──
// Categories as section headers, items listed flat. Clicking an item with children
// opens a slide-over panel for level 3-4.

function Variation4() {
  const [selectedL2, setSelectedL2] = useState<NavNode | null>(null)
  const [selectedL3, setSelectedL3] = useState<string | null>(null)

  return (
    <div className="flex gap-1">
      <Panel width={320}>
        {navTree.map(category => (
          <div key={category.id}>
            <SectionLabel>{category.label}</SectionLabel>
            {category.children?.map(node => (
              <NavItem
                key={node.id}
                node={node}
                active={selectedL2?.id === node.id}
                hasArrow={!!node.children?.length}
                onClick={() => {
                  setSelectedL2(node.children ? node : null)
                  setSelectedL3(null)
                }}
              />
            ))}
          </div>
        ))}
      </Panel>
      {selectedL2?.children && (
        <Panel title={selectedL2.label} onBack={() => setSelectedL2(null)} width={280}>
          {selectedL2.children.map(node => (
            <NavItem
              key={node.id}
              node={node}
              active={selectedL3 === node.id}
              onClick={() => setSelectedL3(node.id)}
            />
          ))}
        </Panel>
      )}
    </div>
  )
}

// ── Variation 5: Icon Rail + Flyout (RECOMMENDED) ──
// Narrow icon strip for L1, clicking opens a flyout showing L2-L4 with inline expansion

function Variation5() {
  const [activeL1, setActiveL1] = useState<string | null>('fme')
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['feature-flags']))
  const [activeLeaf, setActiveLeaf] = useState<string | null>('ff-list')

  const l1Node = navTree.find(n => n.id === activeL1)

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="flex gap-0">
      {/* Icon Rail - L1 */}
      <div className="flex w-14 shrink-0 flex-col items-center gap-1 rounded-l-xl border border-r-0 border-borders-2 bg-white py-3">
        {navTree.map(node => (
          <button
            key={node.id}
            onClick={() => { setActiveL1(activeL1 === node.id ? null : node.id); setActiveLeaf(null) }}
            className={`flex h-10 w-10 flex-col items-center justify-center gap-0.5 rounded-lg transition-colors ${activeL1 === node.id ? 'bg-cn-2' : 'hover:bg-cn-1'}`}
            title={node.label}
          >
            <IconV2 name={node.icon as never} size="sm" className={activeL1 === node.id ? 'text-foreground-1' : 'text-foreground-4'} />
            <span className={`text-[9px] leading-none ${activeL1 === node.id ? 'font-medium text-foreground-1' : 'text-foreground-4'}`}>
              {node.label.length > 7 ? node.label.slice(0, 6) + '...' : node.label}
            </span>
          </button>
        ))}
      </div>

      {/* Flyout Panel - L2/L3/L4 */}
      {l1Node?.children && (
        <div className="w-[280px] shrink-0 overflow-y-auto rounded-r-xl border border-borders-2 bg-white">
          <div className="border-b border-borders-1 px-4 py-2.5">
            <Text variant="body-strong" color="foreground-1" className="text-[13px]">{l1Node.label}</Text>
          </div>
          <div className="flex flex-col gap-0.5 p-2">
            {l1Node.children.map(l2 => (
              <div key={l2.id}>
                <button
                  onClick={() => l2.children ? toggle(l2.id) : setActiveLeaf(l2.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${activeLeaf === l2.id ? 'bg-cn-2' : 'hover:bg-cn-1'}`}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-borders-2 bg-white">
                    <IconV2 name={l2.icon as never} size="sm" className="text-foreground-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text variant="body-strong" color="foreground-2" className="text-[13px]">{l2.label}</Text>
                    {l2.description && <Text variant="caption-normal" color="foreground-4" className="block truncate text-[11px]">{l2.description}</Text>}
                  </div>
                  {l2.children && (
                    <IconV2 name={expanded.has(l2.id) ? 'nav-arrow-down' : 'nav-arrow-right'} size="xs" className="shrink-0 text-foreground-4" />
                  )}
                </button>
                {l2.children && expanded.has(l2.id) && (
                  <div className="ml-5 flex flex-col gap-0.5 border-l border-borders-1 pl-3 pt-1">
                    {l2.children.map(l3 => (
                      <button
                        key={l3.id}
                        onClick={() => setActiveLeaf(l3.id)}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${activeLeaf === l3.id ? 'bg-cn-2' : 'hover:bg-cn-1'}`}
                      >
                        <IconV2 name={l3.icon as never} size="sm" className="text-foreground-4" />
                        <Text variant="body-normal" color={activeLeaf === l3.id ? 'foreground-1' : 'foreground-3'} className="text-[13px]">{l3.label}</Text>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Variation 6: Tabbed Drawer ──
// L1 as horizontal tabs at top of drawer, L2 listed below, L3/L4 expand inline

function Variation6() {
  const [activeTab, setActiveTab] = useState('fme')
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['feature-flags']))
  const [activeLeaf, setActiveLeaf] = useState<string | null>('ff-targeting')

  const tabNode = navTree.find(n => n.id === activeTab)

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="w-[340px] shrink-0 overflow-hidden rounded-xl border border-borders-2 bg-white">
      {/* Tab bar - L1 */}
      <div className="flex border-b border-borders-1">
        {navTree.map(node => (
          <button
            key={node.id}
            onClick={() => { setActiveTab(node.id); setActiveLeaf(null) }}
            className={`flex flex-1 flex-col items-center gap-0.5 px-2 py-2.5 text-center transition-colors ${activeTab === node.id ? 'border-b-2 border-brand bg-cn-0' : 'hover:bg-cn-1'}`}
          >
            <IconV2 name={node.icon as never} size="sm" className={activeTab === node.id ? 'text-foreground-1' : 'text-foreground-4'} />
            <span className={`text-[10px] leading-tight ${activeTab === node.id ? 'font-medium text-foreground-1' : 'text-foreground-4'}`}>
              {node.label.length > 10 ? node.label.slice(0, 9) + '...' : node.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content - L2/L3/L4 */}
      <div className="flex flex-col gap-0.5 p-2">
        {tabNode?.children?.map(l2 => (
          <div key={l2.id}>
            <button
              onClick={() => l2.children ? toggle(l2.id) : setActiveLeaf(l2.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors ${activeLeaf === l2.id ? 'bg-cn-2' : 'hover:bg-cn-1'}`}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-borders-2 bg-white">
                <IconV2 name={l2.icon as never} size="sm" className="text-foreground-4" />
              </div>
              <div className="min-w-0 flex-1">
                <Text variant="body-strong" color="foreground-2" className="text-[13px]">{l2.label}</Text>
                {l2.description && <Text variant="caption-normal" color="foreground-4" className="block truncate text-[11px]">{l2.description}</Text>}
              </div>
              {l2.children && (
                <IconV2 name={expanded.has(l2.id) ? 'nav-arrow-down' : 'nav-arrow-right'} size="xs" className="shrink-0 text-foreground-4" />
              )}
            </button>
            {l2.children && expanded.has(l2.id) && l2.children.map(l3 => (
              <div key={l3.id} className="ml-11">
                <button
                  onClick={() => setActiveLeaf(l3.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${activeLeaf === l3.id ? 'bg-cn-2' : 'hover:bg-cn-1'}`}
                >
                  <IconV2 name={l3.icon as never} size="sm" className="text-foreground-4" />
                  <Text variant="body-normal" color={activeLeaf === l3.id ? 'foreground-1' : 'foreground-3'} className="text-[13px]">{l3.label}</Text>
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Variation 7: Search-First with Browseable Hierarchy ──
// Search bar at top with type-ahead, below it a browseable tree

function Variation7() {
  const [query, setQuery] = useState('')
  const [activeLeaf, setActiveLeaf] = useState<string | null>(null)

  // Flatten all nodes for search
  function flattenNodes(nodes: NavNode[], path: string[] = []): { node: NavNode; path: string[] }[] {
    const result: { node: NavNode; path: string[] }[] = []
    for (const n of nodes) {
      const currentPath = [...path, n.label]
      result.push({ node: n, path: currentPath })
      if (n.children) result.push(...flattenNodes(n.children, currentPath))
    }
    return result
  }

  const allNodes = flattenNodes(navTree)
  const filtered = query
    ? allNodes.filter(({ node }) =>
        node.label.toLowerCase().includes(query.toLowerCase()) ||
        (node.description?.toLowerCase().includes(query.toLowerCase()))
      )
    : []

  return (
    <div className="w-[340px] shrink-0 overflow-hidden rounded-xl border border-borders-2 bg-white">
      {/* Search bar */}
      <div className="flex items-center gap-2 border-b border-borders-1 px-3 py-2">
        <IconV2 name="search" size="sm" className="shrink-0 text-foreground-4" />
        <input
          type="text"
          placeholder="Search navigation..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full bg-transparent text-[13px] text-foreground-1 outline-none placeholder:text-foreground-4"
        />
        {query && (
          <button onClick={() => setQuery('')} className="shrink-0 text-foreground-4 hover:text-foreground-2">
            <IconV2 name="xmark" size="xs" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-0.5 p-2">
        {query ? (
          // Search results
          filtered.length > 0 ? filtered.slice(0, 10).map(({ node, path }) => (
            <button
              key={node.id}
              onClick={() => { setActiveLeaf(node.id); setQuery('') }}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors ${activeLeaf === node.id ? 'bg-cn-2' : 'hover:bg-cn-1'}`}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-borders-2 bg-white">
                <IconV2 name={node.icon as never} size="sm" className="text-foreground-4" />
              </div>
              <div className="min-w-0 flex-1">
                <Text variant="body-strong" color="foreground-2" className="text-[13px]">{node.label}</Text>
                <Text variant="caption-normal" color="foreground-4" className="block truncate text-[10px]">
                  {path.slice(0, -1).join(' / ')}
                </Text>
              </div>
            </button>
          )) : (
            <div className="px-2 py-6 text-center">
              <Text variant="body-normal" color="foreground-4">No results for &ldquo;{query}&rdquo;</Text>
            </div>
          )
        ) : (
          // Default: browse by category
          navTree.map(category => (
            <div key={category.id}>
              <SectionLabel>{category.label}</SectionLabel>
              {category.children?.map(node => (
                <NavItem
                  key={node.id}
                  node={node}
                  active={activeLeaf === node.id}
                  hasArrow={!!node.children?.length}
                  onClick={() => setActiveLeaf(node.id)}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Variation 8: Two-Pane Split ──
// Left pane: L1 + L2 always visible. Right pane: L3 + L4 for the selected L2 item.
// Both panes in a single container, no popups.

function Variation8() {
  const [activeL1, setActiveL1] = useState('fme')
  const [activeL2, setActiveL2] = useState<NavNode | null>(
    navTree.find(n => n.id === 'fme')?.children?.find(n => n.id === 'feature-flags') ?? null
  )
  const [activeLeaf, setActiveLeaf] = useState<string | null>('ff-list')

  const l1Node = navTree.find(n => n.id === activeL1)

  return (
    <div className="flex w-[560px] overflow-hidden rounded-xl border border-borders-2 bg-white">
      {/* Left: L1 tabs + L2 list */}
      <div className="flex w-[260px] shrink-0 flex-col border-r border-borders-1">
        {/* L1 as compact selector */}
        <div className="flex items-center gap-1 border-b border-borders-1 px-2 py-2">
          {navTree.map(node => (
            <button
              key={node.id}
              onClick={() => { setActiveL1(node.id); setActiveL2(null); setActiveLeaf(null) }}
              className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${activeL1 === node.id ? 'bg-cn-2 text-foreground-1' : 'text-foreground-4 hover:bg-cn-1 hover:text-foreground-2'}`}
            >
              {node.label}
            </button>
          ))}
        </div>

        {/* L2 items */}
        <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {l1Node?.children?.map(node => (
            <NavItem
              key={node.id}
              node={node}
              active={activeL2?.id === node.id}
              onClick={() => { setActiveL2(node); setActiveLeaf(null) }}
            />
          ))}
        </div>
      </div>

      {/* Right: L3 + L4 */}
      <div className="flex flex-1 flex-col">
        {activeL2?.children ? (
          <>
            <div className="border-b border-borders-1 px-4 py-2.5">
              <Text variant="body-strong" color="foreground-1" className="text-[13px]">{activeL2.label}</Text>
              {activeL2.description && (
                <Text variant="caption-normal" color="foreground-4" className="block text-[11px]">{activeL2.description}</Text>
              )}
            </div>
            <div className="flex flex-col gap-0.5 p-2">
              {activeL2.children.map(node => (
                <button
                  key={node.id}
                  onClick={() => setActiveLeaf(node.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors ${activeLeaf === node.id ? 'bg-cn-2' : 'hover:bg-cn-1'}`}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-borders-2 bg-white">
                    <IconV2 name={node.icon as never} size="sm" className="text-foreground-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text variant="body-strong" color={activeLeaf === node.id ? 'foreground-1' : 'foreground-2'} className="text-[13px]">{node.label}</Text>
                    {node.description && (
                      <Text variant="caption-normal" color="foreground-4" className="block truncate text-[11px]">{node.description}</Text>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : activeL2 ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg border border-borders-2 bg-cn-1">
                <IconV2 name={activeL2.icon as never} size="sm" className="text-foreground-3" />
              </div>
              <Text variant="body-strong" color="foreground-1">{activeL2.label}</Text>
              {activeL2.description && (
                <Text variant="caption-normal" color="foreground-4" className="mt-1 block">{activeL2.description}</Text>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6">
            <Text variant="body-normal" color="foreground-4">Select an item to see details</Text>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page layout ──

export function NavVariationsPage() {
  return (
    <div className="flex min-h-screen flex-col gap-12 bg-cn-1 p-10">
      <div>
        <Text as="h1" variant="heading-hero" color="foreground-1">Navigation Variations</Text>
        <Text as="p" variant="body-normal" color="foreground-3" className="mt-1">
          8 approaches to 4-level navigation hierarchy for FME
        </Text>
      </div>

      <section className="flex flex-col gap-4">
        <div>
          <Text as="h2" variant="heading-section" color="foreground-1">1. Cascading Panels</Text>
          <Text variant="body-normal" color="foreground-3">Each level opens a new column to the right. All levels visible at once.</Text>
        </div>
        <Variation1 />
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <Text as="h2" variant="heading-section" color="foreground-1">2. Drill-Down</Text>
          <Text variant="body-normal" color="foreground-3">Single panel replaces content on each level, with back navigation.</Text>
        </div>
        <Variation2 />
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <Text as="h2" variant="heading-section" color="foreground-1">3. Accordion Tree</Text>
          <Text variant="body-normal" color="foreground-3">All levels in one panel, expand/collapse inline to reveal children.</Text>
        </div>
        <Variation3 />
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <Text as="h2" variant="heading-section" color="foreground-1">4. Grouped List + Detail Panel</Text>
          <Text variant="body-normal" color="foreground-3">Categories as section headers with flat items. Sub-levels open in a side panel.</Text>
        </div>
        <Variation4 />
      </section>

      {/* ── Recommended ── */}
      <div className="rounded-xl border-2 border-brand bg-white/50 p-6">
        <div className="mb-2 inline-block rounded-full bg-brand px-3 py-0.5 text-[12px] font-medium text-white">Recommended</div>
        <section className="flex flex-col gap-4">
          <div>
            <Text as="h2" variant="heading-section" color="foreground-1">5. Icon Rail + Flyout</Text>
            <Text variant="body-normal" color="foreground-3">Narrow icon strip for L1, flyout panel for L2 with inline-expandable L3/L4.</Text>
            <div className="mt-2 rounded-lg bg-cn-1 p-3">
              <Text variant="body-normal" color="foreground-2" className="text-[13px]">
                <strong>Why this works best:</strong> The icon rail takes minimal horizontal space (~56px) while always showing L1 context.
                The flyout combines L2 items with inline-expandable L3/L4, keeping all levels accessible without losing orientation.
                The tree-line visual for expanded children clearly communicates parent-child relationships.
                This pattern scales naturally: collapsing the flyout leaves just the icon rail, and the inline expansion avoids
                the disorientation of cascading panels or drill-downs. It&apos;s the same proven pattern used by VS Code, Slack, and Linear.
              </Text>
            </div>
          </div>
          <Variation5 />
        </section>
      </div>

      <section className="flex flex-col gap-4">
        <div>
          <Text as="h2" variant="heading-section" color="foreground-1">6. Tabbed Drawer</Text>
          <Text variant="body-normal" color="foreground-3">L1 as horizontal icon tabs, content shows L2 items with inline-expandable L3/L4.</Text>
        </div>
        <Variation6 />
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <Text as="h2" variant="heading-section" color="foreground-1">7. Search-First + Browse</Text>
          <Text variant="body-normal" color="foreground-3">Search bar for quick access, with grouped browseable list as fallback.</Text>
        </div>
        <Variation7 />
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <Text as="h2" variant="heading-section" color="foreground-1">8. Two-Pane Split</Text>
          <Text variant="body-normal" color="foreground-3">L1 pill tabs + L2 list on the left, L3/L4 detail on the right. No popups.</Text>
        </div>
        <Variation8 />
      </section>
    </div>
  )
}
