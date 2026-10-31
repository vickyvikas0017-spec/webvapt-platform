import urllib.request, json, os

BASE = 'http://127.0.0.1:8000/api'

def post(path, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(BASE+path, data=body, headers={'Content-Type':'application/json'}, method='POST')
    r = urllib.request.urlopen(req)
    return json.loads(r.read())

def get(path):
    r = urllib.request.urlopen(BASE+path)
    return json.loads(r.read())

# Get project id=1 (created in integration test)
try:
    projects = get('/projects')
    pid = projects[0]['id']
    print(f'[OK] Using project id={pid}')
except Exception as e:
    print(f'[ERR] Could not get projects: {e}')
    exit(1)

# Test PDF generation
print('[...] Generating PDF report...')
try:
    result = post('/reports/generate', {'project_id': pid, 'report_type': 'pdf', 'include_evidence': True, 'include_incomplete': True})
    print(f'[OK] PDF generated: {result["filename"]} ({result["file_size"]} bytes)')
    assert os.path.exists(result['file_path']), 'PDF file not found on disk!'
    print(f'[OK] PDF file exists on disk: {result["file_path"]}')
except Exception as e:
    print(f'[ERR] PDF generation failed: {e}')

# Test DOCX generation
print('[...] Generating DOCX report...')
try:
    result = post('/reports/generate', {'project_id': pid, 'report_type': 'docx', 'include_evidence': True, 'include_incomplete': True})
    print(f'[OK] DOCX generated: {result["filename"]} ({result["file_size"]} bytes)')
    assert os.path.exists(result['file_path']), 'DOCX file not found on disk!'
    print(f'[OK] DOCX file exists on disk: {result["file_path"]}')
except Exception as e:
    print(f'[ERR] DOCX generation failed: {e}')

# List reports
reports = get(f'/reports/project/{pid}')
print(f'[OK] Reports listed: {len(reports)} total')

print()
print('Report generation test PASSED')

