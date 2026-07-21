const test = require('node:test');
const assert = require('node:assert/strict');
const { validateCredentials } = require('../src/utils/validation');

test('registration credentials are normalized', () => {
  const result = validateCredentials({
    username: '  测试用户  ',
    email: ' USER@Example.COM ',
    password: 'correct horse battery staple'
  });
  assert.equal(result.value.username, '测试用户');
  assert.equal(result.value.email, 'user@example.com');
});

test('weak passwords are rejected', () => {
  const result = validateCredentials({
    username: 'valid_user',
    email: 'user@example.com',
    password: '1234567'
  });
  assert.match(result.error, /8–72/);
});
