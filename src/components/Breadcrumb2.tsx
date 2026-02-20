import { IconV2 } from '@harnessio/ui/components'
import { useLocation } from 'react-router-dom'

export interface Breadcrumb2Item {
  label: string
  href?: string
}

interface Breadcrumb2Props {
  items?: Breadcrumb2Item[]
}

const SEGMENT_LABELS: Record<string, string> = {
  insights: 'Insights',
  canvas: 'Canvas',
  custom: 'Custom',
  'widget-builder': 'Widget Builder',
  'efficiency-dora': 'DORA',
  'efficiency-sprint-metrics': 'Sprint Metrics',
  productivity: 'Productivity',
  tables: 'Tables',
}

function generateBreadcrumbs(pathname: string): Breadcrumb2Item[] {
  const baseCrumbs: Breadcrumb2Item[] = [
    { label: 'Account: Harness.io', href: '/' },
    { label: 'Organization: Harness Analytics', href: '/' },
    { label: 'Project: Split FME Analytics', href: '/' },
  ]

  const segments = pathname.split('/').filter(Boolean)
  const routeCrumbs: Breadcrumb2Item[] = []
  let cumulativePath = ''

  for (const segment of segments) {
    cumulativePath += `/${segment}`
    const label = SEGMENT_LABELS[segment]
    if (!label) continue // skip numeric/ID segments
    routeCrumbs.push({ label, href: cumulativePath })
  }

  // Last crumb has no href
  if (routeCrumbs.length > 0) {
    delete routeCrumbs[routeCrumbs.length - 1].href
  }

  return [...baseCrumbs, ...routeCrumbs]
}

export function Breadcrumb2({ items }: Breadcrumb2Props) {
  const location = useLocation()
  const resolvedItems = items ?? generateBreadcrumbs(location.pathname)
  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {resolvedItems.map((item, i) => (
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
