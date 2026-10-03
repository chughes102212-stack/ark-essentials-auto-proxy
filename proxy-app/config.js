module.exports = {
  APP_NAME: process.env.APP_NAME || 'ArkProxyHelper',
  APP_PORT: Number(process.env.PORT || 8080),
  JOIN_CODE_TTL: Number(process.env.JOIN_CODE_TTL || 900), // 15 minutes
  DOWNLOAD_URL: process.env.DOWNLOAD_URL || 'https://example.com/ark-proxy-installer-v1.0.exe',
  INSTALLER_SHA256: process.env.INSTALLER_SHA256 || 'abc123def456...',
  APP_INSTALL_DIR: process.env.APP_INSTALL_DIR || 'C:/Users/Default/AppData/Local/ArkProxyHelper',
  AUTO_LAUNCH_ON_START: process.env.AUTO_LAUNCH_ON_START !== 'false',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'changeme',
  LOG_DIR: process.env.LOG_DIR || './logs',
  DATABASE_DIR: process.env.DATABASE_DIR || './db'
};
