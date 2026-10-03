const fs = require('fs');
const path = require('path');
const { APP_INSTALL_DIR } = require('./config');

function ensureInstallDir() {
  fs.mkdirSync(APP_INSTALL_DIR, { recursive: true });
}

function writeBootstrapFile() {
  ensureInstallDir();
  const target = path.join(APP_INSTALL_DIR, 'bootstrap.json');
  const payload = {
    installed: true,
    createdAt: new Date().toISOString(),
    app: 'ArkProxyHelper'
  };

  fs.writeFileSync(target, JSON.stringify(payload, null, 2));
  return target;
}

module.exports = { ensureInstallDir, writeBootstrapFile };
