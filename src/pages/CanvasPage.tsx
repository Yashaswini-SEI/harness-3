import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Text,
  Button,
  IconV2,
  SearchInput,
  Table,
  StatusBadge,
  Select,
  TextInput,
  Textarea,
  Tag,
} from '@harnessio/ui/components'
import { Nav2 } from '../components/Nav2'
import { Breadcrumb2 } from '../components/Breadcrumb2'

const canvasData = [
  {
    name: 'Quality Insights',
    orgTree: 'Harness Production',
    widgets: 4,
    status: 'Published' as const,
    createdOn: '01-July-2025 12:45PM',
    updatedOn: '25 July 2025 03:23PM',
  },
  {
    name: 'Test Insights',
    orgTree: '\u2013',
    widgets: 5,
    status: 'Draft' as const,
    createdOn: '01-Jan-2025 10:39PM',
    updatedOn: '25 July 2025 03:23PM',
  },
]

const statusTheme = { Published: 'success', Draft: 'info' } as const

const defaultTags = ['Audit', 'Dec Report', 'Project_Sh35', 'Org: Default']

export function CanvasPage() {
  const [search, setSearch] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | false>(false)
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const [insightName, setInsightName] = useState('')
  const [insightDesc, setInsightDesc] = useState('')
  const [insightTagInput, setInsightTagInput] = useState('')
  const [insightTags, setInsightTags] = useState<string[]>(defaultTags)

  const openDrawer = useCallback(() => {
    clearTimeout(closeTimerRef.current)
    setDrawerVisible(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setDrawerOpen(true)))
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    closeTimerRef.current = setTimeout(() => {
      setDrawerVisible(false)
      setInsightName('')
      setInsightDesc('')
      setInsightTagInput('')
      setInsightTags(defaultTags)
    }, 300)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light-std-low', 'dark-std-low')
    root.classList.add(dark ? 'dark-std-low' : 'light-std-low')
  }, [dark])

  const filteredData = search
    ? canvasData.filter((row) =>
        row.name.toLowerCase().includes(search.toLowerCase())
      )
    : canvasData

  const sortedData = sortDir
    ? [...filteredData].sort((a, b) =>
        sortDir === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      )
    : filteredData

  return (
    <div className="flex min-h-screen bg-cn-3">
      <Nav2 activeSection="canvas" dark={dark} onThemeToggle={() => setDark(!dark)} />

      <div className="flex flex-1 flex-col gap-5 p-8">
        {/* Breadcrumb */}
        <Breadcrumb2
          items={[
            { label: 'Edge Wireless', href: '#' },
            { label: 'Platform', href: '#' },
            { label: 'Canvas' },
          ]}
        />

        {/* Page title + action */}
        <div className="flex items-center justify-between">
          <Text as="h1" variant="heading-hero" color="foreground-1">Canvas</Text>
          <Button size="sm" onClick={openDrawer}>
            <IconV2 name="plus" size="sm" />
            New Insights
          </Button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchInput
              placeholder="Search"
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
          <Button variant="outline" size="sm" iconOnly ignoreIconOnlyTooltip>
            <IconV2 name="pin" size="sm" />
          </Button>
          <Button variant="outline" size="sm">
            <IconV2 name="arrows-updown" size="sm" />
            Most Recent
            <IconV2 name="nav-arrow-down" size="sm" />
          </Button>
        </div>

        {/* Table */}
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head
                sortable
                sortDirection={sortDir}
                onClick={() =>
                  setSortDir((prev) =>
                    prev === 'asc' ? 'desc' : prev === 'desc' ? false : 'asc'
                  )
                }
              >
                Name
              </Table.Head>
              <Table.Head>Org Tree Mapped</Table.Head>
              <Table.Head>No. of Widgets</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Created On</Table.Head>
              <Table.Head>Updated On</Table.Head>
              <Table.Head hideDivider className="w-10" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedData.map((row) => (
              <Table.Row key={row.name}>
                <Table.Cell>
                  <Text variant="body-normal" color="foreground-1">{row.name}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text variant="body-normal" color="foreground-3">{row.orgTree}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text variant="body-normal" color="foreground-3">{row.widgets}</Text>
                </Table.Cell>
                <Table.Cell>
                  <StatusBadge variant="outline" theme={statusTheme[row.status]} size="sm">
                    {row.status}
                  </StatusBadge>
                </Table.Cell>
                <Table.Cell>
                  <Text variant="body-normal" color="foreground-3">{row.createdOn}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text variant="body-normal" color="foreground-3">{row.updatedOn}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
                    <IconV2 name="more-dots-fill" size="sm" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {/* Pagination footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Select
              value="10"
              options={[
                { label: '10 items per page', value: '10' },
                { label: '20 items per page', value: '20' },
                { label: '50 items per page', value: '50' },
              ]}
              onChange={() => {}}
            />
          </div>
          <div className="flex items-center gap-2">
            <Text variant="body-normal" color="foreground-3">Page 1 of 1</Text>
            <Button variant="outline" size="sm" iconOnly ignoreIconOnlyTooltip disabled>
              <IconV2 name="nav-arrow-left" size="sm" />
            </Button>
            <Button variant="outline" size="sm" iconOnly ignoreIconOnlyTooltip disabled>
              <IconV2 name="nav-arrow-right" size="sm" />
            </Button>
          </div>
        </div>
      </div>

      {/* Create Insight drawer */}
      {drawerVisible && (
        <>
          <div
            className="fixed inset-0 z-40 transition-opacity duration-300 ease-in-out"
            style={{
              backgroundColor: drawerOpen ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)',
            }}
            onClick={closeDrawer}
          />
          <div
            className="fixed right-0 top-0 z-50 flex h-full w-[420px] flex-col border-l border-cn-1 bg-cn-3 shadow-xl"
            style={{
              transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 300ms ease-in-out',
            }}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <Text variant="heading-subsection" color="foreground-1">Create Insight</Text>
              <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip onClick={closeDrawer}>
                <IconV2 name="x-mark" size="sm" />
              </Button>
            </div>
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-5">
              <div className="flex flex-col gap-1.5">
                <Text variant="body-strong" color="foreground-1">Name</Text>
                <TextInput
                  value={insightName}
                  onChange={(e) => setInsightName(e.target.value)}
                  placeholder="Enter name"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Text variant="body-strong" color="foreground-1">Description (Optional)</Text>
                <Textarea
                  value={insightDesc}
                  onChange={(e) => setInsightDesc(e.target.value)}
                  placeholder="Measure how smoothly work flows through your pipeline by identifying where delays and bottlenecks happen."
                  rows={4}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Text variant="body-strong" color="foreground-1">Tags (Optional)</Text>
                <TextInput
                  value={insightTagInput}
                  onChange={(e) => setInsightTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && insightTagInput.trim()) {
                      setInsightTags((prev) => [...prev, insightTagInput.trim()])
                      setInsightTagInput('')
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {insightTags.map((tag) => (
                    <Tag key={tag} variant="outline" theme="gray" size="sm" value={tag} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-cn-1 px-5 py-3">
              <Button variant="outline" size="sm" onClick={closeDrawer}>Cancel</Button>
              <Button size="sm">Submit</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
