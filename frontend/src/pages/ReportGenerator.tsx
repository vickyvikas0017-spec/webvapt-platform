import React, { useEffect, useState } from 'react'
import { Download, FileText, RefreshCw, CheckCircle, AlertCircle, File } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApp } from '../hooks/useApp'
import { generateReport, getProjectReports, exportEvidence } from '../services/api'
import { Card, Button, SectionHeader, Alert } from '../components/UI'

export const ReportGenerator: React.FC = () => {
  const { projectId } = useApp()
  const [reports, setReports] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [genType, setGenType] = useState<'pdf' | 'docx' | null>(null)

  const loadReports = async () => {
    if (!projectId) return
    try {
      const data = await getProjectReports(projectId)
      setReports(data)
    } catch {}
  }

  useEffect(() => { loadReports() }, [projectId])

  const handleGenerate = async (type: 'pdf' | 'docx') => {
    if (!projectId) { toast.error('No project selected'); return }
    setGenerating(true)
    setGenType(type)
    try {
      const result = await generateReport({ project_id: projectId, report_type: type, include_evidence: true, include_incomplete: true })
      toast.success(`${type.toUpperCase()} report generated!`)
      await loadReports()
      // Auto-download
      window.open(result.download_url, '_blank')
    } catch (e: any) {
      toast.error(`Report generation failed: ${e.message}`)
    } finally {
      setGenerating(false)
      setGenType(null)
    }
  }

  const handleExportEvidence = () => {
    if (!projectId) return
    const url = `/api/reports/export-evidence?project_id=${projectId}`
    window.open(url, '_blank')
    toast.success('Evidence ZIP download started')
  }

  const formatSize = (bytes: number) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionHeader
        title="VAPT Report Generator"
        subtitle="Generate professional PDF and DOCX reports combining all eight vulnerability assessments"
      />

      {!projectId && (
        <Alert type="warning">Please create and configure a project in Settings first.</Alert>
      )}

      <Alert type="info">
        Reports are automatically populated from your database — all labs, findings, and evidence you have recorded will be included.
        Incomplete assessments will be clearly labelled with their current status rather than fabricated results.
      </Alert>

      {/* Generation buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-4xl mb-3">📄</div>
          <h3 className="font-semibold text-white mb-1">PDF Report</h3>
          <p className="text-slate-400 text-xs mb-4">Professional PDF with cover page, ToC, all findings, charts and evidence index</p>
          <Button
            className="w-full justify-center"
            onClick={() => handleGenerate('pdf')}
            loading={generating && genType === 'pdf'}
            disabled={!projectId || generating}
          >
            <FileText size={14} /> Generate PDF
          </Button>
        </Card>

        <Card className="text-center">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="font-semibold text-white mb-1">DOCX Report</h3>
          <p className="text-slate-400 text-xs mb-4">Editable Word document with styled headings, tables and finding details</p>
          <Button
            className="w-full justify-center"
            variant="secondary"
            onClick={() => handleGenerate('docx')}
            loading={generating && genType === 'docx'}
            disabled={!projectId || generating}
          >
            <FileText size={14} /> Generate DOCX
          </Button>
        </Card>

        <Card className="text-center">
          <div className="text-4xl mb-3">🗜️</div>
          <h3 className="font-semibold text-white mb-1">Evidence ZIP</h3>
          <p className="text-slate-400 text-xs mb-4">Download all uploaded screenshots and evidence files as a ZIP archive</p>
          <Button
            className="w-full justify-center"
            variant="success"
            onClick={handleExportEvidence}
            disabled={!projectId}
          >
            <Download size={14} /> Export Evidence
          </Button>
        </Card>
      </div>

      {/* Report structure preview */}
      <Card>
        <h3 className="font-semibold text-white mb-4">📋 Report Structure</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            '1. Cover Page', '2. Abstract', '3. Project Introduction', '4. Project Objective',
            '5. Scope of Assessment', '6. Tools & Technologies', '7. Methodology',
            '8. Vulnerability Assessments (all 8 categories)',
            '9. Consolidated Findings', '10. Evidence & Screenshots',
            '11. Severity Classification', '12. Impact Analysis',
            '13. Recommendations', '14. Conclusion', '15. References',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-slate-300 py-1">
              <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </Card>

      {/* Past reports */}
      {reports.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Previously Generated Reports</h3>
            <Button variant="ghost" size="sm" onClick={loadReports}>
              <RefreshCw size={12} /> Refresh
            </Button>
          </div>
          <div className="space-y-2">
            {reports.map(r => (
              <div key={r.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <File size={16} className="text-blue-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{r.filename}</div>
                    <div className="text-xs text-slate-500">
                      {r.report_type?.toUpperCase()} · {formatSize(r.file_size)} · {new Date(r.generated_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <a href={`/api/reports/${r.id}/download`} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm">
                    <Download size={12} /> Download
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

