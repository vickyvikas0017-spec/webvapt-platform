import React, { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts'
import { getFindings, getFindingsSummary } from '../services/api'
import { Finding, CATEGORIES } from '../utils/types'
import { Card, SectionHeader, SeverityBadge } from '../components/UI'

const SEV_COLORS = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#3b82f6', Informational: '#94a3b8' }

const MARKING_SCHEME = [
  { criteria: 'Reconnaissance & Understanding', marks: 10, maxMarks: 10 },
  { criteria: 'Exploitation', marks: 20, maxMarks: 20 },
  { criteria: 'Evidence', marks: 20, maxMarks: 20 },
  { criteria: 'Explanation', marks: 20, maxMarks: 20 },
  { criteria: 'Report Quality', marks: 20, maxMarks: 20 },
  { criteria: 'Recommendations', marks: 10, maxMarks: 10 },
]

export const RiskAnalysis: React.FC = () => {
  const [findings, setFindings] = useState<Finding[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getFindings(), getFindingsSummary()])
      .then(([f, s]) => { setFindings(f); setSummary(s) })
      .finally(() => setLoading(false))
  }, [])

  const sevData = ['Critical', 'High', 'Medium', 'Low', 'Informational'].map(s => ({
    name: s, value: findings.filter(f => f.severity === s).length,
    color: SEV_COLORS[s as keyof typeof SEV_COLORS],
  })).filter(d => d.value > 0)

  const catData = CATEGORIES.map(c => ({
    name: c.slug.toUpperCase(),
    findings: summary?.by_category?.[c.slug] || 0,
  }))

  const radarData = CATEGORIES.map(c => ({
    category: c.slug.toUpperCase(),
    findings: summary?.by_category?.[c.slug] || 0,
  }))

  return (
    <div className="space-y-6">
      <SectionHeader title="Risk & Severity Analysis" subtitle="Vulnerability distribution and project completeness assessment" />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <>
          {/* Severity summary */}
          <div className="grid grid-cols-5 gap-3">
            {['Critical', 'High', 'Medium', 'Low', 'Informational'].map(sev => {
              const count = findings.filter(f => f.severity === sev).length
              return (
                <div key={sev} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold" style={{ color: SEV_COLORS[sev as keyof typeof SEV_COLORS] }}>{count}</div>
                  <SeverityBadge severity={sev} />
                </div>
              )
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <h3 className="font-semibold text-white mb-4">Findings by Severity</h3>
              {sevData.length === 0 ? (
                <div className="text-center py-12 text-slate-600">No findings yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={sevData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}>
                      {sevData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <h3 className="font-semibold text-white mb-4">Findings by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={catData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Bar dataKey="findings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Radar */}
          <Card>
            <h3 className="font-semibold text-white mb-4">Category Coverage Radar</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar name="Findings" dataKey="findings" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* Marking Scheme */}
          <Card>
            <h3 className="font-semibold text-white mb-2">📋 Marking Scheme Assessment</h3>
            <p className="text-slate-500 text-xs mb-5">
              Self-assessment checklist — not official marks. Use this to verify project completeness.
            </p>
            <div className="space-y-4">
              {MARKING_SCHEME.map(item => (
                <div key={item.criteria} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-white">{item.criteria}</span>
                      <span className="text-sm text-slate-400">{item.marks} marks</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(item.marks / item.maxMarks) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-slate-800">
                <span className="font-bold text-white">TOTAL</span>
                <span className="font-bold text-blue-400">100 marks</span>
              </div>
            </div>
          </Card>

          {/* Self-assessment checklist */}
          <Card>
            <h3 className="font-semibold text-white mb-4">✅ Project Completeness Checklist</h3>
            <div className="space-y-3">
              {CATEGORIES.map(cat => {
                const catFindings = findings.filter(f => f.category_slug === cat.slug)
                const hasFindings = catFindings.length > 0
                const hasPayload = catFindings.some(f => f.payload_used)
                const hasSteps = catFindings.some(f => f.steps_to_reproduce)
                const hasImpact = catFindings.some(f => f.impact)
                const hasRec = catFindings.some(f => f.recommendation)
                const score = [hasFindings, hasPayload, hasSteps, hasImpact, hasRec].filter(Boolean).length

                return (
                  <div key={cat.slug} className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span className="font-medium text-white text-sm">{cat.name}</span>
                      </div>
                      <span className="text-xs text-slate-400">{score}/5 criteria met</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        [hasFindings, 'Findings recorded'],
                        [hasPayload, 'Payload documented'],
                        [hasSteps, 'Steps to reproduce'],
                        [hasImpact, 'Impact assessed'],
                        [hasRec, 'Recommendations'],
                      ].map(([ok, label]) => (
                        <span key={label as string} className={`text-xs px-2 py-1 rounded ${ok ? 'bg-emerald-900/30 text-emerald-400' : 'bg-slate-900 text-slate-600'}`}>
                          {ok ? '✓' : '○'} {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
