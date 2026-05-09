$src = "C:\Users\hassa\Desktop\anti\photo 2"
$dest = "C:\Users\hassa\Desktop\anti\million-platform\apps\web\public\images"
$authDest = "$dest\auth"

# Define mapping
$mapping = @{
    "ChatGPT Image May 9, 2026, 04_36_54 AM.png" = "$dest\hero-banner-new.png"
    "ChatGPT Image May 9, 2026, 05_34_03 AM.png" = "$dest\ai-learning-new.png"
    "ChatGPT Image May 9, 2026, 05_34_37 AM.png" = "$dest\vision-2030-new.png"
    "ChatGPT Image May 9, 2026, 05_34_43 AM.png" = "$dest\parent-monitoring-new.png"
    "ChatGPT Image May 9, 2026, 05_34_53 AM.png" = "$dest\stats-comparison-new.png"
    "ChatGPT Image May 9, 2026, 05_35_24 AM.png" = "$dest\leaderboard-new.png"
    "ChatGPT Image May 9, 2026, 05_35_10 AM.png" = @("$authDest\admin.png", "$authDest\principal.png", "$authDest\vice_principal.png", "$authDest\supervisor.png")
    "ChatGPT Image May 9, 2026, 05_35_15 AM.png" = "$authDest\teacher.png"
    "ChatGPT Image May 9, 2026, 05_35_27 AM.png" = "$authDest\student.png"
    "ChatGPT Image May 9, 2026, 05_35_20 AM.png" = "$authDest\parent.png"
    "ChatGPT Image May 9, 2026, 05_34_46 AM.png" = "$authDest\counselor.png"
}

foreach ($key in $mapping.Keys) {
    $sourceFile = Join-Path $src $key
    if (Test-Path $sourceFile) {
        $targets = $mapping[$key]
        if ($targets -is [array]) {
            foreach ($target in $targets) {
                Copy-Item -Path $sourceFile -Destination $target -Force
                Write-Host "Copied $key to $target"
            }
        } else {
            Copy-Item -Path $sourceFile -Destination $targets -Force
            Write-Host "Copied $key to $targets"
        }
    } else {
        Write-Host "Source file not found: $sourceFile"
    }
}
