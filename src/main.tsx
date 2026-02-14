import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import { GalleryLayout } from './layouts/GalleryLayout'
import { TableGallery } from './pages/TableGallery'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<GalleryLayout />}>
          <Route path="/" element={<App />} />
          <Route path="/tables" element={<TableGallery />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
