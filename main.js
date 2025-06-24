const { app } = require('electron');
const path = require('path');
const isElevated = require('is-elevated');
const sudo = require('sudo-prompt');
const { BrowserWindow: AcrylicBrowserWindow } = require('electron-acrylic-window');
const fs = require('fs');

// Logger vers log.txt
const logPath = path.join(__dirname, 'log.txt');
const logStream = fs.createWriteStream(logPath, { flags: 'a' });
const log = (...args) => {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}\n`;
  logStream.write(line);
  console.log(...args);
};
process.on('exit', () => logStream.end());

log('🚀 Démarrage main.js');

isElevated().then(elevated => {
  if (!elevated) {
    const electronExe = path.join(__dirname, 'node_modules', 'electron', 'dist', 'electron.exe');
    const command = `"${electronExe}" "${__dirname}"`;
    log('🔁 Relance avec élévation :', command);
    sudo.exec(command, { name: 'XORNO', cwd: __dirname }, err => {
      if (err) log('❌ Erreur élévation :', err);
      else log('✅ Relancé avec succès');
      app.quit();
    });
    return;
  }

  log('✅ Processus élevé — création fenêtre');

  app.whenReady().then(() => {
    log('➡️ app.whenReady');

    try {
      const win = new AcrylicBrowserWindow({
        width: 1000,
        height: 700,
        frame: false,
        transparent: true,
        vibrancy: {
          theme: 'light',               // Thème clair
          effect: 'acrylic',
          useCustomWindowRefreshMethod: true,
          disableOnBlur: false,
        },
        webPreferences: {
          preload: path.join(__dirname, 'app', 'preload.js'),
          nodeIntegration: true,
          contextIsolation: false,
        },
      });

      win.setPosition(100, 100);
      win.show();
      win.focus();
      win.webContents.openDevTools({ mode: 'detach' });

      const indexPath = path.join(__dirname, 'app', 'index.html');
      log('🪟 Fenêtre créée — chargement index.html', indexPath);
      win.loadFile(indexPath);
    } catch (e) {
      log('‼️ Erreur création Fenêtre :', e);
    }
  });

  app.on('window-all-closed', () => {
    log('📦 Fermeture app');
    if (process.platform !== 'darwin') app.quit();
  });
});
