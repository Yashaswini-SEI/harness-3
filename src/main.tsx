import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import { GalleryLayout } from './layouts/GalleryLayout'
import { TableGallery } from './pages/TableGallery'
import { InsightsPage } from './pages/InsightsPage'
import { WidgetBuilderPage } from './pages/WidgetBuilderPage'
import { OrgTreePage } from './pages/OrgTreePage'
import { CustomInsightPage } from './pages/CustomInsightPage'
import { HarnessReportPage } from './pages/HarnessReportPage'
import { AIInsightsPage } from './pages/AIInsightsPage'
import { BusinessAlignmentPage } from './pages/BusinessAlignmentPage'
import { EfficiencyDoraPage } from './pages/EfficiencyDoraPage'
import { SprintMetricsPage } from './pages/SprintMetricsPage'
import { ProductivityPage } from './pages/ProductivityPage'
import { ComponentGallery } from './pages/ComponentGallery'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<GalleryLayout />}>
          <Route path="/" element={<App />} />
          <Route path="/tables" element={<TableGallery />} />
          <Route path="/gallery" element={<ComponentGallery />} />
        </Route>
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/config/org-tree" element={<OrgTreePage />} />
        <Route path="/insights/harness/ai-insights" element={<AIInsightsPage />} />
        <Route path="/insights/harness/business-alignment" element={<BusinessAlignmentPage />} />
        <Route path="/insights/harness/efficiency-dora" element={<EfficiencyDoraPage />} />
        <Route path="/insights/harness/efficiency-sprint-metrics" element={<SprintMetricsPage />} />
        <Route path="/insights/harness/productivity" element={<ProductivityPage />} />
        <Route path="/insights/harness/:slug" element={<HarnessReportPage />} />
        <Route path="/insights/custom/:id" element={<CustomInsightPage />} />
        <Route path="/insights/custom/:id/widget-builder" element={<WidgetBuilderPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
