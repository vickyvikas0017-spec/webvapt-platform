import React, { useEffect, useState } from 'react'
import { Image, Trash2, Eye, Upload, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAllEvidence, deleteEvidence, getEvidenceFileUrl } from '../services/api'
import { Evidence } from '../utils/types'
import { Card, Button, SectionHeader, Select, EmptyState } from '../components/UI'

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
      <div className="grid grid-cols-5 gap-3">
        {EV_TYPES.map(t => {
          const count = t === 'all' ? evidence.length : evidence.filter(e => e.evidence_type === t).length
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-xl p-4 text-center border transition-all ${
                typeFilter === t ? 'bg-blue-900/30 border-blue-700/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-2xl font-bold text-white">{count}</div>
              <div className="text-xs text-slate-400 capitalize mt-1">
                {t === 'all' ? 'All' : t.replace('_', ' ')}
              </div>
            </button>
          )
        })}
      </div>

      {/* How-to guidance */}
      <Card>
        <h3 className="font-semibold text-white mb-3 text-sm">📋 Manual Burp Suite Evidence Workflow</h3>
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
          {[
            ['1. Intercept Request', 'Use Burp Proxy → Intercept → enable intercept, browse the lab'],
            ['2. Send to Repeater', 'Right-click request → Send to Repeater'],
            ['3. Capture Original', 'Screenshot Repeater showing original request'],
            ['4. Modify & Test', 'Edit payload in Repeater, send modified request'],
            ['5. Capture Response', 'Screenshot the response panel in Repeater'],
            ['6. Proof Screenshot', 'Screenshot the lab success page / alert / data leaked'],
          ].map(([step, desc]) => (
            <div key={step} className="bg-slate-800/50 rounded p-2">
              <div className="font-medium text-blue-300">{step}</div>
              <div>{desc}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-3">
          Upload your captured screenshots to the relevant lab's Evidence tab. Supported: PNG, JPG, JPEG, PDF, TXT (max 20MB)
        </p>
      </Card>

      {/* Grid of evidence */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Image size={48} />}
          title="No evidence uploaded yet"
          description="Upload screenshots from individual assessment workspaces (Lab → Evidence tab)"
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(ev => {
            const isImage = ev.mime_type?.startsWith('image/')
            const fileUrl = getEvidenceFileUrl(ev.id)
            return (
              <div key={ev.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors">
                {isImage ? (
                  <div className="relative h-40 bg-slate-800 cursor-pointer" onClick={() => setPreview(ev)}>
                    <img src={fileUrl} alt={ev.original_filename} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2">
                      <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                        {labelFor(ev.evidence_type)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center bg-slate-800 text-slate-400">
                    <Image size={32} className="mb-2" />
                    <span className="text-xs">{ev.mime_type}</span>
                  </div>
                )}
                <div className="p-3">
                  <div className="text-xs text-white font-medium truncate">{ev.original_filename}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {ev.file_size ? `${(ev.file_size / 1024).toFixed(1)} KB` : ''} · Lab #{ev.lab_id}
                  </div>
                  {ev.description && <div className="text-xs text-slate-400 mt-1 truncate">{ev.description}</div>}
                  <div className="flex gap-1 mt-2">
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full justify-center"><Eye size={11} /></Button>
                    </a>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(ev.id)}><Trash2 size={11} /></Button>
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
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setPreview(null)}
        >
          <div className="max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            <img
              src={getEvidenceFileUrl(preview.id)}
              alt={preview.original_filename}
              className="max-w-full max-h-[85vh] rounded-lg"
            />
            <div className="text-center mt-3 text-slate-300 text-sm">{preview.original_filename}</div>
          </div>
        </div>
      )}
    </div>
  )
}

