import { Card, Text, StatusBadge, IconV2, Button } from '@harnessio/ui/components'
import type { IconV2NamesType } from '@harnessio/ui/components'

interface StatCardProps {
  title: string
  value: string
  change: string
  changeType: 'success' | 'danger' | 'warning'
  icon: IconV2NamesType
}

function StatCard({ title, value, change, changeType, icon }: StatCardProps) {
  return (
    <Card.Root>
      <Card.Content>
        <div className="flex items-start justify-between p-4">
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">{title}</Text>
            <Text variant="heading-section">{value}</Text>
            <StatusBadge variant="outline" theme={changeType} size="sm">
              {change}
            </StatusBadge>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
            <IconV2 name={icon} size="md" />
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  )
}

interface ActivityItem {
  id: number
  user: string
  action: string
  target: string
  time: string
  status: 'success' | 'info' | 'warning' | 'danger'
}

const recentActivity: ActivityItem[] = [
  { id: 1, user: 'Sarah Chen', action: 'deployed', target: 'frontend-app v2.4.1', time: '2 minutes ago', status: 'success' },
  { id: 2, user: 'James Wilson', action: 'created', target: 'Pipeline: nightly-build', time: '15 minutes ago', status: 'info' },
  { id: 3, user: 'Maria Garcia', action: 'updated', target: 'Service: auth-service', time: '1 hour ago', status: 'info' },
  { id: 4, user: 'Alex Thompson', action: 'flagged', target: 'Security scan: CVE-2026-1234', time: '2 hours ago', status: 'warning' },
  { id: 5, user: 'David Park', action: 'rolled back', target: 'backend-api v3.1.0', time: '3 hours ago', status: 'danger' },
  { id: 6, user: 'Emily Roberts', action: 'approved', target: 'PR #847: Add caching layer', time: '4 hours ago', status: 'success' },
]

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Text variant="heading-section">Dashboard</Text>
          <Text variant="body-normal" color="foreground-3">
            Overview of your project metrics and recent activity.
          </Text>
        </div>
        <Button>
          <IconV2 name="download" size="sm" />
          Export Report
        </Button>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value="2,847"
          change="+12.5% from last month"
          changeType="success"
          icon="user"
        />
        <StatCard
          title="Active Pipelines"
          value="184"
          change="+4.3% from last week"
          changeType="success"
          icon="executions"
        />
        <StatCard
          title="Deployments"
          value="1,293"
          change="-2.1% from last month"
          changeType="danger"
          icon="deploy"
        />
        <StatCard
          title="Open Issues"
          value="47"
          change="+8 new this week"
          changeType="warning"
          icon="bubble-warning"
        />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card.Root>
            <Card.Content>
              <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                  <Text variant="heading-subsection">Recent Activity</Text>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
                <div className="flex flex-col divide-y">
                  {recentActivity.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <StatusBadge variant="status" theme={item.status} size="sm" />
                        <div className="flex flex-col">
                          <Text variant="body-normal">
                            <Text variant="body-strong" as="span">{item.user}</Text>{' '}
                            {item.action}{' '}
                            <Text variant="body-strong" as="span">{item.target}</Text>
                          </Text>
                          <Text variant="caption-normal" color="foreground-3">{item.time}</Text>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card.Content>
          </Card.Root>
        </div>

        {/* Quick Actions */}
        <div>
          <Card.Root>
            <Card.Content>
              <div className="flex flex-col gap-4 p-4">
                <Text variant="heading-subsection">Quick Actions</Text>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start gap-2">
                    <IconV2 name="deploy" size="sm" />
                    New Deployment
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <IconV2 name="executions" size="sm" />
                    Create Pipeline
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <IconV2 name="user" size="sm" />
                    Invite Team Member
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <IconV2 name="settings" size="sm" />
                    Project Settings
                  </Button>
                </div>
              </div>
            </Card.Content>
          </Card.Root>
        </div>
      </div>
    </div>
  )
}
