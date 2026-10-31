from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


# ── Project ──────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    start_date: Optional[str] = ""
    submission_date: Optional[str] = ""

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    submission_date: Optional[str] = None

class ProjectOut(BaseModel):
    id: int
    name: str
    description: str
    start_date: Optional[str]
    submission_date: Optional[str]
    created_at: Optional[datetime]
    class Config:
        from_attributes = True


# ── Student ───────────────────────────────────────────────────────────────────

class StudentCreate(BaseModel):
    project_id: int
    student_name: Optional[str] = ""
    usn: Optional[str] = ""
    college: Optional[str] = ""
    department: Optional[str] = ""
    batch: Optional[str] = ""
    team_members: Optional[str] = ""
    project_guide: Optional[str] = ""

class StudentUpdate(BaseModel):
    student_name: Optional[str] = None
    usn: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    batch: Optional[str] = None
    team_members: Optional[str] = None
    project_guide: Optional[str] = None

class StudentOut(BaseModel):
    id: int
    project_id: int
    student_name: Optional[str]
    usn: Optional[str]
    college: Optional[str]
    department: Optional[str]
    batch: Optional[str]
    team_members: Optional[str]
    project_guide: Optional[str]
    class Config:
        from_attributes = True


# ── Lab ───────────────────────────────────────────────────────────────────────

class LabCreate(BaseModel):
    project_id: int
    category_slug: str
    lab_name: str
    lab_url: Optional[str] = ""
    objective: Optional[str] = ""
    description: Optional[str] = ""
    affected_endpoint: Optional[str] = ""
    http_method: Optional[str] = "GET"
    vulnerable_parameter: Optional[str] = ""
    payload_used: Optional[str] = ""
    original_request: Optional[str] = ""
    modified_request: Optional[str] = ""
    response_received: Optional[str] = ""
    steps_to_reproduce: Optional[str] = ""
    impact: Optional[str] = ""
    recommendation: Optional[str] = ""
    severity: Optional[str] = ""
    status: Optional[str] = "Not Started"
    notes: Optional[str] = ""
    extra_fields: Optional[str] = "{}"

class LabUpdate(BaseModel):
    lab_name: Optional[str] = None
    lab_url: Optional[str] = None
    objective: Optional[str] = None
    description: Optional[str] = None
    affected_endpoint: Optional[str] = None
    http_method: Optional[str] = None
    vulnerable_parameter: Optional[str] = None
    payload_used: Optional[str] = None
    original_request: Optional[str] = None
    modified_request: Optional[str] = None
    response_received: Optional[str] = None
    steps_to_reproduce: Optional[str] = None
    impact: Optional[str] = None
    recommendation: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    completion_percentage: Optional[int] = None
    notes: Optional[str] = None
    extra_fields: Optional[str] = None

class LabOut(BaseModel):
    id: int
    project_id: int
    category_slug: str
    lab_name: str
    lab_url: Optional[str]
    objective: Optional[str]
    description: Optional[str]
    affected_endpoint: Optional[str]
    http_method: Optional[str]
    vulnerable_parameter: Optional[str]
    payload_used: Optional[str]
    original_request: Optional[str]
    modified_request: Optional[str]
    response_received: Optional[str]
    steps_to_reproduce: Optional[str]
    impact: Optional[str]
    recommendation: Optional[str]
    severity: Optional[str]
    status: Optional[str]
    completion_percentage: Optional[int]
    notes: Optional[str]
    extra_fields: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True


# ── Recon ─────────────────────────────────────────────────────────────────────

class ReconCreate(BaseModel):
    lab_id: int
    lab_name: Optional[str] = ""
    lab_url: Optional[str] = ""
    vulnerability_category: Optional[str] = ""
    lab_objective: Optional[str] = ""
    application_behaviour: Optional[str] = ""
    relevant_parameters: Optional[str] = ""
    http_methods: Optional[str] = ""
    identified_endpoints: Optional[str] = ""
    observed_input_fields: Optional[str] = ""
    auth_requirements: Optional[str] = ""
    testing_observations: Optional[str] = ""
    initial_hypothesis: Optional[str] = ""
    user_roles: Optional[str] = ""
    api_behaviour: Optional[str] = ""
    input_handling: Optional[str] = ""
    security_observations: Optional[str] = ""
    testing_methodology: Optional[str] = ""
    checklist_completed: Optional[str] = ""
    notes: Optional[str] = ""

class ReconUpdate(ReconCreate):
    lab_id: Optional[int] = None

class ReconOut(ReconCreate):
    id: int
    created_at: Optional[datetime]
    class Config:
        from_attributes = True


# ── Finding ───────────────────────────────────────────────────────────────────

class FindingCreate(BaseModel):
    lab_id: int
    title: str
    vulnerability_category: Optional[str] = ""
    category_slug: Optional[str] = ""
    owasp_classification: Optional[str] = ""
    lab_name: Optional[str] = ""
    objective: Optional[str] = ""
    description: Optional[str] = ""
    affected_endpoint: Optional[str] = ""
    affected_parameter: Optional[str] = ""
    http_method: Optional[str] = "GET"
    payload_used: Optional[str] = ""
    steps_to_reproduce: Optional[str] = ""
    impact: Optional[str] = ""
    recommendation: Optional[str] = ""
    severity: Optional[str] = "Medium"
    severity_justification: Optional[str] = ""
    cvss_score: Optional[float] = 0.0
    testing_status: Optional[str] = "Not Started"
    remediation_status: Optional[str] = "Open"
    discovery_date: Optional[str] = ""
    burp_request_screenshot: Optional[str] = ""
    burp_response_screenshot: Optional[str] = ""
    proof_screenshot: Optional[str] = ""

class FindingUpdate(BaseModel):
    title: Optional[str] = None
    vulnerability_category: Optional[str] = None
    category_slug: Optional[str] = None
    owasp_classification: Optional[str] = None
    lab_name: Optional[str] = None
    objective: Optional[str] = None
    description: Optional[str] = None
    affected_endpoint: Optional[str] = None
    affected_parameter: Optional[str] = None
    http_method: Optional[str] = None
    payload_used: Optional[str] = None
    steps_to_reproduce: Optional[str] = None
    impact: Optional[str] = None
    recommendation: Optional[str] = None
    severity: Optional[str] = None
    severity_justification: Optional[str] = None
    cvss_score: Optional[float] = None
    testing_status: Optional[str] = None
    remediation_status: Optional[str] = None
    discovery_date: Optional[str] = None
    burp_request_screenshot: Optional[str] = None
    burp_response_screenshot: Optional[str] = None
    proof_screenshot: Optional[str] = None

class FindingOut(FindingCreate):
    id: int
    finding_id: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True


# ── Evidence ──────────────────────────────────────────────────────────────────

class EvidenceOut(BaseModel):
    id: int
    lab_id: int
    finding_id: Optional[int]
    evidence_type: Optional[str]
    filename: Optional[str]
    original_filename: Optional[str]
    file_path: Optional[str]
    file_size: Optional[int]
    mime_type: Optional[str]
    description: Optional[str]
    captured_at: Optional[str]
    created_at: Optional[datetime]
    class Config:
        from_attributes = True


# ── HTTP ──────────────────────────────────────────────────────────────────────

class HttpRequestCreate(BaseModel):
    lab_id: int
    request_type: Optional[str] = "original"
    content: str
    notes: Optional[str] = ""

class HttpRequestOut(HttpRequestCreate):
    id: int
    captured_at: Optional[datetime]
    class Config:
        from_attributes = True

class HttpResponseCreate(BaseModel):
    lab_id: int
    content: str
    status_code: Optional[int] = None
    notes: Optional[str] = ""

class HttpResponseOut(HttpResponseCreate):
    id: int
    captured_at: Optional[datetime]
    class Config:
        from_attributes = True


# ── Payload ───────────────────────────────────────────────────────────────────

class PayloadCreate(BaseModel):
    lab_id: int
    payload: str
    payload_type: Optional[str] = ""
    description: Optional[str] = ""
    result: Optional[str] = ""

class PayloadOut(PayloadCreate):
    id: int
    created_at: Optional[datetime]
    class Config:
        from_attributes = True


# ── Dashboard ─────────────────────────────────────────────────────────────────

class CategoryStats(BaseModel):
    slug: str
    name: str
    status: str
    lab_name: Optional[str] = "No lab recorded"
    lab_count: int
    completed_labs: int
    finding_count: int
    evidence_count: int
    completion_percentage: int

class DashboardStats(BaseModel):
    project: Optional[ProjectOut]
    student: Optional[StudentOut]
    total_categories: int
    completed_assessments: int
    pending_assessments: int
    in_progress_assessments: int
    total_findings: int
    critical_findings: int
    high_findings: int
    medium_findings: int
    low_findings: int
    info_findings: int
    total_evidence: int
    overall_completion: int
    report_status: Optional[str] = "Not Generated"
    category_stats: List[CategoryStats]
    recent_activities: List[Any]


# ── Report ────────────────────────────────────────────────────────────────────

class ReportRequest(BaseModel):
    project_id: int
    report_type: str  # pdf, docx
    include_evidence: bool = True
    include_incomplete: bool = True
