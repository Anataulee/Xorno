$bloat = @(
  "Microsoft.3DViewer", "Microsoft.3DBuilder", "Microsoft.GetHelp", "Microsoft.Getstarted",
  "Microsoft.MicrosoftSolitaireCollection", "Microsoft.People", "Microsoft.SkypeApp",
  "Microsoft.MicrosoftOfficeHub", "Microsoft.WindowsMaps", "Microsoft.ZuneMusic",
  "Microsoft.ZuneVideo", "Microsoft.BingWeather", "Microsoft.BingNews",
  "Microsoft.BingFinance", "Microsoft.BingSports", "Microsoft.WindowsFeedbackHub",
  "Microsoft.MicrosoftStickyNotes", "Microsoft.XboxApp", "Microsoft.YourPhone"
)

foreach ($id in $bloat) {
  Write-Host "Suppression de $id..."
  $pkgs = Get-AppxPackage -AllUsers -Name $id | Select-Object -ExpandProperty PackageFullName
  if ($pkgs) {
    foreach ($pkg in $pkgs) {
      try {
        Remove-AppxPackage -Package $pkg -AllUsers -ErrorAction Stop
        Write-Host "$id désinstallé."
      } catch [System.Runtime.InteropServices.COMException] {
        if ($_.Exception.ErrorCode -eq -2147024894) {
          Write-Host "$id déjà supprimé ou non présent."
        } else {
          Write-Host "Erreur suppression de $id : $($_.Exception.Message)"
        }
      }
    }
  } else {
    Write-Host "$id non trouvé."
  }

  $prov = Get-AppxProvisionedPackage -Online | Where-Object { $_.PackageName -eq $id }
  if ($prov) {
    try {
      Remove-AppxProvisionedPackage -Online -PackageName $id -ErrorAction Stop
      Write-Host "$id provisionné supprimé."
    } catch {
      Write-Host "Erreur provision $id : $($_.Exception.Message)"
    }
  }
}

Write-Host "Désinstallation des bloatwares terminée."
