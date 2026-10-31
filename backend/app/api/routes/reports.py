import os
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.reports.report_generator import (
    generate_pdf_report, generate_docx_report, export_evidence_zip
)
from app.models.models import ReportGeneration
from app.schemas.schemas import ReportRequest

router = APIRouter()


@router.post("/reports/generate")
def generate_report(data: ReportRequest, db: Session = Depends(get_db)):
    try:
        if data.report_type == "pdf":
            file_path = generate_pdf_report(data.project_id, db)
        elif data.report_type == "docx":
            file_path = generate_docx_report(data.project_id, db)
        else:
            raise HTTPException(status_code=400, detail="report_type must be 'pdf' or 'docx'")

        file_size = os.path.getsize(file_path)
        report = ReportGeneration(
            project_id=data.project_id,
            report_type=data.report_type,
            filename=os.path.basename(file_path),
            file_path=file_path,
            file_size=file_size,
            status="completed",
        )
        db.add(report)
        db.commit()
        db.refresh(report)

        return {
            "report_id": report.id,
            "filename": report.filename,
            "file_path": file_path,
            "file_size": file_size,
            "status": "completed",
            "download_url": f"/api/reports/{report.id}/download",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


@router.get("/reports/{report_id}/download")
def download_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(ReportGeneration).filter(ReportGeneration.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Report file not found on disk")

    media_types = {"pdf": "application/pdf", "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
    media_type = media_types.get(report.report_type, "application/octet-stream")
    return FileResponse(report.file_path, media_type=media_type, filename=report.filename)


@router.get("/reports/project/{project_id}")
def list_reports(project_id: int, db: Session = Depends(get_db)):
    reports = db.query(ReportGeneration).filter(
        ReportGeneration.project_id == project_id
    ).order_by(ReportGeneration.generated_at.desc()).all()
    return reports


@router.post("/reports/export-evidence")
def export_evidence(project_id: int, db: Session = Depends(get_db)):
    try:
        zip_path = export_evidence_zip(project_id, db)
        return FileResponse(
            zip_path,
            media_type="application/zip",
            filename=os.path.basename(zip_path)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")
