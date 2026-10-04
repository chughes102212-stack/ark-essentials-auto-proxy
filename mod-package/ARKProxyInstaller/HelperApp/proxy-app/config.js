module.exports = {
  APP_NAME: process.env.APP_NAME || 'ArkProxyHelper',
  APP_PORT: Number(process.env.PORT || 8080),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  LOG_DIR: process.env.LOG_DIR || './logs',
  DATABASE_DIR: process.env.DATABASE_DIR || './db'
};
