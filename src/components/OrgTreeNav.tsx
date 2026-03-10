import React, { useState, useMemo, useCallback } from 'react'
import {
  Button,
  IconV2,
  Tree,
  Folder,
  File,
} from '@harnessio/ui/components'
import { ExecutionState } from '@harnessio/ui/views'
import iconOrg from '../assets/icon-org.svg'
import iconOrgTree from '../assets/icon-org-tree.svg'

const S = ExecutionState.SUCCESS

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

function collectIds(nodes: OrgNode[]): string[] {
  return nodes.flatMap((n) => [n.id, ...(n.children ? collectIds(n.children) : [])])
}

function OrgFolder({
  element, value, duration, level = 1, children,
}: {
  element: string; value: string; duration: string; level?: number; children: React.ReactNode;
}) {
  return (
    <div className="group/gear relative" data-node-id={value}>
      <Folder className="org-child" element={element} value={value} status={S} level={level} duration={duration}>
        {children}
      </Folder>
    </div>
  );
}

function RenderOrgNode({ node, level }: { node: OrgNode; level: number }) {
  const count = countDescendants(node)
  const hasChildren = node.children && node.children.length > 0
  if (level === 0) {
    return (
      <Folder className="org-top" element={node.name} value={node.id} status={S} level={0} {...(hasChildren ? { 'data-node-id': node.id } : {})}>
        {hasChildren
          ? node.children!.map((child) => <RenderOrgNode key={child.id} node={child} level={1} />)
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
    <OrgFolder element={node.name} value={node.id} duration={String(count)} level={level}>
      {node.children!.map((child) => (
        <RenderOrgNode key={child.id} node={child} level={level + 1} />
      ))}
    </OrgFolder>
  )
}

export function OrgTreeNav({ selectedNodeId = 'harness-sei', onSelectNode }: {
  selectedNodeId?: string
  onSelectNode?: (nodeId: string) => void
}) {
  const [expandAll, setExpandAll] = useState(false)
  const [treeKey, setTreeKey] = useState(0)

  const allIds = useMemo(() => collectIds(orgTreeData), [])
  const expandedIds = useMemo(() => {
    if (expandAll) return allIds
    return ['harness-sei', 'arvind']
  }, [expandAll, allIds])

  const handleTreeCapture = useCallback((e: React.MouseEvent) => {
    let el = e.target as HTMLElement
    let nodeId: string | null = null
    while (el && el !== e.currentTarget) {
      if (el.tagName === 'BUTTON' && el.classList.contains('absolute')) return
      if (el.tagName.toLowerCase() === 'svg' &&
        el.parentElement?.tagName === 'BUTTON' &&
        (el.parentElement.classList.contains('org-child') || el.parentElement.classList.contains('org-top'))) {
        return
      }
      if (!nodeId && el instanceof HTMLElement && el.dataset.nodeId) {
        nodeId = el.dataset.nodeId
      }
      el = el.parentElement as HTMLElement
    }
    if (nodeId) {
      e.stopPropagation()
      e.preventDefault()
      onSelectNode?.(nodeId)
    }
  }, [onSelectNode])

  return (
    <div className="w-[260px] shrink-0">
      <style>{`
        .org-tree { scrollbar-width: none; overflow-x: hidden; }
        .org-tree .overflow-hidden { overflow: visible !important; }
        .org-tree::-webkit-scrollbar { display: none; }
        .org-tree .size-5.flex-none.items-center.justify-center > * { visibility: hidden; }
        .org-tree span.text-cn-1 > span.text-cn-3 { display: none !important; }
        .org-tree .org-leaf span.text-cn-2.flex-none.select-none { display: none !important; }
        .org-tree .org-top span.text-cn-2.flex-none.select-none { display: none !important; }
        .org-tree .org-child span.text-cn-2.flex-none.select-none {
          font-size: 12px; line-height: 18px; border: 1px solid var(--cn-borders-3, #E7E8E9);
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
        .org-tree .group\\/gear > div > button > svg,
        .org-tree .org-top > svg {
          position: relative;
          z-index: 2;
          background: var(--cn-bg-3);
          box-shadow: 0 0 0 4px var(--cn-bg-3);
        }
        .org-tree > .flex.flex-col > .pb-cn-sm::after {
          content: '';
          position: absolute;
          left: 26px;
          top: -20px;
          bottom: -20px;
          width: 1px;
          background: var(--cn-borders-3, #E7E8E9);
          pointer-events: none;
          z-index: 1;
          display: none;
        }
        .org-tree > .flex.flex-col > .pb-cn-sm:has([data-state=open])::after {
          display: block;
        }
        .org-tree > .flex.flex-col > .pb-cn-sm:first-child::after {
          top: 0;
        }
        .org-tree > .flex.flex-col > .pb-cn-sm:last-child::after {
          bottom: auto;
          height: 14px;
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
        .org-tree [data-node-id="${selectedNodeId}"] > button.org-top > div,
        .org-tree [data-node-id="${selectedNodeId}"] > div > button.org-child > div {
          background-color: var(--cn-bg-2);
          border-radius: 6px;
          padding: 6px 0 6px 14px;
          margin: -6px 0;
          position: relative;
        }
        .org-tree [data-node-id="${selectedNodeId}"] > button.org-top > div::before,
        .org-tree [data-node-id="${selectedNodeId}"] > div > button.org-child > div::before {
          content: '';
          position: absolute;
          left: 0;
          top: 10px;
          bottom: 10px;
          width: 3px;
          border-radius: 2px;
          background-color: var(--cn-brand-default, #0078D4);
        }
      `}</style>
      <div className="mb-2">
        <Button variant="link" size="sm" onClick={() => { setExpandAll((v) => !v); setTreeKey((k) => k + 1); }}>
          {expandAll ? 'Collapse all' : 'Expand all'}
        </Button>
      </div>
      <div onClickCapture={handleTreeCapture}>
        <Tree key={treeKey} className="org-tree" initialExpendedItems={expandedIds} initialSelectedId="abdul" indicator>
          {orgTreeData.map((node) => (
            <RenderOrgNode key={node.id} node={node} level={0} />
          ))}
        </Tree>
      </div>
    </div>
  )
}
