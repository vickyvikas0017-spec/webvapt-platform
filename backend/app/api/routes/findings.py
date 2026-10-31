from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.database import get_db
from app.models.models import Finding, Lab, ActivityLog
from app.schemas.schemas import FindingCreate, FindingUpdate, FindingOut
import datetime

router = APIRouter()


def _gen_finding_id(category_slug: str, count: int) -> str:
    slug_map = {
        "sqli": "SQLI", "xss": "XSS", "csrf": "CSRF", "cors": "CORS",
        "idor": "IDOR", "bopla": "BOPLA", "api4": "API4", "ssrf": "SSRF"
    }
    prefix = slug_map.get(category_slug, "FIND")
    return f"{prefix}-{count + 1:03d}"


@router.post("/findings", response_model=FindingOut)
def create_finding(data: FindingCreate, db: Session = Depends(get_db)):
    lab = db.query(Lab).filter(Lab.id == data.lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")

    count = db.query(Finding).filter(Finding.category_slug == data.category_slug).count()
    finding_id = _gen_finding_id(data.category_slug or "", count)

    if not data.discovery_date:
        data.discovery_date = datetime.date.today().isoformat()

    finding = Finding(**data.model_dump(), finding_id=finding_id)
    db.add(finding)
    db.commit()
    db.refresh(finding)
    _log(db, lab.project_id, "Created finding", "finding", finding.id,
         f"Finding '{finding.title}' ({finding.severity}) created")
    return finding


@router.get("/findings", response_model=List[FindingOut])
def list_all_findings(
    severity: Optional[str] = None,
    category_slug: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Finding)
    if severity:
        q = q.filter(Finding.severity == severity)
    if category_slug:
        q = q.filter(Finding.category_slug == category_slug)
    return q.order_by(Finding.created_at.desc()).all()


@router.get("/findings/lab/{lab_id}", response_model=List[FindingOut])
def get_findings_by_lab(lab_id: int, db: Session = Depends(get_db)):
    return db.query(Finding).filter(Finding.lab_id == lab_id).all()


@router.get("/findings/{finding_id}", response_model=FindingOut)
def get_finding(finding_id: int, db: Session = Depends(get_db)):
    f = db.query(Finding).filter(Finding.id == finding_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Finding not found")
    return f


@router.put("/findings/{finding_id}", response_model=FindingOut)
def update_finding(finding_id: int, data: FindingUpdate, db: Session = Depends(get_db)):
    f = db.query(Finding).filter(Finding.id == finding_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Finding not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(f, k, v)
    db.commit()
    db.refresh(f)
    lab = db.query(Lab).filter(Lab.id == f.lab_id).first()
    if lab:
        _log(db, lab.project_id, "Updated finding", "finding", f.id, f"Finding '{f.title}' updated")
    return f


@router.delete("/findings/{finding_id}")
def delete_finding(finding_id: int, db: Session = Depends(get_db)):
    f = db.query(Finding).filter(Finding.id == finding_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Finding not found")
    db.delete(f)
    db.commit()
    return {"message": "Finding deleted"}


@router.get("/findings-summary")
def findings_summary(db: Session = Depends(get_db)):
    all_findings = db.query(Finding).all()
    summary = {
        "total": len(all_findings),
        "critical": sum(1 for f in all_findings if f.severity == "Critical"),
        "high": sum(1 for f in all_findings if f.severity == "High"),
        "medium": sum(1 for f in all_findings if f.severity == "Medium"),
        "low": sum(1 for f in all_findings if f.severity == "Low"),
        "informational": sum(1 for f in all_findings if f.severity == "Informational"),
        "by_category": {}
    }
    cats = ["sqli", "xss", "csrf", "cors", "idor", "bopla", "api4", "ssrf"]
    for cat in cats:
        summary["by_category"][cat] = sum(1 for f in all_findings if f.category_slug == cat)
    return summary


def _log(db, project_id, action, entity_type, entity_id, description):
    log = ActivityLog(
        project_id=project_id, action=action,
        entity_type=entity_type, entity_id=entity_id, description=description,
    )
    db.add(log)
    db.commit()
