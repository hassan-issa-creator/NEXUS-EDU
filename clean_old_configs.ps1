Write-Host "Cleaning old Vercel configurations..." -ForegroundColor Cyan

# Remove root vercel config
if (Test-Path ".vercel") {
    Remove-Item -Recurse -Force ".vercel"
    Write-Host "Deleted /.vercel directory" -ForegroundColor Green
}

if (Test-Path "vercel.json") {
    Remove-Item -Force "vercel.json"
    Write-Host "Deleted /vercel.json file" -ForegroundColor Green
}

# Remove web app vercel config
if (Test-Path "apps\web\.vercel") {
    Remove-Item -Recurse -Force "apps\web\.vercel"
    Write-Host "Deleted /apps/web/.vercel directory" -ForegroundColor Green
}

Write-Host "Cleanup complete! You are ready for a fresh start." -ForegroundColor Green
