// Shared types matching backend schemas

export interface Project {
  id: number
  name: string
  description: string
  start_date?: string
  submission_date?: string
  created_at?: string
}

export interface Student {
  id: number
  project_id: number
  student_name?: string
  usn?: string
  college?: string
  department?: string
  batch?: string
  team_members?: string
  project_guide?: string
}

export interface VulnCategory {
  id: number
  name: string
  slug: string
  description: string
  owasp_ref: string
  sort_order: number
}

export interface Lab {
  id: number
  project_id: number
  category_slug: string
  lab_name: string
  lab_url?: string
  objective?: string
  description?: string
  affected_endpoint?: string
  http_method?: string
  vulnerable_parameter?: string
  payload_used?: string
  original_request?: string
  modified_request?: string
  response_received?: string
  steps_to_reproduce?: string
  impact?: string
  recommendation?: string
  severity?: string
  status?: string
  completion_percentage?: number
  notes?: string
  extra_fields?: string
  created_at?: string
  updated_at?: string
}

export interface Finding {
  id: number
  lab_id: number
  finding_id?: string
  title: string
  vulnerability_category?: string
  category_slug?: string
  owasp_classification?: string
  lab_name?: string
  objective?: string
  description?: string
  affected_endpoint?: string
  affected_parameter?: string
  http_method?: string
  payload_used?: string
  steps_to_reproduce?: string
  impact?: string
  recommendation?: string
  severity?: string
  severity_justification?: string
  cvss_score?: number
  testing_status?: string
  remediation_status?: string
  discovery_date?: string
  burp_request_screenshot?: string
  burp_response_screenshot?: string
  proof_screenshot?: string
  created_at?: string
  updated_at?: string
}

export interface Evidence {
  id: number
  lab_id: number
  finding_id?: number
  evidence_type?: string
  filename?: string
  original_filename?: string
  file_path?: string
  file_size?: number
  mime_type?: string
  description?: string
  captured_at?: string
  created_at?: string
}

export interface ReconRecord {
  id: number
  lab_id: number
  lab_name?: string
  lab_url?: string
  vulnerability_category?: string
  lab_objective?: string
  application_behaviour?: string
  relevant_parameters?: string
  http_methods?: string
  identified_endpoints?: string
  observed_input_fields?: string
  auth_requirements?: string
  testing_observations?: string
  initial_hypothesis?: string
  user_roles?: string
  api_behaviour?: string
  input_handling?: string
  security_observations?: string
  testing_methodology?: string
  notes?: string
}

export interface CategoryStats {
  slug: string
  name: string
  status: string
  lab_name?: string
  lab_count: number
  completed_labs: number
  finding_count: number
  evidence_count: number
  completion_percentage: number
}

export interface DashboardStats {
  project?: Project
  student?: Student
  total_categories: number
  completed_assessments: number
  pending_assessments: number
  in_progress_assessments: number
  total_findings: number
  critical_findings: number
  high_findings: number
  medium_findings: number
  low_findings: number
  info_findings: number
  total_evidence: number
  overall_completion: number
  report_status?: string
  category_stats: CategoryStats[]
  recent_activities: any[]
}

export const SEVERITY_LEVELS = ['Critical', 'High', 'Medium', 'Low', 'Informational'] as const
export const ASSESSMENT_STATUSES = [
  'Not Started', 'In Progress', 'Evidence Pending', 'Tested',
  'Vulnerability Confirmed', 'Not Vulnerable', 'Blocked', 'Completed'
] as const
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const

export const CATEGORIES: { slug: string; name: string; icon: string; owasp: string }[] = [
  { slug: 'sqli',  name: 'SQL Injection',          icon: '🗄️', owasp: 'A03:2021' },
  { slug: 'xss',   name: 'Cross-Site Scripting',   icon: '⚡', owasp: 'A03:2021' },
  { slug: 'csrf',  name: 'CSRF',                   icon: '🔄', owasp: 'A01:2021' },
  { slug: 'cors',  name: 'CORS',                   icon: '🌐', owasp: 'A05:2021' },
  { slug: 'idor',  name: 'IDOR / API1',             icon: '🔑', owasp: 'API1:2023' },
  { slug: 'bopla', name: 'API3 BOPLA',             icon: '📦', owasp: 'API3:2023' },
  { slug: 'api4',  name: 'API4 Resource Consumption', icon: '⚙️', owasp: 'API4:2023' },
  { slug: 'ssrf',  name: 'SSRF',                   icon: '🌍', owasp: 'A10:2021' },
]

export const SEVERITY_COLORS: Record<string, string> = {
  Critical:      'text-red-700 bg-red-50 border-red-200',
  High:          'text-orange-700 bg-orange-50 border-orange-200',
  Medium:        'text-amber-700 bg-amber-50 border-amber-200',
  Low:           'text-blue-700 bg-blue-50 border-blue-200',
  Informational: 'text-slate-700 bg-slate-100 border-slate-200',
}

export const STATUS_COLORS: Record<string, string> = {
  'Not Started':           'text-slate-600 bg-slate-100 border-slate-200',
  'In Progress':           'text-blue-700 bg-blue-50 border-blue-200',
  'Evidence Pending':      'text-amber-700 bg-amber-50 border-amber-200',
  'Tested':                'text-purple-700 bg-purple-50 border-purple-200',
  'Vulnerability Confirmed': 'text-red-700 bg-red-50 border-red-200',
  'Not Vulnerable':        'text-green-700 bg-green-50 border-green-200',
  'Blocked':               'text-orange-700 bg-orange-50 border-orange-200',
  'Completed':             'text-emerald-700 bg-emerald-50 border-emerald-200',
}
