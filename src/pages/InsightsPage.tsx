import React, { useState, useEffect } from 'react'
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
  element, value, duration, level = 1, children,
}: {
  element: string; value: string; duration: string; level?: number; children: React.ReactNode;
}) {
  return (
    <div className="group/gear relative">
      <Folder className="org-child" element={element} value={value} status={S} level={level} duration={duration}>
        {children}
      </Folder>
      <button
        className="absolute right-1 top-1 z-10 rounded p-0.5 opacity-0 transition-opacity hover:bg-cn-2 group-hover/gear:opacity-100"
        onClick={(e) => { e.stopPropagation(); }}
      >
        <IconV2 name="settings" size="xs" className="text-foreground-4" />
      </button>
    </div>
  );
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

export function InsightsPage() {
  const [search, setSearch] = useState('')
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light-std-low', 'dark-std-low')
    root.classList.add(dark ? 'dark-std-low' : 'light-std-low')
  }, [dark])

  return (
    <div className="flex min-h-screen bg-cn-3">
      {/* Override execution tree styles: replace status icons with org icons, hide duration/counts */}
      <style>{`
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
        .org-tree .px-cn-lg { padding-left: 0 !important; padding-right: 0 !important; }
        .org-tree .text-cn-size-2 { font-size: 14px !important; }
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
              <Button variant="link" size="sm">Expand all</Button>
            </div>
            <Tree className="org-tree" initialExpendedItems={['harness-sei', 'arvind']} initialSelectedId="abdul" indicator>
              <Folder className="org-top" element="Harness FME" value="harness-fme" status={S} level={0}>
                <File className="org-leaf" value="harness-fme-empty" status={S} level={1}>{' '}</File>
              </Folder>
              <Folder className="org-top" element="Harness SEI" value="harness-sei" status={S} level={0}>
                <OrgFolder element="Arvind Srinivasulu" value="arvind" duration="302">
                  <File className="org-leaf" value="alex" status={S} level={2}>Alex N Markov</File>
                  <File className="org-leaf" value="abdul" status={S} level={2}>Abdul Asheem</File>
                </OrgFolder>
                <OrgFolder element="Minash Ranjan" value="minash" duration="128">
                  <File className="org-leaf" value="minash-empty" status={S} level={2}>{' '}</File>
                </OrgFolder>
                <OrgFolder element="Sachin Walunj" value="sachin" duration="62">
                  <File className="org-leaf" value="sachin-empty" status={S} level={2}>{' '}</File>
                </OrgFolder>
                <OrgFolder element="Adam England" value="adam" duration="53">
                  <File className="org-leaf" value="adam-empty" status={S} level={2}>{' '}</File>
                </OrgFolder>
                <OrgFolder element="Charu Swaroop" value="charu" duration="124">
                  <File className="org-leaf" value="charu-empty" status={S} level={2}>{' '}</File>
                </OrgFolder>
                <OrgFolder element="Parvez Husein" value="parvez" duration="18">
                  <File className="org-leaf" value="parvez-empty" status={S} level={2}>{' '}</File>
                </OrgFolder>
                <OrgFolder element="Frank Lino" value="frank" duration="6">
                  <File className="org-leaf" value="frank-empty" status={S} level={2}>{' '}</File>
                </OrgFolder>
                <OrgFolder element="Prasad Vazhakkattil" value="prasad" duration="5">
                  <File className="org-leaf" value="prasad-empty" status={S} level={2}>{' '}</File>
                </OrgFolder>
                <OrgFolder element="Shan Calhoun" value="shan" duration="5">
                  <File className="org-leaf" value="shan-empty" status={S} level={2}>{' '}</File>
                </OrgFolder>
                <OrgFolder element="Bob Coyle" value="bob" duration="7">
                  <File className="org-leaf" value="bob-empty" status={S} level={2}>{' '}</File>
                </OrgFolder>
                <OrgFolder element="Promila Sagar" value="promila" duration="24">
                  <File className="org-leaf" value="promila-empty" status={S} level={2}>{' '}</File>
                </OrgFolder>
                <OrgFolder element="Jash Jeyasingh" value="jash" duration="96">
                  <File className="org-leaf" value="jash-empty" status={S} level={2}>{' '}</File>
                </OrgFolder>
                <OrgFolder element="Ajay Kumar Singh" value="ajay" duration="67">
                  <File className="org-leaf" value="ajay-empty" status={S} level={2}>{' '}</File>
                </OrgFolder>
                <OrgFolder element="Greg Bender" value="greg" duration="8">
                  <File className="org-leaf" value="greg-empty" status={S} level={2}>{' '}</File>
                </OrgFolder>
                <OrgFolder element="Sahil Malhotra" value="sahil" duration="12">
                  <File className="org-leaf" value="sahil-empty" status={S} level={2}>{' '}</File>
                </OrgFolder>
                <OrgFolder element="Ivan de la Garza" value="ivan" duration="4">
                  <File className="org-leaf" value="ivan-empty" status={S} level={2}>{' '}</File>
                </OrgFolder>
                <OrgFolder element="Reggie Hawkins" value="reggie" duration="3">
                  <File className="org-leaf" value="reggie-empty" status={S} level={2}>{' '}</File>
                </OrgFolder>
              </Folder>
              <Folder className="org-top" element="Harness CI/CD" value="harness-cicd" status={S} level={0}>
                <File className="org-leaf" value="harness-cicd-empty" status={S} level={1}>{' '}</File>
              </Folder>
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
    </div>
  )
}
