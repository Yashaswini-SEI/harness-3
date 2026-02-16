import { useState } from 'react'
import {
  Text,
  Button,
  IconV2,
  SearchInput,
  Breadcrumb,
  Tag,
  Tree,
  Card,
} from '@harnessio/ui/components'
import type { TreeViewElement } from '@harnessio/ui/components'

// ── Tree data ──
const treeElements: TreeViewElement[] = [
  {
    id: 'harness-fme',
    name: 'Harness FME',
    children: [],
  },
  {
    id: 'harness-sei',
    name: 'Harness SEI',
    children: [
      {
        id: 'arvind',
        name: 'Arvind Srinivasulu',
        children: [
          { id: 'alex', name: 'Alex N Markov' },
          { id: 'abdul', name: 'Abdul Asheem' },
        ],
      },
      { id: 'minash', name: 'Minash Ranjan' },
      { id: 'sachin', name: 'Sachin Walunj' },
      { id: 'adam', name: 'Adam England' },
      { id: 'charu', name: 'Charu Swaroop' },
      { id: 'parvez', name: 'Parvez Husein' },
      { id: 'frank', name: 'Frank Lino' },
      { id: 'prasad', name: 'Prasad Vazhakkattil' },
      { id: 'shan', name: 'Shan Calhoun' },
      { id: 'bob', name: 'Bob Coyle' },
      { id: 'promila', name: 'Promila Sagar' },
      { id: 'jash', name: 'Jash Jeyasingh' },
      { id: 'ajay', name: 'Ajay Kumar Singh' },
      { id: 'greg', name: 'Greg Bender' },
      { id: 'sahil', name: 'Sahil Malhotra' },
      { id: 'ivan', name: 'Ivan de la Garza' },
      { id: 'reggie', name: 'Reggie Hawkins' },
    ],
  },
  {
    id: 'harness-cicd',
    name: 'Harness CI/CD',
    children: [],
  },
]

// ── Insight cards data ──
const harnessInsights = [
  {
    id: 'ai-insights',
    title: 'AI Insights',
    description: 'AI coding assistant adoption and impact insights for your teams.',
    tag: 'AI Insights',
  },
  {
    id: 'dora',
    title: 'DORA',
    description: 'DORA metrics measure software delivery performance.',
    tag: 'Efficiency',
  },
  {
    id: 'sprint-metrics',
    title: 'Sprint Metrics',
    description: 'Shows planning effectiveness, delivery consistency, and team predictability.',
    tag: 'Efficiency',
  },
  {
    id: 'velocity',
    title: 'Velocity',
    description: 'Tracks delivery speed and throughput across the development cycle.',
    tag: 'Productivity',
  },
  {
    id: 'quality',
    title: 'Quality',
    description: 'Monitors defects, test results, and code health.',
    tag: 'Productivity',
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    description: 'Measures teamwork through code reviews, contributions, and communication patterns.',
    tag: 'Productivity',
  },
]

// ── Placeholder chart bars for card thumbnails ──
function CardThumbnail() {
  return (
    <div className="flex items-end gap-[3px] h-[48px]">
      {[60, 80, 45, 70, 55, 90, 40, 65, 75, 50, 85, 60].map((h, i) => (
        <div
          key={i}
          className="w-[4px] rounded-sm"
          style={{
            height: `${h}%`,
            backgroundColor: ['#4DC9F6', '#F67019', '#F53794', '#537BC4', '#ACC236', '#166A8F'][i % 6],
          }}
        />
      ))}
    </div>
  )
}

export function InsightsPage() {
  const [search, setSearch] = useState('')
  const [pinned, setPinned] = useState(false)

  return (
    <div className="flex flex-col gap-6">
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
        <Button
          variant="outline"
          size="sm"
          iconOnly
          ignoreIconOnlyTooltip
          onClick={() => setPinned(!pinned)}
        >
          <IconV2 name="pin" size="sm" />
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
        <div className="w-[269px] shrink-0">
          <Tree
            elements={treeElements}
            initialExpendedItems={['harness-sei', 'arvind']}
            initialSelectedId="abdul"
            indicator
          />
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
              <Card.Root key={insight.id} size="sm" orientation="horizontal">
                <Card.Content>
                  <div className="flex gap-4">
                    <div className="shrink-0 flex items-center justify-center w-[85px] h-[73px] rounded border border-[#E7E8EA] bg-white">
                      <CardThumbnail />
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
              <div className="w-28 h-28 rounded-full bg-[#F6F6F7] flex items-center justify-center">
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
  )
}
