import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, Shield, Clock, CheckCircle, Activity, FileText } from 'lucide-react'
import { useApp } from '../hooks/useApp'
import { getDashboard } from '../services/api'
import { DashboardStats, CATEGORIES } from '../utils/types'
import { Card, SectionHeader, ProgressBar, StatusBadge, SeverityBadge, Button, Alert } from '../components/UI'
import toast from 'react-hot-toast'

export const ProjectOverview: React.FC = () => {
  const { projectId } = useApp()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) { setLoading(false); return }
    getDashboard(projectId)
      .then(setStats)
      .catch(() => toast.error('Failed to load project data'))
      .finally(() => setLoading(false))
  }, [projectId])

  if (!projectId) return <Alert type="warning">Please create a project in Settings first.</Alert>

  if (loading) return <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>

  const p = stats?.project
  const s = stats?.student

  return (
    <div className="space-y-6">
      <SectionHeader title="Project Overview" subtitle="Complete view of your WebVAPT minor project" />

      {/* Project info card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Shield size={16} className="text-blue-400" /> Project Details
          </h2>
          <div className="space-y-2 text-sm">
            {[
              ['Project Name', p?.name],
              ['Start Date', p?.start_date],
              ['Submission Date', p?.submission_date],
              ['Description', p?.description],
            ].map(([label, value]) => value ? (
              <div key={label} className="flex gap-2">
                <span className="text-slate-500 w-32 flex-shrink-0">{label}:</span>
                <span className="text-slate-200">{value}</span>
              </div>
            ) : null)}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <FileText size={16} className="text-blue-400" /> Student Details
          </h2>
          <div className="space-y-2 text-sm">
            {[
              ['Student Name', s?.student_name],
              ['USN', s?.usn],
              ['College', s?.college],
              ['Department', s?.department],
              ['Batch', s?.batch],
              ['Project Guide', s?.project_guide],
              ['Team Members', s?.team_members],
            ].map(([label, value]) => value ? (
              <div key={label} className="flex gap-2">
                <span className="text-slate-500 w-32 flex-shrink-0">{label}:</span>
                <span className="text-slate-200">{value}</span>
              </div>
            ) : null)}
          </div>
          <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate('/settings')}>
            Edit Details
          </Button>
        </Card>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Categories', value: stats?.total_categories || 8, icon: Shield, color: 'text-blue-400' },
          { label: 'Completed', value: stats?.completed_assessments || 0, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'In Progress', value: stats?.in_progress_assessments || 0, icon: Activity, color: 'text-yellow-400' },
          { label: 'Total Findings', value: stats?.total_findings || 0, icon: FileText, color: 'text-red-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <Icon size={20} className={color} />
              <div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">Overall Project Completion</h2>
          <span className="text-2xl font-bold text-blue-400">{stats?.overall_completion || 0}%</span>
        </div>
        <ProgressBar value={stats?.overall_completion || 0} />
      </Card>

      {/* Category progress table */}
      <Card>
        <h2 className="font-semibold text-white mb-4">Assessment Progress by Category</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['#', 'Category', 'OWASP Ref', 'Status', 'Labs', 'Findings', 'Evidence', 'Progress', 'Action'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-slate-400 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat, i) => {
                const cs = stats?.category_stats.find(c => c.slug === cat.slug)
                return (
                  <tr key={cat.slug} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 text-slate-500">{i + 1}</td>
                    <td className="py-3 px-3">
                      <span className="mr-2">{cat.icon}</span>
                      <span className="text-white font-medium">{cat.name}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{cat.owasp}</td>
                    <td className="py-3 px-3"><StatusBadge status={cs?.status || 'Not Started'} /></td>
                    <td className="py-3 px-3 text-slate-300">{cs?.lab_count || 0}</td>
                    <td className="py-3 px-3 text-slate-300">{cs?.finding_count || 0}</td>
                    <td className="py-3 px-3 text-slate-300">{cs?.evidence_count || 0}</td>
                    <td className="py-3 px-3 w-28">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={cs?.completion_percentage || 0} />
                        <span className="text-xs text-slate-400 w-8">{cs?.completion_percentage || 0}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/${cat.slug}`)}>
                        <ExternalLink size={12} /> Open
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

