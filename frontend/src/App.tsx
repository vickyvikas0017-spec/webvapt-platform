import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from './hooks/useApp'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { ProjectOverview } from './pages/ProjectOverview'
import { ReconPage } from './pages/ReconPage'
import {
  SQLiAssessment, XSSAssessment, CSRFAssessment, CORSAssessment,
  IDORAssessment, BOPLAAssessment, API4Assessment, SSRFAssessment
} from './pages/Assessments'
import { EvidenceManager } from './pages/EvidenceManager'
import { FindingsManager } from './pages/FindingsManager'
import { RiskAnalysis } from './pages/RiskAnalysis'
import { ReportGenerator } from './pages/ReportGenerator'
import { ProjectSettings } from './pages/ProjectSettings'

const App: React.FC = () => (
  <AppProvider>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="project" element={<ProjectOverview />} />
          <Route path="recon" element={<ReconPage />} />
          <Route path="sqli" element={<SQLiAssessment />} />
          <Route path="xss" element={<XSSAssessment />} />
          <Route path="csrf" element={<CSRFAssessment />} />
          <Route path="cors" element={<CORSAssessment />} />
          <Route path="idor" element={<IDORAssessment />} />
          <Route path="bopla" element={<BOPLAAssessment />} />
          <Route path="api4" element={<API4Assessment />} />
          <Route path="ssrf" element={<SSRFAssessment />} />
          <Route path="evidence" element={<EvidenceManager />} />
          <Route path="findings" element={<FindingsManager />} />
          <Route path="risk" element={<RiskAnalysis />} />
          <Route path="report" element={<ReportGenerator />} />
          <Route path="settings" element={<ProjectSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AppProvider>
)

export default App
