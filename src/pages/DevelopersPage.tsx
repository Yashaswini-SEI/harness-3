import { useState } from 'react'
import {
  Text,
  SearchInput,
  Table,
  Pagination,
  Button,
  IconV2,
  Select,
  Tabs,
} from '@harnessio/ui/components'
import { Nav2 } from '../components/Nav2'

interface DeveloperRow {
  fullName: string
  email: string
  team: string
  managerEmail: string
  jobFamily: string
  jobFunction: string
  site: string
  status: 'active' | 'inactive'
}

const developersData: DeveloperRow[] = [
  { fullName: 'abigail turner', email: 'fardeen.kamal@harness.io', team: 'monnify payment gateway', managerEmail: 'shashank.singh@harness.io', jobFamily: 'software engineer', jobFunction: 'front end', site: 'india', status: 'active' },
  { fullName: 'ajay sakat', email: 'ajay.sakat@harness.io', team: 'monnify payment gateway', managerEmail: 'navaneeth.kn@harness.io', jobFamily: 'software engineer', jobFunction: 'back end', site: 'india', status: 'active' },
  { fullName: 'akshit agrawal', email: 'akshit.agrawal@harness.io', team: 'deposits & savings', managerEmail: 'pooja.singhal@harness.io', jobFamily: 'software engineer', jobFunction: 'front end', site: 'united states', status: 'active' },
  { fullName: 'alexander cooper', email: 'james.ricks@harness.io', team: 'business loans', managerEmail: 'rohit.karelia@harness.io', jobFamily: 'software engineer', jobFunction: 'back end', site: 'india', status: 'active' },
  { fullName: 'amitabh baruah', email: 'amitabh.baruah@harness.io', team: 'payments', managerEmail: 'shashank.singh@harness.io', jobFamily: 'software engineer', jobFunction: 'front end', site: 'united states', status: 'active' },
  { fullName: 'arjun singh', email: 'arjun.singh@harness.io', team: 'domestic switching', managerEmail: 'kalyan.sai@harness.io', jobFamily: 'software engineer', jobFunction: 'front end', site: 'india', status: 'active' },
  { fullName: 'ashish duthade', email: 'ashish.duthade@harness.io', team: 'core banking application', managerEmail: 'shashank.singh@harness.io', jobFamily: 'software engineer', jobFunction: 'back end', site: 'india', status: 'active' },
  { fullName: 'audrey nelson', email: 'c_anjali.agarwal@harness.io', team: 'business intelligence and...', managerEmail: 'kalyan.sai@harness.io', jobFamily: 'software engineer', jobFunction: 'front end', site: 'india', status: 'active' },
  { fullName: 'ayush mantri', email: 'ayush.mantri@harness.io', team: 'payments', managerEmail: 'shashank.singh@harness.io', jobFamily: 'software engineer', jobFunction: 'front end', site: 'india', status: 'active' },
  { fullName: 'back endnjamin foster', email: 'vinod.kone@harness.io', team: 'account payments', managerEmail: 'abhinav.rastogi@harness.io', jobFamily: 'software engineer', jobFunction: 'back end', site: 'india', status: 'active' },
]

// Generate more rows by repeating data with slight variations
const allDevelopers: DeveloperRow[] = Array.from({ length: 60 }, (_, i) => {
  const base = developersData[i % developersData.length]
  if (i < developersData.length) return base
  return { ...base, fullName: `${base.fullName} ${Math.floor(i / developersData.length) + 1}` }
})

type SearchField = 'fullName' | 'email' | 'team' | 'managerEmail' | 'jobFamily' | 'jobFunction' | 'site' | 'status'

const searchFieldOptions: { value: SearchField; label: string }[] = [
  { value: 'fullName', label: 'By full name' },
  { value: 'email', label: 'By email' },
  { value: 'team', label: 'By team' },
  { value: 'managerEmail', label: 'By manager email' },
  { value: 'jobFamily', label: 'By job-family' },
  { value: 'jobFunction', label: 'By job-function' },
  { value: 'site', label: 'By site' },
  { value: 'status', label: 'By status' },
]

const mappingsData = [
  { fieldName: 'NAME', mappedColumn: 'FULL_NAME' },
  { fieldName: 'EMAIL', mappedColumn: 'EMAIL' },
  { fieldName: 'MANAGER_EMAIL', mappedColumn: 'MANAGER EMAIL' },
]

export function DevelopersPage() {
  const [search, setSearch] = useState('')
  const [searchField, setSearchField] = useState<SearchField>('fullName')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredData = search
    ? allDevelopers.filter((row) =>
        row[searchField].toLowerCase().includes(search.toLowerCase())
      )
    : allDevelopers

  const pagedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <Nav2 activeSection="configuration">
      <div className="flex flex-1 flex-col gap-5 overflow-auto px-5 pb-5 pt-6">
        {/* Header */}
        <Text as="h1" variant="heading-hero" color="foreground-1">Developer Records</Text>

        {/* Tabs */}
        <Tabs.Root defaultValue="data">
          <Tabs.List variant="underlined">
            <Tabs.Trigger value="data">Developer Data</Tabs.Trigger>
            <Tabs.Trigger value="mappings">Developer Mappings</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="data" className="flex flex-col gap-5 pt-5">
            {/* Section header */}
            <div className="flex items-start justify-between">
              <div>
                <Text as="h2" variant="heading-section" color="foreground-1">Developer Data Management</Text>
                <Text as="p" variant="body-normal" color="foreground-3" className="mt-0.5">
                  Read-only view of developer records sourced from HR systems via CSV uploads
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline">
                  <IconV2 name={'download' as never} size="sm" />
                  Download Developers CSV
                </Button>
                <Button>
                  + Upload CSV
                </Button>
              </div>
            </div>

            {/* Search bar */}
            <div className="flex items-center gap-3 rounded-lg border border-borders-2 px-4 py-3">
              <div className="flex items-center gap-2 text-foreground-3">
                <IconV2 name={'search' as never} size="sm" />
                <Text variant="body-strong" color="foreground-1">Search Developers</Text>
              </div>
              <Select
                options={searchFieldOptions.map((opt) => ({ label: opt.label, value: opt.value }))}
                value={searchField}
                onChange={(v) => setSearchField(v as SearchField)}
              />
              <div className="flex-1">
                <SearchInput
                  placeholder="Type full name here..."
                  searchValue={search}
                  onChange={(value) => {
                    setSearch(value)
                    setCurrentPage(1)
                  }}
                />
              </div>
            </div>

            {/* Table */}
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Full Name</Table.Head>
                  <Table.Head>Email</Table.Head>
                  <Table.Head>Team</Table.Head>
                  <Table.Head>Manager Email</Table.Head>
                  <Table.Head>Job-Family</Table.Head>
                  <Table.Head>Job-Function</Table.Head>
                  <Table.Head>Site</Table.Head>
                  <Table.Head>Status</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {pagedData.map((row, idx) => (
                  <Table.Row key={idx}>
                    <Table.Cell>
                      <Text variant="body-normal" color="foreground-1">{row.fullName}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text variant="body-normal" color="foreground-3">{row.email}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text variant="body-normal" color="foreground-3">{row.team}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text variant="body-normal" color="foreground-3" truncate>{row.managerEmail}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text variant="body-normal" color="foreground-3">{row.jobFamily}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text variant="body-normal" color="foreground-3">{row.jobFunction}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text variant="body-normal" color="foreground-3">{row.site}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text variant="body-normal" color="foreground-3">{row.status}</Text>
                    </Table.Cell>
                  </Table.Row>
                ))}
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
          </Tabs.Content>

          <Tabs.Content value="mappings" className="pt-5">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Field Name</Table.Head>
                  <Table.Head>Mapped Column</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {mappingsData.map((row) => (
                  <Table.Row key={row.fieldName}>
                    <Table.Cell>
                      <Text variant="body-normal" color="foreground-1">{row.fieldName}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text variant="body-normal" color="foreground-1">{row.mappedColumn}</Text>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </Nav2>
  )
}
