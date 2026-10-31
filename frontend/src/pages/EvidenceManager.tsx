import React, { useEffect, useState } from 'react'
import { Image, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAllEvidence, deleteEvidence, getEvidenceFileUrl } from '../services/api'
import { Evidence } from '../utils/types'
import { Card, Button, SectionHeader, EmptyState } from '../components/UI'

const EV_TYPES = ['all', 'burp_request', 'burp_response', 'proof', 'additional']

export const EvidenceManager: React.FC = () => {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [filtered, setFiltered] = useState<Evidence[]>([])
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState<Evidence | null>(null)

  useEffect(() => {
    getAllEvidence()
      .then(d => { setEvidence(d); setFiltered(d) })
      .catch(() => toast.error('Failed to load evidence'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (typeFilter === 'all') setFiltered(evidence)
    else setFiltered(evidence.filter(e => e.evidence_type === typeFilter))
  }, [typeFilter, evidence])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this evidence file?')) return
    try {
      await deleteEvidence(id)
      setEvidence(p => p.filter(e => e.id !== id))
      toast.success('Evidence deleted')
    } catch (e: any) { toast.error(e.message) }
  }

  const labelFor = (type?: string) => ({
    burp_request: '📸 Burp Request',
    burp_response: '📸 Burp Response',
    proof: '✅ Proof of Exploitation',
    additional: '📁 Additional',
  }[type || ''] || type || 'Unknown')

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Burp Suite Evidence Manager"
        subtitle="Centralized evidence repository — screenshots, HTTP captures and proof files from all assessments"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {EV_TYPES.map(t => {
          const count = t === 'all' ? evidence.length : evidence.filter(e => e.evidence_type === t).length
          const active = typeFilter === t
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-xl p-4 text-center border transition-all cursor-pointer shadow-2xs ${
                active
                  ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/10'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`text-2xl font-black ${active ? 'text-blue-700' : 'text-slate-900'}`}>{count}</div>
              <div className="text-xs text-slate-500 font-semibold capitalize mt-1">
                {t === 'all' ? 'All Evidence' : t.replace('_', ' ')}
              </div>
            </button>
          )
        })}
      </div>

      {/* How-to guidance */}
      <Card>
        <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
          <span>📋</span> Manual Burp Suite Evidence Workflow
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            ['1. Intercept Request', 'Use Burp Proxy → Intercept → enable intercept, browse the lab target'],
            ['2. Send to Repeater', 'Right-click the captured request → Send to Repeater (Ctrl+R)'],
            ['3. Capture Original', 'Take screenshot of Repeater showing the pristine original request'],
            ['4. Modify & Test', 'Edit the payload in Repeater and send the modified request to test'],
            ['5. Capture Response', 'Take screenshot of the server response panel inside Repeater'],
            ['6. Proof Screenshot', 'Screenshot the lab solved notification / alert banner / leaked data'],
          ].map(([step, desc]) => (
            <div key={step} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="font-bold text-blue-700">{step}</div>
              <div className="text-slate-600 mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3 font-medium">
          Upload captured screenshots inside each lab's **Evidence** tab. Supported file formats: PNG, JPG, JPEG, PDF, TXT (up to 20MB per file).
        </p>
      </Card>

      {/* Grid of evidence */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Image size={48} />}
          title="No evidence uploaded yet"
          description="Upload screenshots from individual assessment workspaces (Lab → Evidence tab)."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(ev => {
            const isImage = ev.mime_type?.startsWith('image/')
            const fileUrl = getEvidenceFileUrl(ev.id)
            return (
              <div key={ev.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all shadow-2xs">
                {isImage ? (
                  <div className="relative h-44 bg-slate-100 cursor-pointer overflow-hidden border-b border-slate-100" onClick={() => setPreview(ev)}>
                    <img src={fileUrl} alt={ev.original_filename} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    <div className="absolute top-2 right-2">
                      <span className="bg-slate-900/80 backdrop-blur text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
                        {labelFor(ev.evidence_type)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center bg-slate-50 text-slate-500 border-b border-slate-100">
                    <Image size={32} className="mb-2 text-slate-400" />
                    <span className="text-xs font-semibold">{ev.mime_type}</span>
                  </div>
                )}
                <div className="p-3.5">
                  <div className="text-xs text-slate-900 font-bold truncate">{ev.original_filename}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    {ev.file_size ? `${(ev.file_size / 1024).toFixed(1)} KB` : ''} · Lab #{ev.lab_id}
                  </div>
                  {ev.description && <div className="text-xs text-slate-600 mt-1 truncate">{ev.description}</div>}
                  <div className="flex gap-2 mt-3 pt-2 border-t border-slate-100">
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full justify-center text-xs"><Eye size={12} /> View</Button>
                    </a>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(ev.id)}><Trash2 size={12} /></Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-6 cursor-pointer"
          onClick={() => setPreview(null)}
        >
          <div className="max-w-4xl max-h-full bg-white p-4 rounded-2xl shadow-2xl border border-slate-200" onClick={e => e.stopPropagation()}>
            <img
              src={getEvidenceFileUrl(preview.id)}
              alt={preview.original_filename}
              className="max-w-full max-h-[80vh] rounded-xl object-contain mx-auto"
            />
            <div className="text-center mt-3 text-slate-800 text-sm font-semibold">{preview.original_filename}</div>
          </div>
        </div>
      )}
    </div>
  )
}
