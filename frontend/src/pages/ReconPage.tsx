import React, { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApp } from '../hooks/useApp'
import { getLabs, createRecon, getReconByLab, updateRecon } from '../services/api'
import { Lab } from '../utils/types'
import { Card, Field, Input, Textarea, Button, Select, SectionHeader, Alert } from '../components/UI'

const RECON_CHECKLIST = [
  'Understand lab objective',
  'Identify application type and technology',
  'Map all input fields',
  'Identify HTTP methods used',
  'Inspect request/response headers',
  'Identify authentication mechanism',
  'Map endpoints and parameters',
  'Understand user roles',
  'Form initial hypothesis',
  'Review PortSwigger lab description',
]

export const ReconPage: React.FC = () => {
  const { projectId } = useApp()
  const [labs, setLabs] = useState<Lab[]>([])
  const [selectedLabId, setSelectedLabId] = useState<number | null>(null)
  const [recon, setRecon] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})

  const [form, setForm] = useState({
    lab_name: '', lab_url: '', vulnerability_category: '',
    lab_objective: '', application_behaviour: '', relevant_parameters: '',
    http_methods: '', identified_endpoints: '', observed_input_fields: '',
    auth_requirements: '', testing_observations: '', initial_hypothesis: '',
    user_roles: '', api_behaviour: '', input_handling: '',
    security_observations: '', testing_methodology: '', notes: '',
  })

  useEffect(() => {
    if (!projectId) return
    getLabs(projectId).then(setLabs)
  }, [projectId])

  useEffect(() => {
    if (!selectedLabId) return
    const lab = labs.find(l => l.id === selectedLabId)
    if (lab) {
      setForm(f => ({ ...f, lab_name: lab.lab_name, lab_url: lab.lab_url || '', vulnerability_category: lab.category_slug }))
    }
    getReconByLab(selectedLabId).then(recs => {
      if (recs.length > 0) {
        const r = recs[0]
        setRecon(r)
        setForm({
          lab_name: r.lab_name || '', lab_url: r.lab_url || '',
          vulnerability_category: r.vulnerability_category || '',
          lab_objective: r.lab_objective || '',
          application_behaviour: r.application_behaviour || '',
          relevant_parameters: r.relevant_parameters || '',
          http_methods: r.http_methods || '',
          identified_endpoints: r.identified_endpoints || '',
          observed_input_fields: r.observed_input_fields || '',
          auth_requirements: r.auth_requirements || '',
          testing_observations: r.testing_observations || '',
          initial_hypothesis: r.initial_hypothesis || '',
          user_roles: r.user_roles || '',
          api_behaviour: r.api_behaviour || '',
          input_handling: r.input_handling || '',
          security_observations: r.security_observations || '',
          testing_methodology: r.testing_methodology || '',
          notes: r.notes || '',
        })
        if (r.checklist_completed) {
          const parsed: Record<string, boolean> = {}
          r.checklist_completed.split(',').forEach((item: string) => { if (item) parsed[item.trim()] = true })
          setChecklist(parsed)
        }
      } else {
        setRecon(null)
      }
    })
  }, [selectedLabId, labs])

  const handleSave = async () => {
    if (!selectedLabId) { toast.error('Select a lab first'); return }
    setSaving(true)
    const checklist_completed = Object.entries(checklist).filter(([, v]) => v).map(([k]) => k).join(',')
    const payload = { lab_id: selectedLabId, ...form, checklist_completed }
    try {
      if (recon) { await updateRecon(recon.id, payload); toast.success('Recon record updated!') }
      else { const r = await createRecon(payload); setRecon(r); toast.success('Recon record created!') }
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }))

  const checkedCount = Object.values(checklist).filter(Boolean).length

  if (!projectId) return <Alert type="warning">Please create a project in Settings first.</Alert>

  return (
    <div className="space-y-5">
      <SectionHeader title="Reconnaissance & Understanding" subtitle="Document your understanding of each lab before starting vulnerability testing" />

      <div className="flex flex-col md:flex-row gap-5">
        {/* Lab selector + checklist */}
        <div className="w-full md:w-80 flex-shrink-0 space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Select Lab</h3>
            <Select value={selectedLabId || ''} onChange={e => setSelectedLabId(Number(e.target.value))}>
              <option value="">Choose a lab...</option>
              {labs.map(l => <option key={l.id} value={l.id}>[{l.category_slug.toUpperCase()}] {l.lab_name}</option>)}
            </Select>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">Recon Checklist</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {checkedCount}/{RECON_CHECKLIST.length}
              </span>
            </div>
            <div className="space-y-2">
              {RECON_CHECKLIST.map(item => (
                <label key={item} className="flex items-center gap-2.5 cursor-pointer group hover:bg-slate-50 p-1.5 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist[item] || false}
                    onChange={e => setChecklist(p => ({ ...p, [item]: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-700 group-hover:text-slate-900 transition-colors">{item}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${(checkedCount / RECON_CHECKLIST.length) * 100}%` }} />
            </div>
          </Card>
        </div>

        {/* Form */}
        <Card className="flex-1">
          {!selectedLabId ? (
            <div className="text-center py-16 text-slate-400">Select a lab on the left to begin reconnaissance documentation</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Lab Name">
                  <Input value={form.lab_name} onChange={f('lab_name')} placeholder="PortSwigger lab name" />
                </Field>
                <Field label="Lab URL">
                  <Input value={form.lab_url} onChange={f('lab_url')} placeholder="https://portswigger.net/..." />
                </Field>
              </div>

              <Field label="Lab Objective">
                <Textarea value={form.lab_objective} onChange={f('lab_objective')} rows={2} placeholder="What is this lab testing?" />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Application Behaviour">
                  <Textarea value={form.application_behaviour} onChange={f('application_behaviour')} rows={3} placeholder="How does the application behave normally?" />
                </Field>
                <Field label="Relevant Parameters">
                  <Textarea value={form.relevant_parameters} onChange={f('relevant_parameters')} rows={3} placeholder="List URL/body parameters found" />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="HTTP Methods Observed">
                  <Input value={form.http_methods} onChange={f('http_methods')} placeholder="GET, POST, PUT..." />
                </Field>
                <Field label="Authentication Requirements">
                  <Input value={form.auth_requirements} onChange={f('auth_requirements')} placeholder="Session cookie, JWT, None..." />
                </Field>
              </div>

              <Field label="Identified Endpoints">
                <Textarea value={form.identified_endpoints} onChange={f('identified_endpoints')} rows={3} placeholder="/search, /product?id=, /api/users/..." />
              </Field>

              <Field label="Observed Input Fields">
                <Textarea value={form.observed_input_fields} onChange={f('observed_input_fields')} rows={2} placeholder="Search box, login form, URL parameter..." />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="User Roles">
                  <Input value={form.user_roles} onChange={f('user_roles')} placeholder="Anonymous, User, Admin..." />
                </Field>
                <Field label="API Behaviour">
                  <Input value={form.api_behaviour} onChange={f('api_behaviour')} placeholder="REST, GraphQL, SOAP..." />
                </Field>
              </div>

              <Field label="Input Handling Observations">
                <Textarea value={form.input_handling} onChange={f('input_handling')} rows={2} placeholder="How is user input processed? Is it reflected? Stored?" />
              </Field>

              <Field label="Testing Observations">
                <Textarea value={form.testing_observations} onChange={f('testing_observations')} rows={3} placeholder="What did you notice during initial browsing?" />
              </Field>

              <Field label="Initial Hypothesis">
                <Textarea value={form.initial_hypothesis} onChange={f('initial_hypothesis')} rows={2} placeholder="What vulnerability do you suspect and why?" />
              </Field>

              <Field label="Security Observations">
                <Textarea value={form.security_observations} onChange={f('security_observations')} rows={2} placeholder="Lack of input validation, missing headers, etc." />
              </Field>

              <Field label="Testing Methodology">
                <Textarea value={form.testing_methodology} onChange={f('testing_methodology')} rows={2} placeholder="Describe your planned testing approach..." />
              </Field>

              <Field label="Notes">
                <Textarea value={form.notes} onChange={f('notes')} rows={2} placeholder="Any additional notes..." />
              </Field>

              <div className="pt-2">
                <Button onClick={handleSave} loading={saving}>
                  <Save size={15} /> Save Recon Record
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
