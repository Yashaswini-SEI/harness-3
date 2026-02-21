import { useState, useEffect } from 'react'
import {
  Text,
  Button,
  IconV2,
  Tabs,
  TextInput,
  Textarea,
} from '@harnessio/ui/components'
import { Nav2 } from '../components/Nav2'
import { Breadcrumb2 } from '../components/Breadcrumb2'

const profileTabs = ['Overview', 'DORA', 'Sprints']

const maturityLevels = [
  { label: 'Elite', color: '#42AB45' },
  { label: 'High', color: '#F5A623' },
  { label: 'Medium', color: '#F07F4B' },
  { label: 'Low', color: '#E8575A' },
]

export function EfficiencyProfilePage() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )
  const [activeTab, setActiveTab] = useState('Overview')
  const [profileName, setProfileName] = useState('With FF')
  const [description, setDescription] = useState('')
  const [maturityValues, setMaturityValues] = useState<Record<string, string>>({
    Elite: 'Elite',
    High: 'High',
    Medium: 'Medium',
    Low: 'Low',
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light-std-low', 'dark-std-low')
    root.classList.add(dark ? 'dark-std-low' : 'light-std-low')
  }, [dark])

  return (
    <div className="flex min-h-screen bg-cn-3">
      <Nav2 activeSection="org-tree" dark={dark} onThemeToggle={() => setDark(!dark)} />

      <div className="flex flex-1 flex-col gap-5 px-5 pb-5 pt-3">
        <Breadcrumb2 />

        {/* Back link */}
        <a
          href="/module/sei/configuration/org-tree"
          className="flex items-center gap-1 text-sm"
          style={{ color: 'var(--cn-brand, #006DEA)' }}
        >
          <IconV2 name="nav-arrow-left" size="sm" />
          Org Trees
        </a>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Text as="p" variant="body-normal" color="foreground-3">Efficiency Profile</Text>
            <Text as="h1" variant="heading-hero" color="foreground-1">With FF</Text>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Cancel</Button>
            <Button size="sm">Save</Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs.Root defaultValue="Overview" value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            {profileTabs.map((tab) => (
              <Tabs.Trigger key={tab} value={tab}>{tab}</Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>

        {activeTab === 'Overview' && (
          <div className="max-w-md space-y-6">
            {/* Efficiency Profile Name */}
            <div className="flex flex-col gap-1.5">
              <Text variant="body-strong" color="foreground-1">Efficiency Profile Name</Text>
              <TextInput
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Text variant="body-strong" color="foreground-1">Description</Text>
                <Text variant="body-normal" color="foreground-4">(Optional)</Text>
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description"
                rows={4}
              />
            </div>

            {/* Maturity Levels */}
            <div className="flex flex-col gap-3">
              <Text variant="body-strong" color="foreground-1">Maturity level(s) of your organization</Text>
              {maturityLevels.map((level) => (
                <div
                  key={level.label}
                  className="flex items-center gap-2.5 rounded-lg border border-borders-2 bg-white px-3 py-2 dark:bg-cn-1"
                >
                  <div
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ backgroundColor: level.color, borderRadius: 2 }}
                  />
                  <input
                    className="flex-1 bg-transparent text-sm text-foreground-1 placeholder:text-foreground-4 outline-none"
                    value={maturityValues[level.label]}
                    placeholder="Enter a name for this level"
                    onChange={(e) =>
                      setMaturityValues((prev) => ({ ...prev, [level.label]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'DORA' && (
          <div className="rounded-lg border border-borders-2 bg-white p-6 dark:bg-cn-1">
            <Text variant="body-normal" color="foreground-3">
              DORA metrics configuration will appear here.
            </Text>
          </div>
        )}

        {activeTab === 'Sprints' && (
          <div className="rounded-lg border border-borders-2 bg-white p-6 dark:bg-cn-1">
            <Text variant="body-normal" color="foreground-3">
              Sprint metrics configuration will appear here.
            </Text>
          </div>
        )}
      </div>
    </div>
  )
}
