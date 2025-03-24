const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, isDesigner } = require('../middleware/auth');

// 获取用户信息
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 更新用户信息
router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['username', 'email', 'description', 'portfolio', 'skills'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: '无效的更新字段' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 检查权限
    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '没有权限更新此用户信息' });
    }

    updates.forEach(update => user[update] = req.body[update]);
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 关注用户
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ message: '用户不存在' });
    }

    if (userToFollow._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: '不能关注自己' });
    }

    const isFollowing = req.user.following.includes(userToFollow._id);
    if (isFollowing) {
      req.user.following = req.user.following.filter(id => id.toString() !== userToFollow._id.toString());
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== req.user._id.toString());
    } else {
      req.user.following.push(userToFollow._id);
      userToFollow.followers.push(req.user._id);
    }

    await req.user.save();
    await userToFollow.save();

    res.json({ message: isFollowing ? '取消关注成功' : '关注成功' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 获取关注列表
router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username email userType');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user.following);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 获取粉丝列表
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username email userType');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user.followers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 