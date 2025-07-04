const { spawn } = require('child_process');
const path = require('path');

document.addEventListener('DOMContentLoaded', () => {
  const cont = document.getElementById('materiel-content');
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
  };
  cont.innerHTML = Object.values(sections)
    .map(s => `<div id="sec-${s}"><strong>${s} :</strong> Chargement...</div>`)
    .join('');
  function loadSection(key, fn) {
    fn().then(value => {
      const el = document.getElementById(`sec-${sections[key]}`);
      el.innerHTML = Array.isArray(value)
        ? `<strong>${sections[key]} :</strong><br>` + value.map(d => `&nbsp;&nbsp;- ${d}`).join('<br>')
        : `<strong>${sections[key]} :</strong> ${value}`;
    }).catch(() => {
      document.getElementById(`sec-${sections[key]}`).innerHTML = `<strong>${sections[key]} :</strong> Erreur`;
    });
  }
  ['cpu', 'gpu', 'ram', 'mb', 'os', 'disks', 'network', 'battery']
    .forEach(k => loadSection(k, window.xornoAPI['get' + k.charAt(0).toUpperCase() + k.slice(1)]));
  function loadActivation() {
    window.xornoAPI.checkActivation()
      .then(status => document.getElementById('sec-Activation Windows').innerHTML = `<strong>Activation Windows :</strong> ${status}`)
      .catch(() => document.getElementById('sec-Activation Windows').innerHTML = `<strong>Activation Windows :</strong> Erreur`);
  }
  loadActivation();

  document.getElementById('btn-update')?.addEventListener('click', () => {
    window.xornoAPI.openWindowsUpdate();
    document.getElementById('maj-content').textContent = 'Ouverture de Windows Update…';
    setTimeout(() => document.getElementById('maj-content').textContent = '', 5000);
  });

  document.getElementById('btn-activate')?.addEventListener('click', () => {
    const btn = document.getElementById('btn-activate');
    btn.classList.add('loading');
    btn.disabled = true;
    document.getElementById('activation-content').textContent = 'Activation en cours…';
    window.xornoAPI.runActivate()
      .then(result => document.getElementById('activation-content').innerHTML = `<pre>${result}</pre>`)
      .finally(() => {
        btn.classList.remove('loading');
        btn.disabled = false;
        loadActivation();
      });
  });

  document.getElementById('btn-quit')?.addEventListener('click', () => window.xornoAPI.quitApp());

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
    { id: 'AMD.AMDSoftwareCloudEdition', label: 'AMD Software', checked: false },
    { id: 'Malwarebytes.Malwarebytes', label: 'Malwarebytes Anti‑Malware', checked: false }
  ];
  const labelMap = {};
  wingetSoftware.forEach(a => labelMap[a.id] = a.label);
  document.getElementById('winget-software-list').innerHTML = wingetSoftware
    .map(a => `<label><input type="checkbox" name="apps" value="${a.id}" ${a.checked ? 'checked' : ''}> ${a.label}</label>`)
    .join('');
  document.getElementById('winget-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const selected = [...document.querySelectorAll('input[name="apps"]:checked')].map(i => i.value);
    document.getElementById('winget-output').innerHTML = selected
      .map(id => `<div id="log-${id}" class="install-entry"><span class="install-label">${labelMap[id]}</span><progress id="prog-${id}" max="100" value="0"></progress><span class="install-status" id="status-${id}">En attente</span></div>`)
      .join('');
    document.getElementById('winget-raw-log').textContent = '';
    window.xornoAPI.runWingetInstallLive(selected, (id, step) => {
      const s = document.getElementById(`status-${id}`), p = document.getElementById(`prog-${id}`);
      if (!s || !p) return;
      if (step === 'running') s.textContent = 'En attente';
      else if (step === 'download') { s.textContent = 'Téléchargement…'; p.removeAttribute('value'); }
      else if (step === 'install') s.textContent = 'Installation…';
      else if (step === 'ok') { s.textContent = 'Terminé'; p.value = 100; }
      else if (step === 'fail') s.textContent = 'Échec';
    }, () => { });
  });

  document.getElementById('virus-ban-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const selected = [...document.querySelectorAll('input[name="vb-tool"]:checked')].map(i => i.value);
    const logEl = document.getElementById('virus-ban-log');
    logEl.innerHTML = '';
    if (selected.includes('JRT.exe') && !confirm("JRT va fermer toutes les applications ouvertes. Continuer ?")) {
      selected.splice(selected.indexOf('JRT.exe'), 1);
    }
    window.xornoAPI.runVirusBanCustom(selected, msg => {
      logEl.innerHTML += `<div>${msg}</div>`;
    });
  });

  document.querySelectorAll('button[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.getElementById(btn.dataset.tab).classList.add('active');
      document.querySelectorAll('.tab-button').forEach(nb => nb.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.getElementById('btn-appbuster')?.addEventListener('click', () => {
    const logContainer = document.getElementById('appbuster-log');
    logContainer.innerHTML = 'Lancement de O&O AppBuster...';
    window.xornoAPI.launchAppBuster(output => {
      logContainer.innerHTML += `<br>${output}`;
    });
  });
  document.getElementById('btn-quick-setup')?.addEventListener('click', () => {
    const quickSoftware = wingetSoftware.filter(a => a.checked);
    const container = document.getElementById('quick-softwares');
    container.innerHTML = quickSoftware
      .map(s => `<label><input type="checkbox" class="quick-soft" value="${s.id}" checked> ${s.label}</label><br>`)
      .join('');
    document.getElementById('quick-confirm-modal').style.display = 'flex';
  });

  document.getElementById('quick-confirm-cancel')?.addEventListener('click', () => {
    document.getElementById('quick-confirm-modal').style.display = 'none';
  });

  document.getElementById('quick-confirm-ok')?.addEventListener('click', () => {
    const installActivation = document.getElementById('quick-activation').checked;
    const installUpdates = document.getElementById('quick-updates').checked;
    const installBloatwareBanEl = document.getElementById('quick-bloatware');
    const installVirusBanEl = document.getElementById('quick-virusban');

    const installBloatwareBan = installBloatwareBanEl ? installBloatwareBanEl.checked : false;
    const installVirusBan = installVirusBanEl ? installVirusBanEl.checked : false;


    const selectedSoftwares = [...document.querySelectorAll('.quick-soft:checked')].map(i => i.value);

    document.getElementById('quick-confirm-modal').style.display = 'none';

    const quickSetupLog = document.getElementById('quick-setup-log');
    quickSetupLog.innerHTML = '<div>Démarrage de l\'installation rapide...</div>';

    if (installActivation) {
      quickSetupLog.innerHTML += '<div>Activation de Windows en cours...</div>';
      window.xornoAPI.runActivate().then(result => {
        quickSetupLog.innerHTML += '<div>Windows activé avec succès.</div>';
      }).catch(() => {
        quickSetupLog.innerHTML += '<div>Erreur lors de l\'activation de Windows.</div>';
      });
    }

    if (installUpdates) {
      quickSetupLog.innerHTML += '<div>Ouverture de Windows Update...</div>';
      window.xornoAPI.openWindowsUpdate();
      quickSetupLog.innerHTML += '<div>Windows Update ouvert.</div>';
    }

    if (selectedSoftwares.length > 0) {
      quickSetupLog.innerHTML += '<div>Installation des logiciels sélectionnés...</div>';

      let currentIndex = 0;

      const runNext = () => {
        if (currentIndex >= selectedSoftwares.length) {
          quickSetupLog.innerHTML += '<div>Installation des logiciels terminée.</div>';
          return;
        }

        const id = selectedSoftwares[currentIndex];
        const name = labelMap[id];

        quickSetupLog.innerHTML += `<div>Installation de ${name} en cours...</div>`;

        window.xornoAPI.runWingetInstallLive([id], (softwareId, step) => {
          if (step === 'ok') {
            quickSetupLog.innerHTML += `<div>${name} installé avec succès.</div>`;
            currentIndex++;
            runNext();
          } else if (step === 'fail') {
            quickSetupLog.innerHTML += `<div>Échec de l'installation de ${name}.</div>`;
            currentIndex++;
            runNext();
          }
        }, () => { });
      };

      runNext();
    }

    if (installBloatwareBan) {
      quickSetupLog.innerHTML += '<div>Exécution de Bloatware Ban...</div>';
      window.xornoAPI.runCreateDesktopIcons();
      quickSetupLog.innerHTML += '<div>Bloatware Ban terminé.</div>';
    }

    if (installVirusBan) {
      quickSetupLog.innerHTML += '<div>Lancement de Virus Ban...</div>';
      window.xornoAPI.runVirusBanCustom(['CCleaner64.exe', 'adwcleaner.exe'], msg => {
        quickSetupLog.innerHTML += `<div>${msg}</div>`;
      });
    }
  });

  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiPosition = 0;
  window.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (e.key === konamiCode[konamiPosition]) {
      konamiPosition++;
      if (konamiPosition === konamiCode.length) {
        konamiPosition = 0;
        activateSnakeMode();
      }
    } else konamiPosition = 0;
  });

  function activateSnakeMode() {
    if (document.getElementById('snake-tab-button')) return;
    const newButton = document.createElement('button');
    newButton.className = 'tab-button';
    newButton.id = 'snake-tab-button';
    newButton.dataset.tab = 'snake-tab';
    newButton.innerHTML = `<span class="icon"><svg viewBox="0 0 20 20"><path d="M3 10a7 7 0 017-7h2a3 3 0 110 6h-2a1 1 0 100 2h2a3 3 0 110 6h-2a7 7 0 01-7-7z"/></svg></span> Snake`;
    document.getElementById('tabs-content').appendChild(newButton);

    const snakeTab = document.createElement('div');
    snakeTab.id = 'snake-tab';
    snakeTab.className = 'tab';
    snakeTab.innerHTML = `
      <h1>Snake Secret</h1>
      <div id="score-container" style="margin-bottom:10px;color:#88aaff;font-size:1rem;">
        Score: <span id="current-score">0</span> – Meilleur: <span id="best-score">0</span>
      </div>
      <canvas id="snake-canvas" width="400" height="400" style="background:#1f1f1f;border:2px solid #587fff;"></canvas>
      <p style="color:#aaa;font-size:0.9rem;margin-top:10px;">Utilise les flèches. ESC pour revenir.</p>
    `;
    document.getElementById('content').appendChild(snakeTab);
    newButton.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      snakeTab.classList.add('active');
      document.querySelectorAll('.tab-button').forEach(nb => nb.classList.remove('active'));
      newButton.classList.add('active');
    });
    startSnakeGame();
  }
  function startSnakeGame() {
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    const grid = 20;
    let count = 0;
    let speedFactor = 8;
    const snake = { x: 160, y: 160, cells: [], maxCells: 4 };
    const apple = { x: 320, y: 320 };
    let dx = grid, dy = 0;
    let score = 0;
    const bestStored = parseInt(localStorage.getItem('snakeBest') || '0', 10);
    document.getElementById('best-score').textContent = bestStored;

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }

    function loop() {
      requestAnimationFrame(loop);
      if (++count < speedFactor) return;
      count = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snake.x += dx;
      snake.y += dy;
      if (snake.x < 0) snake.x = canvas.width - grid;
      else if (snake.x >= canvas.width) snake.x = 0;
      if (snake.y < 0) snake.y = canvas.height - grid;
      else if (snake.y >= canvas.height) snake.y = 0;

      snake.cells.unshift({ x: snake.x, y: snake.y });
      if (snake.cells.length > snake.maxCells) snake.cells.pop();

      ctx.fillStyle = '#88aaff';
      snake.cells.forEach(cell => ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1));
      ctx.fillStyle = '#ff5555';
      ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

      if (snake.x === apple.x && snake.y === apple.y) {
        snake.maxCells++;
        score++;
        speedFactor = Math.max(1, speedFactor - 0.3);
        document.getElementById('current-score').textContent = score;
        apple.x = getRandomInt(0, canvas.width / grid) * grid;
        apple.y = getRandomInt(0, canvas.height / grid) * grid;
      }

      snake.cells.slice(1).forEach(cell => {
        if (cell.x === snake.x && cell.y === snake.y) {
          if (score > bestStored) {
            localStorage.setItem('snakeBest', score);
            document.getElementById('best-score').textContent = score;
          }
          snake.x = 160; snake.y = 160; snake.cells = []; snake.maxCells = 4;
          dx = grid; dy = 0; score = 0; speedFactor = 8;
          document.getElementById('current-score').textContent = '0';
          apple.x = getRandomInt(0, canvas.width / grid) * grid;
          apple.y = getRandomInt(0, canvas.height / grid) * grid;
        }
      });
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.getElementById('materiel').classList.add('active');
        document.querySelectorAll('.tab-button').forEach(nb => nb.classList.remove('active'));
        document.querySelector('[data-tab="materiel"]').classList.add('active');
      }
      if (e.key === 'ArrowLeft' && dx === 0) { dx = -grid; dy = 0; }
      else if (e.key === 'ArrowUp' && dy === 0) { dy = -grid; dx = 0; }
      else if (e.key === 'ArrowRight' && dx === 0) { dx = grid; dy = 0; }
      else if (e.key === 'ArrowDown' && dy === 0) { dy = grid; dx = 0; }
    });

    requestAnimationFrame(loop);
  }

  const sequences = {
    matrix: { code: ['m', 'a', 't', 'r', 'i', 'x'], pos: 0 },
    rave: { code: ['r', 'a', 'v', 'e'], pos: 0 },
    retro: { code: ['r', 'e', 't', 'r', 'o'], pos: 0 },
    credits: { code: ['t', 'a', 'g'], pos: 0 }
  };
  window.addEventListener('keydown', e => {
    Object.entries(sequences).forEach(([k, s]) => {
      if (e.key.toLowerCase() === s.code[s.pos]) {
        s.pos++;
        if (s.pos === s.code.length) {
          s.pos = 0;
          if (k === 'matrix') startMatrix();
          if (k === 'rave') startRave();
          if (k === 'retro') startRetro();
          if (k === 'credits') showCredits();
        }
      } else s.pos = 0;
    });
  });

  function startMatrix() {
    const { remote } = require('electron');
    const window = remote.getCurrentWindow();
    window.setFullScreen(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.style = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;background:black';
    document.body.appendChild(canvas);
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const cols = Math.floor(w / 20) + 1;
    const drops = Array(cols).fill(0);
    const chars = 'アァカサタナハマヤャラワン0123456789';
    const interval = setInterval(() => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#0f0'; ctx.font = '15px monospace';
      drops.forEach((y, i) => {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 20, y);
        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 20;
      });
    }, 50);
    window.addEventListener('keydown', stopMatrix);
    function stopMatrix(e) {
      if (e.key === 'Escape') {
        clearInterval(interval);
        window.setFullScreen(false);
        window.removeEventListener('keydown', stopMatrix);
        canvas.remove();
      }
    }
  }

  function startRave() {
    const original = { bg: document.body.style.background, color: document.body.style.color };
    let count = 0;
    const iv = setInterval(() => {
      document.body.style.background = `#${Math.floor(Math.random() * 0xFFFFFF).toString(16)}`;
      document.body.style.color = `#${Math.floor(Math.random() * 0xFFFFFF).toString(16)}`;
      count++; if (count > 25) { clearInterval(iv); document.body.style.background = original.bg; document.body.style.color = original.color; }
    }, 200);
  }

  function startRetro() {
    document.getElementById('content').classList.add('retro-theme');
    document.querySelectorAll('.tab-button,.footer-btn').forEach(el => el.classList.add('retro-theme'));
    setTimeout(() => {
      document.getElementById('content').classList.remove('retro-theme');
      document.querySelectorAll('.tab-button,.footer-btn').forEach(el => el.classList.remove('retro-theme'));
    }, 10000);
  }

  function showCredits() {
    const modal = document.createElement('div');
    modal.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999';
    modal.innerHTML = `<div style="background:#2a2a2a;padding:20px;border-radius:8px;color:#fff;font-family:monospace;">
      <h2>Crédits</h2><p>Anataule was here.</p><button id="cred-ok" style="margin-top:10px;">OK</button></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#cred-ok').addEventListener('click', () => modal.remove());
  }

});
