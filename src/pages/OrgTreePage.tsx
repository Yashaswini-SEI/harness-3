import { useState, useEffect } from 'react'
import {
  Text,
  Button,
  IconV2,
  SearchInput,
  Table,
  Pagination,
} from '@harnessio/ui/components'
import { Nav2 } from '../components/Nav2'
import { Breadcrumb2 } from '../components/Breadcrumb2'

interface OrgTreeRow {
  name: string
  teams: number
  efficiencyProfile: string | null
  productivityProfile: string | null
  businessAlignmentProfile: string | null
  lastModified: string
  createdBy: { name: string; initials: string }
  lastUpdatedBy: { name: string; initials: string }
}

const orgTreeData: OrgTreeRow[] = [
  {
    name: 'ado_ba_test',
    teams: 3,
    efficiencyProfile: 'With FF',
    productivityProfile: 'IM_SCM',
    businessAlignmentProfile: 'BA levels',
    lastModified: '2026-01-15 02:24',
    createdBy: { name: 'mahesh.sann...', initials: 'MS' },
    lastUpdatedBy: { name: 'sharath.m...', initials: 'SM' },
  },
  {
    name: 'automation_IM_SC...',
    teams: 5,
    efficiencyProfile: 'Test validation',
    productivityProfile: null,
    businessAlignmentProfile: 'BA levels',
    lastModified: '2026-01-21 15:24',
    createdBy: { name: 'vinaya.nayak...', initials: 'VN' },
    lastUpdatedBy: { name: 'sharath.m...', initials: 'SM' },
  },
  {
    name: 'automation-only_IM',
    teams: 3,
    efficiencyProfile: 'Test validation',
    productivityProfile: null,
    businessAlignmentProfile: null,
    lastModified: '2025-11-04 08:04',
    createdBy: { name: 'vinaya.nayak...', initials: 'VN' },
    lastUpdatedBy: { name: 'vinaya.nayak...', initials: 'VN' },
  },
  {
    name: 'auto_productivity',
    teams: 12,
    efficiencyProfile: 'Test productivity',
    productivityProfile: 'IM_SCM',
    businessAlignmentProfile: null,
    lastModified: '2025-09-25 02:46',
    createdBy: { name: 'vinaya.nayak...', initials: 'VN' },
    lastUpdatedBy: { name: 'sharath.mh...', initials: 'SM' },
  },
  {
    name: 'ba_ma',
    teams: 4,
    efficiencyProfile: 'Sprint metrics',
    productivityProfile: 'IM_SCM',
    businessAlignmentProfile: null,
    lastModified: '2025-09-17 17:22',
    createdBy: { name: 'mahesh.sann...', initials: 'MS' },
    lastUpdatedBy: { name: 'harshil.garg...', initials: 'HG' },
  },
  {
    name: 'Insights',
    teams: 3,
    efficiencyProfile: 'Sprint metrics',
    productivityProfile: 'Productivity profil...',
    businessAlignmentProfile: 'BA levels',
    lastModified: '2025-10-04 16:03',
    createdBy: { name: 'vinaya.nayak...', initials: 'VN' },
    lastUpdatedBy: { name: 'sharath.mh...', initials: 'SM' },
  },
  {
    name: 'sei_org_tree',
    teams: 3,
    efficiencyProfile: 'Individual Sprint Me...',
    productivityProfile: null,
    businessAlignmentProfile: 'BA levels',
    lastModified: '2025-10-31 07:49',
    createdBy: { name: 'mahesh.sann...', initials: 'MS' },
    lastUpdatedBy: { name: 'sharath.mh...', initials: 'SM' },
  },
  {
    name: 'sprint-insights-indi...',
    teams: 5,
    efficiencyProfile: 'Sprint metrics',
    productivityProfile: null,
    businessAlignmentProfile: 'BA levels',
    lastModified: '2025-10-23 02:54',
    createdBy: { name: 'mahesh.sann...', initials: 'MS' },
    lastUpdatedBy: { name: 'vinaya.nayak...', initials: 'VN' },
  },
  {
    name: 'sprint-insights-tea...',
    teams: 10,
    efficiencyProfile: 'Meetraj - Sprint metrics',
    productivityProfile: null,
    businessAlignmentProfile: null,
    lastModified: '2025-10-23 08:41',
    createdBy: { name: 'vinaya.nayak...', initials: 'VN' },
    lastUpdatedBy: { name: 'vinaya.nayak...', initials: 'VN' },
  },
  {
    name: 'west-dev',
    teams: 4,
    efficiencyProfile: 'Efficiency July 2025',
    productivityProfile: null,
    businessAlignmentProfile: 'BA levels',
    lastModified: '2025-09-17 11:08',
    createdBy: { name: 'vinaya.nayak...', initials: 'VN' },
    lastUpdatedBy: { name: 'vinaya.nayak...', initials: 'VN' },
  },
]

function ProfileLink({ value }: { value: string | null }) {
  if (!value) {
    return <Text variant="body-normal" color="foreground-4">&ndash;</Text>
  }
  return (
    <button className="text-sm" style={{ color: 'var(--cn-brand, #006DEA)' }}>
      {value}
    </button>
  )
}

function UserCell({ user }: { user: { name: string; initials: string } }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-cn-full bg-[#42AB45]">
        <span className="text-[10px] font-semibold text-white">{user.initials}</span>
      </div>
      <Text variant="body-normal" color="foreground-3" truncate>{user.name}</Text>
    </div>
  )
}

export function OrgTreePage() {
  const [search, setSearch] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | false>(false)
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light-std-low', 'dark-std-low')
    root.classList.add(dark ? 'dark-std-low' : 'light-std-low')
  }, [dark])

  const filteredData = search
    ? orgTreeData.filter((row) =>
        row.name.toLowerCase().includes(search.toLowerCase())
      )
    : orgTreeData

  const sortedData = sortDir
    ? [...filteredData].sort((a, b) =>
        sortDir === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      )
    : filteredData

  const pagedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="flex min-h-screen bg-cn-3">
      <Nav2 activeSection="org-tree" dark={dark} onThemeToggle={() => setDark(!dark)} />

      <div className="flex flex-1 flex-col gap-5 px-5 pb-5 pt-3">
        {/* Breadcrumb */}
        <Breadcrumb2 />

        {/* Page title + action */}
        <div className="flex items-center justify-between">
          <Text as="h1" variant="heading-hero" color="foreground-1">Org Trees</Text>
          <Button size="sm">
            <IconV2 name="plus" size="sm" />
            New Org Tree
          </Button>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchInput
              placeholder="Search org trees by name"
              searchValue={search}
              onChange={(value) => setSearch(value)}
            />
          </div>
          <Button variant="outline" size="sm">
            Search by Name
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
                Org Tree Name
              </Table.Head>
              <Table.Head>Teams</Table.Head>
              <Table.Head sortable>Efficiency Profile</Table.Head>
              <Table.Head sortable>Productivity Profile</Table.Head>
              <Table.Head sortable>Business Alignment Profile</Table.Head>
              <Table.Head sortable>Last Modified</Table.Head>
              <Table.Head>Created By</Table.Head>
              <Table.Head>Last Updated By</Table.Head>
              <Table.Head hideDivider className="w-20" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {pagedData.map((row) => (
              <Table.Row key={row.name}>
                <Table.Cell>
                  <Text variant="body-normal" color="foreground-1">{row.name}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text variant="body-normal" color="foreground-3">{row.teams}</Text>
                </Table.Cell>
                <Table.Cell>
                  <ProfileLink value={row.efficiencyProfile} />
                </Table.Cell>
                <Table.Cell>
                  <ProfileLink value={row.productivityProfile} />
                </Table.Cell>
                <Table.Cell>
                  <ProfileLink value={row.businessAlignmentProfile} />
                </Table.Cell>
                <Table.Cell>
                  <Text variant="body-normal" color="foreground-3">{row.lastModified}</Text>
                </Table.Cell>
                <Table.Cell>
                  <UserCell user={row.createdBy} />
                </Table.Cell>
                <Table.Cell>
                  <UserCell user={row.lastUpdatedBy} />
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
                      <IconV2 name="edit" size="sm" />
                    </Button>
                    <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
                      <IconV2 name="trash" size="sm" />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {/* Pagination */}
        <Pagination
          totalItems={sortedData.length}
          pageSize={pageSize}
          currentPage={currentPage}
          goToPage={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50]}
        />
      </div>
    </div>
  )
}
