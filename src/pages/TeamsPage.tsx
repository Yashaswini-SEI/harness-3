import { useState } from 'react'
import {
  Text,
  SearchInput,
  Table,
  Pagination,
} from '@harnessio/ui/components'
import { Nav2 } from '../components/Nav2'
import harnessLogo from '../assets/logos/harness.svg'

interface TeamRow {
  name: string
  orgTreeName: string
  developers: number
  teamManager: string
  integrations: ('github' | 'harness' | 'jira')[]
  lastUpdatedAt: string
  lastUpdatedBy: string
}

const INTEGRATION_ICONS: Record<string, { bg: string; label: string; svg: React.ReactNode }> = {
  github: {
    bg: '#24292F',
    label: 'GitHub',
    svg: (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
        <path fillRule="evenodd" clipRule="evenodd" d="M8 1C4.13 1 1 4.13 1 8c0 3.1 2.01 5.73 4.79 6.66.35.06.48-.15.48-.34 0-.17-.01-.71-.01-1.29-1.76.33-2.2-.43-2.34-.82-.08-.2-.42-.82-.71-.98-.24-.13-.59-.46-.01-.47.55-.01.94.51 1.07.71.63 1.05 1.63.76 2.03.57.06-.45.24-.76.44-.93-1.55-.17-3.18-.78-3.18-3.45 0-.76.27-1.39.71-1.88-.07-.18-.31-.89.07-1.85 0 0 .58-.18 1.9.71.55-.15 1.14-.23 1.73-.23s1.18.08 1.73.23c1.32-.9 1.9-.71 1.9-.71.38.96.14 1.67.07 1.85.44.49.71 1.11.71 1.88 0 2.68-1.63 3.28-3.19 3.45.25.22.47.64.47 1.29 0 .93-.01 1.68-.01 1.91 0 .19.13.41.48.34A7.003 7.003 0 0015 8c0-3.87-3.13-7-7-7z" />
      </svg>
    ),
  },
  harness: {
    bg: 'transparent',
    label: 'Harness',
    svg: <img src={harnessLogo} alt="Harness" className="h-[18px] w-[18px]" />,
  },
  jira: {
    bg: '#2684FF',
    label: 'Jira',
    svg: (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
        <path d="M14.5 1.5H8.25L8.75 7.25L14.5 7.75V1.5Z" fill="white" />
        <path d="M1.5 14.5H7.75L7.25 8.75L1.5 8.25V14.5Z" fill="white" />
        <path d="M8.75 7.25L14.5 7.75L8.25 14.5H7.75L7.25 8.75L8.75 7.25Z" fill="white" fillOpacity="0.7" />
        <path d="M7.25 8.75L1.5 8.25L7.75 1.5H8.25L8.75 7.25L7.25 8.75Z" fill="white" fillOpacity="0.7" />
      </svg>
    ),
  },
}

const teamsData: TeamRow[] = Array.from({ length: 10 }, () => ({
  name: 'Direct reports of natalie',
  orgTreeName: 'Acme Engineering',
  developers: 6,
  teamManager: 'Natalie Parker',
  integrations: ['github', 'harness', 'jira'] as const,
  lastUpdatedAt: '21 Jan, 2026 09:31:58',
  lastUpdatedBy: 'dhrubajyoti.chakraborty',
}))

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

function getInitials(name: string) {
  return name
    .split('.')
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2)
}

export function TeamsPage() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredData = search
    ? teamsData.filter((row) =>
        row.name.toLowerCase().includes(search.toLowerCase())
      )
    : teamsData

  const pagedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <Nav2 activeSection="teams">
      <div className="flex flex-1 flex-col gap-5 overflow-auto px-5 pb-5 pt-6">
        <Text as="h1" variant="heading-hero" color="foreground-1">Teams</Text>

        {/* Search bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchInput
              placeholder="Search by team name"
              searchValue={search}
              onChange={(value) => setSearch(value)}
            />
          </div>
        </div>

        {/* Table */}
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Org Tree Name</Table.Head>
              <Table.Head>Developers</Table.Head>
              <Table.Head>Team Managers</Table.Head>
              <Table.Head>Integrations</Table.Head>
              <Table.Head>Last Updated At</Table.Head>
              <Table.Head>Last Updated By</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {pagedData.map((row, idx) => {
              const palette = avatarColor(row.lastUpdatedBy)
              const initials = getInitials(row.lastUpdatedBy)
              return (
                <Table.Row key={idx}>
                  <Table.Cell>
                    <Text variant="body-normal" color="foreground-1">{row.name}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text variant="body-normal" color="foreground-3">{row.orgTreeName}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text variant="body-normal" color="foreground-3">{row.developers}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text variant="body-normal" color="foreground-3">{row.teamManager}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-1">
                      {row.integrations.map((key) => {
                        const icon = INTEGRATION_ICONS[key]
                        return icon.bg === 'transparent' ? (
                          <div key={key} className="h-[18px] w-[18px] shrink-0">{icon.svg}</div>
                        ) : (
                          <div
                            key={key}
                            className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-sm"
                            style={{ backgroundColor: icon.bg }}
                          >
                            {icon.svg}
                          </div>
                        )
                      })}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Text variant="body-normal" color="foreground-3">{row.lastUpdatedAt}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-cn-full"
                        style={{ backgroundColor: palette.bg }}
                      >
                        <span className="text-[10px] font-semibold" style={{ color: palette.text }}>{initials}</span>
                      </div>
                      <Text variant="body-normal" color="foreground-3" truncate>{row.lastUpdatedBy}</Text>
                    </div>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>

        <Pagination
          totalItems={filteredData.length}
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
