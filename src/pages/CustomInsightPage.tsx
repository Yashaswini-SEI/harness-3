import { useState, useEffect } from 'react'
import {
  Text,
  Button,
  IconV2,
  StatusBadge,
  Tag,
  Tabs,
} from '@harnessio/ui/components'
import { useSearchParams } from 'react-router-dom'
import { Nav2 } from '../components/Nav2'
import { Breadcrumb2 } from '../components/Breadcrumb2'
import canvasIcon from '../assets/icon-canvas.svg'

export function CustomInsightPage() {
  const [searchParams] = useSearchParams()
  const insightName = searchParams.get('name') || 'Process Efficiency'
  const insightDesc = searchParams.get('desc') || ''
  const insightTagsParam = searchParams.get('tags') || ''
  const tags = insightTagsParam ? insightTagsParam.split(',') : []

  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )
  const [showToast, setShowToast] = useState(true)
  const [timeRange, setTimeRange] = useState('7D')

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light-std-low', 'dark-std-low')
    root.classList.add(dark ? 'dark-std-low' : 'light-std-low')
  }, [dark])

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  return (
    <div className="flex min-h-screen bg-cn-3">
      <Nav2 activeSection="canvas" dark={dark} onThemeToggle={() => setDark(!dark)} />

      <div className="flex flex-1 flex-col gap-5 p-8">
        {/* Breadcrumb */}
        <Breadcrumb2
          items={[
            { label: 'Account: Harness.io', href: '#' },
            { label: 'Organization: Harness Analytics', href: '#' },
            { label: 'Project: Split FME Analytics' },
          ]}
        />

        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <Text as="h1" variant="heading-hero" color="foreground-1">{insightName}</Text>
            {insightDesc && (
              <Text variant="body-normal" color="foreground-3">{insightDesc}</Text>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
              <IconV2 name="more-dots-fill" size="sm" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.history.back()}>Cancel</Button>
            <Button size="sm">Save</Button>
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-10">
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Status</Text>
            <StatusBadge variant="outline" theme="info" size="sm">Draft</StatusBadge>
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Created:</Text>
            <Text variant="body-normal" color="foreground-1">
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })},{' '}
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
            </Text>
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Updated:</Text>
            <Text variant="body-normal" color="foreground-1">&ndash;</Text>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-col gap-1">
              <Text variant="body-normal" color="foreground-3">Tags</Text>
              <div className="flex gap-1">
                {tags.map((tag) => (
                  <Tag key={tag} variant="outline" theme="gray" size="sm" value={tag} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-borders-2 bg-cn-0">
          {/* Controls bar */}
          <div className="flex items-center justify-between px-5 py-3">
            <Tabs.Root value={timeRange} onValueChange={setTimeRange}>
              <Tabs.List variant="outlined">
                <Tabs.Trigger value="7D">7D</Tabs.Trigger>
                <Tabs.Trigger value="1M">1M</Tabs.Trigger>
                <Tabs.Trigger value="3M">3M</Tabs.Trigger>
                <Tabs.Trigger value="6M">6M</Tabs.Trigger>
                <Tabs.Trigger value="12M">12M</Tabs.Trigger>
                <Tabs.Trigger value="custom" icon="calendar">Custom</Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>
            <Button variant="outline" size="sm">
              <IconV2 name="plus" size="sm" />
              New Widget
            </Button>
          </div>

          {/* Empty state */}
          <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-borders-2">
              <img src={canvasIcon} alt="" className="h-6 w-6 opacity-40" />
            </div>
            <Text variant="body-normal" color="foreground-3">Add widgets to your Insight</Text>
            <Button variant="outline" size="sm">
              <IconV2 name="plus" size="sm" />
              New Widget
            </Button>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-borders-2 bg-cn-0 px-4 py-3.5 shadow-md">
          <IconV2 name="success" size="sm" className="text-icons-success" />
          <Text variant="body-normal" color="foreground-1">Dashboard generated successfully.</Text>
        </div>
      )}
    </div>
  )
}
