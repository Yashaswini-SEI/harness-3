import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Text,
  Button,
  IconV2,
  SearchInput,
  Table,
  Pagination,
  DropdownMenu,
  TextInput,
  Select,
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

function ProfileLink({ value, href }: { value: string | null; href?: string }) {
  if (!value) {
    return <Text variant="body-normal" color="foreground-4">&ndash;</Text>
  }
  if (href) {
    return (
      <a href={href} className="text-sm" style={{ color: 'var(--cn-brand, #006DEA)' }}>
        {value}
      </a>
    )
  }
  return (
    <button className="text-sm" style={{ color: 'var(--cn-brand, #006DEA)' }}>
      {value}
    </button>
  )
}

const AVATAR_PALETTES = [
  { bg: '#EFF4FF', text: '#3366CC' },
  { bg: '#F0FDF4', text: '#2D8A4E' },
  { bg: '#FFF7ED', text: '#C2590A' },
  { bg: '#FDF2F8', text: '#BE185D' },
  { bg: '#F5F3FF', text: '#7C3AED' },
  { bg: '#ECFEFF', text: '#0E7490' },
  { bg: '#FEF9EC', text: '#A16207' },
  { bg: '#FFF1F2', text: '#BE123C' },
]

function avatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return AVATAR_PALETTES[((hash >>> 0) % AVATAR_PALETTES.length)]
}

function UserCell({ user }: { user: { name: string; initials: string } }) {
  const palette = avatarColor(user.name)
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-cn-full"
        style={{ backgroundColor: palette.bg }}
      >
        <span className="text-[10px] font-semibold" style={{ color: palette.text }}>{user.initials}</span>
      </div>
      <Text variant="body-normal" color="foreground-3" truncate>{user.name}</Text>
    </div>
  )
}

export function OrgTreePage() {
  const searchFields = [
    { key: 'name' as const, label: 'Name' },
    { key: 'efficiencyProfile' as const, label: 'Efficiency Profile' },
    { key: 'productivityProfile' as const, label: 'Productivity Profile' },
    { key: 'businessAlignmentProfile' as const, label: 'Business Alignment Profile' },
  ]
  const [search, setSearch] = useState('')
  const [searchField, setSearchField] = useState(searchFields[0])
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | false>(false)
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Edit drawer state (existing org tree settings)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const [drawerName, setDrawerName] = useState('')
  const [drawerEfficiency, setDrawerEfficiency] = useState('with-ff')
  const [drawerProductivity, setDrawerProductivity] = useState('im-scm')
  const [drawerBA, setDrawerBA] = useState('new-ba')

  const openDrawer = useCallback((name?: string) => {
    if (name) setDrawerName(name)
    clearTimeout(closeTimerRef.current)
    setDrawerVisible(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setDrawerOpen(true)))
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    closeTimerRef.current = setTimeout(() => {
      setDrawerVisible(false)
      setDrawerName('')
      setDrawerEfficiency('with-ff')
      setDrawerProductivity('im-scm')
      setDrawerBA('new-ba')
    }, 300)
  }, [])

  // New org tree drawer state
  const [newDrawerVisible, setNewDrawerVisible] = useState(false)
  const [newDrawerOpen, setNewDrawerOpen] = useState(false)
  const newCloseTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const openNewDrawer = useCallback(() => {
    clearTimeout(newCloseTimerRef.current)
    setNewDrawerVisible(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setNewDrawerOpen(true)))
  }, [])

  const closeNewDrawer = useCallback(() => {
    setNewDrawerOpen(false)
    newCloseTimerRef.current = setTimeout(() => setNewDrawerVisible(false), 300)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light-std-low', 'dark-std-low')
    root.classList.add(dark ? 'dark-std-low' : 'light-std-low')
  }, [dark])

  const filteredData = search
    ? orgTreeData.filter((row) => {
        const val = row[searchField.key]
        if (val == null) return false
        return val.toString().toLowerCase().includes(search.toLowerCase())
      })
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
          <Button size="sm" onClick={openNewDrawer}>
            <IconV2 name="plus" size="sm" />
            New Org Tree
          </Button>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchInput
              placeholder={`Search org trees by ${searchField.label.toLowerCase()}`}
              searchValue={search}
              onChange={(value) => setSearch(value)}
            />
          </div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="outline" size="sm">
                Search by {searchField.label}
                <IconV2 name="nav-arrow-down" size="sm" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              {searchFields.map((f) => (
                <DropdownMenu.Item key={f.key} title={f.label} onSelect={() => setSearchField(f)} />
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
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
                  <button className="text-sm" style={{ color: 'var(--cn-brand, #006DEA)' }} onClick={() => openDrawer(row.name)}>{row.name}</button>
                </Table.Cell>
                <Table.Cell>
                  <Text variant="body-normal" color="foreground-3">{row.teams}</Text>
                </Table.Cell>
                <Table.Cell>
                  <ProfileLink value={row.efficiencyProfile} href="/module/sei/configuration/profile/efficiency" />
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
                    <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip onClick={() => openDrawer(row.name)}>
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

      {/* New Org Tree drawer */}
      {drawerVisible && (
        <>
          <div
            className="fixed inset-0 z-40 transition-opacity duration-300 ease-in-out"
            style={{ backgroundColor: drawerOpen ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)' }}
            onClick={closeDrawer}
          />
          <div
            className="fixed right-2 top-2 bottom-2 z-50 flex w-[480px] flex-col overflow-hidden border border-cn-1 bg-cn-3 shadow-xl"
            style={{
              borderRadius: 16,
              transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 300ms ease-in-out',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4">
              <Text variant="heading-subsection" color="foreground-1">Org Tree Settings</Text>
              <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip onClick={closeDrawer}>
                <IconV2 name="xmark" size="sm" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-5">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <Text variant="body-strong" color="foreground-1">Name</Text>
                <TextInput
                  value={drawerName}
                  onChange={(e) => setDrawerName(e.target.value)}
                  placeholder="Enter org tree name"
                />
              </div>

              {/* Profiles */}
              <div className="border border-borders-2 bg-white p-4 dark:bg-cn-1" style={{ borderRadius: 6 }}>
                <div className="space-y-4">
                  <div>
                    <Text variant="body-strong" color="foreground-1">Profiles</Text>
                    <Text variant="body-normal" color="foreground-3" className="mt-1">
                      Switching profiles will impact team definitions across the org tree.
                    </Text>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Text variant="body-normal" color="foreground-1">Efficiency</Text>
                    <Select
                      value={drawerEfficiency}
                      options={[
                        { label: 'With FF', value: 'with-ff' },
                        { label: 'Test validation', value: 'test-validation' },
                        { label: 'Test productivity', value: 'test-productivity' },
                        { label: 'Sprint metrics', value: 'sprint-metrics' },
                      ]}
                      onChange={(val) => setDrawerEfficiency(val)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Text variant="body-normal" color="foreground-1">Productivity</Text>
                    <Select
                      value={drawerProductivity}
                      options={[
                        { label: 'IM_SCM', value: 'im-scm' },
                        { label: 'Productivity profile', value: 'productivity-profile' },
                      ]}
                      onChange={(val) => setDrawerProductivity(val)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Text variant="body-normal" color="foreground-1">Business Alignment</Text>
                    <Select
                      value={drawerBA}
                      options={[
                        { label: 'New BA', value: 'new-ba' },
                        { label: 'BA levels', value: 'ba-levels' },
                      ]}
                      onChange={(val) => setDrawerBA(val)}
                    />
                  </div>
                </div>
              </div>

              {/* Configured Levels */}
              <div className="border border-borders-2 bg-white p-4 dark:bg-cn-1" style={{ borderRadius: 6 }}>
                <Text variant="body-strong" color="foreground-1">Configured Levels</Text>
                <Text variant="body-normal" color="foreground-3" className="mt-2">
                  <Text variant="body-strong" color="foreground-1">Manager Email</Text> (Level 1)
                </Text>
              </div>

              {/* Configured Filters */}
              <div className="border border-borders-2 bg-white p-4 dark:bg-cn-1" style={{ borderRadius: 6 }}>
                <Text variant="body-strong" color="foreground-1">Configured Filters</Text>
                <Text variant="body-normal" color="foreground-4" className="mt-2">
                  No data filters configured
                </Text>
              </div>

              {/* Selected Integrations */}
              <div className="border border-borders-2 bg-white p-4 dark:bg-cn-1" style={{ borderRadius: 6 }}>
                <div className="space-y-3">
                  <Text variant="body-strong" color="foreground-1">Selected Integrations</Text>
                  <Text variant="body-normal" color="foreground-3">
                    The default integrations selected here will be used for computing data for all teams.
                  </Text>
                  <Text variant="body-normal" color="foreground-3">
                    Note that the default integration cannot be changed. However, teams may override it if necessary.
                  </Text>

                  <hr className="border-borders-2" />

                  {/* Issue management Tools */}
                  <div className="space-y-2">
                    <Text variant="body-strong" color="foreground-1">Issue management Tools</Text>
                    <div className="flex items-center gap-3 rounded-lg border border-borders-2 px-4 py-3 shadow-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-[#2684FF]">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M14.5 1.5H8.25L8.75 7.25L14.5 7.75V1.5Z" fill="white"/>
                          <path d="M1.5 14.5H7.75L7.25 8.75L1.5 8.25V14.5Z" fill="white"/>
                          <path d="M8.75 7.25L14.5 7.75L8.25 14.5H7.75L7.25 8.75L8.75 7.25Z" fill="white" fillOpacity="0.7"/>
                          <path d="M7.25 8.75L1.5 8.25L7.75 1.5H8.25L8.75 7.25L7.25 8.75Z" fill="white" fillOpacity="0.7"/>
                        </svg>
                      </div>
                      <Text variant="body-normal" color="foreground-1">Jira - Harness</Text>
                    </div>
                  </div>

                  {/* Source code management */}
                  <div className="space-y-2">
                    <Text variant="body-strong" color="foreground-1">Source code management</Text>
                    <div className="flex items-center gap-3 rounded-lg border border-borders-2 px-4 py-3 shadow-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-[#24292F]">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                          <path fillRule="evenodd" clipRule="evenodd" d="M8 1C4.13 1 1 4.13 1 8c0 3.1 2.01 5.73 4.79 6.66.35.06.48-.15.48-.34 0-.17-.01-.71-.01-1.29-1.76.33-2.2-.43-2.34-.82-.08-.2-.42-.82-.71-.98-.24-.13-.59-.46-.01-.47.55-.01.94.51 1.07.71.63 1.05 1.63.76 2.03.57.06-.45.24-.76.44-.93-1.55-.17-3.18-.78-3.18-3.45 0-.76.27-1.39.71-1.88-.07-.18-.31-.89.07-1.85 0 0 .58-.18 1.9.71.55-.15 1.14-.23 1.73-.23s1.18.08 1.73.23c1.32-.9 1.9-.71 1.9-.71.38.96.14 1.67.07 1.85.44.49.71 1.11.71 1.88 0 2.68-1.63 3.28-3.19 3.45.25.22.47.64.47 1.29 0 .93-.01 1.68-.01 1.91 0 .19.13.41.48.34A7.003 7.003 0 0015 8c0-3.87-3.13-7-7-7z"/>
                        </svg>
                      </div>
                      <Text variant="body-normal" color="foreground-1">GitHub - Harness</Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-cn-1 px-5 py-3">
              <Button variant="outline" size="sm" onClick={closeDrawer}>Cancel</Button>
              <Button size="sm" onClick={closeDrawer}>Save</Button>
            </div>
          </div>
        </>
      )}

      {/* New Org Tree drawer */}
      {newDrawerVisible && (
        <>
          <div
            className="fixed inset-0 z-40 transition-opacity duration-300 ease-in-out"
            style={{ backgroundColor: newDrawerOpen ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)' }}
            onClick={closeNewDrawer}
          />
          <div
            className="fixed right-2 top-2 bottom-2 z-50 flex w-[480px] flex-col overflow-hidden border border-cn-1 bg-cn-3 shadow-xl"
            style={{
              borderRadius: 16,
              transform: newDrawerOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 300ms ease-in-out',
            }}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <Text variant="heading-subsection" color="foreground-1">New Org Tree</Text>
              <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip onClick={closeNewDrawer}>
                <IconV2 name="xmark" size="sm" />
              </Button>
            </div>
            <div className="flex flex-1 items-center justify-center px-5">
              <Text variant="body-normal" color="foreground-4">Under development</Text>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-cn-1 px-5 py-3">
              <Button variant="outline" size="sm" onClick={closeNewDrawer}>Cancel</Button>
              <Button size="sm" onClick={closeNewDrawer}>Save</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
