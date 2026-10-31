import React, { useEffect, useState, useCallback } from 'react'
import {
  Plus, Save, Trash2, Upload, Eye, AlertCircle, CheckCircle,
  FileText, Code, Image
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getLabsByCategory, createLab, updateLab, deleteLab,
  getFindingsByLab, createFinding, updateFinding, deleteFinding,
  getEvidenceByLab, uploadEvidence, deleteEvidence, getEvidenceFileUrl,
  getHttpRequests, createHttpRequest, updateHttpRequest,
  getHttpResponses, createHttpResponse, updateHttpResponse,
} from '../services/api'
import {
  Lab, Finding, Evidence, SEVERITY_LEVELS, ASSESSMENT_STATUSES, HTTP_METHODS
} from '../utils/types'
import {
  Card, Field, Input, Textarea, CodeEditor, Select, Button,
  SeverityBadge, StatusBadge, ProgressBar, Alert
} from '../components/UI'

interface AssessmentWorkspaceProps {
  projectId: number
  categorySlug: string
  categoryName: string
  description: string
  workflowSteps: string[]
  specificFields?: string[]
  learningRefs?: { label: string; desc: string }[]
}

const OWASP_MAP: Record<string, string> = {
  sqli: 'OWASP A03:2021 – Injection',
  xss: 'OWASP A03:2021 – Injection',
  csrf: 'OWASP A01:2021 – Broken Access Control',
  cors: 'OWASP A05:2021 – Security Misconfiguration',
  idor: 'OWASP API1:2023 – Broken Object Level Authorization',
  bopla: 'OWASP API3:2023 – Broken Object Property Level Authorization',
  api4: 'OWASP API4:2023 – Unrestricted Resource Consumption',
  ssrf: 'OWASP A10:2021 – Server-Side Request Forgery',
}

const emptyLab = (projectId: number, slug: string): Partial<Lab> => ({
  project_id: projectId,
  category_slug: slug,
  lab_name: '',
  lab_url: '',
  objective: '',
  description: '',
  affected_endpoint: '',
  http_method: 'GET',
  vulnerable_parameter: '',
  payload_used: '',
  original_request: '',
  modified_request: '',
  response_received: '',
  steps_to_reproduce: '',
  impact: '',
  recommendation: '',
  severity: '',
  status: 'Not Started',
  notes: '',
})

export const AssessmentWorkspace: React.FC<AssessmentWorkspaceProps> = ({
  projectId, categorySlug, categoryName, description, workflowSteps, learningRefs
}) => {
  const [labs, setLabs] = useState<Lab[]>([])
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null)
  const [form, setForm] = useState<Partial<Lab>>(emptyLab(projectId, categorySlug))
  const [findings, setFindings] = useState<Finding[]>([])
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [httpReqs, setHttpReqs] = useState<any[]>([])
  const [httpResps, setHttpResps] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [showFindingForm, setShowFindingForm] = useState(false)
  const [findingForm, setFindingForm] = useState<Partial<Finding>>({})
  const [uploading, setUploading] = useState(false)
  const [section, setSection] = useState<'details' | 'http' | 'evidence' | 'findings'>('details')
  const [loading, setLoading] = useState(true)

  const loadLabs = useCallback(async () => {
    const data = await getLabsByCategory(projectId, categorySlug)
    setLabs(data)
    setLoading(false)
  }, [projectId, categorySlug])

  useEffect(() => { loadLabs() }, [loadLabs])

  const selectLab = async (lab: Lab) => {
    setSelectedLab(lab)
    setForm(lab)
    const [f, ev, reqs, resps] = await Promise.all([
      getFindingsByLab(lab.id),
      getEvidenceByLab(lab.id),
      getHttpRequests(lab.id),
      getHttpResponses(lab.id),
    ])
    setFindings(f)
    setEvidence(ev)
    setHttpReqs(reqs)
    setHttpResps(resps)
    setSection('details')
    setShowFindingForm(false)
  }

  const newLab = () => {
    setSelectedLab(null)
    setForm(emptyLab(projectId, categorySlug))
    setFindings([]); setEvidence([]); setHttpReqs([]); setHttpResps([])
  }

  const handleSave = async () => {
    if (!form.lab_name) { toast.error('Lab name is required'); return }
    setSaving(true)
    try {
      if (selectedLab) {
        const updated = await updateLab(selectedLab.id, form)
        setSelectedLab(updated)
        setForm(updated)
        setLabs(prev => prev.map(l => l.id === updated.id ? updated : l))
        toast.success('Lab saved!')
      } else {
        const newL = await createLab({ ...form, project_id: projectId, category_slug: categorySlug })
        setSelectedLab(newL)
        setForm(newL)
        setLabs(prev => [...prev, newL])
        toast.success('Lab created!')
      }
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!selectedLab || !confirm('Delete this lab and all its data?')) return
    await deleteLab(selectedLab.id)
    setLabs(prev => prev.filter(l => l.id !== selectedLab.id))
    newLab()
    toast.success('Lab deleted')
  }

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>, evType: string) => {
    if (!selectedLab || !e.target.files?.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', e.target.files[0])
      fd.append('lab_id', String(selectedLab.id))
      fd.append('evidence_type', evType)
      fd.append('captured_at', new Date().toISOString())
      const ev = await uploadEvidence(fd)
      setEvidence(prev => [...prev, ev])
      toast.success('Evidence uploaded!')
    } catch (e: any) { toast.error(e.message) }
    finally { setUploading(false) }
    e.target.value = ''
  }

  const handleDeleteEvidence = async (id: number) => {
    await deleteEvidence(id)
    setEvidence(prev => prev.filter(e => e.id !== id))
    toast.success('Evidence removed')
  }

  const handleSaveHttpReq = async (type: 'original' | 'modified', content: string) => {
    if (!selectedLab) return
    const existing = httpReqs.find(r => r.request_type === type)
    if (existing) { await updateHttpRequest(existing.id, { lab_id: selectedLab.id, request_type: type, content }) }
    else { const r = await createHttpRequest({ lab_id: selectedLab.id, request_type: type, content }); setHttpReqs(p => [...p, r]) }
    toast.success('Request saved')
  }

  const handleSaveHttpResp = async (content: string) => {
    if (!selectedLab) return
    const existing = httpResps[0]
    if (existing) { await updateHttpResponse(existing.id, { lab_id: selectedLab.id, content }) }
    else { const r = await createHttpResponse({ lab_id: selectedLab.id, content }); setHttpResps([r]) }
    toast.success('Response saved')
  }

  const handleCreateFinding = async () => {
    if (!selectedLab || !findingForm.title) { toast.error('Finding title required'); return }
    try {
      const f = await createFinding({
        lab_id: selectedLab.id,
        category_slug: categorySlug,
        vulnerability_category: categoryName,
        owasp_classification: OWASP_MAP[categorySlug],
        lab_name: selectedLab.lab_name,
        objective: selectedLab.objective,
        description: selectedLab.description,
        affected_endpoint: selectedLab.affected_endpoint,
        affected_parameter: selectedLab.vulnerable_parameter,
        http_method: selectedLab.http_method,
        payload_used: selectedLab.payload_used,
        steps_to_reproduce: selectedLab.steps_to_reproduce,
        impact: selectedLab.impact,
        recommendation: selectedLab.recommendation,
        severity: selectedLab.severity || 'Medium',
        discovery_date: new Date().toISOString().split('T')[0],
        ...findingForm,
      })
      setFindings(p => [...p, f])
      setShowFindingForm(false)
      setFindingForm({})
      toast.success(`Finding ${f.finding_id} created!`)
    } catch (e: any) { toast.error(e.message) }
  }

  const f = (key: keyof Lab) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }))

  const evByType = (type: string) => evidence.filter(e => e.evidence_type === type)
  const origReq = httpReqs.find(r => r.request_type === 'original')?.content || ''
  const modReq = httpReqs.find(r => r.request_type === 'modified')?.content || ''
  const resp = httpResps[0]?.content || ''

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{categoryName} Assessment</h1>
        <p className="text-slate-600 text-sm mt-1">{description}</p>
        <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full mt-2">
          {OWASP_MAP[categorySlug]}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Lab list */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-3">
          <Button variant="primary" size="sm" className="w-full justify-center" onClick={newLab}>
            <Plus size={14} /> New Lab Record
          </Button>

          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading labs...</div>
          ) : labs.length === 0 ? (
            <div className="text-center py-8 bg-white border border-dashed border-slate-200 rounded-xl text-slate-500 text-sm">
              No labs yet.<br />Create your first lab record.
            </div>
          ) : (
            labs.map(lab => (
              <button
                key={lab.id}
                onClick={() => selectLab(lab)}
                className={`w-full text-left rounded-xl p-3 border transition-all cursor-pointer shadow-2xs ${
                  selectedLab?.id === lab.id
                    ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/10'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-sm font-semibold text-slate-900 truncate">{lab.lab_name}</div>
                <div className="flex items-center gap-2 mt-1.5 mb-2">
                  <StatusBadge status={lab.status} />
                  {lab.severity && <SeverityBadge severity={lab.severity} />}
                </div>
                <ProgressBar value={lab.completion_percentage || 0} />
              </button>
            ))
          )}

          {/* Workflow */}
          <Card>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Assessment Workflow</h3>
            <ol className="space-y-2">
              {workflowSteps.map((step, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-600">
                  <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0 font-bold text-[11px] border border-slate-200">
                    {i + 1}
                  </span>
                  <span className="leading-tight pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* Main workspace */}
        <div className="flex-1 space-y-4">
          {/* Tab bar */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {[
              { id: 'details', label: 'Lab Details', icon: FileText },
              { id: 'http', label: 'HTTP Data', icon: Code },
              { id: 'evidence', label: `Evidence (${evidence.length})`, icon: Image },
              { id: 'findings', label: `Findings (${findings.length})`, icon: AlertCircle },
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setSection(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    section === tab.id
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* ── Details ──────────────────────────────────────────────── */}
          {section === 'details' && (
            <Card>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Lab Name" required>
                    <Input value={form.lab_name || ''} onChange={f('lab_name')} placeholder="Lab name from PortSwigger" />
                  </Field>
                  <Field label="Lab URL">
                    <Input value={form.lab_url || ''} onChange={f('lab_url')} placeholder="https://portswigger.net/web-security/..." />
                  </Field>
                </div>
                <Field label="Objective">
                  <Textarea value={form.objective || ''} onChange={f('objective')} rows={2} placeholder="Lab objective..." />
                </Field>
                <Field label="Description">
                  <Textarea value={form.description || ''} onChange={f('description')} rows={3} placeholder="Describe the vulnerability scenario..." />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Affected Endpoint">
                    <Input value={form.affected_endpoint || ''} onChange={f('affected_endpoint')} placeholder="/search?category=..." />
                  </Field>
                  <Field label="HTTP Method">
                    <Select value={form.http_method || 'GET'} onChange={f('http_method')}>
                      {HTTP_METHODS.map(m => <option key={m}>{m}</option>)}
                    </Select>
                  </Field>
                  <Field label="Vulnerable Parameter">
                    <Input value={form.vulnerable_parameter || ''} onChange={f('vulnerable_parameter')} placeholder="category, search, etc." />
                  </Field>
                </div>
                <Field label="Payload Used">
                  <CodeEditor value={form.payload_used || ''} onChange={f('payload_used')} placeholder="Enter the payload used in the lab..." rows={3} />
                </Field>
                <Field label="Steps to Reproduce">
                  <Textarea value={form.steps_to_reproduce || ''} onChange={f('steps_to_reproduce')} rows={5} placeholder="1. Open the lab URL&#10;2. Configure Burp Suite proxy&#10;3. ..." />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Impact">
                    <Textarea value={form.impact || ''} onChange={f('impact')} rows={3} placeholder="Describe the security impact..." />
                  </Field>
                  <Field label="Recommendation">
                    <Textarea value={form.recommendation || ''} onChange={f('recommendation')} rows={3} placeholder="How to fix this vulnerability..." />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Severity">
                    <Select value={form.severity || ''} onChange={f('severity')}>
                      <option value="">Select severity</option>
                      {SEVERITY_LEVELS.map(s => <option key={s}>{s}</option>)}
                    </Select>
                  </Field>
                  <Field label="Assessment Status">
                    <Select value={form.status || 'Not Started'} onChange={f('status')}>
                      {ASSESSMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </Select>
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Completion %" hint="0–100">
                    <Input type="number" min={0} max={100} value={form.completion_percentage ?? 0}
                      onChange={e => setForm(p => ({ ...p, completion_percentage: Number(e.target.value) }))} />
                  </Field>
                </div>
                <Field label="Notes">
                  <Textarea value={form.notes || ''} onChange={f('notes')} rows={2} placeholder="Additional notes..." />
                </Field>

                {form.status === 'Vulnerability Confirmed' && evidence.length === 0 && (
                  <Alert type="warning">
                    ⚠️ Status "Vulnerability Confirmed" requires at least one piece of evidence. Please upload a screenshot first.
                  </Alert>
                )}

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSave} loading={saving}>
                    <Save size={14} /> {selectedLab ? 'Save Changes' : 'Create Lab'}
                  </Button>
                  {selectedLab && (
                    <Button variant="danger" onClick={handleDelete}>
                      <Trash2 size={14} /> Delete Lab
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* ── HTTP Data ─────────────────────────────────────────────── */}
          {section === 'http' && (
            <div className="space-y-4">
              {!selectedLab && (
                <Alert type="info">Save the lab first to record HTTP data.</Alert>
              )}
              {selectedLab && (
                <>
                  <Card>
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Code size={16} className="text-blue-600" /> Original HTTP Request
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">Paste the original request copied directly from Burp Proxy / Repeater</p>
                    <HttpEditor initialValue={origReq} onSave={v => handleSaveHttpReq('original', v)} placeholder="GET /search?category=Accessories HTTP/1.1&#10;Host: target.web-security-academy.net&#10;Cookie: session=abc123..." />
                  </Card>
                  <Card>
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Code size={16} className="text-amber-600" /> Modified HTTP Request (with payload)
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">Paste the modified request containing your injected payload</p>
                    <HttpEditor initialValue={modReq} onSave={v => handleSaveHttpReq('modified', v)} placeholder="GET /search?category=Accessories'--  HTTP/1.1&#10;Host: target.web-security-academy.net&#10;..." />
                  </Card>
                  <Card>
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Code size={16} className="text-emerald-600" /> HTTP Response Received
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">Paste the server response received from Burp Repeater</p>
                    <HttpEditor initialValue={resp} onSave={handleSaveHttpResp} placeholder="HTTP/1.1 200 OK&#10;Content-Type: text/html&#10;..." />
                  </Card>
                </>
              )}
            </div>
          )}

          {/* ── Evidence ──────────────────────────────────────────────── */}
          {section === 'evidence' && (
            <Card>
              {!selectedLab ? (
                <Alert type="info">Save the lab first to upload evidence.</Alert>
              ) : (
                <div className="space-y-6">
                  <p className="text-slate-600 text-sm">
                    Upload Burp Suite screenshots and proof of exploitation. Supported: PNG, JPG, JPEG, PDF, TXT (max 20MB each).
                  </p>
                  {['burp_request', 'burp_response', 'proof', 'additional'].map(evType => (
                    <div key={evType} className="border-b border-slate-100 pb-5 last:border-0">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-slate-900 capitalize">
                          {evType === 'burp_request' ? '📸 Burp Request Screenshot' :
                           evType === 'burp_response' ? '📸 Burp Response Screenshot' :
                           evType === 'proof' ? '✅ Proof of Exploitation' : '📁 Additional Evidence'}
                        </h4>
                        <label className="cursor-pointer">
                          <input type="file" accept=".png,.jpg,.jpeg,.pdf,.txt" className="hidden"
                            onChange={e => handleEvidenceUpload(e, evType)} disabled={uploading} />
                          <Button variant="secondary" size="sm" as="span">
                            <Upload size={12} /> Upload
                          </Button>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {evByType(evType).map(ev => (
                          <EvidenceCard key={ev.id} evidence={ev} onDelete={() => handleDeleteEvidence(ev.id)} />
                        ))}
                        {evByType(evType).length === 0 && (
                          <div className="col-span-1 md:col-span-2 text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm bg-slate-50/50">
                            No {evType.replace('_', ' ')} uploaded yet
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* ── Findings ──────────────────────────────────────────────── */}
          {section === 'findings' && (
            <div className="space-y-4">
              {!selectedLab ? (
                <Alert type="info">Save the lab first to create findings.</Alert>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">Vulnerability Findings</h3>
                    <Button size="sm" onClick={() => setShowFindingForm(true)}>
                      <Plus size={14} /> Add Finding
                    </Button>
                  </div>

                  {showFindingForm && (
                    <Card>
                      <h4 className="font-bold text-slate-900 mb-4">New Finding Record</h4>
                      <div className="space-y-3">
                        <Field label="Title" required>
                          <Input value={findingForm.title || ''} onChange={e => setFindingForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g., SQL Injection in product search" />
                        </Field>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Field label="Severity">
                            <Select value={findingForm.severity || 'Medium'} onChange={e => setFindingForm(p => ({ ...p, severity: e.target.value }))}>
                              {SEVERITY_LEVELS.map(s => <option key={s}>{s}</option>)}
                            </Select>
                          </Field>
                          <Field label="Testing Status">
                            <Select value={findingForm.testing_status || 'Not Started'} onChange={e => setFindingForm(p => ({ ...p, testing_status: e.target.value }))}>
                              {ASSESSMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                            </Select>
                          </Field>
                        </div>
                        <Field label="Severity Justification">
                          <Textarea value={findingForm.severity_justification || ''} onChange={e => setFindingForm(p => ({ ...p, severity_justification: e.target.value }))} rows={2} placeholder="Justify the severity rating based on actual lab impact..." />
                        </Field>
                        <div className="flex gap-2 pt-2">
                          <Button onClick={handleCreateFinding}><CheckCircle size={14} /> Create Finding</Button>
                          <Button variant="ghost" onClick={() => setShowFindingForm(false)}>Cancel</Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  {findings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
                      No findings recorded yet for this lab.
                    </div>
                  ) : (
                    findings.map(f => (
                      <Card key={f.id} className="hover:border-slate-300 transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-blue-600 font-mono font-bold">{f.finding_id}</span>
                            <h4 className="font-bold text-slate-900 text-base">{f.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <SeverityBadge severity={f.severity} />
                            <StatusBadge status={f.testing_status} />
                          </div>
                        </div>
                        {f.description && <p className="text-slate-600 text-sm mt-2">{f.description}</p>}
                        {f.impact && <p className="text-slate-700 text-xs mt-1.5 font-medium"><strong className="text-slate-900">Impact:</strong> {f.impact}</p>}
                        {f.recommendation && <p className="text-slate-700 text-xs mt-1 font-medium"><strong className="text-slate-900">Recommendation:</strong> {f.recommendation}</p>}
                      </Card>
                    ))
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Learning References */}
      {learningRefs && learningRefs.length > 0 && (
        <Card>
          <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
            <span>📚</span> Educational & Learning References
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {learningRefs.map((ref, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                <div className="text-sm font-bold text-blue-700">{ref.label}</div>
                <div className="text-xs text-slate-600 mt-1">{ref.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ── HttpEditor sub-component ──────────────────────────────────────────────────

const HttpEditor: React.FC<{
  initialValue: string; onSave: (v: string) => void; placeholder?: string
}> = ({ initialValue, onSave, placeholder }) => {
  const [value, setValue] = useState(initialValue)
  useEffect(() => { setValue(initialValue) }, [initialValue])
  return (
    <div className="space-y-2">
      <CodeEditor value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder} rows={8} />
      <Button variant="secondary" size="sm" onClick={() => onSave(value)}>
        <Save size={12} /> Save HTTP Content
      </Button>
    </div>
  )
}

// ── EvidenceCard sub-component ────────────────────────────────────────────────

const EvidenceCard: React.FC<{ evidence: Evidence; onDelete: () => void }> = ({ evidence: ev, onDelete }) => {
  const isImage = ev.mime_type?.startsWith('image/')
  const url = getEvidenceFileUrl(ev.id)
  return (
    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
      {isImage ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img src={url} alt={ev.original_filename} className="w-full h-32 object-cover rounded-lg mb-2 border border-slate-100" />
        </a>
      ) : (
        <div className="h-24 flex items-center justify-center bg-slate-50 rounded-lg mb-2 border border-slate-100">
          <FileText size={24} className="text-slate-400" />
        </div>
      )}
      <div className="text-xs text-slate-800 font-semibold truncate">{ev.original_filename}</div>
      <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{ev.file_size ? `${(ev.file_size / 1024).toFixed(1)} KB` : ''}</div>
      <div className="flex gap-2 mt-2.5">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" size="sm"><Eye size={12} /> View</Button>
        </a>
        <Button variant="danger" size="sm" onClick={onDelete}><Trash2 size={12} /></Button>
      </div>
    </div>
  )
}
