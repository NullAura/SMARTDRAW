const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { signToken } = require('../utils/token');
const { normalizeString, validateCredentials } = require('../utils/validation');

const router = express.Router();

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  };
}

router.post('/register', async (req, res, next) => {
  try {
    const validation = validateCredentials(req.body || {});
    if (validation.error) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    const { username, email, password } = validation.value;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ success: false, message: '用户名或邮箱已被使用' });
    }

    const user = await User.create({ username, email, password, role: 'user' });
    return res.status(201).json({
      success: true,
      message: '注册成功',
      data: { token: signToken(user._id), user: publicUser(user) }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: '用户名或邮箱已被使用' });
    }
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const account = normalizeString(req.body?.account).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!account || !password) {
      return res.status(400).json({ success: false, message: '请提供账号和密码' });
    }

    const user = await User.findOne({
      $or: [{ email: account }, { username: req.body.account.trim() }]
    }).select('+password');
    const passwordMatches = user ? await user.comparePassword(password) : false;
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: '账号或密码错误' });
    }

    return res.json({
      success: true,
      message: '登录成功',
      data: { token: signToken(user._id), user: publicUser(user) }
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', auth, async (req, res) => {
  return res.json({ success: true, data: publicUser(req.user) });
});

router.post('/logout', auth, (_req, res) => {
  return res.json({ success: true, message: '登出成功' });
});

module.exports = router;
