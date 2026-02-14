import { useState } from 'react'
import { Table, Text, StatusBadge, Button, IconV2 } from '@harnessio/ui/components'
import { Link } from 'react-router-dom'

const sampleData = [
  { name: 'Alice Johnson', email: 'alice@example.com', displayName: 'Alice', role: 'Admin', date: '2024-01-15', status: 'active' as const },
  { name: 'Bob Smith', email: 'bob@example.com', displayName: 'Bob', role: 'Editor', date: '2024-02-20', status: 'active' as const },
  { name: 'Carol White', email: 'carol@example.com', displayName: 'Carol', role: 'Viewer', date: '2024-03-10', status: 'inactive' as const },
  { name: 'Dan Brown', email: 'dan@example.com', displayName: 'Dan', role: 'Editor', date: '2024-04-05', status: 'active' as const },
  { name: 'Eve Davis', email: 'eve@example.com', displayName: 'Eve', role: 'Admin', date: '2024-05-18', status: 'pending' as const },
]

const statusTheme = { active: 'success', inactive: 'danger', pending: 'warning' } as const

export function TableGallery() {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set([1]))
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | false>('asc')

  const toggleRow = (idx: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const sortedData = sortDir
    ? [...sampleData].sort((a, b) =>
        sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      )
    : sampleData

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link to="/" className="inline-flex items-center gap-1">
        <IconV2 name="arrow-left" size="sm" />
        <Text variant="body-normal" color="brand">Back to Gallery</Text>
      </Link>

      {/* Header */}
      <div className="space-y-1">
        <Text as="h1" variant="heading-hero" color="foreground-1">Table</Text>
        <Text as="p" variant="body-normal" color="foreground-2">
          Display tabular data with various sizes, variants, and interactive features.
        </Text>
      </div>

      {/* ── Basic Usage ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">Basic Usage</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            A standard table with header and body rows.
          </Text>
        </div>
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4">
          <Table.Root size="normal">
            <Table.Header>
              <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head>Email</Table.Head>
                <Table.Head>Display Name</Table.Head>
                <Table.Head>Date Added</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sampleData.map((row) => (
                <Table.Row key={row.email}>
                  <Table.Cell>{row.name}</Table.Cell>
                  <Table.Cell>{row.email}</Table.Cell>
                  <Table.Cell>{row.displayName}</Table.Cell>
                  <Table.Cell>{row.date}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      </section>

      {/* ── Size Variants ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">Size Variants</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            Tables support three sizes: <Text variant="body-code">compact</Text>,{' '}
            <Text variant="body-code">normal</Text> (default), and{' '}
            <Text variant="body-code">relaxed</Text>.
          </Text>
        </div>

        {(['compact', 'normal', 'relaxed'] as const).map((size) => (
          <div key={size} className="space-y-2">
            <Text variant="caption-strong" color="foreground-2">size=&quot;{size}&quot;</Text>
            <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4">
              <Table.Root size={size}>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Name</Table.Head>
                    <Table.Head>Role</Table.Head>
                    <Table.Head>Date Added</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {sampleData.slice(0, 3).map((row) => (
                    <Table.Row key={row.email}>
                      <Table.Cell>{row.name}</Table.Cell>
                      <Table.Cell>{row.role}</Table.Cell>
                      <Table.Cell>{row.date}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </div>
          </div>
        ))}
      </section>

      {/* ── Transparent Variant ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">Transparent Variant</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            Use <Text variant="body-code">variant=&quot;transparent&quot;</Text> for a borderless look that blends into the background.
          </Text>
        </div>
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4">
          <Table.Root variant="transparent">
            <Table.Header>
              <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head>Email</Table.Head>
                <Table.Head>Role</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sampleData.slice(0, 3).map((row) => (
                <Table.Row key={row.email}>
                  <Table.Cell>{row.name}</Table.Cell>
                  <Table.Cell>{row.email}</Table.Cell>
                  <Table.Cell>{row.role}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      </section>

      {/* ── Row Selection ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">Row Selection</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            Rows can be marked as selected. Click a row to toggle selection.
          </Text>
        </div>
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head>Email</Table.Head>
                <Table.Head>Role</Table.Head>
                <Table.Head>Status</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sampleData.map((row, idx) => (
                <Table.Row
                  key={row.email}
                  selected={selectedRows.has(idx)}
                  onClick={() => toggleRow(idx)}
                >
                  <Table.Cell>{row.name}</Table.Cell>
                  <Table.Cell>{row.email}</Table.Cell>
                  <Table.Cell>{row.role}</Table.Cell>
                  <Table.Cell>
                    <StatusBadge variant="outline" theme={statusTheme[row.status]} size="sm">
                      {row.status}
                    </StatusBadge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
          <Text as="p" variant="caption-normal" color="foreground-3" className="mt-2">
            Selected: {selectedRows.size === 0 ? 'none' : [...selectedRows].map((i) => sampleData[i].name).join(', ')}
          </Text>
        </div>
      </section>

      {/* ── Sortable Headers ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">Sortable Headers</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            Use <Text variant="body-code">sortable</Text> and <Text variant="body-code">sortDirection</Text> on{' '}
            <Text variant="body-code">Table.Head</Text> to enable sort indicators.
          </Text>
        </div>
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head
                  sortable
                  sortDirection={sortDir}
                  onClick={() =>
                    setSortDir((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? false : 'asc'))
                  }
                >
                  Name
                </Table.Head>
                <Table.Head>Email</Table.Head>
                <Table.Head>Role</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sortedData.slice(0, 4).map((row) => (
                <Table.Row key={row.email}>
                  <Table.Cell>{row.name}</Table.Cell>
                  <Table.Cell>{row.email}</Table.Cell>
                  <Table.Cell>{row.role}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
          <Text as="p" variant="caption-normal" color="foreground-3" className="mt-2">
            Click the &quot;Name&quot; header to cycle: asc → desc → unsorted
          </Text>
        </div>
      </section>

      {/* ── Caption & Footer ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">Caption &amp; Footer</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            Use <Text variant="body-code">Table.Caption</Text> and <Text variant="body-code">Table.Footer</Text> for
            additional context.
          </Text>
        </div>
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4">
          <Table.Root>
            <Table.Caption>Team members as of January 2024</Table.Caption>
            <Table.Header>
              <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head>Role</Table.Head>
                <Table.Head>Date Added</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sampleData.map((row) => (
                <Table.Row key={row.email}>
                  <Table.Cell>{row.name}</Table.Cell>
                  <Table.Cell>{row.role}</Table.Cell>
                  <Table.Cell>{row.date}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.Cell colSpan={3}>
                  <Text variant="caption-normal" color="foreground-3">
                    Total: {sampleData.length} members
                  </Text>
                </Table.Cell>
              </Table.Row>
            </Table.Footer>
          </Table.Root>
        </div>
      </section>

      {/* ── Disable Hover Highlight ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">Disable Hover Highlight</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            Set <Text variant="body-code">disableHighlightOnHover</Text> to remove the row hover effect.
          </Text>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Text variant="caption-strong" color="foreground-2">Hover enabled (default)</Text>
            <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4">
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Name</Table.Head>
                    <Table.Head>Role</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {sampleData.slice(0, 3).map((row) => (
                    <Table.Row key={row.email}>
                      <Table.Cell>{row.name}</Table.Cell>
                      <Table.Cell>{row.role}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <Text variant="caption-strong" color="foreground-2">Hover disabled</Text>
            <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4">
              <Table.Root disableHighlightOnHover>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Name</Table.Head>
                    <Table.Head>Role</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {sampleData.slice(0, 3).map((row) => (
                    <Table.Row key={row.email}>
                      <Table.Cell>{row.name}</Table.Cell>
                      <Table.Cell>{row.role}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hidden Dividers ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">Hidden Dividers</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            Use <Text variant="body-code">hideDivider</Text> on <Text variant="body-code">Table.Head</Text> to
            remove column dividers.
          </Text>
        </div>
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head hideDivider>Name</Table.Head>
                <Table.Head hideDivider>Email</Table.Head>
                <Table.Head hideDivider>Role</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sampleData.slice(0, 3).map((row) => (
                <Table.Row key={row.email}>
                  <Table.Cell>{row.name}</Table.Cell>
                  <Table.Cell>{row.email}</Table.Cell>
                  <Table.Cell>{row.role}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      </section>

      {/* ── Anatomy Reference ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">Anatomy</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            All parts of the Table component can be imported and composed as needed.
          </Text>
        </div>
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4">
          <pre className="overflow-x-auto">
            <Text as="code" variant="body-code" color="foreground-2">{`<Table.Root>
  <Table.Caption />
  <Table.Header>
    <Table.Row>
      <Table.Head />
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell />
    </Table.Row>
  </Table.Body>
  <Table.Footer>
    <Table.Row>
      <Table.Cell />
    </Table.Row>
  </Table.Footer>
</Table.Root>`}</Text>
          </pre>
        </div>
      </section>

      {/* ── API Quick Reference ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Text as="h2" variant="heading-subsection" color="foreground-1">API Quick Reference</Text>
          <Text as="p" variant="body-normal" color="foreground-3">
            Key props for each sub-component.
          </Text>
        </div>
        <div className="rounded-cn-2 border border-subtle bg-surface-1 p-4">
          <Table.Root size="compact">
            <Table.Header>
              <Table.Row>
                <Table.Head>Component</Table.Head>
                <Table.Head>Prop</Table.Head>
                <Table.Head>Type</Table.Head>
                <Table.Head>Default</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell>
                  <Text variant="body-code">Root</Text>
                </Table.Cell>
                <Table.Cell>size</Table.Cell>
                <Table.Cell>
                  <Text variant="caption-code">&apos;normal&apos; | &apos;relaxed&apos; | &apos;compact&apos;</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text variant="caption-code">&apos;normal&apos;</Text>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <Text variant="body-code">Root</Text>
                </Table.Cell>
                <Table.Cell>variant</Table.Cell>
                <Table.Cell>
                  <Text variant="caption-code">&apos;default&apos; | &apos;transparent&apos;</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text variant="caption-code">&apos;default&apos;</Text>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <Text variant="body-code">Root</Text>
                </Table.Cell>
                <Table.Cell>disableHighlightOnHover</Table.Cell>
                <Table.Cell>
                  <Text variant="caption-code">boolean</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text variant="caption-code">false</Text>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <Text variant="body-code">Head</Text>
                </Table.Cell>
                <Table.Cell>sortable</Table.Cell>
                <Table.Cell>
                  <Text variant="caption-code">boolean</Text>
                </Table.Cell>
                <Table.Cell>—</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <Text variant="body-code">Head</Text>
                </Table.Cell>
                <Table.Cell>sortDirection</Table.Cell>
                <Table.Cell>
                  <Text variant="caption-code">&apos;asc&apos; | &apos;desc&apos; | false</Text>
                </Table.Cell>
                <Table.Cell>—</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <Text variant="body-code">Head</Text>
                </Table.Cell>
                <Table.Cell>hideDivider</Table.Cell>
                <Table.Cell>
                  <Text variant="caption-code">boolean</Text>
                </Table.Cell>
                <Table.Cell>—</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <Text variant="body-code">Row</Text>
                </Table.Cell>
                <Table.Cell>selected</Table.Cell>
                <Table.Cell>
                  <Text variant="caption-code">boolean</Text>
                </Table.Cell>
                <Table.Cell>—</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <Text variant="body-code">Cell</Text>
                </Table.Cell>
                <Table.Cell>to</Table.Cell>
                <Table.Cell>
                  <Text variant="caption-code">string</Text>
                </Table.Cell>
                <Table.Cell>—</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </div>
      </section>
    </div>
  )
}
