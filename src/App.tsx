import { Button, IconV2, SearchInput, StatusBadge, Text, Checkbox } from '@harnessio/ui/components'
import { useState } from 'react'

function App() {
  const [search, setSearch] = useState('')

  return (
    <div className="min-h-screen bg-surface-0 p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* ── Section 1: Harness Typography ── */}
        <section className="space-y-2">
          <h2 className="font-heading-subsection text-primary">Harness Typography</h2>
          <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-2">
            <p className="font-heading-hero text-primary">font-heading-hero</p>
            <p className="font-heading-section text-primary">font-heading-section</p>
            <p className="font-heading-subsection text-primary">font-heading-subsection</p>
            <p className="font-heading-base text-primary">font-heading-base</p>
            <p className="font-heading-small text-primary">font-heading-small</p>
            <hr className="border-subtle" />
            <p className="font-body-normal text-secondary">font-body-normal</p>
            <p className="font-body-strong text-primary">font-body-strong</p>
            <p className="font-body-code text-secondary">font-body-code</p>
            <hr className="border-subtle" />
            <p className="font-caption-normal text-tertiary">font-caption-normal</p>
            <p className="font-caption-strong text-secondary">font-caption-strong</p>
            <p className="font-caption-light text-tertiary">font-caption-light</p>
            <p className="font-caption-code text-tertiary">font-caption-code</p>
          </div>
        </section>

        {/* ── Section 2: Spacing (cn- scale) ── */}
        <section className="space-y-2">
          <h2 className="font-heading-subsection text-primary">Spacing (cn- scale)</h2>
          <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 flex flex-wrap items-end gap-cn-sm">
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
              <div key={size} className="flex flex-col items-center gap-1">
                <div className={`p-cn-${size} bg-surface-2 border border-medium rounded-cn-1`}>
                  <div className="h-4 w-4 bg-[#006DEA] rounded" />
                </div>
                <span className="font-caption-normal text-tertiary">p-cn-{size}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 3: Colors & Borders ── */}
        <section className="space-y-2">
          <h2 className="font-heading-subsection text-primary">Colors &amp; Borders</h2>
          <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-4">
            <div>
              <p className="font-caption-strong text-secondary mb-2">Surface colors</p>
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-cn-1 bg-surface-0 border border-medium" title="bg-surface-0" />
                <div className="h-10 w-10 rounded-cn-1 bg-surface-1 border border-medium" title="bg-surface-1" />
                <div className="h-10 w-10 rounded-cn-1 bg-surface-2 border border-medium" title="bg-surface-2" />
                <div className="h-10 w-10 rounded-cn-1 bg-surface-3 border border-medium" title="bg-surface-3" />
              </div>
            </div>
            <div>
              <p className="font-caption-strong text-secondary mb-2">Text colors</p>
              <div className="flex gap-4">
                <span className="font-body-normal text-primary">text-primary</span>
                <span className="font-body-normal text-secondary">text-secondary</span>
                <span className="font-body-normal text-tertiary">text-tertiary</span>
                <span className="font-body-normal text-quaternary">text-quaternary</span>
              </div>
            </div>
            <div>
              <p className="font-caption-strong text-secondary mb-2">Semantic text</p>
              <div className="flex gap-4">
                <span className="font-body-normal text-cn-brand">text-cn-brand</span>
                <span className="font-body-normal text-cn-success">text-cn-success</span>
                <span className="font-body-normal text-cn-warning">text-cn-warning</span>
                <span className="font-body-normal text-cn-danger">text-cn-danger</span>
              </div>
            </div>
            <div>
              <p className="font-caption-strong text-secondary mb-2">Borders</p>
              <div className="flex gap-3">
                <div className="h-8 w-24 rounded-cn-1 border border-strong" />
                <div className="h-8 w-24 rounded-cn-1 border border-medium" />
                <div className="h-8 w-24 rounded-cn-1 border border-subtle" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 4: Harness UI Components ── */}
        <section className="space-y-2">
          <h2 className="font-heading-subsection text-primary">Harness UI Components</h2>
          <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-4">
            {/* Text component */}
            <div className="space-y-1">
              <Text variant="body-normal">Text variant=&quot;body-normal&quot;</Text>
              <br />
              <Text variant="body-strong">Text variant=&quot;body-strong&quot;</Text>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Primary SM</Button>
              <Button size="md">Primary MD</Button>
              <Button variant="outline" size="sm">Outline SM</Button>
              <Button variant="outline" size="md">Outline MD</Button>
              <Button variant="ghost" size="sm">Ghost SM</Button>
            </div>

            {/* Button with icon */}
            <div className="flex items-center gap-3">
              <Button size="sm">
                <IconV2 name="plus" size="sm" />
                With Icon
              </Button>
              <Button variant="outline" size="sm" iconOnly ignoreIconOnlyTooltip>
                <IconV2 name="settings" size="sm" />
              </Button>
            </div>

            {/* SearchInput */}
            <div className="max-w-md">
              <SearchInput
                placeholder="Search something..."
                searchValue={search}
                onChange={(value) => setSearch(value)}
              />
            </div>

            {/* StatusBadge */}
            <div className="flex items-center gap-3">
              <StatusBadge variant="outline" theme="success" size="sm">Published</StatusBadge>
              <StatusBadge variant="outline" theme="info" size="sm">Draft</StatusBadge>
              <StatusBadge variant="outline" theme="warning" size="sm">Pending</StatusBadge>
              <StatusBadge variant="outline" theme="danger" size="sm">Error</StatusBadge>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox id="check-demo" />
              <label htmlFor="check-demo" className="font-body-normal text-primary">Checkbox label</label>
            </div>
          </div>
        </section>

        {/* ── Section 5: Arbitrary Values ── */}
        <section className="space-y-2">
          <h2 className="font-heading-subsection text-primary">Arbitrary Values</h2>
          <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4 space-y-3">
            <div className="flex gap-3 items-end">
              <div className="h-[26px] w-[80px] rounded bg-[#051a33]" />
              <span className="font-caption-normal text-tertiary">h-[26px] w-[80px] bg-[#051a33]</span>
            </div>
            <div className="flex gap-3 items-end">
              <div className="h-[40px] w-[120px] rounded bg-[#006DEA]" />
              <span className="font-caption-normal text-tertiary">h-[40px] w-[120px] bg-[#006DEA]</span>
            </div>
            <p className="text-[13px] text-secondary">text-[13px] — This should render at 13px</p>
            <p className="text-[28px] font-medium text-primary">text-[28px] — Title at 28px</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
