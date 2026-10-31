import urllib.request, json

BASE = 'http://127.0.0.1:8000/api'

def post(path, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(BASE+path, data=body, headers={'Content-Type':'application/json'}, method='POST')
    r = urllib.request.urlopen(req)
    return json.loads(r.read())

def get(path):
    r = urllib.request.urlopen(BASE+path)
    return json.loads(r.read())

# 1. Create project
p = post('/projects', {'name': 'WebVAPT Integration Test', 'start_date': '2026-10-31', 'submission_date': '2026-11-30'})
print(f'[OK] Project created: id={p["id"]} name={p["name"]}')

# 2. Create student
s = post('/students', {'project_id': p['id'], 'student_name': 'Test Student', 'usn': '1XX21CS001', 'college': 'Test College', 'department': 'CSE', 'batch': '2021-25', 'project_guide': 'Prof. Guide'})
print(f'[OK] Student created: {s["student_name"]} USN={s["usn"]}')

# 3. Create labs for all 8 categories
slugs = ['sqli','xss','csrf','cors','idor','bopla','api4','ssrf']
lab_ids = []
for slug in slugs:
    lab = post('/labs', {
        'project_id': p['id'], 'category_slug': slug,
        'lab_name': f'{slug.upper()} Test Lab',
        'objective': f'Test {slug} vulnerability',
        'status': 'In Progress', 'severity': 'High',
        'affected_endpoint': '/api/test',
        'http_method': 'GET',
        'vulnerable_parameter': 'param',
        'payload_used': 'test_payload',
        'steps_to_reproduce': '1. Open lab\n2. Test',
        'impact': f'{slug} security impact',
        'recommendation': f'Fix {slug} vulnerability',
        'completion_percentage': 50
    })
    lab_ids.append(lab['id'])
    print(f'[OK] Lab created: [{slug}] {lab["lab_name"]}')

# 4. Create findings for each lab
for i, (slug, lab_id) in enumerate(zip(slugs, lab_ids)):
    f = post('/findings', {
        'lab_id': lab_id,
        'title': f'{slug.upper()} Vulnerability Found',
        'category_slug': slug,
        'vulnerability_category': slug.upper(),
        'severity': ['Critical','High','High','Medium','High','Medium','Medium','High'][i],
        'payload_used': 'test_payload',
        'impact': f'{slug} impact',
        'recommendation': f'{slug} recommendation',
        'steps_to_reproduce': '1. Test step'
    })
    print(f'[OK] Finding: {f["finding_id"]} severity={f["severity"]}')

# 5. Dashboard check
d = get(f'/dashboard/{p["id"]}')
print(f'[OK] Dashboard: findings={d["total_findings"]}, categories={d["total_categories"]}, completion={d["overall_completion"]}%')

# 6. Categories check
cats = get('/categories')
cat_slugs = {c['slug'] for c in cats}
expected = {'sqli','xss','csrf','cors','idor','bopla','api4','ssrf'}
assert cat_slugs == expected, f'Missing: {expected - cat_slugs}'
print(f'[OK] All 8 categories verified: {sorted(cat_slugs)}')

# 7. Findings summary
summary = get('/findings-summary')
print(f'[OK] Findings summary: total={summary["total"]} by_category={summary["by_category"]}')

print()
print('============================================')
print(' INTEGRATION TEST PASSED - All checks OK!')
print('============================================')

