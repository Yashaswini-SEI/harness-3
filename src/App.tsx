import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@harnessio/ui/context'
import type { FullTheme } from '@harnessio/ui/context'
import { AppLayout } from './components/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { UsersPage } from './pages/UsersPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  return (
    <ThemeProvider theme={'light-std-std' as FullTheme} setTheme={() => {}} isLightTheme={true}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
