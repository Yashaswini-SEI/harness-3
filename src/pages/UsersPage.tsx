import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Text,
  StatusBadge,
  IconV2,
  Table,
  Breadcrumb,
  SearchInput,
} from '@harnessio/ui/components'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'pending'
  lastActive: string
}

const mockUsers: User[] = [
  { id: 1, name: 'Sarah Chen', email: 'sarah.chen@example.com', role: 'Admin', status: 'active', lastActive: '2 min ago' },
  { id: 2, name: 'James Wilson', email: 'james.wilson@example.com', role: 'Developer', status: 'active', lastActive: '5 min ago' },
  { id: 3, name: 'Maria Garcia', email: 'maria.garcia@example.com', role: 'Developer', status: 'active', lastActive: '1 hour ago' },
  { id: 4, name: 'Alex Thompson', email: 'alex.t@example.com', role: 'Viewer', status: 'inactive', lastActive: '3 days ago' },
  { id: 5, name: 'David Park', email: 'david.park@example.com', role: 'Developer', status: 'active', lastActive: '30 min ago' },
  { id: 6, name: 'Emily Roberts', email: 'emily.r@example.com', role: 'Admin', status: 'active', lastActive: '15 min ago' },
  { id: 7, name: 'Michael Brown', email: 'michael.b@example.com', role: 'Viewer', status: 'pending', lastActive: 'Never' },
  { id: 8, name: 'Lisa Wang', email: 'lisa.wang@example.com', role: 'Developer', status: 'active', lastActive: '45 min ago' },
  { id: 9, name: 'Robert Kim', email: 'robert.kim@example.com', role: 'Developer', status: 'inactive', lastActive: '1 week ago' },
  { id: 10, name: 'Amanda Foster', email: 'amanda.f@example.com', role: 'Viewer', status: 'pending', lastActive: 'Never' },
]

const statusThemeMap: Record<User['status'], 'success' | 'muted' | 'warning'> = {
  active: 'success',
  inactive: 'muted',
  pending: 'warning',
}

export function UsersPage() {
  const [search, setSearch] = useState('')

  const filteredUsers = useMemo(() => {
    if (!search) return mockUsers
    const lower = search.toLowerCase()
    return mockUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower) ||
        u.role.toLowerCase().includes(lower)
    )
  }, [search])

  return (
    <div className="flex flex-col gap-cn-6">
      {/* Breadcrumb */}
      <Breadcrumb.Root>
        <Breadcrumb.Item>
          <Breadcrumb.Link asChild>
            <Link to="/">Dashboard</Link>
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Page>Users</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.Root>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Text variant="heading-section">Users</Text>
          <Text variant="body-normal" color="foreground-3">
            Manage team members and their roles.
          </Text>
        </div>
        <Button>
          <IconV2 name="user" size="sm" />
          Add User
        </Button>
      </div>

      {/* Search & Count */}
      <div className="flex items-center gap-cn-3">
        <div className="w-80">
          <SearchInput
            placeholder="Search users..."
            searchValue={search}
            onChange={(value) => setSearch(value)}
          />
        </div>
        <Text variant="caption-normal" color="foreground-3">
          {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
        </Text>
      </div>

      {/* Users Table */}
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>Name</Table.Head>
            <Table.Head>Email</Table.Head>
            <Table.Head>Role</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Last Active</Table.Head>
            <Table.Head className="w-12" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {filteredUsers.map((user) => (
            <Table.Row key={user.id}>
              <Table.Cell>
                <Text variant="body-strong">{user.name}</Text>
              </Table.Cell>
              <Table.Cell>
                <Text variant="body-normal" color="foreground-3">{user.email}</Text>
              </Table.Cell>
              <Table.Cell>
                <StatusBadge variant="outline" theme="muted" size="sm">
                  {user.role}
                </StatusBadge>
              </Table.Cell>
              <Table.Cell>
                <StatusBadge variant="status" theme={statusThemeMap[user.status]} size="sm">
                  {user.status}
                </StatusBadge>
              </Table.Cell>
              <Table.Cell>
                <Text variant="caption-normal" color="foreground-3">{user.lastActive}</Text>
              </Table.Cell>
              <Table.Cell>
                <Button variant="ghost" size="xs">
                  <IconV2 name="edit-pencil" size="sm" />
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
          {filteredUsers.length === 0 && (
            <Table.Row>
              <Table.Cell colSpan={6}>
                <div className="flex flex-col items-center justify-center py-12 gap-cn-2">
                  <IconV2 name="area-search" size="xl" />
                  <Text variant="body-normal" color="foreground-3">No users found matching your search.</Text>
                </div>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </div>
  )
}
