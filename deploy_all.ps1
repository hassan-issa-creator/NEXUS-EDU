# ============================================
# Nexus EDU — Windows PowerShell Deploy Script
# Usage: .\deploy_all.ps1
# ============================================

Write-Host "🚀 Nexus EDU Production Build & Deploy" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# ─── Check .env ───────────────────────────────────────────────
if (-not (Test-Path "$root\.env")) {
    Write-Host "❌ .env not found! Copy .env.production → .env and fill in values." -ForegroundColor Red
    exit 1
}
Write-Host "✅ .env found" -ForegroundColor Green

# ─── Build API ────────────────────────────────────────────────
Write-Host "`n📦 Building API (NestJS)..." -ForegroundColor Yellow
Set-Location "$root\apps\api"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ API build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ API build successful" -ForegroundColor Green

# ─── Build Web ────────────────────────────────────────────────
Write-Host "`n📦 Building Frontend (Next.js)..." -ForegroundColor Yellow
Set-Location "$root\apps\web"
$env:NEXT_TELEMETRY_DISABLED = "1"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Web build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Web build successful" -ForegroundColor Green

# ─── Summary ──────────────────────────────────────────────────
Set-Location $root
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Build Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps for deployment:" -ForegroundColor Yellow
Write-Host "  1. Push code to GitHub:  git push origin main"
Write-Host "  2. On VPS run:           bash deploy.sh"
Write-Host "  3. Or use Vercel/Railway (see deployment_guide.md)"
Write-Host ""
Write-Host "🌐 Local preview (already running):" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   Backend:  http://localhost:4000"
Write-Host "   Health:   http://localhost:4000/health"
