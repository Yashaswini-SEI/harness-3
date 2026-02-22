import { useState, useEffect } from 'react'
import {
  Text,
  Button,
  IconV2,
  SearchInput,
  Table,
  Tabs,
  Pagination,
  Tag,
} from '@harnessio/ui/components'
import { Nav2 } from '../components/Nav2'
import { Header } from '../components/Breadcrumb2'
import harnessLogo from '../assets/logos/harness.svg'

interface IntegrationRow {
  name: string
  application: string
  appIcon: 'harness-code' | 'github' | 'jira' | 'harness-ng'
  description: string
  status: 'Offline Satellite' | 'Critical' | 'Paused'
  type: 'satellite' | 'notification'
  tags: string[]
  lastUpdatedAt: string
  lastUpdatedBy: string
}

const APP_ICONS: Record<string, { bg: string; label: string; svg: React.ReactNode }> = {
  'harness-code': {
    bg: 'transparent',
    label: 'Harness Code',
    svg: <img src={harnessLogo} alt="Harness" className="h-6 w-6" />,
  },
  github: {
    bg: '#24292F',
    label: 'GitHub',
    svg: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
        <path fillRule="evenodd" clipRule="evenodd" d="M8 1C4.13 1 1 4.13 1 8c0 3.1 2.01 5.73 4.79 6.66.35.06.48-.15.48-.34 0-.17-.01-.71-.01-1.29-1.76.33-2.2-.43-2.34-.82-.08-.2-.42-.82-.71-.98-.24-.13-.59-.46-.01-.47.55-.01.94.51 1.07.71.63 1.05 1.63.76 2.03.57.06-.45.24-.76.44-.93-1.55-.17-3.18-.78-3.18-3.45 0-.76.27-1.39.71-1.88-.07-.18-.31-.89.07-1.85 0 0 .58-.18 1.9.71.55-.15 1.14-.23 1.73-.23s1.18.08 1.73.23c1.32-.9 1.9-.71 1.9-.71.38.96.14 1.67.07 1.85.44.49.71 1.11.71 1.88 0 2.68-1.63 3.28-3.19 3.45.25.22.47.64.47 1.29 0 .93-.01 1.68-.01 1.91 0 .19.13.41.48.34A7.003 7.003 0 0015 8c0-3.87-3.13-7-7-7z" />
      </svg>
    ),
  },
  jira: {
    bg: '#2684FF',
    label: 'Jira',
    svg: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M14.5 1.5H8.25L8.75 7.25L14.5 7.75V1.5Z" fill="white" />
        <path d="M1.5 14.5H7.75L7.25 8.75L1.5 8.25V14.5Z" fill="white" />
        <path d="M8.75 7.25L14.5 7.75L8.25 14.5H7.75L7.25 8.75L8.75 7.25Z" fill="white" fillOpacity="0.7" />
        <path d="M7.25 8.75L1.5 8.25L7.75 1.5H8.25L8.75 7.25L7.25 8.75Z" fill="white" fillOpacity="0.7" />
      </svg>
    ),
  },
  'harness-ng': {
    bg: 'transparent',
    label: 'Harness NG',
    svg: <img src={harnessLogo} alt="Harness" className="h-6 w-6" />,
  },
}

const integrationData: IntegrationRow[] = [
  {
    name: 'Documentation - On Prem',
    application: 'harness-code',
    appIcon: 'harness-code',
    description: 'This integration is for the Harness Developer Hu...',
    status: 'Offline Satellite',
    type: 'satellite',
    tags: ['Tag'],
    lastUpdatedAt: 'December 4, 2025',
    lastUpdatedBy: 'dhrubajyoti.chakraborty',
  },
  {
    name: 'Documentation',
    application: 'harness-code',
    appIcon: 'harness-code',
    description: 'This integration is for the Harness Developer Hu...',
    status: 'Critical',
    type: 'notification',
    tags: [],
    lastUpdatedAt: 'December 12, 2025',
    lastUpdatedBy: 'dhrubajyoti.chakraborty',
  },
  {
    name: 'GitHub App',
    application: 'github',
    appIcon: 'github',
    description: '',
    status: 'Critical',
    type: 'notification',
    tags: [],
    lastUpdatedAt: 'January 15, 2025',
    lastUpdatedBy: 'dhrubajyoti.chakraborty',
  },
  {
    name: 'Jira - Harness',
    application: 'jira',
    appIcon: 'jira',
    description: '',
    status: 'Paused',
    type: 'notification',
    tags: [],
    lastUpdatedAt: 'January 18, 2025',
    lastUpdatedBy: 'dhrubajyoti.chakraborty',
  },
  {
    name: 'GitHub - Harness',
    application: 'github',
    appIcon: 'github',
    description: '',
    status: 'Paused',
    type: 'notification',
    tags: [],
    lastUpdatedAt: 'February 4, 2025',
    lastUpdatedBy: 'dhrubajyoti.chakraborty',
  },
  {
    name: 'Harness Sales Engineering',
    application: 'harness-ng',
    appIcon: 'harness-ng',
    description: '',
    status: 'Paused',
    type: 'notification',
    tags: [],
    lastUpdatedAt: 'February 6, 2025',
    lastUpdatedBy: 'dhrubajyoti.chakraborty',
  },
]

const STATUS_STYLES: Record<string, { color: string; dot: string }> = {
  'Offline Satellite': { color: '#E53E3E', dot: '#E53E3E' },
  Critical: { color: '#E53E3E', dot: '#E53E3E' },
  Paused: { color: '#6B7280', dot: '#6B7280' },
}

export function IntegrationsPage() {
  const [search, setSearch] = useState('')
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [activeTab, setActiveTab] = useState('my')

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light-std-low', 'dark-std-low')
    root.classList.add(dark ? 'dark-std-low' : 'light-std-low')
  }, [dark])

  const filteredData = search
    ? integrationData.filter((row) =>
        row.name.toLowerCase().includes(search.toLowerCase())
      )
    : integrationData

  const pagedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="flex min-h-screen flex-col bg-cn-3">
      <Header />
      <div className="flex flex-1">
      <Nav2 activeSection="org-tree" dark={dark} onThemeToggle={() => setDark(!dark)} />

      <div className="flex flex-1 flex-col gap-5 px-5 pb-5 pt-3">

        <Text as="h1" variant="heading-hero" color="foreground-1">Integrations</Text>

        <Tabs.Root defaultValue="my" value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="my">My Integrations</Tabs.Trigger>
            <Tabs.Trigger value="available">Available Integrations</Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>

        {activeTab === 'my' && (
          <>
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
                Application
                <IconV2 name="nav-arrow-down" size="sm" />
              </Button>
              <Button variant="outline" size="sm">
                Tags
                <IconV2 name="nav-arrow-down" size="sm" />
              </Button>
              <Button variant="outline" size="sm">
                Type
                <IconV2 name="nav-arrow-down" size="sm" />
              </Button>
            </div>

            {/* Table */}
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Name</Table.Head>
                  <Table.Head>Application</Table.Head>
                  <Table.Head>Description</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Type</Table.Head>
                  <Table.Head>Tags</Table.Head>
                  <Table.Head>Last Updated At</Table.Head>
                  <Table.Head>Last Updated By</Table.Head>
                  <Table.Head hideDivider className="w-10" />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {pagedData.map((row) => {
                  const app = APP_ICONS[row.appIcon]
                  const statusStyle = STATUS_STYLES[row.status]
                  return (
                    <Table.Row key={row.name}>
                      <Table.Cell>
                        <Text variant="body-normal" color="foreground-1">{row.name}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          {app.bg === 'transparent' ? (
                            <div className="h-6 w-6 shrink-0">{app.svg}</div>
                          ) : (
                            <div
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
                              style={{ backgroundColor: app.bg }}
                            >
                              {app.svg}
                            </div>
                          )}
                          <Text variant="body-normal" color="foreground-1">{app.label}</Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Text variant="body-normal" color="foreground-3">{row.description || '\u2013'}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: statusStyle.dot }}
                          />
                          <span className="text-sm" style={{ color: statusStyle.color }}>{row.status}</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <IconV2
                          name={row.type === 'satellite' ? 'settings' : 'bell'}
                          size="sm"
                          className="text-foreground-3"
                        />
                      </Table.Cell>
                      <Table.Cell>
                        {row.tags.length > 0 ? (
                          <div className="flex gap-1">
                            {row.tags.map((tag) => (
                              <Tag key={tag} variant="outline" theme="gray" size="sm" value={tag} />
                            ))}
                          </div>
                        ) : (
                          <span />
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Text variant="body-normal" color="foreground-3">{row.lastUpdatedAt}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-cn-full bg-[#6C63FF]">
                            <span className="text-[10px] font-semibold text-white">DC</span>
                          </div>
                          <Text variant="body-normal" color="foreground-3" truncate>{row.lastUpdatedBy}</Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
                          <IconV2 name="trash" size="sm" />
                        </Button>
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
          </>
        )}

        {activeTab === 'available' && (
          <div className="rounded-cn-2 border border-borders-2 p-6" style={{ backgroundColor: '#fff' }}>
            <Text variant="body-normal" color="foreground-3">
              Available integrations will appear here.
            </Text>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
