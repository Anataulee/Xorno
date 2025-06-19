const { app, BrowserWindow } = require('electron');
const sudo = require('sudo-prompt');
const path = require('path');
const isElevated = require('is-elevated');

// Vérifie si l'application est lancée avec les droits admin
isElevated().then(elevated => {
  if (!elevated) {
    // Si non, relance le binaire avec élévation des droits
    const appPath = path.resolve(__dirname);
    const command = `"${process.execPath}" "${appPath}"`;

    sudo.exec(command, { name: 'XORNO Diagnostic' }, (error) => {
      if (error) console.error('Erreur élévation :', error);
      app.quit();
    });
    return;
  }

  // Fonction de création de la fenêtre principale
  function createWindow() {
    const win = new BrowserWindow({
      width: 1000,
      height: 700,
      webPreferences: {
        preload: path.join(__dirname, 'app', 'preload.js'),
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    win.loadFile(path.join(__dirname, 'app', 'index.html'));
  }

  // Initialisation de l'application Electron
  app.whenReady().then(createWindow);
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
});
