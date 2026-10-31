"""Database initialization — seeds vulnerability categories."""
from app.database.database import engine, Base, SessionLocal
from app.models.models import VulnerabilityCategory


CATEGORIES = [
    {"name": "SQL Injection", "slug": "sqli", "owasp_ref": "OWASP A03:2021", "sort_order": 1,
     "description": "SQL Injection flaws allow attackers to interfere with database queries."},
    {"name": "Cross-Site Scripting (XSS)", "slug": "xss", "owasp_ref": "OWASP A03:2021", "sort_order": 2,
     "description": "XSS allows injection of malicious scripts into web pages viewed by other users."},
    {"name": "CSRF", "slug": "csrf", "owasp_ref": "OWASP A01:2021", "sort_order": 3,
     "description": "Cross-Site Request Forgery tricks users into submitting unintended requests."},
    {"name": "CORS", "slug": "cors", "owasp_ref": "OWASP A05:2021", "sort_order": 4,
     "description": "Misconfigured CORS policies can allow unauthorized cross-origin access."},
    {"name": "IDOR / API1 – Broken Object Level Authorization", "slug": "idor", "owasp_ref": "OWASP API1:2023", "sort_order": 5,
     "description": "IDOR allows attackers to access objects belonging to other users."},
    {"name": "API3 – Broken Object Property Level Authorization (BOPLA)", "slug": "bopla", "owasp_ref": "OWASP API3:2023", "sort_order": 6,
     "description": "BOPLA allows unauthorized exposure or modification of object properties."},
    {"name": "API4 – Unrestricted Resource Consumption", "slug": "api4", "owasp_ref": "OWASP API4:2023", "sort_order": 7,
     "description": "Missing rate limits allow attackers to exhaust API resources."},
    {"name": "Server-Side Request Forgery (SSRF)", "slug": "ssrf", "owasp_ref": "OWASP A10:2021", "sort_order": 8,
     "description": "SSRF lets attackers induce the server to make requests to internal resources."},
]


def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for cat_data in CATEGORIES:
            existing = db.query(VulnerabilityCategory).filter_by(slug=cat_data["slug"]).first()
            if not existing:
                cat = VulnerabilityCategory(**cat_data)
                db.add(cat)
        db.commit()
    finally:
        db.close()
