import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useApp } from '../hooks/useApp'
import { Home, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const breadcrumbMap: Record<string, string> = {
  '': 'Dashboard',
  project: 'Project Overview',
  recon: 'Reconnaissance',
  sqli: 'SQL Injection',
  xss: 'XSS Assessment',
  csrf: 'CSRF Assessment',
  cors: 'CORS Assessment',
  idor: 'IDOR / API1',
  bopla: 'API3 BOPLA',
  api4: 'API4 Resource Consumption',
  ssrf: 'SSRF Assessment',
  evidence: 'Evidence Manager',
  findings: 'Vulnerability Findings',
  risk: 'Risk Analysis',
  report: 'Report Generator',
  settings: 'Project Settings',
}

export const Layout: React.FC = () => {
  const { sidebarOpen } = useApp()
  const location = useLocation()
  const parts = location.pathname.split('/').filter(Boolean)

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className={clsx(
        'flex-1 transition-all duration-300 min-h-screen bg-slate-50',
        sidebarOpen ? 'ml-64' : 'ml-16'
      )}>
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-3.5 flex items-center gap-2 shadow-2xs">
          <Home size={14} className="text-slate-400" />
          <ChevronRight size={14} className="text-slate-300" />
          {parts.length === 0 ? (
            <span className="text-sm font-semibold text-slate-800">Dashboard</span>
          ) : (
            parts.map((part, i) => (
              <React.Fragment key={part}>
                <span className={clsx(
                  'text-sm font-medium',
                  i === parts.length - 1 ? 'text-blue-600 font-semibold' : 'text-slate-500'
                )}>
                  {breadcrumbMap[part] || part}
                </span>
                {i < parts.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
              </React.Fragment>
            ))
          )}
        </header>

        {/* Page content */}
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
