import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FolderOpen, Search, Database, Zap, Shield, Globe,
  Key, Package, Cpu, Server, FileImage, AlertTriangle, BarChart3,
  FileText, Settings, ChevronLeft, ChevronRight, Bug
} from 'lucide-react'
import { useApp } from '../hooks/useApp'
import clsx from 'clsx'

const navItems = [
  { path: '/',              icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/project',       icon: FolderOpen,      label: 'Project Overview' },
  { path: '/recon',         icon: Search,           label: 'Reconnaissance' },
  { divider: true, label: 'Vulnerability Assessments' },
  { path: '/sqli',          icon: Database,         label: 'SQL Injection',   slug: 'sqli' },
  { path: '/xss',           icon: Zap,              label: 'XSS',             slug: 'xss' },
  { path: '/csrf',          icon: Shield,           label: 'CSRF',            slug: 'csrf' },
  { path: '/cors',          icon: Globe,            label: 'CORS',            slug: 'cors' },
  { path: '/idor',          icon: Key,              label: 'IDOR / API1',     slug: 'idor' },
  { path: '/bopla',         icon: Package,          label: 'API3 BOPLA',      slug: 'bopla' },
  { path: '/api4',          icon: Cpu,              label: 'API4 Resource',   slug: 'api4' },
  { path: '/ssrf',          icon: Server,           label: 'SSRF',            slug: 'ssrf' },
  { divider: true, label: 'Management' },
  { path: '/evidence',      icon: FileImage,        label: 'Evidence Manager' },
  { path: '/findings',      icon: AlertTriangle,    label: 'Findings' },
  { path: '/risk',          icon: BarChart3,        label: 'Risk Analysis' },
  { path: '/report',        icon: FileText,         label: 'Report Generator' },
  { path: '/settings',      icon: Settings,         label: 'Project Settings' },
]

export const Sidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useApp()
  const location = useLocation()

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-50 shadow-2xs',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200 min-h-[64px]">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs">
          <Bug size={18} className="text-white" />
        </div>
        {sidebarOpen && (
          <div>
            <div className="font-bold text-slate-900 text-sm leading-none">WebVAPT</div>
            <div className="text-slate-500 text-xs mt-0.5 font-medium">PortSwigger Academy</div>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="ml-auto text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {navItems.map((item, i) => {
          if ('divider' in item) {
            return sidebarOpen ? (
              <div key={i} className="px-4 py-2 mt-2">
                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            ) : <div key={i} className="my-1.5 mx-3 border-t border-slate-200" />
          }

          const Icon = item.icon!
          const active = location.pathname === item.path

          return (
            <NavLink
              key={item.path}
              to={item.path!}
              className={clsx(
                'flex items-center gap-3 px-3.5 py-2 mx-2 rounded-lg transition-all text-sm',
                active
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon size={16} className={clsx('flex-shrink-0', active ? 'text-blue-600' : 'text-slate-500')} />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Version */}
      {sidebarOpen && (
        <div className="px-4 py-3 border-t border-slate-200 text-xs text-slate-400 font-medium">
          WebVAPT v1.0 · Minor Project
        </div>
      )}
    </aside>
  )
}
