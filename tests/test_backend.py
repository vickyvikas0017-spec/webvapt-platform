"""
WebVAPT Backend Test Suite
Run: cd backend && python -m pytest ../tests/ -v
"""
import pytest
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.database import Base
from app.models.models import Project, Student, Lab, Finding, Evidence, VulnerabilityCategory
from app.database.init_db import CATEGORIES

# ── Test DB (in-memory) ───────────────────────────────────────────────────────

TEST_DB_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSession = sessionmaker(bind=engine)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestSession()
    # Seed categories
    for cat_data in CATEGORIES:
        if not db.query(VulnerabilityCategory).filter_by(slug=cat_data["slug"]).first():
            db.add(VulnerabilityCategory(**cat_data))
    db.commit()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


# ── Project Tests ─────────────────────────────────────────────────────────────

def test_create_project(setup_db):
    db = setup_db
    p = Project(name="Test VAPT Project", start_date="2026-01-01")
    db.add(p)
    db.commit()
    assert p.id is not None
    assert p.name == "Test VAPT Project"
    print(f"✓ Project created: id={p.id}")


def test_create_student(setup_db):
    db = setup_db
    p = Project(name="Test Project")
    db.add(p); db.commit()
    s = Student(
        project_id=p.id, student_name="John Doe", usn="1XX21CS001",
        college="Test College", department="CSE", batch="2021-25"
    )
    db.add(s); db.commit()
    assert s.id is not None
    assert s.student_name == "John Doe"
    print(f"✓ Student created: {s.student_name}")


# ── Category Tests ────────────────────────────────────────────────────────────

def test_categories_seeded(setup_db):
    db = setup_db
    cats = db.query(VulnerabilityCategory).all()
    slugs = [c.slug for c in cats]
    for expected in ["sqli", "xss", "csrf", "cors", "idor", "bopla", "api4", "ssrf"]:
        assert expected in slugs, f"Missing category: {expected}"
    assert len(cats) == 8
    print(f"✓ All 8 vulnerability categories seeded")


# ── Lab Tests ─────────────────────────────────────────────────────────────────

def test_create_lab(setup_db):
    db = setup_db
    p = Project(name="Test Project"); db.add(p); db.commit()
    lab = Lab(
        project_id=p.id, category_slug="sqli",
        lab_name="SQL injection vulnerability in WHERE clause allowing retrieval of hidden data",
        lab_url="https://portswigger.net/web-security/sql-injection/lab-retrieve-hidden-data",
        objective="Perform a SQL injection attack to retrieve hidden data",
        status="In Progress",
        severity="High",
    )
    db.add(lab); db.commit()
    assert lab.id is not None
    assert lab.category_slug == "sqli"
    print(f"✓ Lab created: id={lab.id}, name={lab.lab_name[:40]}")


def test_lab_status_values(setup_db):
    db = setup_db
    p = Project(name="Test Project"); db.add(p); db.commit()
    for status in ["Not Started", "In Progress", "Completed", "Vulnerability Confirmed"]:
        lab = Lab(project_id=p.id, category_slug="xss", lab_name=f"Lab {status}", status=status)
        db.add(lab)
    db.commit()
    labs = db.query(Lab).filter_by(project_id=p.id).all()
    assert len(labs) == 4
    print(f"✓ Lab status values work correctly")


# ── Finding Tests ─────────────────────────────────────────────────────────────

def test_create_finding(setup_db):
    db = setup_db
    p = Project(name="Test Project"); db.add(p); db.commit()
    lab = Lab(project_id=p.id, category_slug="sqli", lab_name="SQLi Lab"); db.add(lab); db.commit()
    f = Finding(
        lab_id=lab.id, finding_id="SQLI-001",
        title="SQL Injection in product search",
        vulnerability_category="SQL Injection",
        category_slug="sqli",
        severity="High",
        description="The search parameter is vulnerable to SQL injection",
        payload_used="' OR 1=1--",
        steps_to_reproduce="1. Navigate to /search\n2. Enter payload\n3. Observe results",
        impact="Full database read access",
        recommendation="Use parameterized queries",
    )
    db.add(f); db.commit()
    assert f.id is not None
    assert f.severity == "High"
    print(f"✓ Finding created: {f.finding_id} - {f.title}")


def test_all_severity_levels(setup_db):
    db = setup_db
    p = Project(name="Test"); db.add(p); db.commit()
    lab = Lab(project_id=p.id, category_slug="xss", lab_name="XSS Lab"); db.add(lab); db.commit()
    for sev in ["Critical", "High", "Medium", "Low", "Informational"]:
        f = Finding(lab_id=lab.id, title=f"{sev} finding", severity=sev, category_slug="xss")
        db.add(f)
    db.commit()
    findings = db.query(Finding).filter_by(lab_id=lab.id).all()
    assert len(findings) == 5
    print(f"✓ All 5 severity levels created successfully")


# ── All 8 Category Tests ──────────────────────────────────────────────────────

def test_all_eight_categories_have_labs(setup_db):
    db = setup_db
    p = Project(name="Full VAPT Project"); db.add(p); db.commit()
    slugs = ["sqli", "xss", "csrf", "cors", "idor", "bopla", "api4", "ssrf"]
    for slug in slugs:
        lab = Lab(
            project_id=p.id, category_slug=slug,
            lab_name=f"{slug.upper()} Test Lab",
            status="In Progress"
        )
        db.add(lab)
    db.commit()
    labs = db.query(Lab).filter_by(project_id=p.id).all()
    assert len(labs) == 8
    found_slugs = {l.category_slug for l in labs}
    assert found_slugs == set(slugs)
    print(f"✓ All 8 vulnerability category labs created")


# ── Evidence Tests ────────────────────────────────────────────────────────────

def test_create_evidence_record(setup_db):
    db = setup_db
    p = Project(name="Test"); db.add(p); db.commit()
    lab = Lab(project_id=p.id, category_slug="ssrf", lab_name="SSRF Lab"); db.add(lab); db.commit()
    ev = Evidence(
        lab_id=lab.id, evidence_type="burp_request",
        filename="uuid_burp_request.png",
        original_filename="burp_request.png",
        file_path="/storage/evidence/uuid_burp_request.png",
        mime_type="image/png",
        file_size=102400,
    )
    db.add(ev); db.commit()
    assert ev.id is not None
    assert ev.evidence_type == "burp_request"
    print(f"✓ Evidence record created: {ev.original_filename}")


# ── Relationship Tests ────────────────────────────────────────────────────────

def test_project_lab_finding_relationships(setup_db):
    db = setup_db
    p = Project(name="Relationship Test"); db.add(p); db.commit()
    lab = Lab(project_id=p.id, category_slug="csrf", lab_name="CSRF Lab"); db.add(lab); db.commit()
    f = Finding(lab_id=lab.id, title="CSRF Bypass", category_slug="csrf", severity="High"); db.add(f); db.commit()
    ev = Evidence(lab_id=lab.id, finding_id=f.id, evidence_type="proof",
                  filename="proof.png", original_filename="proof.png",
                  file_path="/tmp/proof.png", mime_type="image/png")
    db.add(ev); db.commit()

    # Verify relationships
    loaded_lab = db.query(Lab).filter_by(id=lab.id).first()
    assert len(loaded_lab.findings) == 1
    assert len(loaded_lab.evidence) == 1
    assert loaded_lab.findings[0].title == "CSRF Bypass"
    print(f"✓ Project → Lab → Finding → Evidence relationships verified")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

