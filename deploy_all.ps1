# Million Platform Deployment Script
# This script helps you deploy the platform components.

Write-Host "🚀 Starting Million Platform Deployment Preparation..." -ForegroundColor Cyan

# 1. Check for prerequisite tools
$tools = @("vercel", "railway")
foreach ($tool in $tools) {
    if (!(Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Host "⚠️ Warning: $tool CLI is not installed or not in PATH." -ForegroundColor Yellow
        Write-Host "Please install it using: npm install -g $tool"
    }
}

# 2. Frontend Deployment (Vercel)
Write-Host "`n🌐 Deploying Frontend (apps/web)..." -ForegroundColor Green
# cd apps/web
# vercel --prod
Write-Host "Action required: Run 'vercel login' then 'vercel --prod' in apps/web" -ForegroundColor Gray

# 3. Backend Deployment (Railway)
Write-Host "`n⚙️ Deploying Backend (apps/api)..." -ForegroundColor Green
# cd apps/api
# railway link
# railway up
Write-Host "Action required: Run 'railway login' then 'railway up' in apps/api" -ForegroundColor Gray

Write-Host "`n✅ Preparation complete. Follow the manual steps above to finalize deployment." -ForegroundColor Cyan
