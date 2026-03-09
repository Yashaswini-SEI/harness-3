import { useState, type ReactNode } from 'react'
import {
  Sidebar,
  TooltipProvider,
  Breadcrumb,
  Button,
  IconV2,
  Text,
  Chat,
} from '@harnessio/ui/components'
import { useLocation } from 'react-router-dom'
import type { Nav2Section } from './Nav2'
import harnessIcon from '../assets/logos/harness.svg'

// ── Breadcrumb helpers (shared with Breadcrumb2) ──

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
  configuration: 'Configuration',
}

function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; href?: string }[] = []
  let cumulativePath = ''
  for (const segment of segments) {
    cumulativePath += `/${segment}`
    const label = SEGMENT_LABELS[segment]
    if (!label) continue
    crumbs.push({ label, href: cumulativePath })
  }
  if (crumbs.length > 0) delete crumbs[crumbs.length - 1].href
  return crumbs
}

// ── AI Chat Panel ──

function AIChatPanel({ onClose }: { onClose: () => void }) {
  const [chatInput, setChatInput] = useState('')

  return (
    <aside className="flex w-[380px] shrink-0 flex-col overflow-hidden rounded-xl border border-borders-3 bg-cn-0">
      <Chat.Root className="flex flex-1 flex-col">
        <div className="flex h-[44px] shrink-0 items-center justify-between px-4">
          <Text variant="body-strong" color="foreground-1">Title</Text>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
              <IconV2 name="edit" size="sm" />
            </Button>
            <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip onClick={onClose}>
              <IconV2 name={'columns-2' as never} size="sm" />
            </Button>
            <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
              <IconV2 name="more-horizontal" size="sm" />
            </Button>
          </div>
        </div>
        <Chat.Body className="flex-1">
          <Chat.EmptyState />
        </Chat.Body>
        <Chat.Footer>
          <Chat.Input
            placeholder="Ask Harness..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onSend={() => setChatInput('')}
          />
        </Chat.Footer>
      </Chat.Root>
    </aside>
  )
}

// ── Content Header (breadcrumbs) ──

function ContentHeader({ onToggleChat }: { onToggleChat: () => void; chatOpen: boolean }) {
  const location = useLocation()
  const crumbs = generateBreadcrumbs(location.pathname)

  return (
    <div className="flex h-[44px] shrink-0 items-center gap-1.5 px-1">
      <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
        <IconV2 name="clock" size="sm" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        ignoreIconOnlyTooltip
        onClick={onToggleChat}
      >
        <IconV2 name={'columns-2' as never} size="sm" />
      </Button>

      <Breadcrumb.Root>
        <Breadcrumb.List>
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center">
              {i > 0 && <Breadcrumb.Separator />}
              <Breadcrumb.Item>
                {crumb.href ? (
                  <Breadcrumb.Link href={crumb.href}>{crumb.label}</Breadcrumb.Link>
                ) : (
                  <Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
                )}
              </Breadcrumb.Item>
            </span>
          ))}
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </div>
  )
}

// ── Main AppShell ──

interface AppShellProps {
  activeSection: Nav2Section
  children?: ReactNode
}

export function AppShell({ activeSection, children }: AppShellProps) {
  const [chatOpen, setChatOpen] = useState(true)

  return (
    <TooltipProvider>
      <Sidebar.Provider defaultOpen>
        <div className="flex h-screen">
          {/* Left Nav Sidebar */}
          <Sidebar.Root style={{ '--cn-sidebar-container-full-width': '220px' } as React.CSSProperties}>
            {/* Logo / project header */}
            <Sidebar.Header>
              <div className="flex items-center justify-between px-1 py-1">
                <div className="flex items-center gap-2.5">
                  <img src={harnessIcon} alt="Harness" className="h-6 w-6 shrink-0" />
                  <div className="flex flex-col">
                    <Text variant="body-strong" color="foreground-1" className="text-[13px] leading-tight">Harness</Text>
                    <Text variant="caption-normal" color="foreground-4" className="text-[11px] leading-tight">default</Text>
                  </div>
                </div>
                <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip>
                  <IconV2 name={'chevron-right' as never} size="xs" />
                </Button>
              </div>
            </Sidebar.Header>

            <Sidebar.Content>
              {/* Search */}
              <Sidebar.Group>
                <div className="px-2 pb-1">
                  <button className="flex w-full items-center gap-2 rounded-md border border-borders-2 px-2.5 py-1.5 text-sm text-foreground-4 hover:border-borders-3">
                    <IconV2 name="search" size="sm" className="shrink-0" />
                    <span className="flex-1 text-left">Search</span>
                    <span className="flex h-5 items-center rounded border border-borders-2 px-1.5 text-[11px] text-foreground-4">⌘F</span>
                  </button>
                </div>
              </Sidebar.Group>

              {/* Main nav */}
              <Sidebar.Group>
                <Sidebar.Item icon={'dashboard' as never} title="Home" to="/" />
                <Sidebar.Item icon={'clock-solid' as never} title="Activity" to="#" />
                <Sidebar.Item
                  icon={'engineering-insights' as never}
                  title="Engineering Insights"
                  active={
                    activeSection === 'insights' ||
                    activeSection === 'canvas' ||
                    activeSection === 'configuration' ||
                    activeSection === 'org-tree' ||
                    activeSection === 'teams' ||
                    activeSection === 'project' ||
                    activeSection === 'account-mgmt' ||
                    activeSection === 'settings'
                  }
                  actionButtons={[{ iconName: 'pin' }]}
                >
                  <Sidebar.MenuSubItem title="Insights" to="/module/sei/insights" active={activeSection === 'insights'} />
                  <Sidebar.MenuSubItem title="Canvas" to="/module/sei/canvas" active={activeSection === 'canvas'} />
                  <Sidebar.Separator />
                  <Sidebar.MenuSubItem
                    title="Configuration"
                    to="/module/sei/configuration"
                    active={activeSection === 'configuration' || activeSection === 'org-tree' || activeSection === 'teams' || activeSection === 'project'}
                  />
                  <Sidebar.MenuSubItem
                    title="Settings"
                    to="#"
                    active={activeSection === 'settings' || activeSection === 'account-mgmt'}
                  />
                </Sidebar.Item>
                <Sidebar.Item icon={'menu-more-horizontal' as never} title="more" to="#" />
              </Sidebar.Group>

              <Sidebar.Separator />

              {/* Recent */}
              <Sidebar.Group label="Recent">
                <Sidebar.Item icon={'security-tests' as never} title="Security Tests" to="#" />
                <Sidebar.Item icon={'incidents-solid' as never} title="Incidents" to="#" />
                <Sidebar.Item icon={'deployments-solid' as never} title="Deployments" to="#" />
                <Sidebar.Item icon={'feature-flags' as never} title="Feature Flags" to="#" />
                <Sidebar.Item icon={'artifacts-solid' as never} title="Artifacts" to="#" />
              </Sidebar.Group>
            </Sidebar.Content>

            <Sidebar.Footer>
              {/* User avatar */}
              <Sidebar.Item
                avatarFallback="BR"
                title="bradley-rydzewski"
                withRightIndicator
                to="#"
              />
            </Sidebar.Footer>

            <Sidebar.Rail />
          </Sidebar.Root>

          {/* Everything right of sidebar */}
          <Sidebar.Inset className="!p-0 bg-cn-2">
            <div className="flex h-full gap-3 p-3 pl-3">
              {/* Middle: AI Chat Panel */}
              {chatOpen && <AIChatPanel onClose={() => setChatOpen(false)} />}

              {/* Right: Main Content */}
              <main className="flex min-w-0 flex-1 flex-col">
                <ContentHeader onToggleChat={() => setChatOpen((v) => !v)} chatOpen={chatOpen} />
                <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-borders-3 bg-cn-0">
                  {children}
                </div>
              </main>
            </div>
          </Sidebar.Inset>
        </div>
      </Sidebar.Provider>
    </TooltipProvider>
  )
}
