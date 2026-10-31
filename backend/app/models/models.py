from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Float, Boolean,
    ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.database import Base


class SeverityLevel(str, enum.Enum):
    critical = "Critical"
    high = "High"
    medium = "Medium"
    low = "Low"
    informational = "Informational"


class AssessmentStatus(str, enum.Enum):
    not_started = "Not Started"
    in_progress = "In Progress"
    evidence_pending = "Evidence Pending"
    tested = "Tested"
    vulnerability_confirmed = "Vulnerability Confirmed"
    not_vulnerable = "Not Vulnerable"
    blocked = "Blocked"
    completed = "Completed"


class VulnCategory(str, enum.Enum):
    sqli = "SQL Injection"
    xss = "Cross-Site Scripting"
    csrf = "CSRF"
    cors = "CORS"
    idor = "IDOR / API1"
    bopla = "API3 BOPLA"
    api4 = "API4 Resource Consumption"
    ssrf = "SSRF"


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    start_date = Column(String(50))
    submission_date = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    students = relationship("Student", back_populates="project", cascade="all, delete-orphan")
    labs = relationship("Lab", back_populates="project", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="project", cascade="all, delete-orphan")


class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    student_name = Column(String(255))
    usn = Column(String(50))
    college = Column(String(255))
    department = Column(String(255))
    batch = Column(String(100))
    team_members = Column(Text, default="")
    project_guide = Column(String(255))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    project = relationship("Project", back_populates="students")


class VulnerabilityCategory(Base):
    __tablename__ = "vulnerability_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(50), unique=True, nullable=False)
    description = Column(Text, default="")
    owasp_ref = Column(String(100))
    sort_order = Column(Integer, default=0)

    labs = relationship("Lab", back_populates="category")


class Lab(Base):
    __tablename__ = "labs"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("vulnerability_categories.id"))
    category_slug = Column(String(50), nullable=False)
    lab_name = Column(String(255), nullable=False)
    lab_url = Column(String(500), default="")
    objective = Column(Text, default="")
    description = Column(Text, default="")
    affected_endpoint = Column(String(500), default="")
    http_method = Column(String(20), default="GET")
    vulnerable_parameter = Column(String(255), default="")
    payload_used = Column(Text, default="")
    original_request = Column(Text, default="")
    modified_request = Column(Text, default="")
    response_received = Column(Text, default="")
    steps_to_reproduce = Column(Text, default="")
    impact = Column(Text, default="")
    recommendation = Column(Text, default="")
    severity = Column(String(50), default="")
    status = Column(String(50), default="Not Started")
    completion_percentage = Column(Integer, default=0)
    notes = Column(Text, default="")
    # Category-specific fields stored as JSON text
    extra_fields = Column(Text, default="{}")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    project = relationship("Project", back_populates="labs")
    category = relationship("VulnerabilityCategory", back_populates="labs")
    findings = relationship("Finding", back_populates="lab", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="lab", cascade="all, delete-orphan")
    reconnaissance = relationship("ReconnaissanceRecord", back_populates="lab", cascade="all, delete-orphan")
    http_requests = relationship("HttpRequest", back_populates="lab", cascade="all, delete-orphan")
    http_responses = relationship("HttpResponse", back_populates="lab", cascade="all, delete-orphan")
    payload_records = relationship("PayloadRecord", back_populates="lab", cascade="all, delete-orphan")


class ReconnaissanceRecord(Base):
    __tablename__ = "reconnaissance_records"
    id = Column(Integer, primary_key=True, index=True)
    lab_id = Column(Integer, ForeignKey("labs.id"), nullable=False)
    lab_name = Column(String(255))
    lab_url = Column(String(500))
    vulnerability_category = Column(String(100))
    lab_objective = Column(Text, default="")
    application_behaviour = Column(Text, default="")
    relevant_parameters = Column(Text, default="")
    http_methods = Column(Text, default="")
    identified_endpoints = Column(Text, default="")
    observed_input_fields = Column(Text, default="")
    auth_requirements = Column(Text, default="")
    testing_observations = Column(Text, default="")
    initial_hypothesis = Column(Text, default="")
    user_roles = Column(Text, default="")
    api_behaviour = Column(Text, default="")
    input_handling = Column(Text, default="")
    security_observations = Column(Text, default="")
    testing_methodology = Column(Text, default="")
    # Checklist booleans stored as comma-separated
    checklist_completed = Column(Text, default="")
    notes = Column(Text, default="")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    lab = relationship("Lab", back_populates="reconnaissance")


class AssessmentSession(Base):
    __tablename__ = "assessment_sessions"
    id = Column(Integer, primary_key=True, index=True)
    lab_id = Column(Integer, ForeignKey("labs.id"), nullable=False)
    session_name = Column(String(255), default="Assessment Session")
    status = Column(String(50), default="Not Started")
    notes = Column(Text, default="")
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime)


class Finding(Base):
    __tablename__ = "findings"
    id = Column(Integer, primary_key=True, index=True)
    lab_id = Column(Integer, ForeignKey("labs.id"), nullable=False)
    finding_id = Column(String(50))
    title = Column(String(255), nullable=False)
    vulnerability_category = Column(String(100))
    category_slug = Column(String(50))
    owasp_classification = Column(String(200))
    lab_name = Column(String(255))
    objective = Column(Text, default="")
    description = Column(Text, default="")
    affected_endpoint = Column(String(500), default="")
    affected_parameter = Column(String(255), default="")
    http_method = Column(String(20), default="GET")
    payload_used = Column(Text, default="")
    steps_to_reproduce = Column(Text, default="")
    impact = Column(Text, default="")
    recommendation = Column(Text, default="")
    severity = Column(String(50), default="Medium")
    severity_justification = Column(Text, default="")
    cvss_score = Column(Float, default=0.0)
    testing_status = Column(String(50), default="Not Started")
    remediation_status = Column(String(50), default="Open")
    discovery_date = Column(String(50))
    burp_request_screenshot = Column(String(500), default="")
    burp_response_screenshot = Column(String(500), default="")
    proof_screenshot = Column(String(500), default="")
    evidence_references = Column(Text, default="")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    lab = relationship("Lab", back_populates="findings")
    evidence = relationship("Evidence", back_populates="finding")


class HttpRequest(Base):
    __tablename__ = "http_requests"
    id = Column(Integer, primary_key=True, index=True)
    lab_id = Column(Integer, ForeignKey("labs.id"), nullable=False)
    request_type = Column(String(50), default="original")  # original, modified
    content = Column(Text, default="")
    notes = Column(Text, default="")
    captured_at = Column(DateTime, server_default=func.now())

    lab = relationship("Lab", back_populates="http_requests")


class HttpResponse(Base):
    __tablename__ = "http_responses"
    id = Column(Integer, primary_key=True, index=True)
    lab_id = Column(Integer, ForeignKey("labs.id"), nullable=False)
    content = Column(Text, default="")
    status_code = Column(Integer)
    notes = Column(Text, default="")
    captured_at = Column(DateTime, server_default=func.now())

    lab = relationship("Lab", back_populates="http_responses")


class PayloadRecord(Base):
    __tablename__ = "payload_records"
    id = Column(Integer, primary_key=True, index=True)
    lab_id = Column(Integer, ForeignKey("labs.id"), nullable=False)
    payload = Column(Text, default="")
    payload_type = Column(String(100))
    description = Column(Text, default="")
    result = Column(Text, default="")
    created_at = Column(DateTime, server_default=func.now())

    lab = relationship("Lab", back_populates="payload_records")


class Evidence(Base):
    __tablename__ = "evidence"
    id = Column(Integer, primary_key=True, index=True)
    lab_id = Column(Integer, ForeignKey("labs.id"), nullable=False)
    finding_id = Column(Integer, ForeignKey("findings.id"), nullable=True)
    evidence_type = Column(String(50))  # burp_request, burp_response, proof, additional
    filename = Column(String(255))
    original_filename = Column(String(255))
    file_path = Column(String(500))
    file_size = Column(Integer)
    mime_type = Column(String(100))
    description = Column(Text, default="")
    captured_at = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())

    lab = relationship("Lab", back_populates="evidence")
    finding = relationship("Finding", back_populates="evidence")


class SeverityAssessment(Base):
    __tablename__ = "severity_assessments"
    id = Column(Integer, primary_key=True, index=True)
    finding_id = Column(Integer, ForeignKey("findings.id"))
    severity = Column(String(50))
    cvss_score = Column(Float, default=0.0)
    cvss_vector = Column(String(255))
    justification = Column(Text, default="")
    assessed_by = Column(String(255))
    assessed_at = Column(DateTime, server_default=func.now())


class RemediationRecord(Base):
    __tablename__ = "remediation_records"
    id = Column(Integer, primary_key=True, index=True)
    finding_id = Column(Integer, ForeignKey("findings.id"))
    recommendation = Column(Text, default="")
    priority = Column(String(50))
    status = Column(String(50), default="Open")
    notes = Column(Text, default="")
    created_at = Column(DateTime, server_default=func.now())


class ReportGeneration(Base):
    __tablename__ = "report_generations"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    report_type = Column(String(20))  # pdf, docx
    filename = Column(String(255))
    file_path = Column(String(500))
    file_size = Column(Integer)
    status = Column(String(50), default="pending")
    generated_at = Column(DateTime, server_default=func.now())


class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    action = Column(String(255))
    entity_type = Column(String(100))
    entity_id = Column(Integer)
    description = Column(Text, default="")
    created_at = Column(DateTime, server_default=func.now())

    project = relationship("Project", back_populates="activity_logs")
