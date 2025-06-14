const { contextBridge } = require('electron');
const sys = require('./lib/sys.js');

contextBridge.exposeInMainWorld('xornoAPI', {
  launchOHM: sys.launchOHM,
  extractHardwareInfo: sys.extractHardwareInfo,
  getDisks: sys.getDisks,
  getWindowsVersion: sys.getWindowsVersion,
  installUpdates: sys.installUpdates,
  activateWindows: sys.activateWindows
});
