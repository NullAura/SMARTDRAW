const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config');

const JWT_OPTIONS = {
  algorithm: 'HS256',
  audience: 'smartdraw-web',
  issuer: 'smartdraw-api'
};

function signToken(userId) {
  return jwt.sign({ sub: userId.toString() }, getJwtSecret(), {
    ...JWT_OPTIONS,
    expiresIn: '24h'
  });
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret(), {
    algorithms: [JWT_OPTIONS.algorithm],
    audience: JWT_OPTIONS.audience,
    issuer: JWT_OPTIONS.issuer
  });
}

module.exports = { signToken, verifyToken };
