const { app } = require('electron');
const sudo = require('sudo-prompt');
const path = require('path');

const options = {
  name: 'X ORNO',
};

app.whenReady().then(() => {
  const script = `"${process.execPath}" "${path.join(__dirname, 'main.elevated.js')}"`;
  sudo.exec(script, options, (error) => {
    if (error) {
      console.error('Erreur d’élévation:', error);
      app.quit();
    } else {
      app.quit(); // Quitte l'instance normale
    }
  });
});
