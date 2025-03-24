const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// 注册
router.post('/register', async (req, res) => {
  console.log('收到注册请求:', req.body); // 添加请求日志
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('用户已存在:', existingUser); // 添加日志
      return res.status(400).json({ 
        success: false,
        message: existingUser.email === email ? '该邮箱已被注册' : '该用户名已被使用'
      });
    }

    // 创建新用户
    const user = new User({
      username,
      email,
      password,
      userType: 'user' // 默认注册为普通用户
    });

    console.log('创建新用户:', user); // 添加日志
    await user.save();

    // 生成 token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('注册成功，返回用户信息'); // 添加日志
    res.status(201).json({
      success: true,
      message: '注册成功！',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('注册错误:', error); // 添加错误日志
    res.status(400).json({ 
      success: false,
      message: '注册失败：' + error.message 
    });
  }
});

// 登录
router.post('/login', async (req, res) => {
  console.log('收到登录请求:', req.body);
  try {
    const { account, password } = req.body;
    
    if (!account || !password) {
      console.log('缺少必要参数');
      return res.status(400).json({ 
        success: false,
        message: '请提供账号和密码' 
      });
    }

    // 查找用户（支持邮箱或用户名登录）
    const user = await User.findOne({
      $or: [
        { email: account },
        { username: account }
      ]
    });

    if (!user) {
      console.log('用户不存在:', account);
      return res.status(401).json({ 
        success: false,
        message: '账号或密码错误' 
      });
    }

    console.log('找到用户:', {
      id: user._id,
      email: user.email,
      username: user.username,
      passwordLength: user.password.length
    });

    // 验证密码
    console.log('开始验证密码');
    const isMatch = await user.comparePassword(password);
    console.log('密码验证结果:', isMatch);

    if (!isMatch) {
      console.log('密码验证失败');
      return res.status(401).json({ 
        success: false,
        message: '账号或密码错误' 
      });
    }

    // 生成 token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('登录成功，生成token');
    res.json({
      success: true,
      message: '登录成功！',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(400).json({ 
      success: false,
      message: '登录失败：' + error.message 
    });
  }
});

// 获取当前用户信息
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: '获取用户信息失败：' + error.message 
    });
  }
});

module.exports = router; 