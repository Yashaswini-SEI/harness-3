import { useState } from 'react'
import {
  Text,
  Button,
  IconV2,
  Tabs,
  TextInput,
  Textarea,
  Select,
  Switch,
} from '@harnessio/ui/components'
import { Nav2 } from '../components/Nav2'

const profileTabs = ['Overview', 'DORA', 'Sprints']

const maturityLevels = [
  { label: 'Elite', color: '#42AB45' },
  { label: 'High', color: '#F5A623' },
  { label: 'Medium', color: '#F07F4B' },
  { label: 'Low', color: '#E8575A' },
]

const doraMetrics = [
  'Lead time for changes',
  'Deployment frequency',
  'Change failure rate',
  'Mean time to restore',
]

interface WorkflowStage {
  name: string
  description: string
  enabled: boolean
  startEventLabel: string
  startEventValue: string
  startEventOptions: { label: string; value: string }[]
  startStatusLabel: string
  startStatusValue: string
  startStatusOptions: { label: string; value: string }[]
  endEventLabel: string
  endEventValue: string
  endEventOptions: { label: string; value: string }[]
  endStatusLabel: string
  endStatusValue: string
  endStatusOptions: { label: string; value: string }[]
}

const defaultStages: WorkflowStage[] = [
  {
    name: 'Planning',
    description: 'Lead Time for Changes as per DORA metrics is defined as the amount of time it takes a task to get into production.',
    enabled: true,
    startEventLabel: 'Start event source',
    startEventValue: 'issues-mgmt',
    startEventOptions: [{ label: 'Issues management', value: 'issues-mgmt' }, { label: 'Source code management', value: 'scm' }],
    startStatusLabel: 'Start event status category',
    startStatusValue: 'todo',
    startStatusOptions: [{ label: 'To Do / Proposed', value: 'todo' }, { label: 'In Progress', value: 'in-progress' }],
    endEventLabel: 'End event source',
    endEventValue: 'issues-mgmt',
    endEventOptions: [{ label: 'Issue management', value: 'issues-mgmt' }, { label: 'Source code management', value: 'scm' }],
    endStatusLabel: 'End event status category',
    endStatusValue: 'done',
    endStatusOptions: [{ label: 'Done / Completed & Resolved', value: 'done' }, { label: 'In Progress', value: 'in-progress' }],
  },
  {
    name: 'Coding',
    description: 'Measure time spent coding.',
    enabled: true,
    startEventLabel: 'Start event type',
    startEventValue: 'issues-mgmt',
    startEventOptions: [{ label: 'Issues management', value: 'issues-mgmt' }, { label: 'Source code management', value: 'scm' }],
    startStatusLabel: 'Start event status category',
    startStatusValue: 'done',
    startStatusOptions: [{ label: 'Done / Completed & Resolved', value: 'done' }, { label: 'In Progress', value: 'in-progress' }],
    endEventLabel: 'End event source',
    endEventValue: 'issues-mgmt',
    endEventOptions: [{ label: 'Issue management', value: 'issues-mgmt' }, { label: 'Source code management', value: 'scm' }],
    endStatusLabel: 'End event',
    endStatusValue: 'done',
    endStatusOptions: [{ label: 'Done / Completed & Resolved', value: 'done' }, { label: 'In Progress', value: 'in-progress' }],
  },
  {
    name: 'Review',
    description: 'Measure time spent in code review.',
    enabled: true,
    startEventLabel: 'Start event type',
    startEventValue: 'scm',
    startEventOptions: [{ label: 'Source code management', value: 'scm' }, { label: 'Issues management', value: 'issues-mgmt' }],
    startStatusLabel: 'Start event',
    startStatusValue: 'last-pr-created',
    startStatusOptions: [{ label: 'Last PR created', value: 'last-pr-created' }, { label: 'First PR created', value: 'first-pr-created' }],
    endEventLabel: 'End event source',
    endEventValue: 'scm',
    endEventOptions: [{ label: 'Source code management', value: 'scm' }, { label: 'Issues management', value: 'issues-mgmt' }],
    endStatusLabel: 'End event',
    endStatusValue: 'last-pr-approval',
    endStatusOptions: [{ label: 'Last PR approval', value: 'last-pr-approval' }, { label: 'Last PR merged', value: 'last-pr-merged' }],
  },
  {
    name: 'Build',
    description: 'Measure time spent in build process.',
    enabled: true,
    startEventLabel: 'Start event type',
    startEventValue: 'scm',
    startEventOptions: [{ label: 'Source code management', value: 'scm' }, { label: 'Issues management', value: 'issues-mgmt' }],
    startStatusLabel: 'Start event',
    startStatusValue: 'done',
    startStatusOptions: [{ label: 'Done / Completed & Resolved', value: 'done' }, { label: 'In Progress', value: 'in-progress' }],
    endEventLabel: 'End event source',
    endEventValue: 'issues-mgmt',
    endEventOptions: [{ label: 'Issue management', value: 'issues-mgmt' }, { label: 'Source code management', value: 'scm' }],
    endStatusLabel: 'End event',
    endStatusValue: 'done',
    endStatusOptions: [{ label: 'Done / Completed & Resolved', value: 'done' }, { label: 'In Progress', value: 'in-progress' }],
  },
  {
    name: 'Deploy',
    description: 'Measure time spent in deployment.',
    enabled: true,
    startEventLabel: 'Start event type',
    startEventValue: 'ci',
    startEventOptions: [{ label: 'Continuous Integration', value: 'ci' }, { label: 'Source code management', value: 'scm' }],
    startStatusLabel: 'Start event status category',
    startStatusValue: 'last-ci',
    startStatusOptions: [{ label: 'Time for last CI execution', value: 'last-ci' }, { label: 'Time for first CI execution', value: 'first-ci' }],
    endEventLabel: 'End event source',
    endEventValue: 'cd',
    endEventOptions: [{ label: 'Continuous deployment', value: 'cd' }, { label: 'Continuous Integration', value: 'ci' }],
    endStatusLabel: 'End event',
    endStatusValue: 'last-cd',
    endStatusOptions: [{ label: 'Time for last CD execution', value: 'last-cd' }, { label: 'Time for first CD execution', value: 'first-cd' }],
  },
]


export function EfficiencyProfilePage() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [activeDoraMetric, setActiveDoraMetric] = useState(doraMetrics[0])
  const [stages, setStages] = useState(defaultStages)
  const [advancedOpen, setAdvancedOpen] = useState(true)
  const [leadTimeCalc, setLeadTimeCalc] = useState('all')
  const [workflowSetting, setWorkflowSetting] = useState('exceptions')
  const [profileName, setProfileName] = useState('With FF')
  const [description, setDescription] = useState('')
  const [maturityValues, setMaturityValues] = useState<Record<string, string>>({
    Elite: 'Elite',
    High: 'High',
    Medium: 'Medium',
    Low: 'Low',
  })

  return (


    <Nav2 activeSection="org-tree">

      <div className="flex flex-1 flex-col gap-5 bg-cn-2 px-5 pb-5 pt-6">

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
          <div className="flex gap-6">
            {/* Left sidebar nav */}
            <div className="w-48 shrink-0 space-y-0.5">
              {doraMetrics.map((metric) => (
                <button
                  key={metric}
                  className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors"
                  style={{
                    backgroundColor: activeDoraMetric === metric ? 'rgba(0, 109, 234, 0.08)' : 'transparent',
                    color: activeDoraMetric === metric ? 'var(--cn-brand, #006DEA)' : undefined,
                    borderLeft: activeDoraMetric === metric ? '2px solid var(--cn-brand, #006DEA)' : '2px solid transparent',
                  }}
                  onClick={() => setActiveDoraMetric(metric)}
                >
                  {metric}
                </button>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 space-y-6">
              {/* Header */}
              <div className="overflow-hidden rounded-cn-2 border border-borders-2" style={{ backgroundColor: '#fff' }}>
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <Switch checked onCheckedChange={() => {}} />
                    <Text variant="heading-subsection" color="foreground-1">Lead time for changes</Text>
                  </div>
                  <Text variant="body-normal" color="foreground-3" className="mt-2">
                    Lead Time for Changes as per DORA metrics is defined as the amount of time it takes a task to get into production.
                  </Text>
                </div>
                <div className="flex justify-end border-t border-borders-2 px-5 py-3" style={{ backgroundColor: '#FAFAFA' }}>
                  <Button size="sm">Save</Button>
                </div>
              </div>

              {/* Configure workflow stages */}
              <Text variant="body-strong" color="foreground-1">Configure workflow stages</Text>

              {stages.map((stage, idx) => (
                <div key={stage.name} className="overflow-hidden rounded-cn-2 border border-borders-2" style={{ backgroundColor: '#fff' }}>
                  <div className="p-5 space-y-4">
                  {/* Stage header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Text variant="heading-subsection" color="foreground-1">{stage.name}</Text>
                      <IconV2 name="edit" size="xs" className="text-foreground-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={stage.enabled}
                        onCheckedChange={() => {
                          const next = [...stages]
                          next[idx] = { ...stage, enabled: !stage.enabled }
                          setStages(next)
                        }}
                      />
                      <Text variant="body-normal" color="foreground-1">Enabled</Text>
                    </div>
                  </div>

                  {/* Stage description */}
                  <Text variant="body-normal" color="foreground-3">{stage.description}</Text>

                  {/* Dropdowns row 1 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Text variant="caption-normal" color="foreground-3">{stage.startEventLabel}</Text>
                      <Select
                        value={stage.startEventValue}
                        options={stage.startEventOptions}
                        onChange={(val) => {
                          const next = [...stages]
                          next[idx] = { ...stage, startEventValue: val }
                          setStages(next)
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Text variant="caption-normal" color="foreground-3">{stage.startStatusLabel}</Text>
                      <Select
                        value={stage.startStatusValue}
                        options={stage.startStatusOptions}
                        onChange={(val) => {
                          const next = [...stages]
                          next[idx] = { ...stage, startStatusValue: val }
                          setStages(next)
                        }}
                      />
                    </div>
                  </div>

                  {/* Dropdowns row 2 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Text variant="caption-normal" color="foreground-3">{stage.endEventLabel}</Text>
                      <Select
                        value={stage.endEventValue}
                        options={stage.endEventOptions}
                        onChange={(val) => {
                          const next = [...stages]
                          next[idx] = { ...stage, endEventValue: val }
                          setStages(next)
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Text variant="caption-normal" color="foreground-3">{stage.endStatusLabel}</Text>
                      <Select
                        value={stage.endStatusValue}
                        options={stage.endStatusOptions}
                        onChange={(val) => {
                          const next = [...stages]
                          next[idx] = { ...stage, endStatusValue: val }
                          setStages(next)
                        }}
                      />
                    </div>
                  </div>
                  </div>
                  <div className="flex justify-end border-t border-borders-2 px-5 py-3" style={{ backgroundColor: '#FAFAFA' }}>
                    <Button size="sm">Save</Button>
                  </div>
                </div>
              ))}

              {/* Advanced section */}
              <div className="overflow-hidden rounded-cn-2 border border-borders-2" style={{ backgroundColor: '#fff' }}>
                <div className="p-5 space-y-4">
                <button
                  className="flex w-full items-center justify-between"
                  onClick={() => setAdvancedOpen(!advancedOpen)}
                >
                  <div className="flex items-center gap-2">
                    <Text variant="heading-subsection" color="foreground-1">Advanced</Text>
                    <IconV2 name="edit" size="xs" className="text-foreground-4" />
                  </div>
                  <IconV2
                    name={advancedOpen ? 'nav-arrow-up' : 'nav-arrow-down'}
                    size="sm"
                    className="text-foreground-3"
                  />
                </button>

                {advancedOpen && (
                  <div className="space-y-6">
                    {/* Work to calculate lead time */}
                    <div className="space-y-3">
                      <Text variant="body-strong" color="foreground-1">Work to calculate lead time</Text>
                      <Text variant="body-normal" color="foreground-3">
                        This is applicable only when the last stage is CD.
                      </Text>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="leadTimeCalc"
                          checked={leadTimeCalc === 'all'}
                          onChange={() => setLeadTimeCalc('all')}
                          className="mt-1 accent-[#006DEA]"
                        />
                        <div>
                          <Text variant="body-strong" color="foreground-1">All completed work</Text>
                          <Text variant="body-normal" color="foreground-3" className="mt-0.5">
                            Measures lead time for all work completed within the selected time range regardless of whether it was deployed.
                          </Text>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="leadTimeCalc"
                          checked={leadTimeCalc === 'deployed'}
                          onChange={() => setLeadTimeCalc('deployed')}
                          className="mt-1 accent-[#006DEA]"
                        />
                        <div>
                          <Text variant="body-strong" color="foreground-1">Only deployed work</Text>
                          <Text variant="body-normal" color="foreground-3" className="mt-0.5">
                            Measures lead time only for work that has been successfully deployed.
                          </Text>
                        </div>
                      </label>
                    </div>

                    {/* Workflow settings */}
                    <div className="space-y-3">
                      <Text variant="body-strong" color="foreground-1">Workflow settings</Text>
                      <Text variant="body-normal" color="foreground-3">
                        Use this setting to decide how SEI interprets your workflow for lead time calculation.
                      </Text>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="workflowSetting"
                          checked={workflowSetting === 'enforce'}
                          onChange={() => setWorkflowSetting('enforce')}
                          className="mt-1 accent-[#006DEA]"
                        />
                        <div>
                          <Text variant="body-strong" color="foreground-1">Enforce workflow order</Text>
                          <Text variant="body-normal" color="foreground-3" className="mt-0.5">
                            SEI calculates lead time by considering only events that follow the defined phase sequence. Recommended for accurate lead time tracking.
                          </Text>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="workflowSetting"
                          checked={workflowSetting === 'exceptions'}
                          onChange={() => setWorkflowSetting('exceptions')}
                          className="mt-1 accent-[#006DEA]"
                        />
                        <div>
                          <Text variant="body-strong" color="foreground-1">Allow workflow exceptions</Text>
                          <Text variant="body-normal" color="foreground-3" className="mt-0.5">
                            SEI includes all work, even if some events occur outside the defined sequence. Recommended for tracking anomalies in your software delivery process.
                          </Text>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
                </div>
                <div className="flex justify-end border-t border-borders-2 px-5 py-3" style={{ backgroundColor: '#FAFAFA' }}>
                  <Button size="sm">Save</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Sprints' && (
          <div className="rounded-cn-2 border border-borders-2 p-6" style={{ backgroundColor: '#fff' }}>
            <Text variant="body-normal" color="foreground-3">
              Sprint metrics configuration will appear here.
            </Text>
          </div>
        )}
      </div>
    </Nav2>
  )
}
