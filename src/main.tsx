import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import { GalleryLayout } from './layouts/GalleryLayout'
import { TableGallery } from './pages/TableGallery'
import { InsightsPage } from './pages/InsightsPage'
import { WidgetBuilderPage } from './pages/WidgetBuilderPage'
import { CanvasPage } from './pages/CanvasPage'
import { CustomInsightPage } from './pages/CustomInsightPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<GalleryLayout />}>
          <Route path="/" element={<App />} />
          <Route path="/tables" element={<TableGallery />} />
        </Route>
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/canvas" element={<CanvasPage />} />
        <Route path="/insights/custom/:id" element={<CustomInsightPage />} />
        <Route path="/insights/custom/:id/widget-builder" element={<WidgetBuilderPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
