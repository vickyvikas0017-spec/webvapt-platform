from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.models import HttpRequest, HttpResponse, PayloadRecord, Lab
from app.schemas.schemas import (
    HttpRequestCreate, HttpRequestOut,
    HttpResponseCreate, HttpResponseOut,
    PayloadCreate, PayloadOut,
)

router = APIRouter()


# ── HTTP Requests ─────────────────────────────────────────────────────────────

@router.post("/http-requests", response_model=HttpRequestOut)
def create_http_request(data: HttpRequestCreate, db: Session = Depends(get_db)):
    obj = HttpRequest(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/http-requests/lab/{lab_id}", response_model=List[HttpRequestOut])
def list_http_requests(lab_id: int, db: Session = Depends(get_db)):
    return db.query(HttpRequest).filter(HttpRequest.lab_id == lab_id).all()


@router.put("/http-requests/{req_id}", response_model=HttpRequestOut)
def update_http_request(req_id: int, data: HttpRequestCreate, db: Session = Depends(get_db)):
    obj = db.query(HttpRequest).filter(HttpRequest.id == req_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="HTTP request not found")
    for k, v in data.model_dump().items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/http-requests/{req_id}")
def delete_http_request(req_id: int, db: Session = Depends(get_db)):
    obj = db.query(HttpRequest).filter(HttpRequest.id == req_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="HTTP request not found")
    db.delete(obj)
    db.commit()
    return {"message": "Deleted"}


# ── HTTP Responses ────────────────────────────────────────────────────────────

@router.post("/http-responses", response_model=HttpResponseOut)
def create_http_response(data: HttpResponseCreate, db: Session = Depends(get_db)):
    obj = HttpResponse(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/http-responses/lab/{lab_id}", response_model=List[HttpResponseOut])
def list_http_responses(lab_id: int, db: Session = Depends(get_db)):
    return db.query(HttpResponse).filter(HttpResponse.lab_id == lab_id).all()


@router.put("/http-responses/{resp_id}", response_model=HttpResponseOut)
def update_http_response(resp_id: int, data: HttpResponseCreate, db: Session = Depends(get_db)):
    obj = db.query(HttpResponse).filter(HttpResponse.id == resp_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="HTTP response not found")
    for k, v in data.model_dump().items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/http-responses/{resp_id}")
def delete_http_response(resp_id: int, db: Session = Depends(get_db)):
    obj = db.query(HttpResponse).filter(HttpResponse.id == resp_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="HTTP response not found")
    db.delete(obj)
    db.commit()
    return {"message": "Deleted"}


# ── Payloads ──────────────────────────────────────────────────────────────────

@router.post("/payloads", response_model=PayloadOut)
def create_payload(data: PayloadCreate, db: Session = Depends(get_db)):
    obj = PayloadRecord(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/payloads/lab/{lab_id}", response_model=List[PayloadOut])
def list_payloads(lab_id: int, db: Session = Depends(get_db)):
    return db.query(PayloadRecord).filter(PayloadRecord.lab_id == lab_id).all()


@router.delete("/payloads/{payload_id}")
def delete_payload(payload_id: int, db: Session = Depends(get_db)):
    obj = db.query(PayloadRecord).filter(PayloadRecord.id == payload_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Payload not found")
    db.delete(obj)
    db.commit()
    return {"message": "Deleted"}
