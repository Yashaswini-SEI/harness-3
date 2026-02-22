import { useState, useEffect } from 'react'
import {
  Text,
  Button,
  IconV2,
  StatusBadge,
  Tag,
  Tabs,
} from '@harnessio/ui/components'
import { useSearchParams, useParams, useNavigate, useLocation } from 'react-router-dom'
import { BarChart2 } from '../components/Charts'
import { Nav2 } from '../components/Nav2'
import imgEmptyState from '../assets/img-empty-state.svg'

const widgetChartData = [
  { name: 'FME', value: 9_200_000 },
  { name: 'CDE', value: 4_800_000 },
  { name: 'ENGTAI', value: 3_500_000 },
  { name: 'BT', value: 3_200_000 },
  { name: 'DEVOPS', value: 2_800_000 },
  { name: 'ASP', value: 2_100_000 },
  { name: 'FLAM', value: 1_800_000 },
  { name: 'EXP', value: 1_400_000 },
  { name: 'COE', value: 1_100_000 },
  { name: 'DS', value: 600_000 },
]

export function CustomInsightPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const insightName = searchParams.get('name') || 'Process Efficiency'
  const insightDesc = searchParams.get('desc') || ''
  const insightTagsParam = searchParams.get('tags') || ''
  const tags = insightTagsParam ? insightTagsParam.split(',') : []
  const [hasWidget, setHasWidget] = useState(false)
  const [showToast, setShowToast] = useState(true)
  const [timeRange, setTimeRange] = useState('7D')

  useEffect(() => {
    const state = location.state as { widgetAdded?: boolean } | null
    if (state?.widgetAdded) {
      setHasWidget(true)
      setShowToast(true)
    }
  }, [location.state])

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  return (


    <Nav2 activeSection="canvas">

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-5 px-5 pb-5 pt-6">

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
                <IconV2 name="more-horizontal" size="sm" />
              </Button>
              <Button variant="outline" size="sm" disabled={!hasWidget} onClick={() => navigate('/module/sei/insights')}>Cancel</Button>
              <Button size="sm" disabled={!hasWidget} onClick={() => navigate('/module/sei/insights', { state: { insightSaved: true, insightName } })}>Save</Button>
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

        </div>

        {/* Content area */}
        <div className="flex flex-1 flex-col overflow-hidden border-t border-borders-2 bg-white dark:bg-cn-0">
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
            <Button variant="outline" size="sm" onClick={() => navigate(`/module/sei/insights/custom/${id}/widget-builder`)}>
              <IconV2 name="plus" size="sm" />
              New Widget
            </Button>
          </div>

          {hasWidget ? (
            <div className="flex-1 p-5">
              <div className="rounded-lg border border-borders-2 bg-white p-5 dark:bg-cn-1">
                <div className="mb-4 flex flex-col gap-1">
                  <Text variant="body-strong" color="foreground-1">Issues by project</Text>
                  <Text variant="body-normal" color="foreground-3">Widget represents issues by projects</Text>
                </div>
                <BarChart2 data={widgetChartData} height={320} seriesName="Issue Key Count" />
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-20">
              <img src={imgEmptyState} alt="No widgets" />
              <Text variant="body-normal" color="foreground-3">Add widgets to your Insight</Text>
              <Button variant="outline" size="sm" onClick={() => navigate(`/module/sei/insights/custom/${id}/widget-builder`)}>
                <IconV2 name="plus" size="sm" />
                New Widget
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-borders-2 bg-cn-0 px-4 py-3.5 shadow-md">
          <IconV2 name="check-circle-solid" size="sm" className="text-icons-success" />
          <Text variant="body-normal" color="foreground-1">
            {hasWidget ? 'Widget added successfully.' : 'Dashboard generated successfully.'}
          </Text>
        </div>
      )}
    </Nav2>
  )
}
