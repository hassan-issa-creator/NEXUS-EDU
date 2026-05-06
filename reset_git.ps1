Write-Host "Resetting Local Git History..." -ForegroundColor Cyan

# Check if .git folder exists and remove it
if (Test-Path ".git") {
    Remove-Item -Recurse -Force ".git" -ErrorAction SilentlyContinue
    Write-Host "Deleted old .git directory" -ForegroundColor Green
}

# Initialize fresh git repository
Write-Host "Initializing new Git repository..." -ForegroundColor Yellow
git init
git add .
git commit -m "Initial commit: Nexus EDU Phase 1 (Clean Start)"

Write-Host "Local Git has been reset successfully!" -ForegroundColor Green
Write-Host "------------------------------------------------" -ForegroundColor Cyan
Write-Host "To overwrite your old GitHub repository with this clean start, run:" -ForegroundColor Yellow
Write-Host "git remote add origin [رابط-حسابك-على-جيتهاب]"
Write-Host "git push -u --force origin master" -ForegroundColor Red
