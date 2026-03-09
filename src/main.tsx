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
import { EfficiencyProfilePage } from './pages/EfficiencyProfilePage'
import { IntegrationsPage } from './pages/IntegrationsPage'
import { CanvasPage } from './pages/CanvasPage'
import { ConfigurationPage } from './pages/ConfigurationPage'
import { InsightsPage2 } from './pages/InsightsPage2'
import { TeamsPage } from './pages/TeamsPage'
import { DevelopersPage } from './pages/DevelopersPage'
import { NavVariationsPage } from './pages/NavVariationsPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<GalleryLayout />}>
          <Route path="/" element={<App />} />
          <Route path="/tables" element={<TableGallery />} />
          <Route path="/gallery" element={<ComponentGallery />} />
        </Route>
        <Route path="/module/sei/insights" element={<InsightsPage />} />
        <Route path="/module/sei/insights2" element={<InsightsPage2 />} />
        <Route path="/module/sei/insights/harness/ai-insights" element={<AIInsightsPage />} />
        <Route path="/module/sei/insights/harness/business-alignment" element={<BusinessAlignmentPage />} />
        <Route path="/module/sei/insights/harness/efficiency-dora" element={<EfficiencyDoraPage />} />
        <Route path="/module/sei/insights/harness/efficiency-sprint-metrics" element={<SprintMetricsPage />} />
        <Route path="/module/sei/insights/harness/productivity" element={<ProductivityPage />} />
        <Route path="/module/sei/insights/harness/:slug" element={<HarnessReportPage />} />
        <Route path="/module/sei/insights/custom/:id" element={<CustomInsightPage />} />
        <Route path="/module/sei/insights/custom/:id/widget-builder" element={<WidgetBuilderPage />} />
        <Route path="/module/sei/canvas" element={<CanvasPage />} />
        <Route path="/module/sei/configuration" element={<ConfigurationPage />} />
        <Route path="/module/sei/configuration/org-tree" element={<OrgTreePage />} />
        <Route path="/module/sei/configuration/profile/efficiency" element={<EfficiencyProfilePage />} />
        <Route path="/module/sei/configuration/integration" element={<IntegrationsPage />} />
        <Route path="/module/sei/orgs/default/projects/harness_demo/teams" element={<TeamsPage />} />
        <Route path="/module/sei/configuration/developers" element={<DevelopersPage />} />
        <Route path="/nav-variations" element={<NavVariationsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
