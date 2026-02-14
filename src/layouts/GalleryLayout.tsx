import { useState, useEffect } from 'react'
import { Button, IconV2 } from '@harnessio/ui/components'
import { Outlet } from 'react-router-dom'

export function GalleryLayout() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-std-low')
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light-std-low', 'dark-std-low')
    root.classList.add(dark ? 'dark-std-low' : 'light-std-low')
  }, [dark])

  return (
    <div className="min-h-screen bg-surface-0 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setDark(!dark)}>
            <IconV2 name={dark ? 'sun-light' : 'half-moon'} size="sm" />
            {dark ? 'Light' : 'Dark'}
          </Button>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
