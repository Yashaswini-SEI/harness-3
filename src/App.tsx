import { IconV2, Text } from '@harnessio/ui/components'
import { Link } from 'react-router-dom'

const pages = [
  { path: '/insights', icon: 'dashboard', title: 'Insights', description: 'Dashboard listing with search, filters, and create flow' },
  { path: '/canvas', icon: 'pin', title: 'Canvas', description: 'Drag-and-drop canvas workspace for visual composition' },
  { path: '/insights/custom/1', icon: 'bar-vertical', title: 'Custom Insight', description: 'Single insight view with widget chart and time range controls' },
  { path: '/insights/custom/1/widget-builder', icon: 'settings', title: 'Widget Builder', description: 'Query builder with 7 chart types, datasource selection, and criteria config' },
  { path: '/insights/harness/business-alignment', icon: 'bar-vertical', title: 'Business Alignment', description: 'Work categorization with stacked bar chart and drilldown table' },
  { path: '/insights/harness/efficiency-dora', icon: 'clock', title: 'DORA Metrics', description: 'Lead time, deployment frequency, change failure rate, and MTTR' },
  { path: '/insights/harness/efficiency-sprint-metrics', icon: 'flag', title: 'Sprint Metrics', description: '15 sprint metric cards with grouped bar chart and drilldown' },
  { path: '/insights/harness/productivity', icon: 'code-branch', title: 'Productivity', description: 'PR velocity, cycle time, work completed, coding days, and code rework' },
  { path: '/insights/harness/ai-insights', icon: 'sparkle', title: 'AI Insights', description: 'AI-powered engineering insights and recommendations' },
]

const galleries = [
  { path: '/gallery', icon: 'grip-dots', title: 'Component Gallery', description: 'All reusable components, charts, primitives, and design tokens' },
  { path: '/tables', icon: 'grip-dots', title: 'Tables', description: 'Data tables with sorting, pagination, and row actions' },
]

function DirectoryCard({ path, icon, title, description }: { path: string; icon: string; title: string; description: string }) {
  return (
    <Link to={path} className="rounded-cn-2 border border-subtle bg-surface-1 p-4 hover:border-borders-3 transition-colors no-underline">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cn-2">
          <IconV2 name={icon as never} size="sm" className="text-foreground-2" />
        </div>
        <div>
          <Text variant="body-strong" color="foreground-1">{title}</Text>
          <Text variant="caption-normal" color="foreground-3">{description}</Text>
        </div>
      </div>
    </Link>
  )
}

function App() {
  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <Text as="h1" variant="heading-hero" color="foreground-1">Harness Prototypes</Text>
        <Text as="p" variant="body-normal" color="foreground-2">
          Harness Design System 3.0 — screens, flows, and composed components
        </Text>
      </header>

      <section className="space-y-3">
        <Text as="h2" variant="heading-subsection" color="foreground-1">Pages &amp; Flows</Text>
        <div className="grid grid-cols-2 gap-3">
          {pages.map((p) => <DirectoryCard key={p.path} {...p} />)}
        </div>
      </section>

      <section className="space-y-3">
        <Text as="h2" variant="heading-subsection" color="foreground-1">Component Galleries</Text>
        <div className="grid grid-cols-2 gap-3">
          {galleries.map((g) => <DirectoryCard key={g.path} {...g} />)}
        </div>
      </section>
    </div>
  )
}

export default App
