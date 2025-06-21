# Forcer l'encodage UTF-8 pour éviter les caractères incorrects
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Add-Type -AssemblyName System.Windows.Forms

# Vérifie l’état d’activation de Windows
$activationStatus = (slmgr /xpr | Out-String)

# Si Windows est déjà activé, affiche une boîte de dialogue et quitte
if ($activationStatus -match "permanently activated" -or $activationStatus -match "activé de façon permanente") {
    Write-Host "Windows est déjà activé."
    [System.Windows.Forms.MessageBox]::Show(
        "Windows est déjà activé.",
        "Activation XORNO",
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Information
    )
    exit
}

# Sinon, construit le chemin vers MAS_AIO.cmd (activateur)
$cmdPath = Join-Path $PSScriptRoot "..\MAS_AIO.cmd"

# Vérifie que MAS_AIO.cmd existe à l’endroit prévu
if (-not (Test-Path $cmdPath)) {
    Write-Error "MAS_AIO.cmd introuvable à l'emplacement prévu."
    exit 1
}

# Lancement de MAS_AIO en tant qu’administrateur, sans afficher la fenêtre PowerShell
#Write-Host "Windows non activé. Lancement de MAS_AIO.cmd..."
Start-Process -FilePath $cmdPath -Verb RunAs -Wait -WindowStyle Hidden
