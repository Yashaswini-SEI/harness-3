import { Button, IconV2, SearchInput, StatusBadge, Text, Checkbox } from '@harnessio/ui/components'
import { useState } from 'react'
import { SideNav } from '../components/SideNav'
import { Nav2, type Nav2Section } from '../components/Nav2'
import { Breadcrumb2 } from '../components/Breadcrumb2'
import { InsightMetricCard } from '../components/InsightMetricCard'
import { LineChart2, BarChart2, HorizontalBarChart, AreaChart2, ScatterChart2, DonutChart, StackedBarChart, MetricCard } from '../components/Charts'

export function ComponentGallery() {
  const [search, setSearch] = useState('')
  const [activeNav, setActiveNav] = useState('')
  const [nav2Active] = useState<Nav2Section>('insights')

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <Text as="h1" variant="heading-hero" color="foreground-1">Component Gallery</Text>
        <Text as="p" variant="body-normal" color="foreground-2">
          Reusable components and primitives from the Harness Design System
        </Text>
      </header>

      {/* ── InsightMetricCard ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">InsightMetricCard</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            Flexible metric card with label, value, subtitle, trend indicator, badge, tooltip, and no-data state.
          </Text>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <InsightMetricCard label="Lead Time" value="26d 1h" trend="↗ 1.45%" badge="Medium" />
          <InsightMetricCard label="Total Deployments" value="21" subtitle="(5.25/wk)" trend="↘ 43.24%" badge="Elite" />
          <InsightMetricCard label="Sprint Velocity" value="59.5" subtitle="pts" trend="↑ 4%" badge="Analysis" />
          <InsightMetricCard label="No Data Example" value="0" badge="Work" noData />
          <InsightMetricCard label="With Description" value="0.82" subtitle="ratio" trend="↑ 0.03pts" description="22 of 27 committed tickets" badge="Delivery" />
          <InsightMetricCard label="With Tooltip" value="147.62%" badge="Low" infoTooltip="This metric represents the percentage of deployments that cause a failure in production." />
        </div>
      </section>

      {/* ── SideNav Component ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">SideNav</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            Application sidebar navigation with pinned items, recent group, and expandable "More" drawer.
          </Text>
        </div>
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-6 overflow-visible" style={{ minHeight: 640 }}>
          <div className="flex gap-8">
            <div className="space-y-2">
              <Text variant="caption-strong" color="foreground-2">Default</Text>
              <div className="rounded-lg border border-subtle overflow-visible relative" style={{ minHeight: 600 }}>
                <SideNav onItemClick={(id) => setActiveNav(id)} />
              </div>
            </div>
          </div>
          {activeNav && (
            <Text as="p" variant="caption-normal" color="foreground-3" className="mt-4">
              Last clicked: <Text variant="caption-strong" color="foreground-1">{activeNav}</Text>
            </Text>
          )}
        </div>
      </section>

      {/* ── Nav 2.0 Component ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">Nav 2.0</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            Icon-only sidebar navigation used across application pages.
          </Text>
        </div>
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-6">
          <div className="flex gap-8">
            <div className="space-y-2">
              <Text variant="caption-strong" color="foreground-2">Default</Text>
              <div className="rounded-lg overflow-hidden" style={{ height: 600 }}>
                <Nav2 activeSection={nav2Active} />
              </div>
            </div>
          </div>
          <Text as="p" variant="caption-normal" color="foreground-3" className="mt-4">
            Active section: <Text variant="caption-strong" color="foreground-1">{nav2Active}</Text>
          </Text>
        </div>
      </section>

      {/* ── Breadcrumb 2.0 Component ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">Breadcrumb 2.0</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            Link-styled breadcrumb with arrow separators.
          </Text>
        </div>
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-6 space-y-6">
          <div className="space-y-2">
            <Text variant="caption-strong" color="foreground-2">All links</Text>
            <Breadcrumb2 items={[
              { label: 'Account: Harness.io', href: '#' },
              { label: 'Organization: Harness Analytics', href: '#' },
              { label: 'Project: Split FME Analytics', href: '#' },
            ]} />
          </div>
          <div className="space-y-2">
            <Text variant="caption-strong" color="foreground-2">Current page (no href on last item)</Text>
            <Breadcrumb2 items={[
              { label: 'Account: Harness.io', href: '#' },
              { label: 'Organization: Harness Analytics', href: '#' },
              { label: 'Widget Builder' },
            ]} />
          </div>
        </div>
      </section>

      {/* ── Data Visualizations ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">Data Visualizations</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            Reusable chart components built on Recharts.
          </Text>
        </div>
        {(() => {
          const sampleData = [
            { name: 'Alpha', value: 4_200_000 },
            { name: 'Beta', value: 3_100_000 },
            { name: 'Gamma', value: 2_800_000 },
            { name: 'Delta', value: 1_900_000 },
            { name: 'Epsilon', value: 1_200_000 },
            { name: 'Zeta', value: 750_000 },
          ]
          return (
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-2">
                <Text variant="caption-strong" color="foreground-2">BarChart2</Text>
                <BarChart2 data={sampleData} height={280} />
              </div>
              <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-2">
                <Text variant="caption-strong" color="foreground-2">LineChart2</Text>
                <LineChart2 data={sampleData} height={280} />
              </div>
              <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-2">
                <Text variant="caption-strong" color="foreground-2">AreaChart2</Text>
                <AreaChart2 data={sampleData} height={280} />
              </div>
              <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-2">
                <Text variant="caption-strong" color="foreground-2">HorizontalBarChart</Text>
                <HorizontalBarChart data={sampleData} height={280} />
              </div>
              <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-2">
                <Text variant="caption-strong" color="foreground-2">ScatterChart2</Text>
                <ScatterChart2 data={sampleData} height={280} />
              </div>
              <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-2 overflow-visible">
                <Text variant="caption-strong" color="foreground-2">DonutChart</Text>
                <DonutChart data={sampleData} height={350} />
              </div>
              <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-2">
                <Text variant="caption-strong" color="foreground-2">StackedBarChart</Text>
                <StackedBarChart
                  data={[
                    { name: 'Platform', a: 82, b: 18 },
                    { name: 'Product', a: 65, b: 35 },
                    { name: 'Mobile', a: 58, b: 42 },
                    { name: 'Frontend', a: 72, b: 28 },
                    { name: 'Backend', a: 78, b: 22 },
                  ]}
                  series={[
                    { dataKey: 'a', name: 'Series A', color: '#2DA6FF' },
                    { dataKey: 'b', name: 'Series B', color: '#D946EF' },
                  ]}
                  height={280}
                  yAxisFormatter={(v) => `${v}%`}
                />
              </div>
              <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-2">
                <Text variant="caption-strong" color="foreground-2">StackedBarChart (with trendline + bar values)</Text>
                <StackedBarChart
                  data={[
                    { name: 'Jan', a: 42, b: 18, c: 12 },
                    { name: 'Feb', a: 55, b: 25, c: 8 },
                    { name: 'Mar', a: 48, b: 22, c: 15 },
                    { name: 'Apr', a: 62, b: 30, c: 10 },
                    { name: 'May', a: 58, b: 28, c: 14 },
                  ]}
                  series={[
                    { dataKey: 'a', name: 'Small PRs', color: 'var(--cn-comp-data-viz-01-blue, lch(65% 56 255))' },
                    { dataKey: 'b', name: 'Medium PRs', color: 'var(--cn-comp-data-viz-02-purple, lch(58% 95 320))' },
                    { dataKey: 'c', name: 'Large PRs', color: 'var(--cn-comp-data-viz-03-pink, lch(58% 70 350))' },
                  ]}
                  height={280}
                  showTrendline
                  showBarValues
                />
              </div>
              <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-2">
                <Text variant="caption-strong" color="foreground-2">MetricCard</Text>
                <MetricCard data={sampleData} height={200} seriesName="Total Revenue" />
              </div>
            </div>
          )
        })()}
      </section>

      {/* ── Primitives Reference ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">Primitives Reference</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            The base building blocks used to compose higher-level components.
          </Text>
        </div>

        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-3">
          <Text variant="caption-strong" color="foreground-2">Heading Variants</Text>
          <div className="space-y-2">
            <Text as="p" variant="heading-hero" color="foreground-1">heading-hero</Text>
            <Text as="p" variant="heading-section" color="foreground-1">heading-section</Text>
            <Text as="p" variant="heading-subsection" color="foreground-1">heading-subsection</Text>
            <Text as="p" variant="heading-base" color="foreground-1">heading-base</Text>
            <Text as="p" variant="heading-small" color="foreground-1">heading-small</Text>
          </div>
        </div>

        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-3">
          <Text variant="caption-strong" color="foreground-2">Body Variants</Text>
          <div className="space-y-2">
            <Text as="p" variant="body-normal" color="foreground-2">body-normal</Text>
            <Text as="p" variant="body-strong" color="foreground-1">body-strong</Text>
            <Text as="p" variant="body-code" color="foreground-2">body-code</Text>
          </div>
        </div>

        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-4">
          <Text as="p" variant="caption-strong" color="foreground-2">UI Components</Text>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Primary SM</Button>
            <Button size="md">Primary MD</Button>
            <Button variant="outline" size="sm">Outline SM</Button>
            <Button variant="outline" size="md">Outline MD</Button>
            <Button variant="ghost" size="sm">Ghost SM</Button>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm">
              <IconV2 name="plus" size="sm" />
              With Icon
            </Button>
            <Button variant="outline" size="sm" iconOnly ignoreIconOnlyTooltip>
              <IconV2 name="settings" size="sm" />
            </Button>
          </div>
          <div className="max-w-md">
            <SearchInput placeholder="Search something..." searchValue={search} onChange={(value) => setSearch(value)} />
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge variant="outline" theme="success" size="sm">Published</StatusBadge>
            <StatusBadge variant="outline" theme="info" size="sm">Draft</StatusBadge>
            <StatusBadge variant="outline" theme="warning" size="sm">Pending</StatusBadge>
            <StatusBadge variant="outline" theme="danger" size="sm">Error</StatusBadge>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="check-demo-gallery" />
            <label htmlFor="check-demo-gallery"><Text variant="body-normal" color="foreground-1">Checkbox label</Text></label>
          </div>
        </div>
      </section>
    </div>
  )
}
