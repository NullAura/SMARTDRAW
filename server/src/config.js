const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`缺少必要环境变量：${name}`);
  }
  return value;
}

function getJwtSecret() {
  const secret = required('JWT_SECRET');
  if (secret.length < 32) {
    throw new Error('JWT_SECRET 至少需要 32 个字符');
  }
  return secret;
}

function getConfig() {
  const port = Number.parseInt(process.env.PORT || '3000', 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT 必须是 1 到 65535 之间的整数');
  }

  return {
    port,
    mongodbUri: required('MONGODB_URI'),
    jwtSecret: getJwtSecret(),
    allowedOrigins: (process.env.CORS_ORIGINS || 'http://127.0.0.1:5173,http://localhost:5173')
      .split(',')
      .map(value => value.trim())
      .filter(Boolean)
  };
}

function getOpenAIConfig() {
  return {
    apiKey: required('OPENAI_API_KEY'),
    baseUrl: (process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, ''),
    textModel: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
    imageModel: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2'
  };
}

module.exports = { getConfig, getJwtSecret, getOpenAIConfig, required };
