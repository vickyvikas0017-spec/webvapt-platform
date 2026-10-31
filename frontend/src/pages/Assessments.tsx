import React from 'react'
import { useApp } from '../hooks/useApp'
import { AssessmentWorkspace } from '../components/AssessmentWorkspace'
import { Alert } from '../components/UI'

export const SQLiAssessment: React.FC = () => {
  const { projectId } = useApp()
  if (!projectId) return <Alert type="warning">Please create a project in Settings first.</Alert>
  return (
    <AssessmentWorkspace
      projectId={projectId}
      categorySlug="sqli"
      categoryName="SQL Injection"
      description="Investigate SQL injection vulnerabilities in assigned PortSwigger Academy labs. Test only in controlled lab environments."
      workflowSteps={[
        'Open the assigned PortSwigger lab',
        'Configure browser to use Burp Suite proxy',
        'Intercept the original HTTP request',
        'Send request to Burp Repeater',
        'Record the original request',
        'Test using appropriate SQLi technique',
        'Record the modified request',
        'Record the response',
        'Capture proof of lab result',
        'Document vulnerability & remediation',
      ]}
      learningRefs={[
        { label: 'Error-based SQLi', desc: 'Triggers database errors to extract information' },
        { label: 'UNION-based SQLi', desc: 'Uses UNION SELECT to retrieve data from other tables' },
        { label: 'Blind SQLi', desc: 'No visible output — infer results from application behaviour' },
        { label: 'Boolean-based', desc: 'True/false conditions change application response' },
        { label: 'Time-based', desc: 'Uses time delays (SLEEP, WAITFOR) to infer data' },
      ]}
    />
  )
}

export const XSSAssessment: React.FC = () => {
  const { projectId } = useApp()
  if (!projectId) return <Alert type="warning">Please create a project in Settings first.</Alert>
  return (
    <AssessmentWorkspace
      projectId={projectId}
      categorySlug="xss"
      categoryName="Cross-Site Scripting (XSS)"
      description="Document Reflected, Stored, and DOM-based XSS vulnerabilities in assigned PortSwigger labs."
      workflowSteps={[
        'Identify the input point',
        'Understand how input is processed',
        'Inspect the HTTP request in Burp',
        'Investigate the response',
        'Test the assigned lab',
        'Verify whether script execution occurs',
        'Capture evidence (screenshots)',
        'Document remediation',
      ]}
      learningRefs={[
        { label: 'Reflected XSS', desc: 'Injected script reflected immediately in response' },
        { label: 'Stored XSS', desc: 'Script stored in database, executed for all users' },
        { label: 'DOM-based XSS', desc: 'Script executes via DOM manipulation without server' },
        { label: 'HTML Context', desc: 'Injection into HTML tags and attributes' },
        { label: 'JavaScript Context', desc: 'Injection inside script blocks or event handlers' },
      ]}
    />
  )
}

export const CSRFAssessment: React.FC = () => {
  const { projectId } = useApp()
  if (!projectId) return <Alert type="warning">Please create a project in Settings first.</Alert>
  return (
    <AssessmentWorkspace
      projectId={projectId}
      categorySlug="csrf"
      categoryName="CSRF – Cross-Site Request Forgery"
      description="Assess CSRF vulnerabilities in assigned PortSwigger labs. Document state-changing actions and CSRF protection mechanisms."
      workflowSteps={[
        'Identify the state-changing operation',
        'Inspect the original request in Burp',
        'Check whether CSRF protection exists',
        'Inspect token validation',
        'Review cookie security attributes',
        'Perform the assigned lab demonstration',
        'Capture successful evidence',
        'Explain the security impact',
      ]}
      learningRefs={[
        { label: 'CSRF Tokens', desc: 'Synchronizer tokens prevent cross-site request forgery' },
        { label: 'SameSite Cookie', desc: 'Restricts cookies to same-site requests' },
        { label: 'Origin Validation', desc: 'Check Origin/Referer headers for request legitimacy' },
        { label: 'Double Submit', desc: 'Cookie value matched against request parameter' },
      ]}
    />
  )
}

export const CORSAssessment: React.FC = () => {
  const { projectId } = useApp()
  if (!projectId) return <Alert type="warning">Please create a project in Settings first.</Alert>
  return (
    <AssessmentWorkspace
      projectId={projectId}
      categorySlug="cors"
      categoryName="CORS – Cross-Origin Resource Sharing"
      description="Identify misconfigured CORS policies that allow unauthorized cross-origin access. Test assigned PortSwigger labs only."
      workflowSteps={[
        'Inspect the original response headers',
        'Identify CORS-related headers',
        'Investigate allowed origins',
        'Check credential-related configuration',
        'Perform the assigned lab test',
        'Record the result',
        'Explain its impact',
        'Recommend secure CORS configuration',
      ]}
      learningRefs={[
        { label: 'ACAO Header', desc: 'Access-Control-Allow-Origin controls allowed origins' },
        { label: 'ACAC Header', desc: 'Access-Control-Allow-Credentials enables cookie sharing' },
        { label: 'Wildcard Origin', desc: 'Using * is unsafe with credentials' },
        { label: 'Origin Reflection', desc: 'Reflecting arbitrary Origin values is a critical misconfiguration' },
      ]}
    />
  )
}

export const IDORAssessment: React.FC = () => {
  const { projectId } = useApp()
  if (!projectId) return <Alert type="warning">Please create a project in Settings first.</Alert>
  return (
    <AssessmentWorkspace
      projectId={projectId}
      categorySlug="idor"
      categoryName="IDOR / API1 – Broken Object Level Authorization"
      description="Test whether object-level authorization can be bypassed. Use only lab-provided test accounts. Never access real user data."
      workflowSteps={[
        'Identify an API endpoint',
        'Identify object identifiers in requests',
        'Observe authorized account behaviour',
        'Inspect access control enforcement',
        'Perform assigned lab test with provided accounts',
        'Record whether unauthorized object access occurred',
        'Capture evidence',
        'Explain remediation',
      ]}
      learningRefs={[
        { label: 'Object ID Tampering', desc: 'Changing numeric/GUID IDs to access other users data' },
        { label: 'Horizontal Privilege Escalation', desc: 'Accessing same-level resources of other users' },
        { label: 'Authorization Checks', desc: 'Server must verify ownership for every request' },
        { label: 'Indirect References', desc: 'Use non-guessable IDs or map them server-side' },
      ]}
    />
  )
}

export const BOPLAAssessment: React.FC = () => {
  const { projectId } = useApp()
  if (!projectId) return <Alert type="warning">Please create a project in Settings first.</Alert>
  return (
    <AssessmentWorkspace
      projectId={projectId}
      categorySlug="bopla"
      categoryName="API3 – Broken Object Property Level Authorization"
      description="Assess unauthorized property exposure or modification (BOPLA). Document what properties should vs actually are accessible."
      workflowSteps={[
        'Identify the API endpoint and object structure',
        'Identify sensitive object properties',
        'Compare expected vs actual visible properties',
        'Attempt to send unauthorized properties',
        'Observe server-side acceptance',
        'Document excessive data exposure',
        'Capture evidence',
        'Recommend property-level filtering',
      ]}
      learningRefs={[
        { label: 'Excessive Data Exposure', desc: 'API returns more data than the client needs' },
        { label: 'Mass Assignment', desc: 'Client can set server-side properties not intended to be public' },
        { label: 'Property Filtering', desc: 'Only expose/accept necessary properties per role' },
        { label: 'Response Shaping', desc: 'Use DTOs to control exactly what is returned' },
      ]}
    />
  )
}

export const API4Assessment: React.FC = () => {
  const { projectId } = useApp()
  if (!projectId) return <Alert type="warning">Please create a project in Settings first.</Alert>
  return (
    <AssessmentWorkspace
      projectId={projectId}
      categorySlug="api4"
      categoryName="API4 – Unrestricted Resource Consumption"
      description="Document missing rate limiting and resource controls. IMPORTANT: Never conduct DoS attacks or uncontrolled load tests."
      workflowSteps={[
        'Identify resource-intensive API functionality',
        'Inspect request parameters for limits',
        'Review pagination and limit controls',
        'Review rate-limiting behaviour',
        'Examine resource consumption controls',
        'Perform only the assigned safe lab demonstration',
        'Record observations',
        'Recommend rate limiting and quotas',
      ]}
      learningRefs={[
        { label: 'Rate Limiting', desc: 'Limit number of requests per time window per client' },
        { label: 'Pagination', desc: 'Enforce max page size to prevent large data dumps' },
        { label: 'Resource Quotas', desc: 'Cap compute, storage, or API call consumption' },
        { label: 'Throttling', desc: 'Slow down excessive requests rather than hard blocking' },
      ]}
    />
  )
}

export const SSRFAssessment: React.FC = () => {
  const { projectId } = useApp()
  if (!projectId) return <Alert type="warning">Please create a project in Settings first.</Alert>
  return (
    <AssessmentWorkspace
      projectId={projectId}
      categorySlug="ssrf"
      categoryName="SSRF – Server-Side Request Forgery"
      description="Investigate SSRF vulnerabilities in assigned labs. Never test against arbitrary internal networks or real cloud metadata endpoints."
      workflowSteps={[
        'Identify URL-fetching functionality',
        'Inspect relevant URL parameters',
        'Capture the original request in Burp',
        'Identify server-side request behaviour',
        'Perform assigned PortSwigger lab test',
        'Record the response',
        'Capture proof of exploitation',
        'Document security impact',
        'Recommend remediation',
      ]}
      learningRefs={[
        { label: 'Internal SSRF', desc: 'Force server to request internal/localhost resources' },
        { label: 'Cloud Metadata', desc: 'Access cloud metadata endpoints (lab context only)' },
        { label: 'Allowlist', desc: 'Only allow requests to approved domains' },
        { label: 'Input Validation', desc: 'Validate and sanitize all user-supplied URLs' },
      ]}
    />
  )
}
