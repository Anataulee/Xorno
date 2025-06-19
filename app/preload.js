const si = require('systeminformation');
const { execSync, spawn } = require('child_process');
const iconv = require('iconv-lite');
const path = require('path');

async function getCpu() {
  const cpu = await si.cpu();
  return `${cpu.manufacturer} ${cpu.brand} @ ${cpu.speed} GHz`;
}

async function getGpu() {
  const graphics = await si.graphics();
  return graphics.controllers[0]?.model || 'N/A';
}

async function getRam() {
  const mem = await si.mem();
  const layout = await si.memLayout();
  const ramGB = (mem.total / 1024 ** 3).toFixed(2) + ' Go';
  const speed = layout[0]?.clockSpeed ? layout[0].clockSpeed + ' MHz' : 'N/A';
  return `${ramGB} @ ${speed}`;
}

async function getMb() {
  const mb = await si.baseboard();
  return `${mb.manufacturer} ${mb.model}`;
}

async function getOs() {
  const os = await si.osInfo();
  return `${os.distro} ${os.release}`;
}

async function getDisks() {
  const disks = await si.fsSize();
  return disks.map(d => `${d.fs} (${(d.size / 1024 ** 3).toFixed(1)} Go)`);
}

async function getNetwork() {
  const net = await si.networkInterfaces();
  const up = net.find(n => n.operstate === 'up');
  return up ? `${up.iface} (${up.type})` : 'Non connecté';
}

async function getBattery() {
  const bat = await si.battery();
  if (!bat.hasBattery) return 'N/A - PC fixe';
  return `${bat.percent}% ${bat.acConnected ? '(branchée)' : '(batterie)'}`;
}

async function checkActivation() {
  try {
    const raw = execSync(
      '%SystemRoot%\\System32\\cscript.exe //nologo %SystemRoot%\\System32\\slmgr.vbs /xpr',
      { encoding: 'buffer' }
    );
    const output = iconv.decode(raw, 'cp850').trim();
    return output.includes('permanent') ? 'Activé' : output || 'Non activé';
  } catch {
    return 'Erreur détection activation';
  }
}

function openWindowsUpdate() {
  execSync('start ms-settings:windowsupdate', { shell: 'cmd.exe' });
}

function runActivate() {
  try {
    return execSync(
      `powershell -ExecutionPolicy Bypass -File "${path.join(__dirname, '..', 'scripts', 'activate.ps1')}"`,
      { encoding: 'utf8' }
    );
  } catch (e) {
    return `Erreur PowerShell (activation): ${e.message}`;
  }
}

function runNinite(type) {
  const exePath = path.join(
    __dirname,
    '..',
    'scripts',
    type === 'bureau'
      ? 'ninite-bureautique.exe'
      : type === 'gaming'
      ? 'ninite-gaming.exe'
      : 'ninite-combo.exe'
  );
  try {
    return execSync(`"${exePath}"`, { encoding: 'utf8' });
  } catch (e) {
    return `Erreur Ninite (${type}) : ${e.message}`;
  }
}

function runWingetInstallLive(appList, reportStatus, reportLog) {
  if (!Array.isArray(appList) || appList.length === 0) return;

  let index = 0;

  const runNext = () => {
    const id = appList[index];
    reportStatus(id, 'running');
    const proc = spawn(
      'cmd.exe',
      ['/c', `winget install --accept-package-agreements --accept-source-agreements -e --id ${id}`],
      { shell: true }
    );

    proc.stdout.on('data', (data) => {
      const line = data.toString();
      reportLog(id, line);
      if (/Téléchargement en cours|Downloading/.test(line)) {
        reportStatus(id, 'download');
      } else if (/Installation de|Installing|Installing package/.test(line)) {
        reportStatus(id, 'install');
      }
    });

    proc.stderr.on('data', (data) => {
      const line = data.toString();
      reportLog(id, line);
    });

    proc.on('close', (code) => {
      if (code === 0) {
        reportStatus(id, 'ok');
      } else {
        reportStatus(id, 'fail');
      }
      index++;
      if (index < appList.length) {
        runNext();
      }
    });
  };

  runNext();
}

function quitApp() {
  execSync('taskkill /IM electron.exe /F');
}

window.xornoAPI = {
  getCpu,
  getGpu,
  getRam,
  getMb,
  getOs,
  getDisks,
  getNetwork,
  getBattery,
  checkActivation,
  openWindowsUpdate,
  runActivate,
  runNinite,
  runWingetInstallLive,
  quitApp
};
