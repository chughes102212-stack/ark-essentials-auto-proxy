module.exports = {
  APP_NAME: process.env.APP_NAME || 'ArkProxyHelper',
  APP_PORT: Number(process.env.PORT || 8080),
  JOIN_CODE_TTL: Number(process.env.JOIN_CODE_TTL || 900),
  DOWNLOAD_URL: process.env.DOWNLOAD_URL || 'https://example.com/ark-proxy-installer.exe',
  APP_INSTALL_DIR: process.env.APP_INSTALL_DIR || 'C:/ArkProxyHelper',
  APP_DATA_DIR: process.env.APP_DATA_DIR || 'C:/Users/Default/AppData/Local/ArkProxyHelper',
  AUTO_LAUNCH_ON_START: process.env.AUTO_LAUNCH_ON_START !== 'false'
};
