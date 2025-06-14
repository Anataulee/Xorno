#NoTrayIcon
SetTitleMatchMode, 2
Run, %A_ScriptDir%\ohm\OpenHardwareMonitor.exe
; Attendre que la fenêtre se lance
WinWaitActive, Open Hardware Monitor ahk_class WindowsForms10.Window.…
Sleep, 2000
; Utiliser les raccourcis clavier pour ouvrir "Fichier > Enregistrer le rapport"
Send, !f   ; Alt + F pour ouvrir le menu Fichier
Sleep, 200
Send, a    ; Option "Save report" (ex. lettre alt)
Sleep, 500
Send, {Enter}
Sleep, 2000
; Quitter OHM si souhaité
Send, !f
Sleep, 200
Send, x    ; Sortir
