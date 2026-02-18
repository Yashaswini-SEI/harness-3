import { useState, useEffect } from 'react'
import {
  Text,
  Button,
  IconV2,
  SearchInput,
  Table,
  StatusBadge,
  Select,
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

export function CanvasPage() {
  const [search, setSearch] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | false>(false)
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )

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
          <Button size="sm">
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
    </div>
  )
}
