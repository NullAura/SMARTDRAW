const http = require('node:http');
const mongoose = require('mongoose');
const { createApp } = require('./app');
const { getConfig } = require('./config');

async function start() {
  const config = getConfig();
  mongoose.set('sanitizeFilter', true);
  await mongoose.connect(config.mongodbUri, { serverSelectionTimeoutMS: 10000 });

  const server = http.createServer(createApp({ allowedOrigins: config.allowedOrigins }));
  server.listen(config.port, '127.0.0.1', () => {
    console.log(`SmartDraw API 已启动：http://127.0.0.1:${config.port}`);
  });

  const shutdown = signal => {
    console.log(`收到 ${signal}，正在安全停止服务`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch(error => {
  console.error('SmartDraw API 启动失败：', error.message);
  process.exit(1);
});
