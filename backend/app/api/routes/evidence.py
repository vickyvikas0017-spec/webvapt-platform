import os
import uuid
import mimetypes
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.database import get_db, get_storage_path
from app.models.models import Evidence, Lab, ActivityLog
from app.schemas.schemas import EvidenceOut

router = APIRouter()

ALLOWED_MIME_TYPES = {
    "image/png", "image/jpeg", "image/jpg", "image/gif",
    "application/pdf", "text/plain"
}
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".pdf", ".txt"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


def sanitize_filename(filename: str) -> str:
    """Remove path traversal characters and keep only safe filename parts."""
    safe = os.path.basename(filename)
    safe = "".join(c for c in safe if c.isalnum() or c in "._- ")
    return safe[:200] or "file"


@router.post("/evidence/upload", response_model=EvidenceOut)
async def upload_evidence(
    lab_id: int = Form(...),
    evidence_type: str = Form("additional"),
    description: str = Form(""),
    captured_at: str = Form(""),
    finding_id: Optional[int] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    lab = db.query(Lab).filter(Lab.id == lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")

    # Validate file type
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' not allowed. Use: {', '.join(ALLOWED_EXTENSIONS)}")

    # Read and size-check
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum 20MB allowed.")

    safe_name = sanitize_filename(file.filename or "upload")
    unique_name = f"{uuid.uuid4().hex}_{safe_name}"
    storage_path = get_storage_path("evidence")
    file_path = os.path.join(storage_path, unique_name)

    with open(file_path, "wb") as f:
        f.write(content)

    mime = mimetypes.guess_type(safe_name)[0] or "application/octet-stream"
    evidence = Evidence(
        lab_id=lab_id,
        finding_id=finding_id,
        evidence_type=evidence_type,
        filename=unique_name,
        original_filename=safe_name,
        file_path=file_path,
        file_size=len(content),
        mime_type=mime,
        description=description,
        captured_at=captured_at,
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    _log(db, lab.project_id, "Uploaded evidence", "evidence", evidence.id,
         f"Evidence '{safe_name}' ({evidence_type}) uploaded for lab '{lab.lab_name}'")
    return evidence


@router.get("/evidence/lab/{lab_id}", response_model=List[EvidenceOut])
def list_evidence(lab_id: int, db: Session = Depends(get_db)):
    return db.query(Evidence).filter(Evidence.lab_id == lab_id).all()


@router.get("/evidence/all", response_model=List[EvidenceOut])
def list_all_evidence(db: Session = Depends(get_db)):
    return db.query(Evidence).order_by(Evidence.created_at.desc()).all()


@router.get("/evidence/{evidence_id}", response_model=EvidenceOut)
def get_evidence(evidence_id: int, db: Session = Depends(get_db)):
    ev = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return ev


@router.get("/evidence/{evidence_id}/file")
def serve_evidence_file(evidence_id: int, db: Session = Depends(get_db)):
    ev = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found")
    if not os.path.exists(ev.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(ev.file_path, media_type=ev.mime_type, filename=ev.original_filename)


@router.delete("/evidence/{evidence_id}")
def delete_evidence(evidence_id: int, db: Session = Depends(get_db)):
    ev = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found")
    # Remove file from disk
    if ev.file_path and os.path.exists(ev.file_path):
        try:
            os.remove(ev.file_path)
        except OSError:
            pass
    db.delete(ev)
    db.commit()
    return {"message": "Evidence deleted"}


def _log(db, project_id, action, entity_type, entity_id, description):
    log = ActivityLog(
        project_id=project_id, action=action,
        entity_type=entity_type, entity_id=entity_id, description=description,
    )
    db.add(log)
    db.commit()
