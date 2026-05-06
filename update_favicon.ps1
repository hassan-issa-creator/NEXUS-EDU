$sourceFile = "c:\Users\hassa\Desktop\anti\million-platform\apps\web\public\logo_new.jpeg"
$destinationFile = "c:\Users\hassa\Desktop\anti\million-platform\apps\web\app\favicon.ico"

Write-Host "Copying new logo to replace old favicon..." -ForegroundColor Cyan

if (Test-Path $sourceFile) {
    Copy-Item -Path $sourceFile -Destination $destinationFile -Force
    Write-Host "Success! The favicon has been updated." -ForegroundColor Green
    Write-Host "Please go to your browser and press Ctrl + F5 to hard refresh the page." -ForegroundColor Yellow
} else {
    Write-Host "Error: Could not find the source logo at $sourceFile" -ForegroundColor Red
}

Read-Host -Prompt "Press Enter to exit"
