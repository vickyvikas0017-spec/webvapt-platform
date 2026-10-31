# WebVAPT – PortSwigger Web Security Academy VAPT Platform

> **Minor Project** | Cybersecurity / Web Application Security  
> A complete, integrated Vulnerability Assessment and Penetration Testing documentation platform

---

## 📋 Project Overview

WebVAPT is a full-stack web application that supports the practical assessment and documentation of **eight vulnerability categories** from the PortSwigger Web Security Academy Minor Project:

| # | Category | OWASP Reference |
|---|----------|----------------|
| 1 | SQL Injection | A03:2021 |
| 2 | Cross-Site Scripting (XSS) | A03:2021 |
| 3 | CSRF | A01:2021 |
| 4 | CORS | A05:2021 |
| 5 | IDOR / API1 – Broken Object Level Authorization | API1:2023 |
| 6 | API3 – BOPLA | API3:2023 |
| 7 | API4 – Unrestricted Resource Consumption | API4:2023 |
| 8 | SSRF – Server-Side Request Forgery | A10:2021 |

---

## ✨ Features

- **Unified Project Dashboard** — progress tracking, severity chart, recent activity
- **8 Assessment Workspaces** — each with lab details, HTTP data editor, evidence upload, findings
- **Reconnaissance Module** — structured lab understanding checklist
- **Burp Suite Evidence Manager** — upload and preview PNG/JPG/PDF screenshots
- **HTTP Request/Response Editor** — paste directly from Burp Proxy/Repeater
- **Vulnerability Findings Manager** — centralized findings with all 12 mandatory fields
- **Risk & Severity Analysis** — charts, radar, marking scheme dashboard
- **PDF + DOCX Report Generator** — professional 24-section VAPT report
- **Evidence ZIP Export** — all screenshots bundled for submission
- **SQLite Database** — all data persists across restarts
- **Marking Scheme Dashboard** — self-assessment based on actual assignment criteria

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Python 3.13 + FastAPI + SQLAlchemy |
| Database | SQLite |
| PDF Report | ReportLab |
| DOCX Report | python-docx |
| Images | Pillow |
| Testing | Pytest |

---

## 📁 Project Structure

```
WebVAPT-Minor-Project/
├── backend/
│   ├── app/
│   │   ├── api/routes/       # FastAPI route handlers
│   │   ├── models/           # SQLAlchemy ORM models (16 tables)
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── database/         # DB engine, session, init & seeding
│   │   ├── reports/          # PDF + DOCX generation
│   │   └── main.py           # FastAPI application entry point
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/       # Sidebar, Layout, UI, AssessmentWorkspace
│       ├── pages/            # Dashboard, 8 assessments, Evidence, Findings, Report...
│       ├── services/api.ts   # All API calls
│       ├── hooks/useApp.tsx  # Global state (project ID, sidebar)
│       └── utils/types.ts    # TypeScript interfaces
├── storage/
│   ├── evidence/             # Uploaded screenshots
│   ├── reports/              # Generated PDF/DOCX files
│   └── exports/              # ZIP evidence exports
├── tests/
│   ├── test_backend.py       # 10 unit tests (all pass)
│   ├── integration_test.py   # Full workflow integration test
│   └── test_reports.py       # PDF + DOCX generation test
├── run.ps1                   # Windows startup script
├── run.sh                    # Linux/macOS startup script
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- Python 3.10+ (tested on Python 3.13.1)
- Node.js 18+ (tested on v26.13)
- npm

### 1. Install Backend Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies

```powershell
cd frontend
npm install
```

### 3. Start the Application

**Option A — PowerShell script (recommended):**
```powershell
.\run.ps1
```

**Option B — Manual (two terminals):**

Terminal 1 — Backend:
```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Terminal 2 — Frontend:
```powershell
cd frontend
npm run dev
```

### 4. Open the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

---

## 🚀 Getting Started — Workflow

### Step 1: Create Your Project
1. Navigate to **Project Settings** (sidebar)
2. Enter project name, student name, USN, college, department, batch, guide
3. Click **Create Project**

### Step 2: Add PortSwigger Lab Records
1. Go to any vulnerability assessment page (e.g., SQL Injection)
2. Click **New Lab Record**
3. Enter the lab name, URL, objective, and details
4. Set status to **In Progress**

### Step 3: Reconnaissance
1. Go to **Reconnaissance** page
2. Select the lab from the dropdown
3. Complete the structured checklist
4. Document application behaviour, endpoints, parameters

### Step 4: Practical Assessment (with Burp Suite)
1. Open the PortSwigger lab in your browser
2. Configure browser proxy to Burp Suite (127.0.0.1:8080)
3. In Burp: Proxy → Intercept → intercept the request
4. Send to Repeater (Ctrl+R)
5. In WebVAPT, open the lab → **HTTP Data** tab
6. Paste the **original request** from Burp Repeater
7. Modify the request with your payload
8. Paste the **modified request** and **response**

### Step 5: Collect Evidence
1. In the lab → **Evidence** tab
2. Upload:
   - 📸 **Burp Request Screenshot** — screenshot of request in Repeater
   - 📸 **Burp Response Screenshot** — screenshot of response in Repeater
   - ✅ **Proof of Exploitation** — screenshot of the lab success page

### Step 6: Document Findings
1. In the lab → **Findings** tab
2. Click **Add Finding**
3. Enter title, severity, justification
4. All lab details are auto-populated

### Step 7: Generate Report
1. Go to **Report Generator**
2. Click **Generate PDF** or **Generate DOCX**
3. Download the report
4. Optionally download **Evidence ZIP**

---

## 🔬 Testing

```powershell
# Unit tests (10 tests)
python -m pytest tests/test_backend.py -v

# Integration test (full workflow)
python tests/integration_test.py

# Report generation test
python tests/test_reports.py
```

---

## 📊 Database Schema

16 tables: `projects`, `students`, `vulnerability_categories`, `labs`, `reconnaissance_records`, `assessment_sessions`, `findings`, `http_requests`, `http_responses`, `payload_records`, `reproduction_steps`, `evidence`, `severity_assessments`, `remediation_records`, `report_generations`, `activity_logs`

Database file: `backend/webvapt.db` (auto-created on first run)

---

## 🔒 Security Notes

- All testing must be performed exclusively in authorized PortSwigger lab environments
- The application does not perform automated scanning or exploitation
- No real-world targets are accessed
- Evidence is stored locally only
- File uploads are restricted to PNG, JPG, JPEG, PDF, TXT (max 20MB)
- Path traversal and filename injection are prevented

---

## 📋 Marking Scheme

| Criteria | Marks |
|----------|------:|
| Reconnaissance & Understanding | 10 |
| Exploitation | 20 |
| Evidence | 20 |
| Explanation | 20 |
| Report Quality | 20 |
| Recommendations | 10 |
| **TOTAL** | **100** |

The **Risk Analysis** page includes a self-assessment checklist aligned to this marking scheme.

---

## 🔧 Troubleshooting

**Backend won't start:**
```powershell
pip install -r backend/requirements.txt
cd backend && python -c "from app.database.init_db import init_db; init_db(); print('OK')"
```

**Frontend won't start:**
```powershell
cd frontend && npm install && npm run dev
```

**Database reset:**
```powershell
Remove-Item backend/webvapt.db
# Restart backend — DB will be recreated automatically
```

**Report generation fails:**
```powershell
pip install reportlab python-docx Pillow
```

---

## 📝 References

- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP API Security Top 10 2023](https://owasp.org/API-Security/)
- [Burp Suite Documentation](https://portswigger.net/burp/documentation)
- [CVSS v3.1 Specification](https://www.first.org/cvss/v3.1/specification-document)

