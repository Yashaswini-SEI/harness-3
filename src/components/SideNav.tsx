import { useState } from 'react'
import { Sidebar, IconV2 } from '@harnessio/ui/components'

interface NavItem {
  id: string
  title: string
  icon: string
  active?: boolean
}

interface NavGroup {
  label: string
  items: NavItem[]
}

interface MoreDrawerCategory {
  label: string
  items: NavItem[]
}

interface SideNavProps {
  pinnedItems?: NavItem[]
  recentGroup?: NavGroup
  moreCategories?: MoreDrawerCategory[]
  onItemClick?: (id: string) => void
}

const defaultPinnedItems: NavItem[] = [
  { id: 'home', title: 'Home', icon: 'dashboard', active: true },
  { id: 'activity', title: 'Activity', icon: 'clock' },
]

const defaultRecentGroup: NavGroup = {
  label: 'Recent',
  items: [
    { id: 'security-tests', title: 'Security Tests', icon: 'security-tests' },
    { id: 'incidents', title: 'Incidents', icon: 'incidents' },
    { id: 'deployments', title: 'Deployments', icon: 'deployments' },
    { id: 'feature-flags', title: 'Feature Flags', icon: 'feature-flags' },
    { id: 'artifacts', title: 'Artifacts', icon: 'artifacts' },
  ],
}

const defaultMoreCategories: MoreDrawerCategory[] = [
  {
    label: 'DevOps',
    items: [
      { id: 'pipelines', title: 'Pipelines', icon: 'pipeline' },
      { id: 'databases', title: 'Databases', icon: 'databases' },
      { id: 'deployments-more', title: 'Deployments', icon: 'deployments' },
      { id: 'artifacts-more', title: 'Artifacts', icon: 'artifacts' },
      { id: 'builds', title: 'Builds', icon: 'builds' },
      { id: 'workspaces', title: 'Workspaces', icon: 'workspaces' },
      { id: 'portal', title: 'Portal', icon: 'portal' },
      { id: 'repositories', title: 'Repositories', icon: 'repository' },
      { id: 'infrastructure', title: 'Infrastructure', icon: 'infrastructure' },
      { id: 'ai-ml-ops', title: 'AI / ML Ops', icon: 'ai-ml-ops' },
    ],
  },
  {
    label: 'Security',
    items: [
      { id: 'security-testing', title: 'Security Testing', icon: 'security-tests' },
      { id: 'protection', title: 'Protection', icon: 'shield' },
      { id: 'ai-security', title: 'AI Security', icon: 'ai' },
      { id: 'security-posture', title: 'Security Posture', icon: 'security-pass' },
    ],
  },
  {
    label: 'Efficiency',
    items: [
      { id: 'cloud-costs', title: 'Cloud Costs', icon: 'cloud-costs' },
      { id: 'engineering-insights', title: 'Engineering Insights', icon: 'engineering-insights' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { id: 'dashboards', title: 'Dashboards', icon: 'dashboard' },
      { id: 'account', title: 'Account', icon: 'account' },
      { id: 'organization', title: 'Organization', icon: 'organizations' },
    ],
  },
  {
    label: 'Testing',
    items: [
      { id: 'feature-flags-more', title: 'Feature Flags', icon: 'feature-flags' },
      { id: 'incidents-more', title: 'Incidents', icon: 'incidents' },
      { id: 'chaos-tests', title: 'Chaos Tests', icon: 'chaos-tests' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { id: 'certificates', title: 'Certificates', icon: 'key' },
      { id: 'templates', title: 'Templates', icon: 'templates' },
      { id: 'environments', title: 'Environments', icon: 'environments' },
      { id: 'secrets', title: 'Secrets', icon: 'lock' },
      { id: 'connectors', title: 'Connectors', icon: 'connectors' },
      { id: 'delegates', title: 'Delegates', icon: 'delegates' },
      { id: 'policies', title: 'Policies', icon: 'shield' },
      { id: 'variables', title: 'Variables', icon: 'variables' },
      { id: 'services', title: 'Services', icon: 'services' },
      { id: 'webhooks', title: 'Webhooks', icon: 'webhook' },
    ],
  },
]

export function SideNav({
  pinnedItems = defaultPinnedItems,
  recentGroup = defaultRecentGroup,
  moreCategories = defaultMoreCategories,
  onItemClick,
}: SideNavProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>(
    pinnedItems.find((i) => i.active)?.id ?? ''
  )

  const handleClick = (id: string) => {
    setActiveId(id)
    onItemClick?.(id)
  }

  return (
    <div className="relative flex">
      <Sidebar.Provider defaultOpen>
        <Sidebar.Root className="!relative !h-auto" style={{ width: 256, minHeight: 600 }}>
          <Sidebar.Content>
            {/* Pinned items */}
            <Sidebar.Group>
              {pinnedItems.map((item) => (
                <Sidebar.Item
                  key={item.id}
                  title={item.title}
                  icon={item.icon as never}
                  active={activeId === item.id}
                  onClick={() => handleClick(item.id)}
                />
              ))}
              <Sidebar.Item
                title="More"
                icon={'menu-more-horizontal' as never}
                onClick={() => setMoreOpen(!moreOpen)}
                withRightIndicator
              />
            </Sidebar.Group>

            <Sidebar.Separator />

            {/* Recent group */}
            <Sidebar.Group label={recentGroup.label}>
              {recentGroup.items.map((item) => (
                <Sidebar.Item
                  key={item.id}
                  title={item.title}
                  icon={item.icon as never}
                  active={activeId === item.id}
                  onClick={() => handleClick(item.id)}
                />
              ))}
            </Sidebar.Group>
          </Sidebar.Content>

          <Sidebar.Footer>
            <Sidebar.Item
              title="Settings"
              icon={'settings' as never}
              active={activeId === 'settings'}
              onClick={() => handleClick('settings')}
              withRightIndicator
            />
          </Sidebar.Footer>
        </Sidebar.Root>
      </Sidebar.Provider>

      {/* More Drawer (popover) */}
      {moreOpen && (
        <div
          className="absolute top-0 z-50"
          style={{
            left: 228,
            width: 650,
            padding: '8px 12px',
            backgroundColor: '#FCFCFC',
            border: '1px solid #E7E8E9',
            borderRadius: 8,
            boxShadow:
              '0px 8px 10px -6px rgba(132, 136, 146, 0.08), 0px 20px 25px -5px rgba(132, 136, 146, 0.08)',
          }}
        >
          {/* Categories in flex-wrap 3-column layout */}
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            {moreCategories.map((category) => (
              <div
                key={category.label}
                style={{ width: 'calc(33.333% - 6px)' }}
              >
                {/* Category label — micro/normal style */}
                <div style={{ padding: '2px 2px 2px 14px' }}>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: 11.5,
                      lineHeight: '1.5em',
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      color: '#6B6F79',
                    }}
                  >
                    {category.label}
                  </span>
                </div>
                {/* Category items */}
                <div className="flex flex-col" style={{ gap: 2 }}>
                  {category.items.map((item) => (
                    <button
                      key={item.id}
                      className="flex items-center text-left transition-colors"
                      style={{
                        gap: 8,
                        padding: 2,
                        paddingLeft: 14,
                        borderRadius: 8,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: 14,
                        lineHeight: '1.14em',
                        letterSpacing: '-0.023em',
                        color: activeId === item.id ? '#0F1013' : '#343A47',
                        backgroundColor:
                          activeId === item.id
                            ? 'rgba(190, 195, 206, 0.15)'
                            : 'transparent',
                        width: '100%',
                      }}
                      onMouseEnter={(e) => {
                        if (activeId !== item.id)
                          e.currentTarget.style.backgroundColor =
                            'rgba(190, 195, 206, 0.10)'
                      }}
                      onMouseLeave={(e) => {
                        if (activeId !== item.id)
                          e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                      onClick={() => {
                        handleClick(item.id)
                        setMoreOpen(false)
                      }}
                    >
                      <IconV2 name={item.icon as never} size="sm" />
                      <span>{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Footer: "Go to settings" link */}
          <div
            className="flex flex-col"
            style={{
              gap: 2,
              paddingTop: 10,
              marginTop: 8,
              borderTop: '1px solid #E7E8E9',
            }}
          >
            <button
              className="flex items-center"
              style={{
                gap: 4,
                padding: '2px 2px 2px 14px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '1.14em',
                color: 'var(--cn-brand, #006DEA)',
              }}
              onClick={() => {
                handleClick('settings')
                setMoreOpen(false)
              }}
            >
              Go to settings
              <IconV2 name="arrow-right" size="xs" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
