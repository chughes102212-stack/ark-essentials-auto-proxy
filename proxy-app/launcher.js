const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { APP_INSTALL_DIR, APP_NAME } = require('./config');

function ensureInstallFolder() {
  fs.mkdirSync(APP_INSTALL_DIR, { recursive: true });
  return APP_INSTALL_DIR;
}

function writeLauncherState() {
  const stateFile = path.join(APP_INSTALL_DIR, 'launcher-state.json');
  const state = {
    app: APP_NAME,
    installedAt: new Date().toISOString(),
    autoStart: true
  };

  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  return stateFile;
}

function launchHelper() {
  const scriptPath = path.join(__dirname, 'server.js');
  const child = spawn(process.execPath, [scriptPath], {
    detached: true,
    stdio: 'ignore',
    env: {
      ...process.env,
      APP_NAME,
      AUTO_LAUNCH_ON_START: 'true'
    }
  });

  child.unref();
  return child.pid;
}

module.exports = {
  ensureInstallFolder,
  writeLauncherState,
  launchHelper
};
