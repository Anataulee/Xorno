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

  async function loadSection(key, fn) {
    try {
      const value = await fn();
      const el = document.getElementById(`sec-${sections[key]}`);
      el.innerHTML = Array.isArray(value)
        ? `<strong>${sections[key]} :</strong><br>` + value.map(d => `&nbsp;&nbsp;- ${d}`).join('<br>')
        : `<strong>${sections[key]} :</strong> ${value}`;
    } catch {
      document.getElementById(`sec-${sections[key]}`).innerHTML =
        `<strong>${sections[key]} :</strong> Erreur`;
    }
  }

  ['cpu','gpu','ram','mb','os','disks','network','battery']
    .forEach(k => loadSection(k, window.xornoAPI['get' + k.charAt(0).toUpperCase() + k.slice(1)]));

  async function loadActivation() {
    try {
      const status = await window.xornoAPI.checkActivation();
      document.getElementById('sec-Activation Windows').innerHTML =
        `<strong>Activation Windows :</strong> ${status}`;
    } catch {
      document.getElementById('sec-Activation Windows').innerHTML =
        `<strong>Activation Windows :</strong> Erreur`;
    }
  }
  loadActivation();

  const updateBtn = document.getElementById('btn-update');
  if (updateBtn) {
    updateBtn.addEventListener('click', () => {
      window.xornoAPI.openWindowsUpdate();
      const msg = document.getElementById('maj-content');
      msg.textContent = 'Ouverture de Windows Update…';
      setTimeout(() => {
        updateBtn.classList.remove('loading');
        msg.textContent = '';
      }, 5000);
    });
  }

  const activateBtn = document.getElementById('btn-activate');
  if (activateBtn) {
    activateBtn.addEventListener('click', async () => {
      activateBtn.classList.add('loading');
      activateBtn.disabled = true;
      const out = document.getElementById('activation-content');
      out.textContent = 'Activation en cours…';
      const result = await window.xornoAPI.runActivate();
      out.innerHTML = `<pre>${result}</pre>`;
      activateBtn.classList.remove('loading');
      activateBtn.disabled = false;
      loadActivation();
    });
  }

  document.getElementById('btn-quit')?.addEventListener('click', () => {
    window.xornoAPI.quitApp();
  });

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
  ];

  const labelMap = {};
  wingetSoftware.forEach(a => labelMap[a.id] = a.label);

  document.getElementById('winget-software-list').innerHTML =
    wingetSoftware.map(a =>
      `<label><input type="checkbox" name="apps" value="${a.id}" ${a.checked ? 'checked' : ''}> ${a.label}</label>`
    ).join('');

  document.getElementById('winget-form').addEventListener('submit', e => {
    e.preventDefault();
    const checked = [...document.querySelectorAll('input[name="apps"]:checked')]
      .map(i => i.value);
    const btn = e.submitter;
    document.getElementById('winget-output').innerHTML = checked.map(id =>
      `<div id="log-${id}" class="install-entry">
         <span class="install-label">${labelMap[id]}</span>
         <progress id="prog-${id}" max="100" value="0"></progress>
         <span class="install-status" id="status-${id}">🕒 En attente</span>
       </div>`
    ).join('');
    document.getElementById('winget-raw-log').innerHTML = '';
    window.xornoAPI.runWingetInstallLive(
      checked,
      (id, step) => {
        const s = document.getElementById(`status-${id}`);
        const p = document.getElementById(`prog-${id}`);
        if (!s || !p) return;
        if (step === 'running') s.textContent = '⬇️ En attente';
        else if (step === 'download') { s.textContent = '⬇️ Téléchargement…'; p.removeAttribute('value'); }
        else if (step === 'install') s.textContent = '💿 Installation…';
        else if (step === 'ok') { s.textContent = '✅ Terminé'; p.value = 100; }
        else if (step === 'fail') s.textContent = '❌ Échec';
      },
      () => {}
    );
    setTimeout(() => btn?.classList.remove('loading'), 10000);
  });

  document.querySelectorAll('button[data-tab]').forEach(b =>
    b.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.getElementById(b.dataset.tab).classList.add('active');
      document.querySelectorAll('.tab-button').forEach(nb => nb.classList.remove('active'));
      b.classList.add('active');
    })
  );

  const modal = document.getElementById('quick-confirm-modal');
  const listEl = document.getElementById('quick-confirm-list');
  const okBtn = document.getElementById('quick-confirm-ok');
  const cancelBtn = document.getElementById('quick-confirm-cancel');

  const quickSetupBtn = document.getElementById('btn-quick-setup');
  if (quickSetupBtn) {
    quickSetupBtn.addEventListener('click', () => {
      const selected = wingetSoftware.filter(a => a.checked);
      const activationCheckbox = `<div><label><input type="checkbox" id="quick-activation" checked> Activer Windows</label></div>`;
      const separator1 = `<hr style="border-color: #444; margin: 12px 0;">`;
      const iconsCheckbox = `<div><label><input type="checkbox" id="quick-create-icons" checked> Créer raccourcis bureau</label></div>`;
      const separator2 = `<hr style="border-color: #444; margin: 12px 0;">`;
      const appsCheckboxes = selected.map(a =>
        `<div><label><input type="checkbox" name="quick-app" value="${a.id}" checked> ${a.label}</label></div>`
      ).join('');
      listEl.innerHTML = activationCheckbox + separator1 + iconsCheckbox + separator2 + appsCheckboxes;
      modal.style.display = 'flex';
    });
  }

  cancelBtn.addEventListener('click', () => { modal.style.display = 'none'; });

  okBtn.addEventListener('click', async () => {
    modal.style.display = 'none';
    const checkedApps = [...document.querySelectorAll('input[name="quick-app"]:checked')]
      .map(i => i.value);
    const doActivation = document.getElementById('quick-activation').checked;
    const doIcons = document.getElementById('quick-create-icons').checked;
    const log = document.getElementById('quick-setup-log');
    const btn = document.getElementById('btn-quick-setup');
    btn.disabled = true;
    btn.classList.add('loading');
    log.innerHTML = '';
    const logStep = msg => log.innerHTML += `<div>${msg}</div>`;

    if (doIcons) {
      logStep(`<span class="status-icon info"></span>Création des raccourcis sur le bureau...`);
      const iconsResult = window.xornoAPI.runCreateDesktopIcons();
      logStep(
        iconsResult && !iconsResult.toLowerCase().includes('erreur')
          ? `<span class="status-icon success"></span>Raccourcis créés`
          : `<span class="status-icon error"></span>${iconsResult}`
      );
    }

    if (doActivation) {
      logStep(`<span class="status-icon info"></span>Activation de Windows...`);
      const activationResult = await window.xornoAPI.runActivate();
      const cleaned = activationResult.trim();
      if (cleaned &&
          !cleaned.toLowerCase().includes('déjà activé') &&
          !cleaned.toLowerCase().includes('windows non activ')) {
        logStep(`<pre>${cleaned}</pre>`);
      }
    }

    if (checkedApps.length) {
      logStep(`<span class="status-icon info"></span>Installation de base via Winget...`);
      let done = 0;
      await new Promise(doneAll => {
        window.xornoAPI.runWingetInstallLive(
          checkedApps,
          (id, step) => {
            if (step === 'ok') logStep(`<span class="status-icon success"></span>${labelMap[id]} installé avec succès`);
            if (step === 'fail') logStep(`<span class="status-icon error"></span>Échec installation ${labelMap[id]}`);
            if (step === 'ok' || step === 'fail') {
              done++;
              if (done === checkedApps.length) doneAll();
            }
          },
          () => {}
        );
      });
    }

    logStep(`<span class="status-icon info"></span>Ouverture de Windows Update...`);
    window.xornoAPI.openWindowsUpdate();
    document.getElementById('maj-content').textContent = 'Mises à jour lancées (panneau ouvert).';

    await loadActivation();

    btn.classList.remove('loading');
    btn.disabled = false;
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.style.display === 'flex') modal.style.display = 'none';
  });

  window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });
});
