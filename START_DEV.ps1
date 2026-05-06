# ============================================
# Million Platform - One-Click Dev Starter
# ============================================
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiDir = "$root\apps\api"
$webDir = "$root\apps\web"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Million Platform - Starting Dev Servers" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Step 1: Start Docker (PostgreSQL + Redis)
Write-Host ""
Write-Host "[1/4] Starting Docker services (PostgreSQL + Redis)..." -ForegroundColor Yellow
Set-Location $root
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "  WARNING: Docker failed. Make sure Docker Desktop is running." -ForegroundColor Red
    Write-Host "  You can still run the API if PostgreSQL is running separately." -ForegroundColor DarkYellow
} else {
    Write-Host "  Docker services started." -ForegroundColor Green
}

# Step 2: Wait for PostgreSQL to be ready
Write-Host ""
Write-Host "[2/4] Waiting 5 seconds for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 3: Generate Prisma client + run migrations
Write-Host ""
Write-Host "[3/4] Setting up Prisma (generate + migrate)..." -ForegroundColor Yellow
Set-Location $apiDir
$env:DATABASE_URL = "postgresql://million_user:million_password@localhost:5432/million_db"
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Prisma client generated." -ForegroundColor Green
} else {
    Write-Host "  Prisma generate failed - check your DATABASE_URL" -ForegroundColor Red
}

npx prisma migrate deploy 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Migrations applied." -ForegroundColor Green
} else {
    Write-Host "  Migration note: might need 'npx prisma migrate dev' on first run." -ForegroundColor DarkYellow
}

# Step 4: Start API in a new window
Write-Host ""
Write-Host "[4/4] Starting API server (port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$apiDir'; npm run dev" -WindowStyle Normal

# Step 5: Wait then start Web
Write-Host ""
Write-Host "[5/4] Waiting 3 seconds then starting Web (port 3002)..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$webDir'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "  API:     http://localhost:3001" -ForegroundColor White
Write-Host "  Swagger: http://localhost:3001/api/docs" -ForegroundColor White
Write-Host "  Web:     http://localhost:3002" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to open the browser..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "http://localhost:3002"
