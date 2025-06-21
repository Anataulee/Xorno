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
    .map((s) => `<div id="sec-${s}"><strong>${s} :</strong> Chargement...</div>`)
    .join('');

  async function loadSection(key, fn) {
    try {
      const result = await fn();
      const el = document.getElementById(`sec-${sections[key]}`);
      if (Array.isArray(result)) {
        el.innerHTML =
          `<strong>${sections[key]} :</strong><br>` +
          result.map((d) => `&nbsp;&nbsp;- ${d}`).join('<br>');
      } else {
        el.innerHTML = `<strong>${sections[key]} :</strong> ${result}`;
      }
    } catch {
      document.getElementById(`sec-${sections[key]}`).innerHTML = `<strong>${sections[key]} :</strong> Erreur`;
    }
  }

  loadSection('cpu', window.xornoAPI.getCpu);
  loadSection('gpu', window.xornoAPI.getGpu);
  loadSection('ram', window.xornoAPI.getRam);
  loadSection('mb', window.xornoAPI.getMb);
  loadSection('os', window.xornoAPI.getOs);
  loadSection('disks', window.xornoAPI.getDisks);
  loadSection('network', window.xornoAPI.getNetwork);
  loadSection('battery', window.xornoAPI.getBattery);

  async function loadActivation() {
    const el = document.getElementById('sec-Activation Windows');
    try {
      const status = await window.xornoAPI.checkActivation();
      el.innerHTML = `<strong>Activation Windows :</strong> ${status}`;
    } catch {
      el.innerHTML = `<strong>Activation Windows :</strong> Erreur`;
    }
  }

  loadActivation();

  document.getElementById('btn-update').addEventListener('click', () => {
    window.xornoAPI.openWindowsUpdate();
    const msg = document.getElementById('maj-content');
    msg.textContent = 'Ouverture de Windows Update…';
    setTimeout(() => (msg.textContent = ''), 5000);
  });

  document.getElementById('btn-activate').addEventListener('click', async () => {
    const btn = document.getElementById('btn-activate');
    const out = document.getElementById('activation-content');
    btn.disabled = true;
    out.textContent = 'Activation en cours…';
    out.innerHTML = `<pre>${await window.xornoAPI.runActivate()}</pre>`;
    btn.disabled = false;
    loadActivation();
  });

  document.getElementById('btn-quit').addEventListener('click', () => {
    window.xornoAPI.quitApp();
  });

  const wingetSoftware = [
    { id: 'Google.Chrome', label: 'Google Chrome', checked: true },
    { id: 'VideoLAN.VLC', label: 'VLC Media Player', checked: true },
    { id: '7zip.7zip', label: '7-Zip', checked: true },
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
    { id: 'Malwarebytes.Malwarebytes', label: 'Malwarebytes Anti-Malware', checked: false }
  ];

  const labelMap = wingetSoftware.reduce((acc, cur) => {
    acc[cur.id] = cur.label;
    return acc;
  }, {});

  const container = document.getElementById('winget-software-list');
  container.innerHTML = wingetSoftware
    .map(
      (a) =>
        `<label><input type="checkbox" name="apps" value="${a.id}" ${a.checked ? 'checked' : ''}> ${a.label}</label>`
    )
    .join('');

  document.getElementById('winget-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const checked = [...document.querySelectorAll('input[name="apps"]:checked')].map((i) => i.value);
    const output = document.getElementById('winget-output');
    output.innerHTML = checked
      .map(
        (id) =>
          `<div id="log-${id}" class="install-entry">
             <span class="install-label">${labelMap[id]}</span>
             <progress id="prog-${id}" max="100" value="0"></progress>
             <span class="install-status" id="status-${id}">🕒 En attente</span>
           </div>`
      )
      .join('');

    const logRaw = document.getElementById('winget-raw-log');
    logRaw.innerHTML = '';

    window.xornoAPI.runWingetInstallLive(
      checked,
      (id, step) => {
        const statusEl = document.getElementById(`status-${id}`);
        const progEl = document.getElementById(`prog-${id}`);
        if (!statusEl || !progEl) return;

        if (step === 'running') {
          statusEl.textContent = '⬇️ En attente';
        } else if (step === 'download') {
          statusEl.textContent = '⬇️ Téléchargement...';
          progEl.removeAttribute('value');
        } else if (step === 'install') {
          statusEl.textContent = '💿 Installation...';
        } else if (step === 'ok') {
          statusEl.textContent = '✅ Terminé';
          progEl.value = 100;
        } else if (step === 'fail') {
          statusEl.textContent = '❌ Échec';
        }
      },
      (id, line) => {
        const div = document.createElement('div');
        div.textContent = `[${labelMap[id]}] ${line.trim()}`;
        logRaw.appendChild(div);
        logRaw.scrollTop = logRaw.scrollHeight;
      }
    );
  });

  document.querySelectorAll('button[data-tab]').forEach((b) =>
    b.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      document.getElementById(b.dataset.tab).classList.add('active');
      document.querySelectorAll('.tab-button').forEach((nb) => nb.classList.remove('active'));
      b.classList.add('active');
    })
  );

  document.getElementById('btn-theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('light');
    const theme = document.body.classList.contains('light') ? 'light' : 'dark';
    localStorage.setItem('xorno-theme', theme);
  });

  const savedTheme = localStorage.getItem('xorno-theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light');
  }

  const modal = document.getElementById('quick-confirm-modal');
  const listEl = document.getElementById('quick-confirm-list');
  const okBtn = document.getElementById('quick-confirm-ok');
  const cancelBtn = document.getElementById('quick-confirm-cancel');
  const sizeMap = {};

  async function fetchSizes(ids) {
    for (const id of ids) {
      try {
        const raw = await window.xornoAPI.execWingetShowSize(id);
        const match = raw.match(/PackageSize:\s+([\d.]+)\s*(MB|GB)/i);
        sizeMap[id] = match ? `${match[1]} ${match[2]}` : 'N/A';
      } catch {
        sizeMap[id] = 'N/A';
      }
    }
  }

  document.getElementById('btn-quick-setup').addEventListener('click', async () => {
    const selected = wingetSoftware.filter(a => a.checked);
    const ids = selected.map(a => a.id);
    await fetchSizes(ids);
    const lines = selected.map(a => `• ${a.label} – ${sizeMap[a.id]}`);
    listEl.innerHTML = lines.map(l => `<li>${l}</li>`).join('');
    modal.style.display = 'flex';
  });

  cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  okBtn.addEventListener('click', async () => {
    modal.style.display = 'none';

    const selected = wingetSoftware.filter(a => a.checked);
    const ids = selected.map(a => a.id);
    const log = document.getElementById('quick-setup-log');
    const btn = document.getElementById('btn-quick-setup');
    btn.disabled = true;
    btn.textContent = 'En cours...';
    log.innerHTML = '';

    const logStep = (msg) => {
      log.innerHTML += `<div>${msg}</div>`;
    };

    logStep('🛠 Activation de Windows...');
    logStep(`<pre>${await window.xornoAPI.runActivate()}</pre>`);

    await new Promise(r => setTimeout(r, 1000));

    logStep('📦 Installation de base via Winget...');
    let done = 0;
    await new Promise(doneAll => {
      window.xornoAPI.runWingetInstallLive(
        ids,
        (id, step) => {
          logStep(`📦 ${labelMap[id]} : ${step}`);
          if (step === 'ok' || step === 'fail') {
            done++;
            if (done === ids.length) doneAll();
          }
        },
        (id, line) => {
          logStep(`[${labelMap[id]}] ${line.trim()}`);
        }
      );
    });

    await new Promise(r => setTimeout(r, 1000));

    logStep('🔄 Ouverture de Windows Update...');
    window.xornoAPI.openWindowsUpdate();

    document.getElementById('maj-content').textContent = 'Mises à jour lancées (panneau ouvert).';
    await loadActivation();

    btn.textContent = 'Terminé';
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Installation rapide';
    }, 6000);
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      modal.style.display = 'none';
    }
  });
  window.addEventListener('click', e => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});
