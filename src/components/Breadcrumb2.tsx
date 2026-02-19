import { IconV2 } from '@harnessio/ui/components'

export interface Breadcrumb2Item {
  label: string
  href?: string
}

interface Breadcrumb2Props {
  items: Breadcrumb2Item[]
}

export function Breadcrumb2({ items }: Breadcrumb2Props) {
  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <IconV2 name="nav-arrow-right" size="sm" className="text-foreground-3" />}
          {item.href ? (
            <a href={item.href} className="hover:underline" style={{ color: 'var(--cn-brand, #006DEA)' }}>{item.label}</a>
          ) : (
            <span className="text-foreground-1">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
