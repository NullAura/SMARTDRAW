const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-32-characters';

test('health endpoint returns security headers', async () => {
  const response = await request(createApp()).get('/health').expect(200);
  assert.equal(response.body.status, 'healthy');
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
  assert.equal(response.headers['x-powered-by'], undefined);
});

test('CORS rejects an unknown browser origin', async () => {
  const response = await request(createApp({ allowedOrigins: ['https://smartdraw.example'] }))
    .get('/health')
    .set('Origin', 'https://attacker.example')
    .expect(403);
  assert.equal(response.body.success, false);
});

test('login validates required fields before database access', async () => {
  const response = await request(createApp()).post('/api/auth/login').send({}).expect(400);
  assert.equal(response.body.message, '请提供账号和密码');
});
