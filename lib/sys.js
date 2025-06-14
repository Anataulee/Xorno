const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseStringPromise } = require('xml2js');
const { spawn, execSync } = require('child_process');

function getOHMPath() {
  return path.join(__dirname, '../ohm/OpenHardwareMonitor.exe');
}

function launchOHM() {
  const exe = getOHMPath();
  if (!fs.existsSync(exe)) {
    console.error('OpenHardwareMonitor.exe non trouvé.');
    return;
  }
  spawn(exe, [], { detached: true, stdio: 'ignore' }).unref();
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
    return lines.map(line => {
      const parts = line.trim().split(/\s+/);
      const name = parts[0];
      const size = parts[2] ? parseInt(parts[2], 10) : 0;
      return `${name} (${(size / (1024 ** 3)).toFixed(1)} Go)`;
    });
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
    return spawn('powershell', [
      '-Command',
      `
      Write-Progress -Activity 'Installation des mises à jour' -PercentComplete 0;
      Install-PackageProvider -Name NuGet -Force;
      Install-Module -Name PSWindowsUpdate -Force;
      Import-Module PSWindowsUpdate;
      Get-WindowsUpdate -AcceptAll -Install -AutoReboot -Verbose | ForEach-Object {
        $p = ($_ | Measure-Object).Count * 10;
        Write-Progress -Activity 'Installation des mises à jour' -PercentComplete $p
      };
      Write-Output 'SUCCESS'
      `
    ]);
  } catch (e) {
    throw new Error(e.message);
  }
}

function activateWindows() {
  try {
    const scriptPath = path.join(__dirname, '../MAS_AIO.cmd');
    const psCommand = `Start-Process -FilePath '${scriptPath}' -Verb runAs`;
    execSync(`powershell -Command "${psCommand}"`);
    return 'Script d’activation lancé en mode administrateur.';
  } catch (e) {
    return `Échec lancement script MAS_AIO.cmd : ${e.message}`;
  }
}

module.exports = {
  launchOHM,
  extractHardwareInfo,
  getDisks,
  getWindowsVersion,
  installUpdates,
  activateWindows
};
