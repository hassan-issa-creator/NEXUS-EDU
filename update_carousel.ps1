$src = "C:\Users\hassa\Desktop\anti\photo 2"
$dest = "C:\Users\hassa\Desktop\anti\million-platform\apps\web\public\images"

Copy-Item -Path "$src\ChatGPT Image May 9, 2026, 05_34_37 AM.png" -Destination "$dest\hero-1.png" -Force
Copy-Item -Path "$src\ChatGPT Image May 9, 2026, 04_36_54 AM.png" -Destination "$dest\hero-2.png" -Force
Copy-Item -Path "$src\ChatGPT Image May 9, 2026, 05_34_53 AM.png" -Destination "$dest\hero-3.png" -Force
Copy-Item -Path "$src\ChatGPT Image May 9, 2026, 05_35_10 AM.png" -Destination "$dest\hero-4.png" -Force

Write-Host "Carousel images updated successfully with the 4 selected images!"
