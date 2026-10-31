import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts'
import {
  Shield, AlertTriangle, CheckCircle, Clock, Activity,
  FileText, Image, ExternalLink, Calendar, Users, GraduationCap
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
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
        <Shield size={64} className="text-blue-600 mb-4" />
        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">WEBVAPT</h1>
        <p className="text-slate-500 text-sm mb-4 font-mono tracking-wide">
          PORTSWIGGER WEB SECURITY ACADEMY MINOR PROJECT
        </p>
        <p className="text-slate-600 text-sm mb-6">No project found. Create your project to get started.</p>
        <Button onClick={() => navigate('/settings')} size="lg">
          Create Project
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const p = stats?.project
  const s = stats?.student

  const sevData = [
    { name: 'Critical', value: stats?.critical_findings || 0, color: '#dc2626' },
    { name: 'High', value: stats?.high_findings || 0, color: '#ea580c' },
    { name: 'Medium', value: stats?.medium_findings || 0, color: '#d97706' },
    { name: 'Low', value: stats?.low_findings || 0, color: '#2563eb' },
    { name: 'Info', value: stats?.info_findings || 0, color: '#64748b' },
  ]

  const catBarData = stats?.category_stats.map(c => ({
    name: c.slug.toUpperCase(),
    completion: c.completion_percentage,
    findings: c.finding_count,
  })) || []

  return (
    <div className="space-y-6">
      {/* ── Section 5: Application Heading & Project Metadata ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs">
                <Shield size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-wider">WEBVAPT</h1>
                <p className="text-blue-600 font-bold text-xs tracking-wider uppercase">
                  PortSwigger Web Security Academy Minor Project
                </p>
              </div>
            </div>
            <div className="mt-3 text-base text-slate-700 font-semibold">
              {p?.name || 'Vulnerability Assessment Platform'}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-3xl font-extrabold text-blue-600">{stats?.overall_completion || 0}%</div>
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Project Completion</div>
            </div>
            <div className="pl-6 border-l border-slate-200 text-right">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {stats?.report_status || 'Not Generated'}
              </div>
              <div className="text-slate-500 text-xs mt-1 font-medium">Report Status</div>
            </div>
          </div>
        </div>

        {/* Student & Project Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-blue-600 flex-shrink-0" />
            <div className="truncate">
              <span className="text-slate-500 font-medium">Student: </span>
              <span className="text-slate-800 font-semibold">{s?.student_name || 'N/A'}</span>
              {s?.usn && <span className="text-slate-500 font-normal"> ({s.usn})</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Shield size={16} className="text-blue-600 flex-shrink-0" />
            <div className="truncate">
              <span className="text-slate-500 font-medium">College: </span>
              <span className="text-slate-800 font-semibold">{s?.college || 'N/A'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-600 flex-shrink-0" />
            <div className="truncate">
              <span className="text-slate-500 font-medium">Batch & Team: </span>
              <span className="text-slate-800 font-semibold">
                {s?.batch || 'Batch A'}
                {s?.team_members ? ` · ${s.team_members.split('\n')[0]}` : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-blue-600 flex-shrink-0" />
            <div className="truncate">
              <span className="text-slate-500 font-medium">Start Date: </span>
              <span className="text-slate-800 font-semibold">{p?.start_date || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 5: Stat Counters Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard label="Categories" value={stats?.total_categories || 8} />
        <StatCard label="Completed" value={stats?.completed_assessments || 0} color="text-emerald-600" icon={<CheckCircle size={16} />} />
        <StatCard label="In Progress" value={stats?.in_progress_assessments || 0} color="text-blue-600" icon={<Activity size={16} />} />
        <StatCard label="Pending" value={stats?.pending_assessments || 0} color="text-slate-500" icon={<Clock size={16} />} />
        <StatCard label="Findings" value={stats?.total_findings || 0} color="text-amber-600" icon={<AlertTriangle size={16} />} />
        <StatCard label="Critical" value={stats?.critical_findings || 0} color="text-red-600" />
        <StatCard label="High" value={stats?.high_findings || 0} color="text-orange-600" />
        <StatCard label="Evidence" value={stats?.total_evidence || 0} color="text-purple-600" icon={<Image size={16} />} />
      </div>

      {/* Medium & Low Findings + Report Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <StatCard label="Medium Severity" value={stats?.medium_findings || 0} color="text-amber-600" />
        <StatCard label="Low Severity" value={stats?.low_findings || 0} color="text-blue-600" />
        <StatCard label="Informational" value={stats?.info_findings || 0} color="text-slate-600" />
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Report Generation</div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-bold text-slate-900">{stats?.report_status || 'Not Generated'}</span>
            <Button size="sm" variant="secondary" onClick={() => navigate('/report')} className="text-xs py-1 px-2.5">
              <FileText size={12} /> View Reports
            </Button>
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900 text-sm">Overall Assessment Completion</h2>
            <span className="text-xs text-slate-500">({stats?.completed_assessments || 0} of {stats?.total_categories || 8} completed)</span>
          </div>
          <span className="text-blue-600 font-extrabold text-base">{stats?.overall_completion || 0}%</span>
        </div>
        <ProgressBar value={stats?.overall_completion || 0} />
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <h3 className="font-bold text-slate-900 mb-4 text-sm">Findings by Severity</h3>
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
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-bold text-slate-900 mb-4 text-sm">Category Completion %</h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={catBarData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="completion" fill="#2563eb" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Section 5: Eight-Category Progress Cards ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Eight Vulnerability Categories Progress Cards</h2>
            <p className="text-xs text-slate-500">Practical workspaces for all eight required PortSwigger categories</p>
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
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-slate-900 leading-tight">{cat.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{cat.owasp}</div>
                      </div>
                    </div>
                    {catStat && <StatusBadge status={catStat.status} />}
                  </div>

                  {/* Lab Name display */}
                  <div className="bg-slate-50 rounded-lg px-2.5 py-1.5 my-2.5 border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Active Lab</div>
                    <div className="text-xs text-slate-800 font-semibold truncate" title={catStat?.lab_name || 'No lab recorded'}>
                      {catStat?.lab_name || 'No lab recorded'}
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Progress</span>
                      <span className="text-blue-600 font-bold">{catStat?.completion_percentage || 0}%</span>
                    </div>
                    <ProgressBar value={catStat?.completion_percentage || 0} />
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-medium">
                      <span>{catStat?.finding_count || 0} finding{catStat?.finding_count === 1 ? '' : 's'}</span>
                      <span>{catStat?.evidence_count || 0} screenshot{catStat?.evidence_count === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
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
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm">
            <Activity size={16} className="text-blue-600" />
            Recent Assessment Activity
          </h2>
          <div className="space-y-2">
            {stats.recent_activities.slice(0, 8).map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                <div className="flex-1 text-xs text-slate-700 font-medium">{a.description}</div>
                <div className="text-[11px] text-slate-400 font-medium flex-shrink-0">
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
