import React, { useEffect, useState } from 'react'
import { AlertTriangle, Filter, Trash2, Edit3, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { getFindings, deleteFinding } from '../services/api'
import { Finding, SEVERITY_LEVELS, CATEGORIES } from '../utils/types'
import { Card, SeverityBadge, StatusBadge, Button, Input, Select, SectionHeader, EmptyState } from '../components/UI'

export const FindingsManager: React.FC = () => {
  const [findings, setFindings] = useState<Finding[]>([])
  const [filtered, setFiltered] = useState<Finding[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sevFilter, setSevFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getFindings()
      setFindings(data)
      setFiltered(data)
    } catch { toast.error('Failed to load findings') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    let f = findings
    if (search) f = f.filter(x => x.title?.toLowerCase().includes(search.toLowerCase()) || x.description?.toLowerCase().includes(search.toLowerCase()))
    if (sevFilter) f = f.filter(x => x.severity === sevFilter)
    if (catFilter) f = f.filter(x => x.category_slug === catFilter)
    setFiltered(f)
  }, [search, sevFilter, catFilter, findings])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this finding?')) return
    await deleteFinding(id)
    setFindings(p => p.filter(f => f.id !== id))
    toast.success('Finding deleted')
  }

  // Summary counts
  const total = findings.length
  const counts = Object.fromEntries(SEVERITY_LEVELS.map(s => [s, findings.filter(f => f.severity === s).length]))

  return (
    <div className="space-y-5">
      <SectionHeader title="Vulnerability Findings" subtitle="All findings from across all eight assessment categories" />

      {/* Severity summary */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: 'Total', count: total, color: 'text-white' },
          { label: 'Critical', count: counts.Critical, color: 'text-red-400' },
          { label: 'High', count: counts.High, color: 'text-orange-400' },
          { label: 'Medium', count: counts.Medium, color: 'text-yellow-400' },
          { label: 'Low', count: counts.Low, color: 'text-blue-400' },
          { label: 'Info', count: counts.Informational, color: 'text-slate-400' },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${color}`}>{count}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
          <Input className="pl-9" placeholder="Search findings..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={sevFilter} onChange={e => setSevFilter(e.target.value)} className="w-40">
          <option value="">All Severities</option>
          {SEVERITY_LEVELS.map(s => <option key={s}>{s}</option>)}
        </Select>
        <Select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="w-48">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<AlertTriangle size={48} />} title="No findings" description="Add findings from individual assessment workspaces." />
      ) : (
        <div className="space-y-3">
          {filtered.map(f => (
            <Card key={f.id} className="hover:border-slate-700 transition-colors">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(expanded === f.id ? null : f.id)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-blue-400">{f.finding_id}</span>
                  <div>
                    <h3 className="font-semibold text-white">{f.title}</h3>
                    <p className="text-xs text-slate-500">{f.vulnerability_category} · {f.lab_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={f.severity} />
                  <StatusBadge status={f.testing_status} />
                  <Button variant="danger" size="sm" onClick={e => { e.stopPropagation(); handleDelete(f.id) }}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>

              {expanded === f.id && (
                <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-sm">
                  {[
                    ['Lab Name', f.lab_name],
                    ['Category', f.vulnerability_category],
                    ['OWASP', f.owasp_classification],
                    ['Finding ID', f.finding_id],
                    ['Endpoint', f.affected_endpoint],
                    ['Parameter', f.affected_parameter],
                    ['HTTP Method', f.http_method],
                    ['Discovery Date', f.discovery_date],
                    ['Severity', f.severity],
                    ['CVSS Score', f.cvss_score ? String(f.cvss_score) : undefined],
                    ['Remediation Status', f.remediation_status],
                  ].map(([label, value]) => value ? (
                    <div key={label}>
                      <span className="text-slate-500">{label}: </span>
                      <span className="text-slate-200">{value}</span>
                    </div>
                  ) : null)}
                  <div className="col-span-2">
                    <span className="text-slate-500">Objective: </span>
                    <span className="text-slate-200">{f.objective}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Description: </span>
                    <span className="text-slate-200">{f.description}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Payload Used: </span>
                    <code className="text-emerald-300 text-xs bg-slate-900 px-2 py-1 rounded">{f.payload_used}</code>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Steps to Reproduce: </span>
                    <span className="text-slate-200 whitespace-pre-line">{f.steps_to_reproduce}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Impact: </span>
                    <span className="text-slate-200">{f.impact}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Recommendation: </span>
                    <span className="text-slate-200">{f.recommendation}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Severity Justification: </span>
                    <span className="text-slate-200">{f.severity_justification}</span>
                  </div>
                  {(f.burp_request_screenshot || f.burp_response_screenshot || f.proof_screenshot) && (
                    <div className="col-span-2 text-slate-500 text-xs">
                      Screenshots: {[f.burp_request_screenshot && 'Burp Request', f.burp_response_screenshot && 'Burp Response', f.proof_screenshot && 'Proof'].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
