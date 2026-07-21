const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[\p{L}\p{N}_-]{3,30}$/u;

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateCredentials({ username, email, password }) {
  const normalized = {
    username: normalizeString(username),
    email: normalizeString(email).toLowerCase(),
    password: typeof password === 'string' ? password : ''
  };

  if (!USERNAME_PATTERN.test(normalized.username)) {
    return { error: '用户名需为 3–30 位文字、数字、下划线或连字符' };
  }
  if (!EMAIL_PATTERN.test(normalized.email) || normalized.email.length > 254) {
    return { error: '请输入有效的邮箱地址' };
  }
  if (normalized.password.length < 8 || normalized.password.length > 72) {
    return { error: '密码长度需为 8–72 位' };
  }
  return { value: normalized };
}

module.exports = { EMAIL_PATTERN, USERNAME_PATTERN, normalizeString, validateCredentials };
