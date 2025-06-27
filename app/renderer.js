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

  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
  let konamiPosition = 0
  window.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return
    if (e.key === konamiCode[konamiPosition]) {
      konamiPosition++
      if (konamiPosition === konamiCode.length) {
        konamiPosition = 0
        activateSnakeMode()
      }
    } else konamiPosition = 0
  })

  function activateSnakeMode() {
    if (document.getElementById('snake-tab-button')) return
    const newButton = document.createElement('button')
    newButton.className = 'tab-button'
    newButton.id = 'snake-tab-button'
    newButton.dataset.tab = 'snake-tab'
    newButton.innerHTML = `<span class="icon"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 10a7 7 0 017-7h2a3 3 0 110 6h-2a1 1 0 100 2h2a3 3 0 110 6h-2a7 7 0 01-7-7z"/></svg></span> Snake`
    document.getElementById('tabs-content').appendChild(newButton)

    const snakeTab = document.createElement('div')
    snakeTab.id = 'snake-tab'
    snakeTab.className = 'tab'
    snakeTab.innerHTML = `
      <h1>Snake Secret</h1>
      <div id="score-container" style="margin-bottom:10px;color:#88aaff;font-size:1rem;">
        Score: <span id="current-score">0</span> – Meilleur: <span id="best-score">0</span>
      </div>
      <canvas id="snake-canvas" width="400" height="400" style="background:#1f1f1f;border:2px solid #587fff;"></canvas>
      <p style="color:#aaa;font-size:0.9rem;margin-top:10px;">Utilisez les flèches pour jouer. ESC pour quitter.</p>
    `
    document.getElementById('content').appendChild(snakeTab)

    newButton.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
      snakeTab.classList.add('active')
      document.querySelectorAll('.tab-button').forEach(nb => nb.classList.remove('active'))
      newButton.classList.add('active')
    })

    startSnakeGame()
  }

  function startSnakeGame() {
    const canvas = document.getElementById('snake-canvas')
    const ctx = canvas.getContext('2d')
    const grid = 20
    let count = 0
    let speedFactor = 8
    const snake = { x: 160, y: 160, cells: [], maxCells: 4 }
    const apple = { x: 320, y: 320 }
    let dx = grid, dy = 0
    let score = 0
    const bestStored = parseInt(localStorage.getItem('snakeBest') || '0', 10)
    document.getElementById('best-score').textContent = bestStored

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min
    }

    function loop() {
      requestAnimationFrame(loop)
      if (++count < speedFactor) return
      count = 0
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      snake.x += dx
      snake.y += dy

      if (snake.x < 0) snake.x = canvas.width - grid
      else if (snake.x >= canvas.width) snake.x = 0
      if (snake.y < 0) snake.y = canvas.height - grid
      else if (snake.y >= canvas.height) snake.y = 0

      snake.cells.unshift({ x: snake.x, y: snake.y })
      if (snake.cells.length > snake.maxCells) snake.cells.pop()

      ctx.fillStyle = '#88aaff'
      snake.cells.forEach(cell => ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1))

      ctx.fillStyle = '#ff5555'
      ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1)

      if (snake.x === apple.x && snake.y === apple.y) {
        snake.maxCells++
        score++
        speedFactor = Math.max(1, speedFactor - 0.3)
        document.getElementById('current-score').textContent = score
        apple.x = getRandomInt(0, canvas.width / grid) * grid
        apple.y = getRandomInt(0, canvas.height / grid) * grid
      }

      snake.cells.slice(1).forEach(cell => {
        if (cell.x === snake.x && cell.y === snake.y) {
          if (score > bestStored) {
            localStorage.setItem('snakeBest', score)
            document.getElementById('best-score').textContent = score
          }
          snake.x = 160
          snake.y = 160
          snake.cells = []
          snake.maxCells = 4
          dx = grid
          dy = 0
          score = 0
          speedFactor = 8
          document.getElementById('current-score').textContent = '0'
          apple.x = getRandomInt(0, canvas.width / grid) * grid
          apple.y = getRandomInt(0, canvas.height / grid) * grid
        }
      })
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
        document.getElementById('materiel').classList.add('active')
        document.querySelectorAll('.tab-button').forEach(nb => nb.classList.remove('active'))
        document.querySelector('[data-tab="materiel"]').classList.add('active')
      }
      if (e.key === 'ArrowLeft' && dx === 0) { dx = -grid; dy = 0 }
      else if (e.key === 'ArrowUp' && dy === 0) { dy = -grid; dx = 0 }
      else if (e.key === 'ArrowRight' && dx === 0) { dx = grid; dy = 0 }
      else if (e.key === 'ArrowDown' && dy === 0) { dy = grid; dx = 0 }
    })

    requestAnimationFrame(loop)
  }
})
