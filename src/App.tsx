import { Button, IconV2, SearchInput, StatusBadge, Text, Checkbox } from '@harnessio/ui/components'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SideNav } from './components/SideNav'
import { Nav2, type Nav2Section } from './components/Nav2'
import { Breadcrumb2 } from './components/Breadcrumb2'
import { LineChart2, BarChart2, HorizontalBarChart, AreaChart2, ScatterChart2, DonutChart, MetricCard } from './components/Charts'

function App() {
  const [search, setSearch] = useState('')
  const [activeNav, setActiveNav] = useState('')
  const [nav2Active, setNav2Active] = useState<Nav2Section>('insights')

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <Text as="h1" variant="heading-hero" color="foreground-1">Harness Prototypes</Text>
        <Text as="p" variant="body-normal" color="foreground-2">
          Harness Design System 3.0 — composed components built from primitives
        </Text>
      </header>

      {/* Page directory */}
      <section className="space-y-3">
        <Text as="h2" variant="heading-subsection" color="foreground-1">Pages</Text>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/insights" className="rounded-cn-2 border border-subtle bg-surface-1 p-4 hover:border-borders-3 transition-colors no-underline">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cn-2">
                <IconV2 name="dashboard" size="sm" className="text-foreground-2" />
              </div>
              <div>
                <Text variant="body-strong" color="foreground-1">Insights</Text>
                <Text variant="caption-normal" color="foreground-3">Dashboard listing with search, filters, and create flow</Text>
              </div>
            </div>
          </Link>
          <Link to="/canvas" className="rounded-cn-2 border border-subtle bg-surface-1 p-4 hover:border-borders-3 transition-colors no-underline">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cn-2">
                <IconV2 name="layout-grid" size="sm" className="text-foreground-2" />
              </div>
              <div>
                <Text variant="body-strong" color="foreground-1">Canvas</Text>
                <Text variant="caption-normal" color="foreground-3">Drag-and-drop canvas workspace for visual composition</Text>
              </div>
            </div>
          </Link>
          <Link to="/insights/custom/1" className="rounded-cn-2 border border-subtle bg-surface-1 p-4 hover:border-borders-3 transition-colors no-underline">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cn-2">
                <IconV2 name="bar-vertical" size="sm" className="text-foreground-2" />
              </div>
              <div>
                <Text variant="body-strong" color="foreground-1">Custom Insight</Text>
                <Text variant="caption-normal" color="foreground-3">Single insight view with widget chart and time range controls</Text>
              </div>
            </div>
          </Link>
          <Link to="/insights/custom/1/widget-builder" className="rounded-cn-2 border border-subtle bg-surface-1 p-4 hover:border-borders-3 transition-colors no-underline">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cn-2">
                <IconV2 name="settings" size="sm" className="text-foreground-2" />
              </div>
              <div>
                <Text variant="body-strong" color="foreground-1">Widget Builder</Text>
                <Text variant="caption-normal" color="foreground-3">Query builder with 7 chart types, datasource selection, and criteria config</Text>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Component Gallery ── */}
      <section className="space-y-3">
        <Text as="h2" variant="heading-subsection" color="foreground-1">Component Gallery</Text>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/tables" className="rounded-cn-2 border border-subtle bg-surface-1 p-4 hover:border-borders-3 transition-colors no-underline">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cn-2">
                <IconV2 name="grip-dots" size="sm" className="text-foreground-2" />
              </div>
              <div>
                <Text variant="body-strong" color="foreground-1">Tables</Text>
                <Text variant="caption-normal" color="foreground-3">Data tables with sorting, pagination, and row actions</Text>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── SideNav Component ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">SideNav</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            Application sidebar navigation with pinned items, recent group, and expandable "More" drawer.
            Click "More" to open the category popover.
          </Text>
        </div>
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-6 overflow-visible" style={{ minHeight: 640 }}>
          <div className="flex gap-8">
            {/* Light variant */}
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
            Icon-only sidebar navigation used across application pages. Click icons to change the active section.
          </Text>
        </div>
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-6">
          <div className="flex gap-8">
            <div className="space-y-2">
              <Text variant="caption-strong" color="foreground-2">Default</Text>
              <div className="rounded-lg overflow-hidden" style={{ height: 600 }}>
                <Nav2 activeSection={nav2Active} onSectionChange={setNav2Active} />
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
            Link-styled breadcrumb with arrow separators. Items with an href render as links; the last item can omit href to appear as plain text (current page).
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
          <div className="space-y-2">
            <Text variant="caption-strong" color="foreground-2">Two levels</Text>
            <Breadcrumb2 items={[
              { label: 'Home', href: '#' },
              { label: 'Settings', href: '#' },
            ]} />
          </div>
        </div>
      </section>

      {/* ── Data Visualizations ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">Data Visualizations</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            Reusable chart components built on Recharts. Each accepts a simple <code>{'{ name, value }[]'}</code> data array.
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
                <DonutChart data={sampleData} height={280} />
              </div>
              <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-2 col-span-2">
                <Text variant="caption-strong" color="foreground-2">MetricCard</Text>
                <MetricCard data={sampleData} height={200} seriesName="Total Revenue" />
              </div>
            </div>
          )
        })()}
      </section>

      {/* ── Section: Primitives Reference ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">Primitives Reference</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            The base building blocks used to compose higher-level components.
          </Text>
        </div>

        {/* Typography — Heading Variants */}
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

        {/* Typography — Body Variants */}
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-3">
          <Text variant="caption-strong" color="foreground-2">Body Variants</Text>
          <div className="space-y-2">
            <Text as="p" variant="body-normal" color="foreground-2">body-normal</Text>
            <Text as="p" variant="body-single-line-normal" color="foreground-2">body-single-line-normal</Text>
            <Text as="p" variant="body-strong" color="foreground-1">body-strong</Text>
            <Text as="p" variant="body-single-line-strong" color="foreground-1">body-single-line-strong</Text>
            <Text as="p" variant="body-code" color="foreground-2">body-code</Text>
            <Text as="p" variant="body-single-line-code" color="foreground-2">body-single-line-code</Text>
          </div>
        </div>

        {/* Typography — Caption Variants */}
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-3">
          <Text variant="caption-strong" color="foreground-2">Caption Variants</Text>
          <div className="space-y-2">
            <Text as="p" variant="caption-normal" color="foreground-3">caption-normal</Text>
            <Text as="p" variant="caption-single-line-normal" color="foreground-3">caption-single-line-normal</Text>
            <Text as="p" variant="caption-strong" color="foreground-2">caption-strong</Text>
            <Text as="p" variant="caption-light" color="foreground-3">caption-light</Text>
            <Text as="p" variant="caption-single-line-light" color="foreground-3">caption-single-line-light</Text>
            <Text as="p" variant="caption-code" color="foreground-3">caption-code</Text>
          </div>
        </div>

        {/* Typography — Text Colors */}
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-3">
          <Text variant="caption-strong" color="foreground-2">Text Colors</Text>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Text variant="body-normal" color="foreground-1">foreground-1</Text>
            <Text variant="body-normal" color="foreground-2">foreground-2</Text>
            <Text variant="body-normal" color="foreground-3">foreground-3</Text>
            <Text variant="body-normal" color="foreground-4">foreground-4</Text>
            <Text variant="body-normal" color="success">success</Text>
            <Text variant="body-normal" color="danger">danger</Text>
            <Text variant="body-normal" color="warning">warning</Text>
            <Text variant="body-normal" color="brand">brand</Text>
            <Text variant="body-normal" color="disabled">disabled</Text>
          </div>
        </div>

        {/* Spacing */}
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4">
          <Text as="p" variant="caption-strong" color="foreground-2" className="mb-2">Spacing (cn- scale)</Text>
          <div className="flex flex-wrap items-end gap-cn-sm">
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
              <div key={size} className="flex flex-col items-center gap-1">
                <div className={`p-cn-${size} bg-surface-2 border border-medium rounded-cn-1`}>
                  <div className="h-4 w-4 bg-[#006DEA] rounded" />
                </div>
                <Text variant="caption-normal" color="foreground-3">p-cn-{size}</Text>
              </div>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-4">
          <Text as="p" variant="caption-strong" color="foreground-2" className="mb-2">Colors &amp; Borders</Text>
          <div>
            <Text as="p" variant="caption-normal" color="foreground-3" className="mb-1">Surface</Text>
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-cn-1 bg-surface-0 border border-medium" title="bg-surface-0" />
              <div className="h-10 w-10 rounded-cn-1 bg-surface-1 border border-medium" title="bg-surface-1" />
              <div className="h-10 w-10 rounded-cn-1 bg-surface-2 border border-medium" title="bg-surface-2" />
              <div className="h-10 w-10 rounded-cn-1 bg-surface-3 border border-medium" title="bg-surface-3" />
            </div>
          </div>
          <div>
            <Text as="p" variant="caption-normal" color="foreground-3" className="mb-1">Text</Text>
            <div className="flex gap-4">
              <Text variant="body-normal" color="foreground-1">foreground-1</Text>
              <Text variant="body-normal" color="foreground-2">foreground-2</Text>
              <Text variant="body-normal" color="foreground-3">foreground-3</Text>
              <Text variant="body-normal" color="foreground-4">foreground-4</Text>
            </div>
          </div>
          <div>
            <Text as="p" variant="caption-normal" color="foreground-3" className="mb-1">Semantic</Text>
            <div className="flex gap-4">
              <Text variant="body-normal" color="brand">brand</Text>
              <Text variant="body-normal" color="success">success</Text>
              <Text variant="body-normal" color="warning">warning</Text>
              <Text variant="body-normal" color="danger">danger</Text>
            </div>
          </div>
        </div>

        {/* UI Components */}
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-4">
          <Text as="p" variant="caption-strong" color="foreground-2" className="mb-2">UI Components</Text>

          <div className="space-y-1">
            <Text variant="body-normal">Text variant=&quot;body-normal&quot;</Text>
            <br />
            <Text variant="body-strong">Text variant=&quot;body-strong&quot;</Text>
          </div>

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
            <SearchInput
              placeholder="Search something..."
              searchValue={search}
              onChange={(value) => setSearch(value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge variant="outline" theme="success" size="sm">Published</StatusBadge>
            <StatusBadge variant="outline" theme="info" size="sm">Draft</StatusBadge>
            <StatusBadge variant="outline" theme="warning" size="sm">Pending</StatusBadge>
            <StatusBadge variant="outline" theme="danger" size="sm">Error</StatusBadge>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="check-demo" />
            <label htmlFor="check-demo"><Text variant="body-normal" color="foreground-1">Checkbox label</Text></label>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
