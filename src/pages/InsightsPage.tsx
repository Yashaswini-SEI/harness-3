import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Text,
  Button,
  IconV2,
  SearchInput,
  Tag,
  Tree,
  Folder,
  File,
  Card,
} from '@harnessio/ui/components'
import { ExecutionState } from '@harnessio/ui/views'
import iconOrg from '../assets/icon-org.svg'
import iconOrgTree from '../assets/icon-org-tree.svg'
import { Nav2 } from '../components/Nav2'
import { Breadcrumb2 } from '../components/Breadcrumb2'

// Dashboard thumbnail imports (light variants)
import thumb1 from '../assets/dashboard-thumbnails/1-light.svg'
import thumb2 from '../assets/dashboard-thumbnails/2-light.svg'
import thumb3 from '../assets/dashboard-thumbnails/3-light.svg'
import thumb4 from '../assets/dashboard-thumbnails/4-light.svg'
import thumb5 from '../assets/dashboard-thumbnails/5-light.svg'
import thumb6 from '../assets/dashboard-thumbnails/6-light.svg'

const S = ExecutionState.SUCCESS

function OrgFolder({
  element, value, duration, level = 1, children, onSettingsClick,
}: {
  element: string; value: string; duration: string; level?: number; children: React.ReactNode;
  onSettingsClick?: (nodeId: string) => void;
}) {
  return (
    <div className="group/gear relative">
      <Folder className="org-child" element={element} value={value} status={S} level={level} duration={duration}>
        {children}
      </Folder>
      <button
        className="absolute right-1 top-0.5 z-10 rounded p-0.5 opacity-0 transition-opacity hover:bg-cn-2 group-hover/gear:opacity-100"
        onClick={(e) => { e.stopPropagation(); onSettingsClick?.(value); }}
      >
        <IconV2 name="settings" size="xs" className="text-foreground-4" />
      </button>
    </div>
  );
}

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

function countDescendants(node: OrgNode): number {
  if (!node.children) return 0
  return node.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0)
}

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

function RenderOrgNode({ node, level, onSettingsClick }: { node: OrgNode; level: number; onSettingsClick?: (nodeId: string) => void }) {
  const count = countDescendants(node)
  const hasChildren = node.children && node.children.length > 0
  if (level === 0) {
    return (
      <Folder className="org-top" element={node.name} value={node.id} status={S} level={0}>
        {hasChildren
          ? node.children!.map((child) => <RenderOrgNode key={child.id} node={child} level={1} onSettingsClick={onSettingsClick} />)
          : <File className="org-leaf" value={`${node.id}-empty`} status={S} level={1}>{' '}</File>
        }
      </Folder>
    )
  }
  if (!hasChildren) {
    return (
      <File className="org-leaf" value={node.id} status={S} level={level}>{node.name}</File>
    )
  }
  return (
    <OrgFolder element={node.name} value={node.id} duration={String(count)} level={level} onSettingsClick={onSettingsClick}>
      {node.children!.map((child) => (
        <RenderOrgNode key={child.id} node={child} level={level + 1} onSettingsClick={onSettingsClick} />
      ))}
    </OrgFolder>
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
    id: 'dora',
    title: 'DORA',
    description: 'DORA metrics measure software delivery performance.',
    tag: 'Efficiency',
    thumb: thumb2,
  },
  {
    id: 'sprint-metrics',
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
]

function findNodeName(nodes: OrgNode[], id: string): string | undefined {
  for (const node of nodes) {
    if (node.id === id) return node.name
    if (node.children) {
      const found = findNodeName(node.children, id)
      if (found) return found
    }
  }
}

export function InsightsPage() {
  const [search, setSearch] = useState('')
  const [expandAll, setExpandAll] = useState(false)
  const [treeKey, setTreeKey] = useState(0)
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )
  const [settingsNode, setSettingsNode] = useState<string | null>(null)
  const [panelVisible, setPanelVisible] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const openSettings = useCallback((nodeId: string) => {
    clearTimeout(closeTimerRef.current)
    setSettingsNode(nodeId)
    setPanelVisible(true)
    // Next frame: trigger the CSS transition
    requestAnimationFrame(() => requestAnimationFrame(() => setPanelOpen(true)))
  }, [])

  const closeSettings = useCallback(() => {
    setPanelOpen(false)
    // Wait for the transition to finish before unmounting
    closeTimerRef.current = setTimeout(() => {
      setPanelVisible(false)
      setSettingsNode(null)
    }, 300)
  }, [])

  const filteredTree = useMemo(() => filterTree(orgTreeData, search), [search])
  const allIds = useMemo(() => collectIds(filteredTree), [filteredTree])
  const expandedIds = useMemo(() => {
    if (search) return allIds
    if (expandAll) return allIds
    return ['harness-sei', 'arvind']
  }, [search, expandAll, allIds])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light-std-low', 'dark-std-low')
    root.classList.add(dark ? 'dark-std-low' : 'light-std-low')
  }, [dark])

  return (
    <div className="flex min-h-screen bg-cn-3">
      {/* Override execution tree styles: replace status icons with org icons, hide duration/counts */}
      <style>{`
        .org-tree { scrollbar-width: none; }
        .org-tree .overflow-hidden { overflow: visible !important; }
        .org-tree::-webkit-scrollbar { display: none; }
        .org-tree .size-5.flex-none.items-center.justify-center > * { visibility: hidden; }
        .org-tree span.text-cn-1 > span.text-cn-3 { display: none !important; }
        .org-tree .org-leaf span.text-cn-2.flex-none.select-none { display: none !important; }
        .org-tree .org-top span.text-cn-2.flex-none.select-none { display: none !important; }
        .org-tree .org-child span.text-cn-2.flex-none.select-none {
          font-size: 12px; line-height: 18px; border: 1px solid var(--cn-borders-2, #d0d5dd);
          border-radius: 6px; padding: 0 6px; color: var(--cn-foreground-3, #6b6f79);
          margin-right: 28px;
        }
        .org-tree .org-top .size-5.flex-none.items-center.justify-center {
          background: url("${iconOrg}") center / 16px 16px no-repeat;
        }
        .org-tree .org-child .size-5.flex-none.items-center.justify-center {
          background: url("${iconOrgTree}") center / 16px 16px no-repeat;
        }
        .org-tree .org-leaf .size-5.flex-none.items-center.justify-center { display: none !important; }
        .org-tree .px-cn-lg { padding-right: 0 !important; }
        .org-tree .text-cn-size-2 { font-size: 14px !important; }
        .org-tree .gap-x-cn-xs.flex.w-full.justify-between > .flex {
          min-width: 0;
          overflow: hidden;
        }
        .org-tree span.text-cn-1 {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .org-tree .group\\/gear {
          position: relative;
        }
        .org-tree .group\\/gear > div > button > svg {
          position: relative;
          z-index: 2;
          background: var(--cn-bg-3);
          box-shadow: 0 0 0 4px var(--cn-bg-3);
        }
        .org-tree .group\\/gear::after {
          content: '';
          position: absolute;
          left: 34px;
          top: -20px;
          bottom: -20px;
          width: 1px;
          background: var(--cn-borders-2, #d0d5dd);
          pointer-events: none;
          z-index: 1;
          display: none;
        }
        .org-tree .group\\/gear:has([data-state=open])::after {
          display: block;
        }
        .org-tree .group\\/gear:first-child::after {
          top: 0;
        }
        .org-tree .group\\/gear:last-child::after {
          bottom: auto;
          height: 14px;
        }
        .org-tree .org-leaf {
          padding-left: 29px;
        }
        .org-tree .group\\/gear .group\\/gear {
          padding-left: 0px;
        }
        .org-tree .group\\/gear .group\\/gear > div > button.px-cn-lg {
          padding-left: 28px !important;
        }
        .org-tree .group\\/gear .group\\/gear .org-leaf {
          padding-left: 36px;
        }
        .org-tree .duration-200 {
          transition-duration: 75ms !important;
        }
        .org-tree [data-state=open],
        .org-tree [data-state=closed] {
          animation-duration: 75ms !important;
        }
      `}</style>
      <Nav2 activeSection="insights" dark={dark} onThemeToggle={() => setDark(!dark)} />

      {/* Page content */}
      <div className="flex flex-1 flex-col gap-5 p-8">
        {/* Breadcrumb */}
        <Breadcrumb2 items={[
          { label: 'Edge Wireless', href: '#' },
          { label: 'Platform', href: '#' },
          { label: 'Insights' },
        ]} />

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
          <Button variant="outline" size="sm">
            Tag
            <IconV2 name="nav-arrow-down" size="sm" />
          </Button>
          <Button variant="outline" size="sm">
            Owner
            <IconV2 name="nav-arrow-down" size="sm" />
          </Button>
          <Button variant="outline" size="sm">
            <IconV2 name="arrows-updown" size="sm" />
            Most Recent
            <IconV2 name="nav-arrow-down" size="sm" />
          </Button>
        </div>

        {/* Main content: tree nav + insights */}
        <div className="flex gap-5">
          {/* Left: tree navigation */}
          <div className="w-[269px] shrink-0 pr-3">
            <div className="mb-2">
              <Button variant="link" size="sm" onClick={() => { setExpandAll((v) => !v); setTreeKey((k) => k + 1); }}>
                {expandAll ? 'Collapse all' : 'Expand all'}
              </Button>
            </div>
            <Tree key={`${search}-${treeKey}`} className="org-tree" initialExpendedItems={expandedIds} initialSelectedId="abdul" indicator>
              {filteredTree.map((node) => (
                <RenderOrgNode key={node.id} node={node} level={0} onSettingsClick={openSettings} />
              ))}
            </Tree>
          </div>

          {/* Right: insights overview */}
          <div className="flex-1 flex flex-col gap-5">
            {/* "Insights by Harness" header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconV2 name="nav-arrow-down" size="sm" />
                <Text as="h2" variant="heading-subsection" color="foreground-1">
                  Insights by Harness
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
                  <IconV2 name="nav-arrow-left" size="sm" />
                </Button>
                <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
                  <IconV2 name="nav-arrow-right" size="sm" />
                </Button>
              </div>
            </div>

            {/* Insight cards — 3-column grid, 2 rows */}
            <div className="grid grid-cols-3 gap-3">
              {harnessInsights.map((insight) => (
                <Card.Root key={insight.id} size="sm" orientation="horizontal" className="border-0 shadow-none">
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
              ))}
            </div>

            {/* "Custom insights" section */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-full">
                <Text as="h2" variant="heading-subsection" color="foreground-1">
                  Custom insights
                </Text>
              </div>
              <div className="flex flex-col items-center gap-4 py-20">
                <div className="w-28 h-28 rounded-full bg-cn-2 flex items-center justify-center">
                  <IconV2 name="open-select-hand-gesture" size="sm" className="opacity-40" />
                </div>
                <Text variant="heading-subsection" color="foreground-3">
                  You don&apos;t have any custom insights.
                </Text>
              </div>
            </div>
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
            className="fixed right-0 top-0 z-50 flex h-full w-1/3 flex-col border-l border-cn-1 bg-cn-3 shadow-xl"
            style={{
              transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 300ms ease-in-out',
            }}
          >
            <div className="flex items-center justify-between border-b border-cn-1 px-5 py-4">
              <Text variant="heading-subsection" color="foreground-1">
                {findNodeName(orgTreeData, settingsNode!)} Settings
              </Text>
              <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip onClick={closeSettings}>
                <IconV2 name="x-mark" size="sm" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex flex-col gap-4">
                <Text variant="body-normal" color="foreground-3">
                  Configure settings for this org node.
                </Text>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
