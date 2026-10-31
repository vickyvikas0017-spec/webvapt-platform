from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.database import get_db
from app.models.models import Lab, Finding, Evidence, ActivityLog
from app.schemas.schemas import LabCreate, LabUpdate, LabOut

router = APIRouter()

VALID_STATUSES = [
    "Not Started", "In Progress", "Evidence Pending",
    "Tested", "Vulnerability Confirmed", "Not Vulnerable",
    "Blocked", "Completed"
]


@router.post("/labs", response_model=LabOut)
def create_lab(data: LabCreate, db: Session = Depends(get_db)):
    lab = Lab(**data.model_dump())
    db.add(lab)
    db.commit()
    db.refresh(lab)
    _log(db, data.project_id, "Created lab", "lab", lab.id, f"Lab '{lab.lab_name}' created under {lab.category_slug}")
    return lab


@router.get("/labs/project/{project_id}", response_model=List[LabOut])
def list_labs_by_project(project_id: int, db: Session = Depends(get_db)):
    return db.query(Lab).filter(Lab.project_id == project_id).all()


@router.get("/labs/project/{project_id}/category/{category_slug}", response_model=List[LabOut])
def list_labs_by_category(project_id: int, category_slug: str, db: Session = Depends(get_db)):
    return db.query(Lab).filter(
        Lab.project_id == project_id,
        Lab.category_slug == category_slug
    ).all()


@router.get("/labs/{lab_id}", response_model=LabOut)
def get_lab(lab_id: int, db: Session = Depends(get_db)):
    lab = db.query(Lab).filter(Lab.id == lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    return lab


@router.put("/labs/{lab_id}", response_model=LabOut)
def update_lab(lab_id: int, data: LabUpdate, db: Session = Depends(get_db)):
    lab = db.query(Lab).filter(Lab.id == lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")

    update_data = data.model_dump(exclude_none=True)

    # Enforce evidence requirement for Vulnerability Confirmed status
    if update_data.get("status") == "Vulnerability Confirmed":
        ev_count = db.query(Evidence).filter(Evidence.lab_id == lab_id).count()
        if ev_count == 0:
            raise HTTPException(
                status_code=400,
                detail="Cannot mark as 'Vulnerability Confirmed' without supporting evidence. Please upload at least one screenshot."
            )

    for k, v in update_data.items():
        setattr(lab, k, v)

    db.commit()
    db.refresh(lab)
    _log(db, lab.project_id, "Updated lab", "lab", lab.id, f"Lab '{lab.lab_name}' updated — status: {lab.status}")
    return lab


@router.delete("/labs/{lab_id}")
def delete_lab(lab_id: int, db: Session = Depends(get_db)):
    lab = db.query(Lab).filter(Lab.id == lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    db.delete(lab)
    db.commit()
    return {"message": "Lab deleted"}


def _log(db, project_id, action, entity_type, entity_id, description):
    log = ActivityLog(
        project_id=project_id, action=action,
        entity_type=entity_type, entity_id=entity_id, description=description,
    )
    db.add(log)
    db.commit()
