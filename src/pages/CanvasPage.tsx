import { useState } from 'react'
import {
  Text,
  Button,
  IconV2,
  SearchInput,
  Table,
  StatusBadge,
  Pagination,
} from '@harnessio/ui/components'
import { Nav2 } from '../components/Nav2'

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
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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

  const pagedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <Nav2 activeSection="canvas">
      <div className="flex flex-1 flex-col gap-3 overflow-auto px-5 pb-5 pt-3">
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
            {pagedData.map((row) => (
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
                    <IconV2 name="more-horizontal" size="sm" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {/* Pagination */}
        <Pagination className="!mt-0"
          totalItems={sortedData.length}
          pageSize={pageSize}
          currentPage={currentPage}
          goToPage={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50]}
        />
      </div>
    </Nav2>
  )
}
