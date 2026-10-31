from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.models import ReconnaissanceRecord, Lab
from app.schemas.schemas import ReconCreate, ReconUpdate, ReconOut

router = APIRouter()


@router.post("/recon", response_model=ReconOut)
def create_recon(data: ReconCreate, db: Session = Depends(get_db)):
    lab = db.query(Lab).filter(Lab.id == data.lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    recon = ReconnaissanceRecord(**data.model_dump())
    db.add(recon)
    db.commit()
    db.refresh(recon)
    return recon


@router.get("/recon/lab/{lab_id}", response_model=List[ReconOut])
def list_recon_by_lab(lab_id: int, db: Session = Depends(get_db)):
    return db.query(ReconnaissanceRecord).filter(ReconnaissanceRecord.lab_id == lab_id).all()


@router.get("/recon/{recon_id}", response_model=ReconOut)
def get_recon(recon_id: int, db: Session = Depends(get_db)):
    r = db.query(ReconnaissanceRecord).filter(ReconnaissanceRecord.id == recon_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recon record not found")
    return r


@router.put("/recon/{recon_id}", response_model=ReconOut)
def update_recon(recon_id: int, data: ReconUpdate, db: Session = Depends(get_db)):
    r = db.query(ReconnaissanceRecord).filter(ReconnaissanceRecord.id == recon_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recon record not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return r


@router.delete("/recon/{recon_id}")
def delete_recon(recon_id: int, db: Session = Depends(get_db)):
    r = db.query(ReconnaissanceRecord).filter(ReconnaissanceRecord.id == recon_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recon record not found")
    db.delete(r)
    db.commit()
    return {"message": "Recon record deleted"}
