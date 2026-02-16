import { Button, IconV2, SearchInput, StatusBadge, Text, Checkbox } from '@harnessio/ui/components'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SideNav } from './components/SideNav'

function App() {
  const [search, setSearch] = useState('')
  const [activeNav, setActiveNav] = useState('')

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <Text as="h1" variant="heading-hero" color="foreground-1">Component Gallery</Text>
        <Text as="p" variant="body-normal" color="foreground-2">
          Harness Design System 3.0 — composed components built from primitives
        </Text>
      </header>

      {/* Quick links to sub-pages */}
      <nav className="flex gap-3">
        <Link to="/tables">
          <Button variant="outline" size="sm">
            <IconV2 name="grip-dots" size="sm" />
            Tables
          </Button>
        </Link>
        <Link to="/insights">
          <Button variant="outline" size="sm">
            <IconV2 name="dashboard" size="sm" />
            Insights
          </Button>
        </Link>
        <Link to="/widget-builder">
          <Button variant="outline" size="sm">
            <IconV2 name="settings" size="sm" />
            Widget Builder
          </Button>
        </Link>
      </nav>

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
