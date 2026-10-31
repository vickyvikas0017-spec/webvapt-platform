# WebVAPT Startup Script for Windows PowerShell
# Run this from the WebVAPT-Minor-Project directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WebVAPT - PortSwigger VAPT Platform" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$PYTHON = "C:\Users\VIKAS VICKY\AppData\Local\Programs\Python\Python313\python.exe"
if (-not (Test-Path $PYTHON)) {
    if (Get-Command py -ErrorAction SilentlyContinue) {
        $PYTHON = "py"
    } elseif (Get-Command python -ErrorAction SilentlyContinue) {
        $PYTHON = "python"
    } elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
        $PYTHON = "python3"
    } else {
        $PYTHON = "python"
    }
}

Write-Host "[1/3] Starting Backend (FastAPI)..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    param($root, $py)
    Set-Location "$root\backend"
    & $py -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
} -ArgumentList $ROOT, $PYTHON

Start-Sleep -Seconds 3

Write-Host "[2/3] Starting Frontend (Vite)..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    param($root)
    Set-Location "$root\frontend"
    npm run dev
} -ArgumentList $ROOT

Start-Sleep -Seconds 4

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Application is starting up!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Gray

# Open browser
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

try {
    while ($true) {
        Start-Sleep -Seconds 2
        $backendOutput = Receive-Job $backendJob
        $frontendOutput = Receive-Job $frontendJob
        if ($backendOutput) { Write-Host "[Backend] $backendOutput" -ForegroundColor DarkGray }
        if ($frontendOutput) { Write-Host "[Frontend] $frontendOutput" -ForegroundColor DarkGray }
    }
} finally {
    Stop-Job $backendJob, $frontendJob
    Remove-Job $backendJob, $frontendJob
    Write-Host "Servers stopped." -ForegroundColor Yellow
}

