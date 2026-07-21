const test = require('node:test');
const assert = require('node:assert/strict');
const { signToken, verifyToken } = require('../src/utils/token');

test('signed token enforces issuer, audience and subject', () => {
  process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-32-characters';
  const token = signToken('507f1f77bcf86cd799439011');
  const payload = verifyToken(token);
  assert.equal(payload.sub, '507f1f77bcf86cd799439011');
  assert.equal(payload.iss, 'smartdraw-api');
  assert.equal(payload.aud, 'smartdraw-web');
});
