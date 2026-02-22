import type { ReactNode } from 'react'
import { Sidebar, TooltipProvider } from '@harnessio/ui/components'
import { Header } from './Breadcrumb2'

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
  children?: ReactNode
}

export function Nav2({ activeSection, children }: Nav2Props) {

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col">
        <Header />
        <Sidebar.Provider open defaultOpen>
          <Sidebar.Root>
            <Sidebar.Content>
            {/* Main nav */}
            <Sidebar.Group>
              <Sidebar.Item icon={'dashboard' as never} title="Home" to="/" />
              <Sidebar.Item icon={'clock-solid' as never} title="Activity" to="#" />
              <Sidebar.Item
                icon={'engineering-insights' as never}
                title="Engineering Insights"
                active={activeSection === 'insights' || activeSection === 'canvas' || activeSection === 'org-tree' || activeSection === 'teams' || activeSection === 'project' || activeSection === 'account-mgmt'}
              >
                <Sidebar.MenuSubItem
                  title="Insights"
                  to="/module/sei/insights"
                  active={activeSection === 'insights'}
                />
                <Sidebar.MenuSubItem
                  title="Canvas"
                  to="/module/sei/canvas"
                  active={activeSection === 'canvas'}
                />
                <Sidebar.MenuSubItem
                  title="Org Trees"
                  to="/module/sei/configuration/org-tree"
                  active={activeSection === 'org-tree'}
                />
                <Sidebar.MenuSubItem
                  title="Teams"
                  to="#"
                  active={activeSection === 'teams'}
                />
                <Sidebar.MenuSubItem
                  title="Project"
                  to="#"
                  active={activeSection === 'project'}
                />
                <Sidebar.MenuSubItem
                  title="Account Management"
                  to="#"
                  active={activeSection === 'account-mgmt'}
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
            <Sidebar.Item
              icon={'settings' as never}
              title="Settings"
              active={activeSection === 'settings'}
              withRightIndicator
              to="#"
            />
            <Sidebar.ToggleMenuButton />
          </Sidebar.Footer>

          <Sidebar.Rail />
        </Sidebar.Root>

          {/* Main content area */}
          <Sidebar.Inset className="rounded-tl-[6px]">
            {children}
          </Sidebar.Inset>
        </Sidebar.Provider>
      </div>
    </TooltipProvider>
  )
}
