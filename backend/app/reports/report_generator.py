"""Report generation service — produces PDF and DOCX VAPT reports."""
import os
import io
import zipfile
import datetime
from typing import Optional

from sqlalchemy.orm import Session
from app.models.models import Project, Student, Lab, Finding, Evidence, VulnerabilityCategory
from app.database.database import get_storage_path


# ──────────────────────────────────────────────────────────────────────────────
# DOCX generation
# ──────────────────────────────────────────────────────────────────────────────

def generate_docx_report(project_id: int, db: Session) -> str:
    try:
        from docx import Document
        from docx.shared import Pt, RGBColor, Inches
        from docx.enum.text import WD_ALIGN_PARAGRAPH
    except ImportError:
        raise RuntimeError("python-docx not installed. Run: pip install python-docx")

    project = db.query(Project).filter(Project.id == project_id).first()
    student = db.query(Student).filter(Student.project_id == project_id).first()
    labs = db.query(Lab).filter(Lab.project_id == project_id).all()
    findings = db.query(Finding).join(Lab).filter(Lab.project_id == project_id).all()
    categories = db.query(VulnerabilityCategory).order_by(VulnerabilityCategory.sort_order).all()

    doc = Document()

    # ── Styles ────────────────────────────────────────────────────────────────
    style = doc.styles['Normal']
    style.font.name = 'Calibri'
    style.font.size = Pt(11)

    def add_heading(text, level=1, color=None):
        h = doc.add_heading(text, level)
        if color:
            for run in h.runs:
                run.font.color.rgb = RGBColor(*color)

    def add_para(text, bold=False):
        p = doc.add_paragraph()
        run = p.add_run(text)
        run.bold = bold
        return p

    def add_field(label, value):
        p = doc.add_paragraph()
        run = p.add_run(f"{label}: ")
        run.bold = True
        p.add_run(str(value) if value else "N/A")

    # ── Cover Page ────────────────────────────────────────────────────────────
    doc.add_paragraph()
    title_para = doc.add_paragraph()
    title_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title_para.add_run("WEBVAPT")
    run.font.size = Pt(28)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0x1e, 0x40, 0xaf)

    sub_para = doc.add_paragraph()
    sub_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run2 = sub_para.add_run("PortSwigger Web Security Academy\nVulnerability Assessment and Penetration Testing Report")
    run2.font.size = Pt(14)

    doc.add_paragraph()
    info_para = doc.add_paragraph()
    info_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if project:
        info_para.add_run(f"Project: {project.name}\n").bold = True
    if student:
        info_para.add_run(f"Student: {student.student_name}\n")
        info_para.add_run(f"USN: {student.usn}\n")
        info_para.add_run(f"College: {student.college}\n")
        info_para.add_run(f"Department: {student.department}\n")
        info_para.add_run(f"Batch: {student.batch}\n")
        info_para.add_run(f"Guide: {student.project_guide}\n")
    if project:
        info_para.add_run(f"Date: {project.start_date}\n")
        info_para.add_run(f"Submission: {project.submission_date}\n")

    doc.add_page_break()

    # ── Abstract ──────────────────────────────────────────────────────────────
    add_heading("Abstract", 1, (0x1e, 0x40, 0xaf))
    add_para(
        "This report documents the vulnerability assessment and penetration testing "
        "conducted on assigned PortSwigger Web Security Academy labs as part of the "
        "WebVAPT Minor Project. The assessment covers eight vulnerability categories: "
        "SQL Injection, Cross-Site Scripting (XSS), CSRF, CORS, IDOR/API1, API3 BOPLA, "
        "API4 Unrestricted Resource Consumption, and Server-Side Request Forgery (SSRF). "
        "All testing was performed in controlled, authorized lab environments only."
    )
    doc.add_page_break()

    # ── Introduction ──────────────────────────────────────────────────────────
    add_heading("1. Project Introduction", 1, (0x1e, 0x40, 0xaf))
    add_para(
        "This WebVAPT project involves systematic investigation of web application "
        "vulnerabilities using the PortSwigger Web Security Academy platform. "
        "Each lab provides a controlled, intentionally vulnerable application "
        "designed for educational purposes. Testing was performed using Burp Suite "
        "Community/Professional Edition alongside manual analysis."
    )

    add_heading("2. Project Objective", 1, (0x1e, 0x40, 0xaf))
    add_para(
        "To demonstrate understanding and practical exploitation of eight web vulnerability "
        "categories through authorized lab exercises, document findings with evidence, "
        "assess impact, and recommend appropriate mitigations."
    )

    add_heading("3. Scope of Assessment", 1, (0x1e, 0x40, 0xaf))
    add_para(
        "Scope is strictly limited to assigned PortSwigger Web Security Academy labs. "
        "No real-world systems, third-party websites, or unauthorized targets were tested. "
        "All testing adheres to ethical guidelines and PortSwigger's terms of service."
    )

    add_heading("4. Tools and Technologies", 1, (0x1e, 0x40, 0xaf))
    tools = [
        "Burp Suite Community/Professional — HTTP interception and manipulation",
        "PortSwigger Web Security Academy — Controlled lab environment",
        "WebVAPT Platform — Assessment documentation and reporting",
        "Firefox/Chrome — Browser for lab access",
        "Python 3 / FastAPI — Backend platform",
        "React / TypeScript — Frontend platform",
        "SQLite — Assessment database",
    ]
    for tool in tools:
        doc.add_paragraph(tool, style='List Bullet')

    add_heading("5. Methodology", 1, (0x1e, 0x40, 0xaf))
    steps = [
        "Reconnaissance & Lab Understanding",
        "HTTP Request Interception with Burp Suite",
        "Vulnerability Testing per Lab Instructions",
        "Evidence Collection (Screenshots, HTTP Requests/Responses)",
        "Finding Documentation and Severity Assessment",
        "Impact Analysis",
        "Remediation Recommendations",
    ]
    for i, step in enumerate(steps, 1):
        doc.add_paragraph(f"Step {i}: {step}", style='List Number')

    doc.add_page_break()

    # ── Category Sections ─────────────────────────────────────────────────────
    add_heading("6. Vulnerability Assessments", 1, (0x1e, 0x40, 0xaf))

    for idx, cat in enumerate(categories, 1):
        add_heading(f"6.{idx} {cat.name}", 2)
        add_para(cat.description)

        cat_labs = [l for l in labs if l.category_slug == cat.slug]
        if not cat_labs:
            add_para("No labs recorded for this category.", bold=False)
            continue

        for lab in cat_labs:
            add_heading(f"Lab: {lab.lab_name}", 3)
            add_field("Status", lab.status)
            add_field("Lab URL", lab.lab_url)
            add_field("Objective", lab.objective)
            add_field("Description", lab.description)
            add_field("Affected Endpoint", lab.affected_endpoint)
            add_field("HTTP Method", lab.http_method)
            add_field("Vulnerable Parameter", lab.vulnerable_parameter)
            add_field("Payload Used", lab.payload_used)

            if lab.original_request:
                add_para("Original HTTP Request:", bold=True)
                doc.add_paragraph(lab.original_request, style='Normal').runs[0].font.name = 'Courier New'
            if lab.modified_request:
                add_para("Modified HTTP Request:", bold=True)
                doc.add_paragraph(lab.modified_request, style='Normal').runs[0].font.name = 'Courier New'
            if lab.response_received:
                add_para("Response:", bold=True)
                doc.add_paragraph(lab.response_received, style='Normal').runs[0].font.name = 'Courier New'

            add_field("Steps to Reproduce", lab.steps_to_reproduce)
            add_field("Impact", lab.impact)
            add_field("Recommendation", lab.recommendation)
            add_field("Severity", lab.severity)

    doc.add_page_break()

    # ── Consolidated Findings ─────────────────────────────────────────────────
    add_heading("7. Consolidated Vulnerability Findings", 1, (0x1e, 0x40, 0xaf))

    if not findings:
        add_para("No findings recorded.")
    else:
        # Summary table
        table = doc.add_table(rows=1, cols=5)
        table.style = 'Light Shading Accent 1'
        hdr = table.rows[0].cells
        hdr[0].text = "Finding ID"
        hdr[1].text = "Title"
        hdr[2].text = "Category"
        hdr[3].text = "Severity"
        hdr[4].text = "Status"

        for f in findings:
            row = table.add_row().cells
            row[0].text = f.finding_id or str(f.id)
            row[1].text = f.title
            row[2].text = f.vulnerability_category or ""
            row[3].text = f.severity or ""
            row[4].text = f.testing_status or ""

        doc.add_paragraph()

        # Detailed findings
        for f in findings:
            add_heading(f"Finding: {f.title}", 2)
            add_field("Finding ID", f.finding_id)
            add_field("Vulnerability Category", f.vulnerability_category)
            add_field("OWASP Classification", f.owasp_classification)
            add_field("Lab Name", f.lab_name)
            add_field("Objective", f.objective)
            add_field("Description", f.description)
            add_field("Affected Endpoint", f.affected_endpoint)
            add_field("Affected Parameter", f.affected_parameter)
            add_field("HTTP Method", f.http_method)
            add_field("Payload Used", f.payload_used)
            add_field("Steps to Reproduce", f.steps_to_reproduce)
            add_field("Impact", f.impact)
            add_field("Recommendation", f.recommendation)
            add_field("Severity", f.severity)
            add_field("Severity Justification", f.severity_justification)
            add_field("Discovery Date", f.discovery_date)
            add_field("Burp Request Screenshot", f.burp_request_screenshot or "See evidence section")
            add_field("Burp Response Screenshot", f.burp_response_screenshot or "See evidence section")
            add_field("Proof of Exploitation", f.proof_screenshot or "See evidence section")
            doc.add_paragraph()

    doc.add_page_break()

    # ── Severity Summary ──────────────────────────────────────────────────────
    add_heading("8. Severity Classification Summary", 1, (0x1e, 0x40, 0xaf))
    sev_table = doc.add_table(rows=1, cols=2)
    sev_table.style = 'Light Shading Accent 1'
    hdr = sev_table.rows[0].cells
    hdr[0].text = "Severity Level"
    hdr[1].text = "Count"
    for sev in ["Critical", "High", "Medium", "Low", "Informational"]:
        cnt = sum(1 for f in findings if f.severity == sev)
        row = sev_table.add_row().cells
        row[0].text = sev
        row[1].text = str(cnt)

    doc.add_page_break()

    # ── Recommendations ───────────────────────────────────────────────────────
    add_heading("9. Recommendations", 1, (0x1e, 0x40, 0xaf))
    if findings:
        for f in findings:
            if f.recommendation:
                add_para(f"[{f.severity}] {f.title}: {f.recommendation}")

    # ── Conclusion ────────────────────────────────────────────────────────────
    add_heading("10. Conclusion", 1, (0x1e, 0x40, 0xaf))
    add_para(
        "This assessment demonstrates the practical identification and documentation of "
        "eight categories of web application vulnerabilities. All testing was performed "
        "in authorized PortSwigger lab environments. The findings and recommendations "
        "presented in this report are intended for educational purposes and should be "
        "applied in real applications to improve security posture."
    )

    # ── References ────────────────────────────────────────────────────────────
    add_heading("11. References", 1, (0x1e, 0x40, 0xaf))
    refs = [
        "PortSwigger Web Security Academy — https://portswigger.net/web-security",
        "OWASP Top 10 2021 — https://owasp.org/Top10/",
        "OWASP API Security Top 10 2023 — https://owasp.org/API-Security/",
        "Burp Suite Documentation — https://portswigger.net/burp/documentation",
        "CVSS v3.1 Specification — https://www.first.org/cvss/v3.1/specification-document",
    ]
    for ref in refs:
        doc.add_paragraph(ref, style='List Bullet')

    # Save
    reports_dir = get_storage_path("reports")
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"VAPT_Report_{project_id}_{timestamp}.docx"
    file_path = os.path.join(reports_dir, filename)
    doc.save(file_path)
    return file_path


# ──────────────────────────────────────────────────────────────────────────────
# PDF generation
# ──────────────────────────────────────────────────────────────────────────────

def generate_pdf_report(project_id: int, db: Session) -> str:
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
            PageBreak, HRFlowable
        )
        from reportlab.lib.enums import TA_CENTER, TA_LEFT
    except ImportError:
        raise RuntimeError("reportlab not installed. Run: pip install reportlab")

    project = db.query(Project).filter(Project.id == project_id).first()
    student = db.query(Student).filter(Student.project_id == project_id).first()
    labs = db.query(Lab).filter(Lab.project_id == project_id).all()
    findings = db.query(Finding).join(Lab).filter(Lab.project_id == project_id).all()
    categories = db.query(VulnerabilityCategory).order_by(VulnerabilityCategory.sort_order).all()

    reports_dir = get_storage_path("reports")
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"VAPT_Report_{project_id}_{timestamp}.pdf"
    file_path = os.path.join(reports_dir, filename)

    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2.5*cm, bottomMargin=2.5*cm
    )

    styles = getSampleStyleSheet()
    navy = colors.HexColor("#1e40af")
    dark = colors.HexColor("#1e293b")

    title_style = ParagraphStyle("Title", parent=styles["Title"],
        fontSize=28, textColor=navy, spaceAfter=12, alignment=TA_CENTER)
    h1_style = ParagraphStyle("H1", parent=styles["Heading1"],
        fontSize=16, textColor=navy, spaceBefore=18, spaceAfter=8)
    h2_style = ParagraphStyle("H2", parent=styles["Heading2"],
        fontSize=13, textColor=dark, spaceBefore=12, spaceAfter=6)
    h3_style = ParagraphStyle("H3", parent=styles["Heading3"],
        fontSize=11, textColor=dark, spaceBefore=8, spaceAfter=4)
    body_style = ParagraphStyle("Body", parent=styles["Normal"],
        fontSize=10, leading=14, spaceAfter=6)
    code_style = ParagraphStyle("Code", parent=styles["Code"],
        fontSize=8, fontName="Courier", leading=10, backColor=colors.HexColor("#f1f5f9"))
    label_style = ParagraphStyle("Label", parent=styles["Normal"],
        fontSize=10, fontName="Helvetica-Bold", spaceAfter=2)

    import html

    story = []

    def add_h1(text):
        story.append(Paragraph(html.escape(str(text)), h1_style))
        story.append(HRFlowable(width="100%", thickness=1, color=navy))
        story.append(Spacer(1, 8))

    def add_h2(text):
        story.append(Paragraph(html.escape(str(text)), h2_style))

    def add_h3(text):
        story.append(Paragraph(html.escape(str(text)), h3_style))

    def add_body(text):
        if text:
            escaped = html.escape(str(text)).replace('\n', '<br/>')
            story.append(Paragraph(escaped, body_style))

    def add_field(label, value):
        if value:
            escaped_val = html.escape(str(value)).replace('\n', '<br/>')
            story.append(Paragraph(f"<b>{html.escape(str(label))}:</b> {escaped_val}", body_style))

    def add_code(text):
        if text:
            escaped = html.escape(str(text)).replace('\n', '<br/>')
            story.append(Paragraph(escaped, code_style))

    # ── Cover ─────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 3*cm))
    story.append(Paragraph("WEBVAPT", title_style))
    story.append(Paragraph("PortSwigger Web Security Academy", ParagraphStyle(
        "Sub", parent=styles["Normal"], fontSize=14, alignment=TA_CENTER,
        textColor=navy, spaceAfter=4
    )))
    story.append(Paragraph("Vulnerability Assessment & Penetration Testing Report", ParagraphStyle(
        "Sub2", parent=styles["Normal"], fontSize=12, alignment=TA_CENTER, spaceAfter=30
    )))
    story.append(HRFlowable(width="100%", thickness=2, color=navy))
    story.append(Spacer(1, 1*cm))

    if project:
        story.append(Paragraph(f"<b>Project:</b> {project.name}", ParagraphStyle(
            "Info", parent=styles["Normal"], fontSize=12, alignment=TA_CENTER)))
    if student:
        for label, val in [
            ("Student", student.student_name), ("USN", student.usn),
            ("College", student.college), ("Department", student.department),
            ("Batch", student.batch), ("Guide", student.project_guide),
        ]:
            if val:
                story.append(Paragraph(f"<b>{label}:</b> {val}", ParagraphStyle(
                    "InfoS", parent=styles["Normal"], fontSize=11, alignment=TA_CENTER)))
    if project:
        if project.start_date:
            story.append(Paragraph(f"<b>Start Date:</b> {project.start_date}", ParagraphStyle(
                "InfoD", parent=styles["Normal"], fontSize=11, alignment=TA_CENTER)))
        if project.submission_date:
            story.append(Paragraph(f"<b>Submission:</b> {project.submission_date}", ParagraphStyle(
                "InfoD2", parent=styles["Normal"], fontSize=11, alignment=TA_CENTER)))

    story.append(PageBreak())

    # ── ToC ───────────────────────────────────────────────────────────────────
    add_h1("Table of Contents")
    toc_items = [
        "1. Abstract", "2. Project Introduction", "3. Project Objective",
        "4. Scope of Assessment", "5. Tools and Technologies", "6. Methodology",
        "7. Vulnerability Assessments", "8. Consolidated Findings",
        "9. Severity Classification", "10. Impact Analysis",
        "11. Recommendations", "12. Conclusion", "13. References"
    ]
    for item in toc_items:
        story.append(Paragraph(item, body_style))
    story.append(PageBreak())

    # ── Abstract ──────────────────────────────────────────────────────────────
    add_h1("1. Abstract")
    add_body(
        "This report documents vulnerability assessment and penetration testing "
        "conducted on assigned PortSwigger Web Security Academy labs as part of the "
        "WebVAPT Minor Project. Eight vulnerability categories were assessed: "
        "SQL Injection, XSS, CSRF, CORS, IDOR/API1, API3 BOPLA, API4 Unrestricted "
        "Resource Consumption, and SSRF. All testing was performed exclusively in "
        "controlled, authorized lab environments."
    )
    story.append(PageBreak())

    # ── Sections ──────────────────────────────────────────────────────────────
    add_h1("2. Project Introduction")
    add_body(
        "This WebVAPT project involves systematic investigation of web application "
        "vulnerabilities using PortSwigger Web Security Academy. Each lab provides "
        "a controlled, intentionally vulnerable application for educational testing."
    )

    add_h1("3. Project Objective")
    add_body(
        "Demonstrate understanding and exploitation of eight vulnerability categories "
        "through authorized lab exercises, document findings with Burp Suite evidence, "
        "assess impact, and recommend mitigations."
    )

    add_h1("4. Scope of Assessment")
    add_body(
        "Scope: Assigned PortSwigger Web Security Academy labs only. "
        "No real-world systems or unauthorized targets were tested."
    )

    add_h1("5. Tools and Technologies")
    tools = [
        "Burp Suite Community/Professional — HTTP interception",
        "PortSwigger Web Security Academy — Lab environment",
        "WebVAPT Platform — Documentation system",
        "Firefox/Chrome — Browser",
        "Python 3.13 / FastAPI — Backend",
        "React / TypeScript — Frontend",
        "SQLite — Database",
        "ReportLab / python-docx — Report generation",
    ]
    for t in tools:
        story.append(Paragraph(f"• {t}", body_style))

    add_h1("6. Methodology")
    steps = [
        "Reconnaissance & Lab Understanding",
        "HTTP Request Interception",
        "Vulnerability Testing",
        "Evidence Collection",
        "Finding Documentation & Severity Assessment",
        "Impact Analysis",
        "Remediation Recommendations",
    ]
    for i, s in enumerate(steps, 1):
        story.append(Paragraph(f"{i}. {s}", body_style))
    story.append(PageBreak())

    # ── Category Assessments ──────────────────────────────────────────────────
    add_h1("7. Vulnerability Assessments")

    for idx, cat in enumerate(categories, 1):
        add_h2(f"7.{idx} {cat.name}")
        add_body(cat.description)
        cat_labs = [l for l in labs if l.category_slug == cat.slug]
        if not cat_labs:
            add_body("No labs recorded for this category.")
            continue
        for lab in cat_labs:
            add_h3(f"Lab: {lab.lab_name}")
            data = [
                ["Field", "Value"],
                ["Status", lab.status or ""],
                ["Lab URL", (lab.lab_url or "")[:80]],
                ["Objective", (lab.objective or "")[:200]],
                ["Affected Endpoint", lab.affected_endpoint or ""],
                ["HTTP Method", lab.http_method or ""],
                ["Vulnerable Parameter", lab.vulnerable_parameter or ""],
                ["Severity", lab.severity or ""],
            ]
            t = Table(data, colWidths=[4*cm, 13*cm])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), navy),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('WORDWRAP', (0, 0), (-1, -1), True),
            ]))
            story.append(t)
            story.append(Spacer(1, 6))

            if lab.payload_used:
                add_body("<b>Payload:</b>")
                add_code(lab.payload_used)
            if lab.original_request:
                add_body("<b>Original Request:</b>")
                add_code(lab.original_request[:500])
            if lab.modified_request:
                add_body("<b>Modified Request:</b>")
                add_code(lab.modified_request[:500])
            if lab.steps_to_reproduce:
                add_field("Steps to Reproduce", lab.steps_to_reproduce)
            if lab.impact:
                add_field("Impact", lab.impact)
            if lab.recommendation:
                add_field("Recommendation", lab.recommendation)

    story.append(PageBreak())

    # ── Consolidated Findings ─────────────────────────────────────────────────
    add_h1("8. Consolidated Vulnerability Findings")

    if not findings:
        add_body("No findings recorded.")
    else:
        tbl_data = [["ID", "Title", "Category", "Severity", "Endpoint"]]
        for f in findings:
            tbl_data.append([
                f.finding_id or str(f.id),
                (f.title or "")[:40],
                (f.vulnerability_category or "")[:20],
                f.severity or "",
                (f.affected_endpoint or "")[:30],
            ])
        t = Table(tbl_data, colWidths=[2*cm, 5.5*cm, 3.5*cm, 2.5*cm, 3.5*cm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), navy),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f0f9ff")]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ]))
        story.append(t)
        story.append(Spacer(1, 12))

        # Detailed findings
        for f in findings:
            add_h2(f"Finding: {f.title}")
            fields = [
                ("Finding ID", f.finding_id),
                ("Category", f.vulnerability_category),
                ("OWASP", f.owasp_classification),
                ("Lab Name", f.lab_name),
                ("Objective", f.objective),
                ("Description", f.description),
                ("Affected Endpoint", f.affected_endpoint),
                ("Parameter", f.affected_parameter),
                ("HTTP Method", f.http_method),
                ("Payload Used", f.payload_used),
                ("Steps to Reproduce", f.steps_to_reproduce),
                ("Impact", f.impact),
                ("Recommendation", f.recommendation),
                ("Severity", f.severity),
                ("Severity Justification", f.severity_justification),
                ("Discovery Date", f.discovery_date),
                ("Burp Request Screenshot", f.burp_request_screenshot or "See evidence"),
                ("Burp Response Screenshot", f.burp_response_screenshot or "See evidence"),
                ("Proof of Exploitation", f.proof_screenshot or "See evidence"),
            ]
            for label, val in fields:
                if val:
                    add_field(label, str(val)[:300])
            story.append(Spacer(1, 8))

    story.append(PageBreak())

    # ── Severity Summary ──────────────────────────────────────────────────────
    add_h1("9. Severity Classification Summary")
    sev_data = [["Severity", "Count", "Percentage"]]
    total = len(findings)
    for sev in ["Critical", "High", "Medium", "Low", "Informational"]:
        cnt = sum(1 for f in findings if f.severity == sev)
        pct = f"{(cnt/total*100):.1f}%" if total else "0%"
        sev_data.append([sev, str(cnt), pct])
    sev_t = Table(sev_data, colWidths=[5*cm, 3*cm, 4*cm])
    sev_t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), navy),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
    ]))
    story.append(sev_t)
    story.append(PageBreak())

    # ── Recommendations ───────────────────────────────────────────────────────
    add_h1("10. Recommendations")
    if findings:
        for f in findings:
            if f.recommendation:
                rec_text = f"<b>[{html.escape(str(f.severity or ''))}] {html.escape(str(f.title or ''))}:</b> {html.escape(str(f.recommendation))}"
                story.append(Paragraph(rec_text, body_style))
    else:
        add_body("No recommendations available.")

    # ── Conclusion ────────────────────────────────────────────────────────────
    add_h1("11. Conclusion")
    add_body(
        "This assessment demonstrates the practical identification and documentation of "
        "eight web vulnerability categories. All findings are from authorized PortSwigger "
        "lab environments. The security concepts and mitigations documented here should "
        "be applied in real applications to improve security posture."
    )

    # ── References ────────────────────────────────────────────────────────────
    add_h1("12. References")
    refs = [
        "PortSwigger Web Security Academy — https://portswigger.net/web-security",
        "OWASP Top 10 2021 — https://owasp.org/Top10/",
        "OWASP API Security Top 10 2023 — https://owasp.org/API-Security/",
        "Burp Suite Documentation — https://portswigger.net/burp/documentation",
        "CVSS v3.1 — https://www.first.org/cvss/v3.1/specification-document",
    ]
    for r in refs:
        story.append(Paragraph(f"• {r}", body_style))

    # Page numbers
    def add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.HexColor("#64748b"))
        page_num = canvas.getPageNumber()
        canvas.drawString(A4[0] - 3*cm, 1.5*cm, f"Page {page_num}")
        canvas.drawString(2*cm, 1.5*cm, "WebVAPT — VAPT Report | Confidential")
        canvas.restoreState()

    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    return file_path


# ──────────────────────────────────────────────────────────────────────────────
# ZIP Evidence Export
# ──────────────────────────────────────────────────────────────────────────────

def export_evidence_zip(project_id: int, db: Session) -> str:
    labs = db.query(Lab).filter(Lab.project_id == project_id).all()
    lab_ids = [l.id for l in labs]

    all_evidence = db.query(Evidence).filter(Evidence.lab_id.in_(lab_ids)).all()

    exports_dir = get_storage_path("exports")
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_filename = f"Evidence_Export_{project_id}_{timestamp}.zip"
    zip_path = os.path.join(exports_dir, zip_filename)

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for ev in all_evidence:
            if ev.file_path and os.path.exists(ev.file_path):
                arcname = f"{ev.evidence_type}/{ev.original_filename}"
                zf.write(ev.file_path, arcname)

    return zip_path
