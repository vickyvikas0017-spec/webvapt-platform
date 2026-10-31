from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database.database import get_db
from app.models.models import (
    Project, Student, Lab, Finding, Evidence, ActivityLog, VulnerabilityCategory, ReportGeneration
)
from app.schemas.schemas import (
    ProjectCreate, ProjectUpdate, ProjectOut,
    StudentCreate, StudentUpdate, StudentOut,
    DashboardStats, CategoryStats
)

router = APIRouter()


# ── Projects ──────────────────────────────────────────────────────────────────

@router.post("/projects", response_model=ProjectOut)
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(**data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    _log(db, project.id, "Created project", "project", project.id, f"Project '{project.name}' created")
    return project


@router.get("/projects", response_model=List[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()


@router.get("/projects/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return p


@router.put("/projects/{project_id}", response_model=ProjectOut)
def update_project(project_id: int, data: ProjectUpdate, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    _log(db, project_id, "Updated project", "project", project_id, f"Project updated")
    return p


@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(p)
    db.commit()
    return {"message": "Project deleted"}


# ── Students ──────────────────────────────────────────────────────────────────

@router.post("/students", response_model=StudentOut)
def create_student(data: StudentCreate, db: Session = Depends(get_db)):
    student = Student(**data.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.get("/students/project/{project_id}", response_model=List[StudentOut])
def get_students_by_project(project_id: int, db: Session = Depends(get_db)):
    return db.query(Student).filter(Student.project_id == project_id).all()


@router.put("/students/{student_id}", response_model=StudentOut)
def update_student(student_id: int, data: StudentUpdate, db: Session = Depends(get_db)):
    s = db.query(Student).filter(Student.id == student_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Student not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return s


# ── Dashboard ─────────────────────────────────────────────────────────────────

@router.get("/dashboard/{project_id}", response_model=DashboardStats)
def get_dashboard(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    student = db.query(Student).filter(Student.project_id == project_id).first()
    cats = db.query(VulnerabilityCategory).order_by(VulnerabilityCategory.sort_order).all()
    labs = db.query(Lab).filter(Lab.project_id == project_id).all()
    findings = db.query(Finding).join(Lab).filter(Lab.project_id == project_id).all()
    evidence_count = db.query(Evidence).join(Lab).filter(Lab.project_id == project_id).count()

    # severity counts
    sev_counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0, "Informational": 0}
    for f in findings:
        if f.severity in sev_counts:
            sev_counts[f.severity] += 1

    category_stats = []
    completed = in_prog = pending = 0

    for cat in cats:
        cat_labs = [l for l in labs if l.category_slug == cat.slug]
        cat_findings = [f for f in findings if f.category_slug == cat.slug]
        cat_evidence = db.query(Evidence).join(Lab).filter(
            Lab.project_id == project_id, Lab.category_slug == cat.slug
        ).count()

        lab_done = sum(1 for l in cat_labs if l.status in ("Completed", "Vulnerability Confirmed", "Not Vulnerable"))
        pct = int((lab_done / len(cat_labs) * 100)) if cat_labs else 0

        if not cat_labs:
            status = "Not Started"
            pending += 1
        elif all(l.status in ("Completed", "Vulnerability Confirmed", "Not Vulnerable") for l in cat_labs):
            status = "Completed"
            completed += 1
        elif any(l.status == "In Progress" for l in cat_labs):
            status = "In Progress"
            in_prog += 1
        else:
            status = "Not Started"
            pending += 1

        primary_lab_name = cat_labs[0].lab_name if cat_labs else "No lab recorded"

        category_stats.append(CategoryStats(
            slug=cat.slug,
            name=cat.name,
            status=status,
            lab_name=primary_lab_name,
            lab_count=len(cat_labs),
            completed_labs=lab_done,
            finding_count=len(cat_findings),
            evidence_count=cat_evidence,
            completion_percentage=pct,
        ))

    overall = int(sum(c.completion_percentage for c in category_stats) / len(category_stats)) if category_stats else 0

    latest_report = db.query(ReportGeneration).filter(
        ReportGeneration.project_id == project_id
    ).order_by(ReportGeneration.generated_at.desc()).first()
    report_status = f"{latest_report.report_type.upper()} Generated" if latest_report else "Not Generated"

    activities = db.query(ActivityLog).filter(
        ActivityLog.project_id == project_id
    ).order_by(ActivityLog.created_at.desc()).limit(15).all()

    act_list = [{"id": a.id, "action": a.action, "entity_type": a.entity_type,
                 "description": a.description, "created_at": str(a.created_at)} for a in activities]

    return DashboardStats(
        project=project,
        student=student,
        total_categories=len(cats),
        completed_assessments=completed,
        pending_assessments=pending,
        in_progress_assessments=in_prog,
        total_findings=len(findings),
        critical_findings=sev_counts["Critical"],
        high_findings=sev_counts["High"],
        medium_findings=sev_counts["Medium"],
        low_findings=sev_counts["Low"],
        info_findings=sev_counts["Informational"],
        total_evidence=evidence_count,
        overall_completion=overall,
        report_status=report_status,
        category_stats=category_stats,
        recent_activities=act_list,
    )


# ── Categories ────────────────────────────────────────────────────────────────

@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    return db.query(VulnerabilityCategory).order_by(VulnerabilityCategory.sort_order).all()


# ── Activity ──────────────────────────────────────────────────────────────────

@router.get("/activity/{project_id}")
def get_activity(project_id: int, limit: int = 20, db: Session = Depends(get_db)):
    logs = db.query(ActivityLog).filter(
        ActivityLog.project_id == project_id
    ).order_by(ActivityLog.created_at.desc()).limit(limit).all()
    return logs


def _log(db, project_id, action, entity_type, entity_id, description):
    log = ActivityLog(
        project_id=project_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        description=description,
    )
    db.add(log)
    db.commit()
