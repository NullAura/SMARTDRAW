const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { EMAIL_PATTERN, USERNAME_PATTERN, normalizeString } = require('../utils/validation');

const router = express.Router();
const PUBLIC_FIELDS = 'username role description portfolio skills followers following createdAt';

router.param('id', (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return res.status(400).json({ success: false, message: '用户 ID 格式无效' });
  }
  return next();
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(PUBLIC_FIELDS);
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });
    return res.json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', auth, async (req, res, next) => {
  if (req.params.id !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: '没有权限更新此用户' });
  }

  const allowedUpdates = new Set(['username', 'email', 'description', 'portfolio', 'skills']);
  const updates = Object.keys(req.body || {});
  if (!updates.length || !updates.every(update => allowedUpdates.has(update))) {
    return res.status(400).json({ success: false, message: '包含无效的更新字段' });
  }

  try {
    if ('username' in req.body) {
      const username = normalizeString(req.body.username);
      if (!USERNAME_PATTERN.test(username)) {
        return res.status(400).json({ success: false, message: '用户名格式无效' });
      }
      req.user.username = username;
    }
    if ('email' in req.body) {
      const email = normalizeString(req.body.email).toLowerCase();
      if (!EMAIL_PATTERN.test(email) || email.length > 254) {
        return res.status(400).json({ success: false, message: '邮箱格式无效' });
      }
      req.user.email = email;
    }
    if ('description' in req.body) req.user.description = normalizeString(req.body.description);
    if ('portfolio' in req.body) req.user.portfolio = req.body.portfolio;
    if ('skills' in req.body) req.user.skills = req.body.skills;

    await req.user.save();
    return res.json({ success: true, data: req.user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: '用户名或邮箱已被使用' });
    }
    return next(error);
  }
});

router.post('/:id/follow', auth, async (req, res, next) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: '不能关注自己' });
  }

  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: '用户不存在' });

    const isFollowing = req.user.following.some(id => id.equals(target._id));
    const operation = isFollowing ? '$pull' : '$addToSet';
    await Promise.all([
      User.updateOne({ _id: req.user._id }, { [operation]: { following: target._id } }),
      User.updateOne({ _id: target._id }, { [operation]: { followers: req.user._id } })
    ]);
    return res.json({ success: true, message: isFollowing ? '已取消关注' : '关注成功' });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/following', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username role');
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });
    return res.json({ success: true, data: user.following });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/followers', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username role');
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });
    return res.json({ success: true, data: user.followers });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
