import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  r => r,
  err => {
    const msg = err.response?.data?.detail || err.message || 'Request failed'
    return Promise.reject(new Error(msg))
  }
)

// ── Projects ──────────────────────────────────────────────────────────────────
export const getProjects = () => api.get('/projects').then(r => r.data)
export const getProject = (id: number) => api.get(`/projects/${id}`).then(r => r.data)
export const createProject = (data: any) => api.post('/projects', data).then(r => r.data)
export const updateProject = (id: number, data: any) => api.put(`/projects/${id}`, data).then(r => r.data)

// ── Students ──────────────────────────────────────────────────────────────────
export const getStudentsByProject = (pid: number) => api.get(`/students/project/${pid}`).then(r => r.data)
export const createStudent = (data: any) => api.post('/students', data).then(r => r.data)
export const updateStudent = (id: number, data: any) => api.put(`/students/${id}`, data).then(r => r.data)

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboard = (pid: number) => api.get(`/dashboard/${pid}`).then(r => r.data)

// ── Categories ────────────────────────────────────────────────────────────────
export const getCategories = () => api.get('/categories').then(r => r.data)

// ── Labs ──────────────────────────────────────────────────────────────────────
export const getLabs = (pid: number) => api.get(`/labs/project/${pid}`).then(r => r.data)
export const getLabsByCategory = (pid: number, slug: string) =>
  api.get(`/labs/project/${pid}/category/${slug}`).then(r => r.data)
export const getLab = (id: number) => api.get(`/labs/${id}`).then(r => r.data)
export const createLab = (data: any) => api.post('/labs', data).then(r => r.data)
export const updateLab = (id: number, data: any) => api.put(`/labs/${id}`, data).then(r => r.data)
export const deleteLab = (id: number) => api.delete(`/labs/${id}`).then(r => r.data)

// ── Findings ──────────────────────────────────────────────────────────────────
export const getFindings = (params?: any) => api.get('/findings', { params }).then(r => r.data)
export const getFinding = (id: number) => api.get(`/findings/${id}`).then(r => r.data)
export const getFindingsByLab = (labId: number) => api.get(`/findings/lab/${labId}`).then(r => r.data)
export const createFinding = (data: any) => api.post('/findings', data).then(r => r.data)
export const updateFinding = (id: number, data: any) => api.put(`/findings/${id}`, data).then(r => r.data)
export const deleteFinding = (id: number) => api.delete(`/findings/${id}`).then(r => r.data)
export const getFindingsSummary = () => api.get('/findings-summary').then(r => r.data)

// ── Evidence ──────────────────────────────────────────────────────────────────
export const getEvidenceByLab = (labId: number) => api.get(`/evidence/lab/${labId}`).then(r => r.data)
export const getAllEvidence = () => api.get('/evidence/all').then(r => r.data)
export const uploadEvidence = (formData: FormData) =>
  api.post('/evidence/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
export const deleteEvidence = (id: number) => api.delete(`/evidence/${id}`).then(r => r.data)
export const getEvidenceFileUrl = (id: number) => `/api/evidence/${id}/file`

// ── Recon ─────────────────────────────────────────────────────────────────────
export const getReconByLab = (labId: number) => api.get(`/recon/lab/${labId}`).then(r => r.data)
export const createRecon = (data: any) => api.post('/recon', data).then(r => r.data)
export const updateRecon = (id: number, data: any) => api.put(`/recon/${id}`, data).then(r => r.data)

// ── HTTP Data ─────────────────────────────────────────────────────────────────
export const getHttpRequests = (labId: number) => api.get(`/http-requests/lab/${labId}`).then(r => r.data)
export const createHttpRequest = (data: any) => api.post('/http-requests', data).then(r => r.data)
export const updateHttpRequest = (id: number, data: any) => api.put(`/http-requests/${id}`, data).then(r => r.data)
export const getHttpResponses = (labId: number) => api.get(`/http-responses/lab/${labId}`).then(r => r.data)
export const createHttpResponse = (data: any) => api.post('/http-responses', data).then(r => r.data)
export const updateHttpResponse = (id: number, data: any) => api.put(`/http-responses/${id}`, data).then(r => r.data)
export const getPayloads = (labId: number) => api.get(`/payloads/lab/${labId}`).then(r => r.data)
export const createPayload = (data: any) => api.post('/payloads', data).then(r => r.data)

// ── Reports ───────────────────────────────────────────────────────────────────
export const generateReport = (data: any) => api.post('/reports/generate', data).then(r => r.data)
export const downloadReport = (reportId: number) => `/api/reports/${reportId}/download`
export const getProjectReports = (pid: number) => api.get(`/reports/project/${pid}`).then(r => r.data)
export const exportEvidence = (pid: number) => `/api/reports/export-evidence?project_id=${pid}`

export default api
