import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts'
import {
  Shield, AlertTriangle, CheckCircle, Clock, Activity,
  FileText, Image, ExternalLink, Calendar, Users, GraduationCap,
  Sparkles
} from 'lucide-react'
import { useApp } from '../hooks/useApp'
import { getDashboard } from '../services/api'
import { DashboardStats, CATEGORIES } from '../utils/types'
import { StatCard, Card, ProgressBar, StatusBadge, Button } from '../components/UI'
import toast from 'react-hot-toast'

export const Dashboard: React.FC = () => {
  const { projectId } = useApp()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) { setLoading(false); return }
    getDashboard(projectId)
      .then(setStats)
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [projectId])

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Shield size={64} className="text-blue-500 mb-4" />
        <h1 className="text-3xl font-bold text-white mb-1">WEBVAPT</h1>
        <p className="text-slate-400 text-lg mb-4 font-mono text-sm tracking-wide">
          PORTSWIGGER WEB SECURITY ACADEMY MINOR PROJECT
        </p>
        <p className="text-slate-500 text-sm mb-6">No project found. Create your project to get started.</p>
        <Button onClick={() => navigate('/settings')} size="lg">
          Create Project
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  const p = stats?.project
  const s = stats?.student

  const sevData = [
    { name: 'Critical', value: stats?.critical_findings || 0, color: '#ef4444' },
    { name: 'High', value: stats?.high_findings || 0, color: '#f97316' },
    { name: 'Medium', value: stats?.medium_findings || 0, color: '#eab308' },
    { name: 'Low', value: stats?.low_findings || 0, color: '#3b82f6' },
    { name: 'Info', value: stats?.info_findings || 0, color: '#94a3b8' },
  ]

  const catBarData = stats?.category_stats.map(c => ({
    name: c.slug.toUpperCase(),
    completion: c.completion_percentage,
    findings: c.finding_count,
  })) || []

  return (
    <div className="space-y-6">
      {/* ── Section 5: Application Heading & Project Metadata ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                <Shield size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-wider">WEBVAPT</h1>
                <p className="text-blue-400 font-semibold text-xs tracking-wider uppercase">
                  PortSwigger Web Security Academy Minor Project
                </p>
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-300 font-medium">
              {p?.name || 'Vulnerability Assessment Platform'}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-3xl font-extrabold text-blue-400">{stats?.overall_completion || 0}%</div>
              <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Project Completion</div>
            </div>
            <div className="pl-6 border-l border-slate-800 text-right">
              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                {stats?.report_status || 'Not Generated'}
              </div>
              <div className="text-slate-500 text-xs mt-1 font-medium">Report Status</div>
            </div>
          </div>
        </div>

        {/* Student & Project Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <GraduationCap size={15} className="text-blue-400 flex-shrink-0" />
            <div className="truncate">
              <span className="text-slate-500">Student: </span>
              <span className="text-slate-200 font-medium">{s?.student_name || 'N/A'}</span>
              {s?.usn && <span className="text-slate-400"> ({s.usn})</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Shield size={15} className="text-blue-400 flex-shrink-0" />
            <div className="truncate">
              <span className="text-slate-500">College: </span>
              <span className="text-slate-200 font-medium">{s?.college || 'N/A'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users size={15} className="text-blue-400 flex-shrink-0" />
            <div className="truncate">
              <span className="text-slate-500">Batch & Team: </span>
              <span className="text-slate-200 font-medium">
                {s?.batch || 'Batch A'}
                {s?.team_members ? ` · ${s.team_members.split('\n')[0]}` : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-blue-400 flex-shrink-0" />
            <div className="truncate">
              <span className="text-slate-500">Start Date: </span>
              <span className="text-slate-200 font-medium">{p?.start_date || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 5: Stat Counters Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard label="Categories" value={stats?.total_categories || 8} />
        <StatCard label="Completed" value={stats?.completed_assessments || 0} color="text-emerald-400" icon={<CheckCircle size={16} />} />
        <StatCard label="In Progress" value={stats?.in_progress_assessments || 0} color="text-blue-400" icon={<Activity size={16} />} />
        <StatCard label="Pending" value={stats?.pending_assessments || 0} color="text-slate-400" icon={<Clock size={16} />} />
        <StatCard label="Findings" value={stats?.total_findings || 0} color="text-yellow-400" icon={<AlertTriangle size={16} />} />
        <StatCard label="Critical" value={stats?.critical_findings || 0} color="text-red-400" />
        <StatCard label="High" value={stats?.high_findings || 0} color="text-orange-400" />
        <StatCard label="Evidence" value={stats?.total_evidence || 0} color="text-purple-400" icon={<Image size={16} />} />
      </div>

      {/* Medium & Low Findings + Report Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <StatCard label="Medium Severity Findings" value={stats?.medium_findings || 0} color="text-yellow-400" />
        <StatCard label="Low Severity Findings" value={stats?.low_findings || 0} color="text-blue-400" />
        <StatCard label="Informational Findings" value={stats?.info_findings || 0} color="text-slate-400" />
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="text-xs text-slate-400 font-medium">Report Generation Status</div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-semibold text-white">{stats?.report_status || 'Not Generated'}</span>
            <Button size="sm" variant="ghost" onClick={() => navigate('/report')} className="text-xs py-1 px-2">
              <FileText size={12} /> View Reports
            </Button>
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-white text-sm">Overall Assessment Completion</h2>
            <span className="text-xs text-slate-500">({stats?.completed_assessments || 0} of {stats?.total_categories || 8} completed)</span>
          </div>
          <span className="text-blue-400 font-bold">{stats?.overall_completion || 0}%</span>
        </div>
        <ProgressBar value={stats?.overall_completion || 0} />
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <h3 className="font-semibold text-white mb-4 text-sm">Findings by Severity</h3>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={sevData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
              >
                {sevData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-white mb-4 text-sm">Category Completion %</h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={catBarData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="completion" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Section 5: Eight-Category Progress Cards ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-white text-lg">Eight Vulnerability Categories Progress Cards</h2>
            <p className="text-xs text-slate-400">Practical workspaces for all eight required PortSwigger categories</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/risk')}>
            View Risk & Marking Scheme
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => {
            const catStat = stats?.category_stats.find(c => c.slug === cat.slug)
            return (
              <div
                key={cat.slug}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-blue-700/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <div>
                        <div className="text-sm font-semibold text-white leading-tight">{cat.name}</div>
                        <div className="text-[11px] text-slate-500">{cat.owasp}</div>
                      </div>
                    </div>
                    {catStat && <StatusBadge status={catStat.status} />}
                  </div>

                  {/* Lab Name display */}
                  <div className="bg-slate-950/60 rounded px-2.5 py-1.5 my-2.5 border border-slate-800/80">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active Lab</div>
                    <div className="text-xs text-slate-300 font-medium truncate" title={catStat?.lab_name || 'No lab recorded'}>
                      {catStat?.lab_name || 'No lab recorded'}
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-blue-400 font-semibold">{catStat?.completion_percentage || 0}%</span>
                    </div>
                    <ProgressBar value={catStat?.completion_percentage || 0} />
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>{catStat?.finding_count || 0} finding{catStat?.finding_count === 1 ? '' : 's'}</span>
                      <span>{catStat?.evidence_count || 0} screenshot{catStat?.evidence_count === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-4 justify-center text-xs"
                  onClick={() => navigate(`/${cat.slug}`)}
                >
                  <ExternalLink size={12} />
                  Open Assessment
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recent_activities && stats.recent_activities.length > 0 && (
        <Card>
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
            <Activity size={16} className="text-blue-400" />
            Recent Assessment Activity
          </h2>
          <div className="space-y-2">
            {stats.recent_activities.slice(0, 8).map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b border-slate-800/80 last:border-0">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                <div className="flex-1 text-xs text-slate-300 font-medium">{a.description}</div>
                <div className="text-[11px] text-slate-500 flex-shrink-0">
                  {new Date(a.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
