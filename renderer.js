window.addEventListener('DOMContentLoaded', async () => {
  window.xornoAPI.launchOHM();

  setTimeout(async () => {
    const hw = await window.xornoAPI.extractHardwareInfo();
    const disks = window.xornoAPI.getDisks();
    const winVer = window.xornoAPI.getWindowsVersion();

    if (!hw) return;

    document.getElementById('hardware').innerHTML = `
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
  document.getElementById('updateLog').textContent = 'Mise à jour en cours...';
  setTimeout(() => {
    const result = window.xornoAPI.installUpdates();
    document.getElementById('updateLog').textContent = result;
  }, 100);
});

document.getElementById('activateBtn').addEventListener('click', () => {
  const result = window.xornoAPI.activateWindows();
  document.getElementById('activationLog').textContent = result;
});
