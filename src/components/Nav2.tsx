import { Sidebar, TooltipProvider } from '@harnessio/ui/components'

export type Nav2Section =
  | 'project'
  | 'insights'
  | 'canvas'
  | 'org-tree'
  | 'teams'
  | 'account-mgmt'
  | 'settings'

interface Nav2Props {
  activeSection: Nav2Section
  onSectionChange?: (section: Nav2Section) => void
  onThemeToggle?: () => void
  dark?: boolean
}

const eiSubItems: { id: Nav2Section; title: string; href?: string }[] = [
  { id: 'insights', title: 'Insights', href: '/module/sei/insights' },
  { id: 'canvas', title: 'Canvas' },
]

const configItems: { id: Nav2Section; title: string; href?: string }[] = [
  { id: 'org-tree', title: 'Org Trees', href: '/module/sei/configuration/org-tree' },
  { id: 'teams', title: 'Teams', href: '/module/sei/configuration/teams' },
  { id: 'project', title: 'Project' },
]

const settingsItems: { id: Nav2Section; title: string }[] = [
  { id: 'account-mgmt', title: 'Account Management' },
]

const recentItems = [
  { id: 'security-tests', title: 'Security Tests', icon: 'security-tests' },
  { id: 'incidents', title: 'Incidents', icon: 'incidents-solid' },
  { id: 'deployments', title: 'Deployments', icon: 'deployments-solid' },
  { id: 'feature-flags', title: 'Feature Flags', icon: 'feature-flags' },
  { id: 'artifacts', title: 'Artifacts', icon: 'artifacts-solid' },
]

export function Nav2({ activeSection, onSectionChange }: Nav2Props) {
  const handleClick = (id: Nav2Section, href?: string) => {
    onSectionChange?.(id)
    if (href) window.location.href = href
  }

  return (
    <TooltipProvider>
    <Sidebar.Provider defaultOpen>
      <Sidebar.Root className="!relative !h-auto shrink-0" style={{ minHeight: '100vh', '--cn-sidebar-container-full-width': '280px' } as React.CSSProperties}>
        <Sidebar.Content>
          {/* Main nav */}
          <Sidebar.Group>
            <Sidebar.Item icon={'dashboard' as never} title="Home" active={false} onClick={() => {}} />
            <Sidebar.Item icon={'clock-solid' as never} title="Activity" active={false} onClick={() => {}} />
            <Sidebar.Item icon={'engineering-insights' as never} title="Engineering Insights" active={false} onClick={() => {}} />
            {eiSubItems.map((item) => (
              <Sidebar.Item
                key={item.id}
                title={item.title}
                active={activeSection === item.id}
                onClick={() => handleClick(item.id, item.href)}
              />
            ))}
          </Sidebar.Group>

          <Sidebar.Group>
            <div className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-[0.06em] text-color-3">
              Configurations
            </div>
            {configItems.map((item) => (
              <Sidebar.Item
                key={item.id}
                title={item.title}
                active={activeSection === item.id}
                onClick={() => handleClick(item.id, item.href)}
              />
            ))}
          </Sidebar.Group>

          <Sidebar.Group>
            <div className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-[0.06em] text-color-3">
              Settings
            </div>
            {settingsItems.map((item) => (
              <Sidebar.Item
                key={item.id}
                title={item.title}
                active={activeSection === item.id}
                onClick={() => handleClick(item.id)}
              />
            ))}
          </Sidebar.Group>

          <Sidebar.Item icon={'menu-more-horizontal' as never} title="more" onClick={() => {}} />

          <Sidebar.Separator />

          <Sidebar.Group label="Recent">
            {recentItems.map((item) => (
              <Sidebar.Item
                key={item.id}
                icon={item.icon as never}
                title={item.title}
                onClick={() => {}}
              />
            ))}
          </Sidebar.Group>
        </Sidebar.Content>

        <Sidebar.Footer>
          <Sidebar.Item
            icon={'settings' as never}
            title="Settings"
            active={activeSection === 'settings'}
            onClick={() => handleClick('settings')}
            withRightIndicator
          />
          <Sidebar.ToggleMenuButton />
        </Sidebar.Footer>

      </Sidebar.Root>
    </Sidebar.Provider>
    </TooltipProvider>
  )
}
