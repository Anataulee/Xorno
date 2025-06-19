document.addEventListener('DOMContentLoaded', () => {
  const cont = document.getElementById('materiel-content');
<<<<<<< HEAD

=======
>>>>>>> 1
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

<<<<<<< HEAD
  cont.innerHTML = Object.values(sections).map(s =>
    `<div id="sec-${s}"><strong>${s} :</strong> Chargement...</div>`
  ).join('');
=======
  cont.innerHTML = Object.values(sections)
    .map((s) => `<div id="sec-${s}"><strong>${s} :</strong> Chargement...</div>`)
    .join('');
>>>>>>> 1

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

<<<<<<< HEAD
  document.getElementById('btn-ninite-bureau').addEventListener('click', async () => {
    const output = document.getElementById('ninite-output');
    output.textContent = 'Lancement de Ninite Bureautique...';
    try {
      const result = await window.xornoAPI.runNinite('bureau');
      output.textContent = `Terminé :\n${result}`;
    } catch (err) {
      output.textContent = `Erreur : ${err.message}`;
    }
  });

  document.getElementById('btn-ninite-gaming').addEventListener('click', async () => {
    const output = document.getElementById('ninite-output');
    output.textContent = 'Lancement de Ninite Gaming...';
    try {
      const result = await window.xornoAPI.runNinite('gaming');
      output.textContent = `Terminé :\n${result}`;
    } catch (err) {
      output.textContent = `Erreur : ${err.message}`;
    }
  });

  document.getElementById('btn-ninite-combo').addEventListener('click', async () => {
    const output = document.getElementById('ninite-output');
    output.textContent = 'Lancement de Ninite Combo...';
    try {
      const result = await window.xornoAPI.runNinite('combo');
      output.textContent = `Terminé :\n${result}`;
    } catch (err) {
      output.textContent = `Erreur : ${err.message}`;
    }
  });

=======
  ['bureau', 'gaming', 'combo'].forEach((type) => {
    document.getElementById(`btn-ninite-${type}`).addEventListener('click', async () => {
      const output = document.getElementById('ninite-output');
      output.textContent = `Lancement de Ninite ${type}…`;
      output.textContent = `Terminé :\n${await window.xornoAPI.runNinite(type)}`;
    });
  });

>>>>>>> 1
  document.getElementById('btn-quit').addEventListener('click', () => {
    window.xornoAPI.quitApp();
  });

<<<<<<< HEAD
  document.querySelectorAll('button[data-tab]').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.getElementById(b.dataset.tab).classList.add('active');
      document.querySelectorAll('.tab-button').forEach(nb => nb.classList.remove('active'));
      b.classList.add('active');
    });
  });

=======
>>>>>>> 1
  document.getElementById('btn-quick-setup').addEventListener('click', async () => {
    const btn = document.getElementById('btn-quick-setup');
    btn.disabled = true;
    btn.textContent = 'En cours...';
    document.getElementById('activation-content').innerHTML = `<pre>${
      await window.xornoAPI.runActivate()
    }</pre>`;
    await new Promise((r) => setTimeout(r, 1000));
    document.getElementById('ninite-output').innerHTML = `<pre>${
      await window.xornoAPI.runNinite('bureau')
    }</pre>`;
    await new Promise((r) => setTimeout(r, 1000));
    window.xornoAPI.openWindowsUpdate();
    document.getElementById('maj-content').textContent = 'Mises à jour lancées (panneau ouvert).';
    loadActivation();
    btn.textContent = 'Terminé';
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Installation rapide';
    }, 6000);
  });

  const wingetSoftware = [
    { id: 'Google.Chrome', label: 'Google Chrome', checked: true },
    { id: 'VideoLAN.VLC', label: 'VLC Media Player', checked: true },
    { id: '7zip.7zip', label: '7-Zip', checked: true },
    { id: 'Adobe.Acrobat.Reader.64-bit', label: 'Adobe Reader', checked: true },
    { id: 'TheDocumentFoundation.LibreOffice', label: 'LibreOffice', checked: true },
    { id: 'Notepad++.Notepad++', label: 'Notepad++', checked: false },
    { id: 'Discord.Discord', label: 'Discord', checked: false },
    { id: 'Spotify.Spotify', label: 'Spotify', checked: false },
    { id: 'Microsoft.Edge', label: 'Microsoft Edge', checked: false },
    { id: 'Mozilla.Firefox', label: 'Mozilla Firefox', checked: false },
    { id: 'Valve.Steam', label: 'Steam', checked: false },
    { id: 'EpicGames.EpicGamesLauncher', label: 'Epic Games', checked: false },
    { id: 'Opera.Opera', label: 'Opera', checked: false },
    { id: 'Brave.Brave', label: 'Brave', checked: false },
    { id: 'RARLab.WinRAR', label: 'WinRAR', checked: false }
  ];

<<<<<<< HEAD
=======
  const labelMap = wingetSoftware.reduce((acc, cur) => {
    acc[cur.id] = cur.label;
    return acc;
  }, {});

>>>>>>> 1
  const container = document.getElementById('winget-software-list');
  container.innerHTML = wingetSoftware
    .map(
      (a) =>
        `<label><input type="checkbox" name="apps" value="${a.id}" ${a.checked ? 'checked' : ''}> ${a.label}</label>`
    )
    .join('');

<<<<<<< HEAD
  // Nouvelle version Winget avec logs en direct et buffer 3 lignes
=======
>>>>>>> 1
  document.getElementById('winget-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const checked = [...document.querySelectorAll('input[name="apps"]:checked')].map((i) => i.value);
    const output = document.getElementById('winget-output');
<<<<<<< HEAD
    const buffer = [];

    output.innerHTML = '<strong>Installation en cours...</strong><br><br>';

    window.xornoAPI.runWingetInstallLive(checked, (line) => {
      buffer.push(line);
      if (buffer.length > 3) buffer.shift();
      output.innerHTML = buffer.map(l => `<div>${l}</div>`).join('');
    });
  });
=======
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
>>>>>>> 1
});
