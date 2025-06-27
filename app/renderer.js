const { spawn } = require('child_process')
const path = require('path')

document.addEventListener('DOMContentLoaded', () => {
  const cont = document.getElementById('materiel-content')
  const sections = {
    cpu: 'Processeur',
    gpu: 'Carte Graphique',
    ram: 'RAM',
    mb: 'Carte Mère',
    os: 'Windows',
    disks: 'Disques',
    network: 'Réseau',
    battery: 'Batterie',
    activation: 'Activation Windows'
  }
  cont.innerHTML = Object.values(sections)
    .map(s => `<div id="sec-${s}"><strong>${s} :</strong> Chargement...</div>`)
    .join('')
  function loadSection(key, fn) {
    fn().then(value => {
      const el = document.getElementById(`sec-${sections[key]}`)
      el.innerHTML = Array.isArray(value)
        ? `<strong>${sections[key]} :</strong><br>` + value.map(d => `&nbsp;&nbsp;- ${d}`).join('<br>')
        : `<strong>${sections[key]} :</strong> ${value}`
    }).catch(() => {
      document.getElementById(`sec-${sections[key]}`).innerHTML = `<strong>${sections[key]} :</strong> Erreur`
    })
  }
  ['cpu','gpu','ram','mb','os','disks','network','battery']
    .forEach(k => loadSection(k, window.xornoAPI['get'+k.charAt(0).toUpperCase()+k.slice(1)]))
  function loadActivation() {
    window.xornoAPI.checkActivation()
      .then(status => {
        document.getElementById('sec-Activation Windows').innerHTML = `<strong>Activation Windows :</strong> ${status}`
      })
      .catch(() => {
        document.getElementById('sec-Activation Windows').innerHTML = `<strong>Activation Windows :</strong> Erreur`
      })
  }
  loadActivation()

  document.getElementById('btn-update')?.addEventListener('click', () => {
    window.xornoAPI.openWindowsUpdate()
    document.getElementById('maj-content').textContent = 'Ouverture de Windows Update…'
    setTimeout(() => document.getElementById('maj-content').textContent = '', 5000)
  })

  document.getElementById('btn-activate')?.addEventListener('click', () => {
    const btn = document.getElementById('btn-activate')
    btn.classList.add('loading')
    btn.disabled = true
    document.getElementById('activation-content').textContent = 'Activation en cours…'
    window.xornoAPI.runActivate()
      .then(result => {
        document.getElementById('activation-content').innerHTML = `<pre>${result}</pre>`
      })
      .finally(() => {
        btn.classList.remove('loading')
        btn.disabled = false
        loadActivation()
      })
  })

  document.getElementById('btn-quit')?.addEventListener('click', () => window.xornoAPI.quitApp())

  const wingetSoftware = [
    { id: 'Google.Chrome', label: 'Google Chrome', checked: true },
    { id: 'VideoLAN.VLC', label: 'VLC Media Player', checked: true },
    { id: '7zip.7zip', label: '7‑Zip', checked: true },
    { id: 'Adobe.Acrobat.Reader.64-bit', label: 'Adobe Reader', checked: true },
    { id: 'TheDocumentFoundation.LibreOffice', label: 'LibreOffice', checked: true },
    { id: 'Notepad++.Notepad++', label: 'Notepad++', checked: false },
    { id: 'Discord.Discord', label: 'Discord', checked: false },
    { id: 'Microsoft.Edge', label: 'Microsoft Edge', checked: false },
    { id: 'Mozilla.Firefox', label: 'Mozilla Firefox', checked: false },
    { id: 'Valve.Steam', label: 'Steam', checked: false },
    { id: 'EpicGames.EpicGamesLauncher', label: 'Epic Games', checked: false },
    { id: 'Opera.Opera', label: 'Opera', checked: false },
    { id: 'Brave.Brave', label: 'Brave', checked: false },
    { id: 'RARLab.WinRAR', label: 'WinRAR', checked: false },
    { id: 'Nvidia.GeForceExperience', label: 'NVIDIA GeForce Experience', checked: false },
    { id: 'AMD.AMDSoftwareCloudEdition', label: 'AMD Software', checked: false },
    { id: 'Malwarebytes.Malwarebytes', label: 'Malwarebytes Anti‑Malware', checked: false }
  ]
  const labelMap = {}
  wingetSoftware.forEach(a => labelMap[a.id] = a.label)
  document.getElementById('winget-software-list').innerHTML = wingetSoftware
    .map(a => `<label><input type="checkbox" name="apps" value="${a.id}" ${a.checked?'checked':''}> ${a.label}</label>`)
    .join('')
  document.getElementById('winget-form')?.addEventListener('submit', e => {
    e.preventDefault()
    const selected = [...document.querySelectorAll('input[name="apps"]:checked')].map(i => i.value)
    document.getElementById('winget-output').innerHTML = selected
      .map(id => `<div id="log-${id}" class="install-entry"><span class="install-label">${labelMap[id]}</span><progress id="prog-${id}" max="100" value="0"></progress><span class="install-status" id="status-${id}">En attente</span></div>`)
      .join('')
    document.getElementById('winget-raw-log').textContent = ''
    window.xornoAPI.runWingetInstallLive(selected, (id, step) => {
      const s = document.getElementById(`status-${id}`)
      const p = document.getElementById(`prog-${id}`)
      if (!s || !p) return
      if (step === 'running') s.textContent = 'En attente'
      else if (step === 'download') { s.textContent = 'Téléchargement…'; p.removeAttribute('value') }
      else if (step === 'install') s.textContent = 'Installation…'
      else if (step === 'ok') { s.textContent = 'Terminé'; p.value = 100 }
      else if (step === 'fail') s.textContent = 'Échec'
    }, () => {})
  })

  document.getElementById('virus-ban-form')?.addEventListener('submit', e => {
    e.preventDefault()
    const selected = [...document.querySelectorAll('input[name="vb-tool"]:checked')].map(i => i.value)
    const logEl = document.getElementById('virus-ban-log')
    logEl.innerHTML = ''
    if (selected.includes('JRT.exe') && !confirm("JRT va fermer toutes les applications ouvertes. Continuer ?")) {
      selected.splice(selected.indexOf('JRT.exe'), 1)
    }
    window.xornoAPI.runVirusBanCustom(selected, msg => {
      logEl.innerHTML += `<div>${msg}</div>`
    })
  })

  document.querySelectorAll('button[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
      document.getElementById(btn.dataset.tab).classList.add('active')
      document.querySelectorAll('.tab-button').forEach(nb => nb.classList.remove('active'))
      btn.classList.add('active')
    })
  })

  const bloatwareList = [
    'Microsoft.3DViewer','Microsoft.3DBuilder','Microsoft.GetHelp','Microsoft.Getstarted',
    'Microsoft.MicrosoftSolitaireCollection','Microsoft.People','Microsoft.SkypeApp',
    'Microsoft.MicrosoftOfficeHub','Microsoft.WindowsMaps','Microsoft.ZuneMusic',
    'Microsoft.ZuneVideo','Microsoft.BingWeather','Microsoft.BingNews',
    'Microsoft.BingFinance','Microsoft.BingSports','Microsoft.WindowsFeedbackHub',
    'Microsoft.MicrosoftStickyNotes','Microsoft.XboxApp','Microsoft.YourPhone'
  ]
  document.getElementById('bloatware-list').innerHTML = bloatwareList
    .map(id => `<label><input type="checkbox" name="bloat" value="${id}" checked> ${id.replace('Microsoft.','')}</label>`)
    .join('')

  function runBloatwareRemoval(logDiv) {
    return new Promise(resolve => {
      const script = path.join(__dirname, '..', 'scripts', 'remove-bloatwares.ps1')
      const p = spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', script], { shell: true })
      p.stdout.on('data', d => logDiv.innerHTML += `<div>${d.toString().trim()}</div>`)
      p.stderr.on('data', d => logDiv.innerHTML += `<div>Erreur : ${d.toString().trim()}</div>`)
      p.on('close', () => { logDiv.innerHTML += `<div>✅ Désinstallation terminée.</div>`; resolve() })
    })
  }

  document.getElementById('bloatware-form')?.addEventListener('submit', e => {
    e.preventDefault()
    const logDiv = document.getElementById('bloatware-log')
    logDiv.innerHTML = ''
    runBloatwareRemoval(logDiv)
  })

  const modal = document.getElementById('quick-confirm-modal')
  const listEl = document.getElementById('quick-confirm-list')
  const okBtn = document.getElementById('quick-confirm-ok')
  const cancelBtn = document.getElementById('quick-confirm-cancel')
  const quickBtn = document.getElementById('btn-quick-setup')

  quickBtn?.addEventListener('click', () => {
    const sel = wingetSoftware.filter(a => a.checked)
    const actBox = `<div><label><input type="checkbox" id="quick-activation" checked> Activer Windows</label></div>`
    const sep = `<hr style="border-color:#444;margin:12px 0;">`
    const icoBox = `<div><label><input type="checkbox" id="quick-create-icons" checked> Créer raccourcis bureau</label></div>`
    const appBoxes = sel.map(a => `<div><label><input type="checkbox" name="quick-app" value="${a.id}" checked> ${a.label}</label></div>`).join('')
    const bloatBox = `<div><label><input type="checkbox" id="quick-bloatware" checked> Désinstaller les Bloatwares Windows</label></div>`
    const virusBox = `<div><label><input type="checkbox" id="quick-virus-ban"> Lancer le Virus Ban après l'installation</label></div>`
    listEl.innerHTML = actBox + sep + icoBox + sep + appBoxes + sep + bloatBox + sep + virusBox
    modal.style.display = 'flex'
  })

  cancelBtn.addEventListener('click', () => modal.style.display = 'none')

  okBtn.addEventListener('click', () => {
    modal.style.display = 'none'
    const checkedApps = [...document.querySelectorAll('input[name="quick-app"]:checked')].map(i => i.value)
    const doAct = document.getElementById('quick-activation').checked
    const doIcon = document.getElementById('quick-create-icons').checked
    const doBloat = document.getElementById('quick-bloatware').checked
    const doVirus = document.getElementById('quick-virus-ban').checked
    const logDiv = document.getElementById('quick-setup-log')
    logDiv.innerHTML = ''
    quickBtn.disabled = true
    quickBtn.classList.add('loading')

    const step = m => logDiv.innerHTML += `<div>${m}</div>`

    if (doIcon) {
      step(`Création des raccourcis sur le bureau...`)
      const r = window.xornoAPI.runCreateDesktopIcons()
      step(r && !r.toLowerCase().includes('erreur') ? `Raccourcis créés` : r)
    }
    if (doAct) {
      step(`Activation de Windows...`)
      window.xornoAPI.runActivate().then(r => {
        const c = r.trim()
        if (c && !c.toLowerCase().includes('déjà activé') && !c.toLowerCase().includes('windows non activ')) {
          step(`<pre>${c}</pre>`)
        }
      })
    }
    if (checkedApps.length) {
      step(`Installation de base via Winget...`)
      let done = 0
      window.xornoAPI.runWingetInstallLive(checkedApps, (id, st) => {
        if (st === 'ok') step(`${labelMap[id]} installé avec succès`)
        if (st === 'fail') step(`Échec installation ${labelMap[id]}`)
        if (st === 'ok' || st === 'fail') {
          done++
          if (done === checkedApps.length) {
            if (doBloat) {
              step(`Désinstallation des bloatwares...`)
              runBloatwareRemoval(logDiv).then(() => finalize())
            } else {
              finalize()
            }
          }
        }
      }, () => {})
    } else if (doBloat) {
      step(`Désinstallation des bloatwares...`)
      runBloatwareRemoval(logDiv).then(() => finalize())
    } else {
      finalize()
    }

    function finalize() {
      step(`Ouverture de Windows Update...`)
      window.xornoAPI.openWindowsUpdate()
      document.getElementById('maj-content').textContent = 'Mises à jour lancées (panneau ouvert).'
      if (doVirus) {
        step(`Lancement du Virus Ban...`)
        window.xornoAPI.runVirusBanCustom(m => step(m))
      }
      loadActivation()
      quickBtn.classList.remove('loading')
      quickBtn.disabled = false
    }
  })

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.style.display === 'flex') modal.style.display = 'none'
  })
  window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none'
  })
})
