from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database.init_db import init_db
from app.database.database import get_storage_path
from app.api.routes import projects, labs, findings, evidence, recon, http_data, reports

app = FastAPI(
    title="WebVAPT API",
    description="PortSwigger Web Security Academy VAPT Platform",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialise DB and seed categories on startup
@app.on_event("startup")
def startup():
    init_db()
    # Ensure storage directories exist
    for sub in ["evidence", "reports", "exports"]:
        get_storage_path(sub)

# Mount evidence files as static (for preview)
_evidence_dir = get_storage_path("evidence")
if os.path.isdir(_evidence_dir):
    app.mount("/files/evidence", StaticFiles(directory=_evidence_dir), name="evidence")

# Routes
app.include_router(projects.router, prefix="/api", tags=["Projects"])
app.include_router(labs.router, prefix="/api", tags=["Labs"])
app.include_router(findings.router, prefix="/api", tags=["Findings"])
app.include_router(evidence.router, prefix="/api", tags=["Evidence"])
app.include_router(recon.router, prefix="/api", tags=["Reconnaissance"])
app.include_router(http_data.router, prefix="/api", tags=["HTTP Data"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])


@app.get("/")
def root():
    return {"message": "WebVAPT API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
