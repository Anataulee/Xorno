function logDebug(...args) {
  const area = document.getElementById('debugLog');
  const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : a)).join(' ');
  area.textContent += `\n${msg}`;
}

function clearDebug() {
  document.getElementById('debugLog').textContent = '';
}

window.addEventListener('DOMContentLoaded', async () => {
  window.xornoAPI.launchOHM();
  logDebug("→ OHM lancé.");

  setTimeout(async () => {
    logDebug("→ Extraction hardware...");
    const hw = await window.xornoAPI.extractHardwareInfo();
    logDebug("↳ Résultat hardware:", hw);

    const disks = window.xornoAPI.getDisks();
    logDebug("↳ Disques:", disks);

    const winVer = window.xornoAPI.getWindowsVersion();
    logDebug("↳ Version Windows:", winVer);

    const container = document.getElementById('hardware');

    if (!hw) {
      container.innerHTML = `
        <h1>Erreur de récupération</h1>
        <p>Impossible de récupérer les informations matérielles.<br>
        Vérifiez que OpenHardwareMonitor fonctionne correctement.</p>`;
      return;
    }

    container.innerHTML = `
      <h1>État Matériel</h1>
      <div class="info-grid">
        <div><span>Processeur :</span> ${hw.cpuModel} (Temp: ${hw.cpuTemp}°C)</div>
        <div><span>Carte Graphique :</span> ${hw.gpuModel} (Temp: ${hw.gpuTemp}°C)</div>
        <div><span>Mémoire RAM :</span> ${hw.ramAmount} Go</div>
        <div><span>Disques :</span> ${disks.join(', ')}</div>
        <div><span>Carte Mère :</span> ${hw.mbModel} (Temp: ${hw.mbTemp}°C)</div>
        <div><span>Windows :</span> ${winVer}</div>
      </div>`;
  }, 3000);
});

function showTab(id) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelector(`[onclick="showTab('${id}')"]`).classList.add('active');
}

document.getElementById('updateBtn').addEventListener('click', () => {
  const log = document.getElementById('updateLog');
  const prog = document.getElementById('updateProgress');

  log.textContent = 'Mise à jour en cours...';
  prog.style.display = 'block';
  prog.value = 0;

  logDebug("→ Installation mises à jour...");

  try {
    const result = window.xornoAPI.installUpdates();
    log.textContent = result;
    logDebug("↳ Résultat:", result);
  } catch (err) {
    log.textContent = "Erreur de mise à jour.";
    logDebug("⚠️ Erreur update:", err);
  } finally {
    prog.style.display = 'none';
  }
});

document.getElementById('activateBtn').addEventListener('click', () => {
  logDebug("→ Lancement activation...");
  const result = window.xornoAPI.activateWindows();
  document.getElementById('activationLog').textContent = result;
  logDebug("↳ Résultat activation:", result);
});

document.getElementById('themeSwitch').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', current === 'light' ? '' : 'light');
  logDebug("🌓 Thème basculé:", current === 'light' ? 'dark' : 'light');
});
