import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar, Text } from '@harnessio/ui/components'

const navItems = [
  { title: 'Dashboard', icon: 'dashboard' as const, to: '/' },
  { title: 'Users', icon: 'user' as const, to: '/users' },
  { title: 'Settings', icon: 'settings' as const, to: '/settings' },
]

export function AppLayout() {
  const location = useLocation()

  return (
    <Sidebar.Provider>
      <Sidebar.Root>
        <Sidebar.Header>
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
              <Text variant="body-strong" color="inherit" className="text-white text-sm">
                H
              </Text>
            </div>
            <Text variant="heading-subsection">Harness Dashboard</Text>
          </div>
        </Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Group>
            {navItems.map((item) => (
              <Sidebar.Item
                key={item.to}
                title={item.title}
                icon={item.icon}
                to={item.to}
                active={
                  item.to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.to)
                }
              />
            ))}
          </Sidebar.Group>
        </Sidebar.Content>
        <Sidebar.Footer>
          <Sidebar.Item
            title="Help & Support"
            icon="chat-bubble-question"
            onClick={() => window.open('https://harness-design.netlify.app', '_blank')}
          />
        </Sidebar.Footer>
        <Sidebar.Rail />
      </Sidebar.Root>
      <Sidebar.Inset>
        <main className="flex flex-1 flex-col p-6">
          <Outlet />
        </main>
      </Sidebar.Inset>
    </Sidebar.Provider>
  )
}
