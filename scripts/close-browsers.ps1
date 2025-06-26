Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue
Stop-Process -Name msedge -Force -ErrorAction SilentlyContinue
Stop-Process -Name firefox -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "Navigateurs fermés."
