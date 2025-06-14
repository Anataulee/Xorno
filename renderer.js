window.addEventListener('DOMContentLoaded', async () => {
  // Theme auto-based on OS
  const current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', current);
  document.getElementById('themeSwitch').addEventListener('click', () => {
    const el = document.documentElement;
    const n = el.getAttribute('data-theme');
    el.setAttribute('data-theme', n === 'dark' ? 'light' : 'dark');
  });

  window.xornoAPI.launchOHM();
  setTimeout(async () => {
    const hw = await window.xornoAPI.extractHardwareInfo();
    const disks = window.xornoAPI.getDisks();
    const winVer = window.xornoAPI.getWindowsVersion();
    const container = document.getElementById('hardware');

    if (!hw) {
      container.innerHTML = `<h1>Erreur de récupération</h1>
        <p>Impossible de récupérer les infos matérielles.<br>
        Vérifiez que OpenHardwareMonitor fonctionne.</p>`;
      return;
    }

    container.innerHTML = `
      <h1>État Matériel</h1>
      <div class="info-grid">
        <div><span>Processeur :</span> ${hw.cpuModel} (Temp: ${hw.cpuTemp}°C)</div>
        <div><span>Carte Graph :</span> ${hw.gpuModel} (Temp: ${hw.gpuTemp}°C)</div>
        <div><span>RAM :</span> ${hw.ramAmount} Go</div>
        <div><span>Disques :</span> ${disks.join(', ')}</div>
        <div><span>Carte Mère :</span> ${hw.mbModel} (Temp: ${hw.mbTemp}°C)</div>
        <div><span>Windows :</span> ${winVer}</div>
      </div>`;
  }, 3000);
});

function showTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelector(`[onclick="showTab('${id}')"]`).classList.add('active');
}

document.getElementById('updateBtn').addEventListener('click', () => {
  const log = document.getElementById('updateLog');
  const prog = document.getElementById('updateProgress');
  log.textContent = '';
  prog.style.display = 'block';
  prog.value = 0;

  const ps = window.xornoAPI.installUpdates();
  ps.stdout.on('data', data => {
    const str = data.toString();
    log.textContent += str;
    const pctMatch = str.match(/PercentComplete\s*:\s*(\d+)/i);
    if (pctMatch) prog.value = parseInt(pctMatch[1], 10);
  });
  ps.on('close', code => {
    prog.style.display = 'none';
    log.textContent += `\nProcess terminé (code ${code}).`;
  });
});

document.getElementById('activateBtn').addEventListener('click', () => {
  const res = window.xornoAPI.activateWindows();
  document.getElementById('activationLog').textContent = res;
});
