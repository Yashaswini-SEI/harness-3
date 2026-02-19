import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Text } from '@harnessio/ui/components'
import { Nav2 } from '../components/Nav2'
import { Breadcrumb2 } from '../components/Breadcrumb2'

const REPORT_META: Record<string, { title: string; description: string }> = {
  'ai-insights': {
    title: 'AI Insights',
    description: 'AI coding assistant adoption and impact insights for your teams.',
  },
  dora: {
    title: 'DORA',
    description: 'DORA metrics measure software delivery performance.',
  },
  'sprint-metrics': {
    title: 'Sprint Metrics',
    description: 'Shows planning effectiveness, delivery consistency, and team predictability.',
  },
  velocity: {
    title: 'Velocity',
    description: 'Tracks delivery speed and throughput across the development cycle.',
  },
  quality: {
    title: 'Quality',
    description: 'Monitors defects, test results, and code health.',
  },
  collaboration: {
    title: 'Collaboration',
    description: 'Measures teamwork through code reviews, contributions, and communication patterns.',
  },
}

export function HarnessReportPage() {
  const { slug } = useParams()
  const report = slug ? REPORT_META[slug] : undefined

  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light-std-low', 'dark-std-low')
    root.classList.add(dark ? 'dark-std-low' : 'light-std-low')
  }, [dark])

  return (
    <div className="flex min-h-screen bg-cn-3">
      <Nav2 activeSection="insights" dark={dark} onThemeToggle={() => setDark(!dark)} />

      <div className="flex flex-1 flex-col gap-5 px-5 pb-5 pt-3">
        <Breadcrumb2 />

        <div className="flex flex-col gap-1">
          <Text as="h1" variant="heading-hero" color="foreground-1">
            {report?.title ?? 'Report Not Found'}
          </Text>
          {report && (
            <Text variant="body-normal" color="foreground-3">{report.description}</Text>
          )}
        </div>

        <div className="flex flex-1 items-center justify-center rounded-lg border border-borders-2 bg-white dark:bg-cn-0">
          <Text variant="body-normal" color="foreground-4">Report content coming soon</Text>
        </div>
      </div>
    </div>
  )
}
