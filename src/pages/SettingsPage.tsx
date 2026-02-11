import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Card,
  Text,
  TextInput,
  Textarea,
  Switch,
  Select,
  Breadcrumb,
  Separator,
} from '@harnessio/ui/components'

const environmentOptions = [
  { label: 'Production', value: 'production' },
  { label: 'Staging', value: 'staging' },
  { label: 'Development', value: 'development' },
]

export function SettingsPage() {
  const [projectName, setProjectName] = useState('My Harness Project')
  const [description, setDescription] = useState('A production deployment pipeline for our main application.')
  const [environment, setEnvironment] = useState('production')
  const [notifications, setNotifications] = useState(true)
  const [autoRetry, setAutoRetry] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Breadcrumb */}
      <Breadcrumb.Root>
        <Breadcrumb.Item>
          <Breadcrumb.Link asChild>
            <Link to="/">Dashboard</Link>
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Page>Settings</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.Root>

      {/* Page Header */}
      <div>
        <Text variant="heading-section">Settings</Text>
        <Text variant="body-normal" color="foreground-3">
          Manage your project configuration and preferences.
        </Text>
      </div>

      {/* General Settings */}
      <Card.Root>
        <Card.Content>
          <div className="flex flex-col gap-5 p-5">
            <Text variant="heading-subsection">General</Text>

            <div className="flex flex-col gap-1.5">
              <Text variant="body-strong" as="label">Project Name</Text>
              <TextInput
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Text variant="body-strong" as="label">Description</Text>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Text variant="body-strong" as="label">Default Environment</Text>
              <Select
                options={environmentOptions}
                value={environment}
                onChange={(value) => setEnvironment(value)}
                placeholder="Select environment"
              />
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      {/* Notifications */}
      <Card.Root>
        <Card.Content>
          <div className="flex flex-col gap-5 p-5">
            <Text variant="heading-subsection">Notifications</Text>

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <Text variant="body-strong">Email Notifications</Text>
                <Text variant="caption-normal" color="foreground-3">
                  Receive email alerts for deployment events and pipeline failures.
                </Text>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <Text variant="body-strong">Auto-Retry Failed Pipelines</Text>
                <Text variant="caption-normal" color="foreground-3">
                  Automatically retry pipelines that fail due to transient errors.
                </Text>
              </div>
              <Switch
                checked={autoRetry}
                onCheckedChange={setAutoRetry}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <Text variant="body-strong">Dark Mode</Text>
                <Text variant="caption-normal" color="foreground-3">
                  Switch the application to dark theme.
                </Text>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      {/* Danger Zone */}
      <Card.Root>
        <Card.Content>
          <div className="flex flex-col gap-5 p-5">
            <Text variant="heading-subsection" color="danger">Danger Zone</Text>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <Text variant="body-strong">Delete Project</Text>
                <Text variant="caption-normal" color="foreground-3">
                  Permanently delete this project and all associated data. This action cannot be undone.
                </Text>
              </div>
              <Button variant="outline" theme="danger" size="sm">
                Delete Project
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  )
}
