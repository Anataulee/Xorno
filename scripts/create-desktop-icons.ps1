# Affichage des icônes système Ce PC, Utilisateur et Corbeille
$regPaths = @(
  'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\HideDesktopIcons\NewStartPanel',
  'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\HideDesktopIcons\ClassicStartMenu'
)
$regDesktopNS = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Desktop\NameSpace'

$guids = @{
  "CePC"        = "{20D04FE0-3AEA-1069-A2D8-08002B30309D}"
  "Utilisateur" = "{59031a47-3f72-44a7-89c5-5595fe6b30ee}"
  "Corbeille"   = "{645FF040-5081-101B-9F08-00AA002F954E}"
}

foreach ($path in $regPaths) {
  if (-not (Test-Path $path)) {
    New-Item -Path $path -Force | Out-Null
  }
  foreach ($guid in $guids.Values) {
    Set-ItemProperty -Path $path -Name $guid -Value 0 -Force
  }
}

if (-not (Test-Path $regDesktopNS)) {
  New-Item -Path $regDesktopNS -Force | Out-Null
}
foreach ($guid in $guids.Values) {
  $itemPath = Join-Path $regDesktopNS $guid
  if (-not (Test-Path $itemPath)) {
    New-Item -Path $itemPath | Out-Null
  }
}

# Redémarrage propre d'explorer.exe
Stop-Process -Name explorer -Force
Start-Sleep -Milliseconds 500
Start-Process explorer.exe
Start-Sleep -Milliseconds 1000

# Création du raccourci “Panneau de configuration”
$desktop = [Environment]::GetFolderPath('Desktop')
Add-Type -AssemblyName 'Windows Script Host Object Model'
$ws = New-Object -ComObject WScript.Shell

$lnk = Join-Path $desktop "Panneau de configuration.lnk"
if (Test-Path $lnk) { Remove-Item $lnk -Force }
$shortcut = $ws.CreateShortcut($lnk)
$shortcut.TargetPath = "control.exe"
$shortcut.Save()
