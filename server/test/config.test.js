const test = require('node:test');
const assert = require('node:assert/strict');
const { getConfig, getJwtSecret } = require('../src/config');

test('JWT secret must be present and sufficiently long', () => {
  const previous = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'short';
  assert.throws(() => getJwtSecret(), /至少需要 32 个字符/);
  if (previous === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previous;
});

test('server configuration parses allowed origins', () => {
  const previous = {
    jwtSecret: process.env.JWT_SECRET,
    mongodbUri: process.env.MONGODB_URI,
    corsOrigins: process.env.CORS_ORIGINS
  };
  process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-32-characters';
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/smartdraw-test';
  process.env.CORS_ORIGINS = 'https://one.example, https://two.example';
  const config = getConfig();
  assert.deepEqual(config.allowedOrigins, ['https://one.example', 'https://two.example']);
  for (const [name, value] of [
    ['JWT_SECRET', previous.jwtSecret],
    ['MONGODB_URI', previous.mongodbUri],
    ['CORS_ORIGINS', previous.corsOrigins]
  ]) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});
