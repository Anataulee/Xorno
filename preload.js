const { contextBridge } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseStringPromise } = require('xml2js');
const { spawn, execSync } = require('child_process');

function launchOHM() {
  const ahkScript = path.join(__dirname, 'auto_save_ohm.ahk');
  const is64 = os.arch() === 'x64';
  const ahkExe = path.join(__dirname, 'ahk', is64 ? 'AutoHotkey64.exe' : 'AutoHotkey32.exe');

  if (!fs.existsSync(ahkExe) || !fs.existsSync(ahkScript)) {
    console.error('AutoHotkey ou script AHK introuvable :', ahkExe, ahkScript);
    return;
  }

  spawn(ahkExe, [ahkScript], { detached: true, stdio: 'ignore' }).unref();
}

async function readOHMData() {
  const reportPath = path.join(os.homedir(), 'AppData', 'Roaming', 'OpenHardwareMonitor', 'OpenHardwareMonitorReport.xml');
  if (!fs.existsSync(reportPath)) return null;

  const xml = fs.readFileSync(reportPath, 'utf8');
  const result = await parseStringPromise(xml);
  return result;
}

async function extractHardwareInfo() {
  try {
    const data = await readOHMData();
    if (!data) return null;
    const hw = data.OpenHardwareMonitor.Hardware;

    const getSensor = (type, name) =>
      hw.flatMap(h => h.Sensor || [])
        .find(s => s.$.type === type && s.$.name.includes(name));

    const cpu = hw.find(h => h.$.type === 'CPU');
    const gpu = hw.find(h => h.$.type === 'GpuNvidia' || h.$.type === 'GpuAti');
    const ram = hw.find(h => h.$.type === 'RAM');
    const mb  = hw.find(h => h.$.type === 'Mainboard');

    return {
      cpuModel: cpu?.$.name || 'Inconnu',
      cpuTemp: getSensor('Temperature', 'CPU Package')?.Value?.[0] || 'N/A',
      gpuModel: gpu?.$.name || 'Inconnu',
      gpuTemp: getSensor('Temperature', 'GPU Core')?.Value?.[0] || 'N/A',
      ramAmount: getSensor('Data', 'Used Memory')?.Value?.[0] || 'N/A',
      mbModel: mb?.$.name || 'Inconnu',
      mbTemp: getSensor('Temperature', 'Mainboard')?.Value?.[0] || 'N/A'
    };
  } catch (e) {
    console.error('Erreur extraction hardware:', e.message);
    return null;
  }
}

function getDisks() {
  try {
    const output = execSync('wmic logicaldisk get name,size,description').toString();
    const lines = output.trim().split('\n').slice(1);
    const disks = lines.map(line => {
      const parts = line.trim().split(/\s+/);
      const name = parts[0];
      const size = parts[2] ? parseInt(parts[2], 10) : 0;
      return `${name} (${(size / (1024 ** 3)).toFixed(1)} Go)`;
    });
    return disks;
  } catch (e) {
    console.error('Erreur récupération disques:', e.message);
    return ['Erreur récupération disques'];
  }
}

function getWindowsVersion() {
  try {
    const version = execSync('wmic os get Caption,CSDVersion /value').toString();
    return version.replace(/\r/g, '').trim().split('\n').filter(Boolean).map(s => s.split('=')[1]).join(' ');
  } catch (e) {
    console.error('Erreur version Windows:', e.message);
    return 'Version inconnue';
  }
}

function installUpdates() {
  try {
    const script = `
      try {
        Set-ExecutionPolicy Bypass -Scope Process -Force;
        Install-PackageProvider -Name NuGet -Force;
        Install-Module -Name PSWindowsUpdate -Force;
        Import-Module PSWindowsUpdate;
        Get-WindowsUpdate -AcceptAll -Install -AutoReboot;
        "SUCCESS"
      } catch { "ERROR: $($_.Exception.Message)" }
    `;
    const result = execSync(`powershell -Command "${script}"`, { encoding: 'utf8' });
    return result;
  } catch (e) {
    console.error("Erreur PowerShell:", e);
    return `Erreur d'exécution PowerShell : ${e?.stderr || e?.message || e}`;
  }
}

function activateWindows() {
  try {
    const scriptPath = path.join(__dirname, 'MAS_AIO.cmd');
    const psCommand = `Start-Process -FilePath '${scriptPath}' -Verb runAs`;
    execSync(`powershell -Command "${psCommand}"`);
    console.log("→ MAS_AIO lancé avec succès");
    return 'Script d’activation lancé en mode administrateur.';
  } catch (e) {
    console.error("Erreur activation:", e);
    return `Échec lancement script MAS_AIO.cmd : ${e.message}`;
  }
}

contextBridge.exposeInMainWorld('xornoAPI', {
  launchOHM,
  extractHardwareInfo,
  getDisks,
  getWindowsVersion,
  installUpdates,
  activateWindows
});
