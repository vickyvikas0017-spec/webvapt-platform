import React, { useEffect, useState } from 'react'
import { AlertTriangle, Trash2, Search } from 'lucide-react'
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
      <SectionHeader title="Vulnerability Findings" subtitle="Centralized repository of all confirmed and tested vulnerability findings" />

      {/* Severity summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'Total Findings', count: total, color: 'text-slate-900' },
          { label: 'Critical', count: counts.Critical, color: 'text-red-600' },
          { label: 'High', count: counts.High, color: 'text-orange-600' },
          { label: 'Medium', count: counts.Medium, color: 'text-amber-600' },
          { label: 'Low', count: counts.Low, color: 'text-blue-600' },
          { label: 'Informational', count: counts.Informational, color: 'text-slate-600' },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-2xs">
            <div className={`text-2xl font-extrabold ${color}`}>{count}</div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <Input className="pl-9" placeholder="Search findings by title, description or payload..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={sevFilter} onChange={e => setSevFilter(e.target.value)} className="w-44">
          <option value="">All Severities</option>
          {SEVERITY_LEVELS.map(s => <option key={s}>{s}</option>)}
        </Select>
        <Select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="w-56">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </Select>
      </div>

      {/* List of findings */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<AlertTriangle size={48} />} title="No findings matched" description="Try adjusting your search criteria or add new findings from the assessment workspaces." />
      ) : (
        <div className="space-y-3">
          {filtered.map(f => (
            <Card key={f.id} className="hover:border-slate-300 transition-all shadow-2xs">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(expanded === f.id ? null : f.id)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">{f.finding_id}</span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{f.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">{f.vulnerability_category} · {f.lab_name}</p>
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
                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {[
                    ['Lab Name', f.lab_name],
                    ['Category', f.vulnerability_category],
                    ['OWASP Classification', f.owasp_classification],
                    ['Finding ID', f.finding_id],
                    ['Affected Endpoint', f.affected_endpoint],
                    ['Vulnerable Parameter', f.affected_parameter],
                    ['HTTP Method', f.http_method],
                    ['Discovery Date', f.discovery_date],
                    ['Severity', f.severity],
                    ['CVSS Score', f.cvss_score ? String(f.cvss_score) : undefined],
                    ['Remediation Status', f.remediation_status],
                  ].map(([label, value]) => value ? (
                    <div key={label}>
                      <span className="text-slate-500 font-medium">{label}: </span>
                      <span className="text-slate-900 font-semibold">{value}</span>
                    </div>
                  ) : null)}
                  <div className="col-span-1 md:col-span-2">
                    <span className="text-slate-500 font-medium">Objective: </span>
                    <span className="text-slate-800">{f.objective}</span>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <span className="text-slate-500 font-medium">Description: </span>
                    <span className="text-slate-800">{f.description}</span>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <span className="text-slate-500 font-medium block mb-1">Payload Used: </span>
                    <code className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-xs px-2.5 py-1.5 rounded-lg font-mono block overflow-x-auto">{f.payload_used}</code>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <span className="text-slate-500 font-medium block mb-1">Steps to Reproduce: </span>
                    <span className="text-slate-800 whitespace-pre-line text-xs font-mono bg-slate-50 p-3 rounded-lg border border-slate-200 block">{f.steps_to_reproduce}</span>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <span className="text-slate-500 font-medium">Impact: </span>
                    <span className="text-slate-800 font-medium">{f.impact}</span>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <span className="text-slate-500 font-medium">Recommendation: </span>
                    <span className="text-slate-800 font-medium">{f.recommendation}</span>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <span className="text-slate-500 font-medium">Severity Justification: </span>
                    <span className="text-slate-800">{f.severity_justification}</span>
                  </div>
                  {(f.burp_request_screenshot || f.burp_response_screenshot || f.proof_screenshot) && (
                    <div className="col-span-1 md:col-span-2 text-slate-500 text-xs pt-1 border-t border-slate-100">
                      Screenshots Linked: {[f.burp_request_screenshot && 'Burp Request', f.burp_response_screenshot && 'Burp Response', f.proof_screenshot && 'Proof of Exploit'].filter(Boolean).join(', ')}
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
