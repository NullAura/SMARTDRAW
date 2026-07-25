const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPrompt } = require('../src/services/merchantAiService');

test('merchant AI prompt uses the selected template and generation type', () => {
  const prompt = buildPrompt('description', 'digital', [{ title: '降噪耳机' }]);
  assert.match(prompt, /数码产品/);
  assert.match(prompt, /商品描述/);
  assert.match(prompt, /降噪耳机/);
});
