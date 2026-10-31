import React, { useEffect, useState } from 'react'
import { Save, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApp } from '../hooks/useApp'
import {
  getProject, getStudentsByProject, createProject, updateProject,
  createStudent, updateStudent
} from '../services/api'
import { Project, Student } from '../utils/types'
import { Card, Field, Input, Textarea, Button, SectionHeader, Alert } from '../components/UI'

export const ProjectSettings: React.FC = () => {
  const { projectId, setProjectId, refreshProjects } = useApp()
  const [project, setProject] = useState<Project | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)

  const [projForm, setProjForm] = useState({
    name: '', description: '', start_date: '', submission_date: ''
  })
  const [studForm, setStudForm] = useState({
    student_name: '', usn: '', college: '', department: '',
    batch: '', team_members: '', project_guide: ''
  })

  useEffect(() => {
    if (!projectId) return
    getProject(projectId).then(p => {
      setProject(p)
      setProjForm({ name: p.name, description: p.description || '', start_date: p.start_date || '', submission_date: p.submission_date || '' })
    })
    getStudentsByProject(projectId).then(students => {
      if (students.length > 0) {
        const s = students[0]
        setStudent(s)
        setStudForm({
          student_name: s.student_name || '', usn: s.usn || '',
          college: s.college || '', department: s.department || '',
          batch: s.batch || '', team_members: s.team_members || '',
          project_guide: s.project_guide || ''
        })
      }
    })
  }, [projectId])

  const handleCreateProject = async () => {
    if (!projForm.name) { toast.error('Project name required'); return }
    setCreating(true)
    try {
      const p = await createProject(projForm)
      setProjectId(p.id)
      setProject(p)
      await refreshProjects()
      toast.success('Project created!')
    } catch (e: any) { toast.error(e.message) }
    finally { setCreating(false) }
  }

  const handleSaveProject = async () => {
    if (!projectId) return
    setSaving(true)
    try {
      await updateProject(projectId, projForm)
      toast.success('Project updated!')
      refreshProjects()
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleSaveStudent = async () => {
    if (!projectId) return
    setSaving(true)
    try {
      if (student) {
        await updateStudent(student.id, studForm)
      } else {
        const s = await createStudent({ project_id: projectId, ...studForm })
        setStudent(s)
      }
      toast.success('Student information saved!')
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionHeader title="Project Settings" subtitle="Configure your WebVAPT project and student information" />

      {!projectId && (
        <Alert type="info">
          No project exists yet. Create a new project to get started.
        </Alert>
      )}

      {/* Project Info */}
      <Card>
        <h2 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-600 rounded text-xs font-bold flex items-center justify-center text-white">1</span>
          Project Information
        </h2>
        <div className="space-y-4">
          <Field label="Project Name" required>
            <Input value={projForm.name} onChange={e => setProjForm(p => ({ ...p, name: e.target.value }))}
              placeholder="WebVAPT – PortSwigger Web Security Academy VAPT" />
          </Field>
          <Field label="Description">
            <Textarea value={projForm.description} onChange={e => setProjForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Project description..." rows={3} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Start Date">
              <Input type="date" value={projForm.start_date} onChange={e => setProjForm(p => ({ ...p, start_date: e.target.value }))} />
            </Field>
            <Field label="Submission Date">
              <Input type="date" value={projForm.submission_date} onChange={e => setProjForm(p => ({ ...p, submission_date: e.target.value }))} />
            </Field>
          </div>
          <div className="flex gap-3 pt-2">
            {!projectId ? (
              <Button onClick={handleCreateProject} loading={creating}>
                <Plus size={15} /> Create Project
              </Button>
            ) : (
              <Button onClick={handleSaveProject} loading={saving}>
                <Save size={15} /> Save Project
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Student Info */}
      {projectId && (
        <Card>
          <h2 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-600 rounded text-xs font-bold flex items-center justify-center text-white">2</span>
            Student Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Student Name">
                <Input value={studForm.student_name} onChange={e => setStudForm(p => ({ ...p, student_name: e.target.value }))} placeholder="Full Name" />
              </Field>
              <Field label="USN / Registration No.">
                <Input value={studForm.usn} onChange={e => setStudForm(p => ({ ...p, usn: e.target.value }))} placeholder="1XX21CSXXX" />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="College">
                <Input value={studForm.college} onChange={e => setStudForm(p => ({ ...p, college: e.target.value }))} placeholder="College Name" />
              </Field>
              <Field label="Department">
                <Input value={studForm.department} onChange={e => setStudForm(p => ({ ...p, department: e.target.value }))} placeholder="CSE / ISE / ECE" />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Batch">
                <Input value={studForm.batch} onChange={e => setStudForm(p => ({ ...p, batch: e.target.value }))} placeholder="2021-25 Batch A" />
              </Field>
              <Field label="Project Guide">
                <Input value={studForm.project_guide} onChange={e => setStudForm(p => ({ ...p, project_guide: e.target.value }))} placeholder="Prof. Name" />
              </Field>
            </div>
            <Field label="Team Members" hint="One name per line or comma-separated">
              <Textarea value={studForm.team_members} onChange={e => setStudForm(p => ({ ...p, team_members: e.target.value }))} placeholder="Team member names..." rows={3} />
            </Field>
            <div className="pt-2">
              <Button onClick={handleSaveStudent} loading={saving}>
                <Save size={15} /> Save Student Info
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Project Selection */}
      {projectId && (
        <Card>
          <h2 className="font-semibold text-slate-800 mb-3">Active Project</h2>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-sm space-y-1">
            <p className="text-slate-600"><strong className="text-slate-800">Project ID:</strong> #{projectId}</p>
            <p className="text-slate-600"><strong className="text-slate-800">Project Name:</strong> {project?.name}</p>
          </div>
        </Card>
      )}
    </div>
  )
}
