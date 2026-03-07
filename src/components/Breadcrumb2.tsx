import { IconV2, Breadcrumb } from '@harnessio/ui/components'
import { useLocation } from 'react-router-dom'
import harnessLogo from '../assets/logos/harness-logo.svg'

export interface Breadcrumb2Item {
  label: string
  href?: string
  icon?: string
}

interface Breadcrumb2Props {
  items?: Breadcrumb2Item[]
}

const SEGMENT_LABELS: Record<string, string> = {
  sei: 'Platform',
  insights: 'Insights',
  canvas: 'Canvas',
  'org-tree': 'Org Trees',
  profile: 'Profile',
  efficiency: 'Efficiency',
  integration: 'Integrations',
  custom: 'Custom',
  'widget-builder': 'Widget Builder',
  'efficiency-dora': 'DORA',
  'efficiency-sprint-metrics': 'Sprint Metrics',
  productivity: 'Productivity',
  tables: 'Tables',
  'business-alignment': 'Business Alignment',
  'ai-insights': 'AI Insights',
  teams: 'Teams',
  developers: 'Developers',
}

function generateBreadcrumbs(pathname: string): Breadcrumb2Item[] {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: Breadcrumb2Item[] = []
  let cumulativePath = ''

  for (const segment of segments) {
    cumulativePath += `/${segment}`
    const label = SEGMENT_LABELS[segment]
    if (!label) continue
    crumbs.push({ label, href: cumulativePath })
  }

  // Last crumb has no href
  if (crumbs.length > 0) {
    delete crumbs[crumbs.length - 1].href
  }

  return crumbs
}

/** Standalone breadcrumb nav (used in component gallery demos) */
export function Breadcrumb2({ items }: Breadcrumb2Props) {
  const location = useLocation()
  const resolvedItems = items ?? generateBreadcrumbs(location.pathname)
  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        {resolvedItems.map((item, i) => (
          <span key={i} className="flex items-center">
            {i > 0 && <Breadcrumb.Separator />}
            <Breadcrumb.Item>
              {item.href ? (
                <Breadcrumb.Link href={item.href}>{item.label}</Breadcrumb.Link>
              ) : (
                <Breadcrumb.Page>{item.label}</Breadcrumb.Page>
              )}
            </Breadcrumb.Item>
          </span>
        ))}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  )
}

/** Full-width header bar with logo, breadcrumb, and utility buttons */
export function Header() {
  const location = useLocation()
  const crumbs = generateBreadcrumbs(location.pathname)

  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between px-4">
      {/* Left: Logo + Breadcrumb */}
      <div className="flex min-w-0 items-center gap-4">
        <img src={harnessLogo} alt="Harness" className="h-[20px] shrink-0" />

        <Breadcrumb.Root>
          <Breadcrumb.List>
            {/* Account/org picker */}
            <Breadcrumb.Item>
              <Breadcrumb.RootInteractive
                avatar={
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cn-3">
                    <IconV2 name={'city' as never} size="sm" className="text-foreground-1" />
                  </div>
                }
              >
                Edge Wireless
              </Breadcrumb.RootInteractive>
            </Breadcrumb.Item>

            {/* Dynamic route crumbs */}
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center">
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                  {i < crumbs.length - 1 ? (
                    <Breadcrumb.Link href={crumb.href} prefixIcon={i === 0 ? ('copy' as never) : undefined}>
                      {crumb.label}
                    </Breadcrumb.Link>
                  ) : (
                    <Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
                  )}
                </Breadcrumb.Item>
              </span>
            ))}
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </div>

      {/* Right: Utility buttons */}
      <div className="flex shrink-0 items-center gap-3">
        <button className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-cn-2">
          <IconV2 name="search" size="sm" className="text-foreground-3" />
          <span className="flex h-5 items-center rounded border border-borders-2 px-1.5 text-xs text-foreground-3">⌘F</span>
        </button>
        <button className="flex h-7 w-7 items-center justify-center rounded-md border-[1.5px] border-blue-400">
          <IconV2 name={'sparkle' as never} size="sm" className="text-foreground-1" />
        </button>
        <button className="flex items-center gap-1 rounded-full pr-1.5">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-400 to-blue-500" />
          <IconV2 name="nav-arrow-down" size="xs" className="text-foreground-3" />
        </button>
      </div>
    </header>
  )
}
