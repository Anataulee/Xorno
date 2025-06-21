const { app, BrowserWindow } = require('electron');
const sudo = require('sudo-prompt');
const path = require('path');
const isElevated = require('is-elevated');

isElevated().then(elevated => {
  if (!elevated) {
    const appPath = path.resolve(__dirname);
    const command = `"${process.execPath}" "${appPath}"`;

    sudo.exec(command, { name: 'XORNO Diagnostic' }, (error) => {
      if (error) console.error('Erreur élévation :', error);
      app.quit();
    });
    return;
  }

  function createWindow() {
    const win = new BrowserWindow({
      width: 1000,
      height: 700,
      transparent: true,
      frame: false,
      vibrancy: 'acrylic',
      visualEffectState: 'active',
      webPreferences: {
        preload: path.join(__dirname, 'app', 'preload.js'),
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    win.loadFile(path.join(__dirname, 'app', 'index.html'));
  }

  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
});
