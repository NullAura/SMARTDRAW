const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const axios = require('axios');

// 商家登录
router.post('/login', async (req, res) => {
  console.log('收到商家登录请求:', {
    body: {
      ...req.body,
      password: '******' // 不输出实际密码
    }
  });
  
  try {
    const { account, password } = req.body;
    
    if (!account || !password) {
      console.log('缺少必要参数');
      return res.status(400).json({ 
        success: false,
        message: '请提供账号和密码' 
      });
    }

    // 查找商家用户（支持邮箱或用户名登录）
    const user = await User.findOne({
      $or: [
        { email: account },
        { username: account }
      ],
      role: 'merchant'
    });

    if (!user) {
      console.log('商家账号不存在:', account);
      return res.status(401).json({ 
        success: false,
        message: '账号或密码错误' 
      });
    }

    console.log('找到商家用户:', {
      id: user._id,
      email: user.email,
      username: user.username
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

    console.log('商家登录成功，生成token');
    res.json({
      success: true,
      message: '登录成功！',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          storeName: user.storeName,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('商家登录错误:', error);
    res.status(400).json({ 
      success: false,
      message: '登录失败：' + error.message 
    });
  }
});

// 商家登出
router.post('/logout', auth, async (req, res) => {
  try {
    // 在这里可以添加token黑名单或其他服务器端登出逻辑
    console.log('商家登出成功:', req.user.userId);
    
    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    console.error('商家登出错误:', error);
    res.status(500).json({
      success: false,
      message: '登出失败：' + error.message
    });
  }
});

// 商家注册
router.post('/register', async (req, res) => {
  console.log('收到商家注册请求:', {
    body: {
      ...req.body,
      password: '******' // 不输出实际密码
    },
    headers: req.headers,
    ip: req.ip,
    method: req.method,
    path: req.path
  });

  try {
    const { storeName, username, email, phone, password, address, businessLicense } = req.body;

    // 输入验证
    if (!storeName || !username || !email || !phone || !password || !address || !businessLicense) {
      console.log('缺少必要参数:', { 
        storeName: !!storeName, 
        username: !!username, 
        email: !!email, 
        phone: !!phone, 
        password: !!password, 
        address: !!address, 
        businessLicense: !!businessLicense 
      });
      return res.status(400).json({
        success: false,
        message: '请提供完整的注册信息'
      });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('用户名已存在:', {
        id: existingUser._id,
        username: existingUser.username
      });
      return res.status(400).json({
        success: false,
        message: '该用户名已被使用'
      });
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log('邮箱已存在:', {
        id: existingEmail._id,
        email: existingEmail.email
      });
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }

    // 创建新商家用户
    const merchant = new User({
      username,
      email,
      password,
      role: 'merchant',
      storeName,
      phone,
      address,
      businessLicense
    });

    console.log('正在创建新商家用户:', {
      username: merchant.username,
      email: merchant.email,
      storeName: merchant.storeName
    });

    await merchant.save();
    console.log('商家用户创建成功:', {
      id: merchant._id,
      username: merchant.username,
      email: merchant.email
    });

    // 生成 token
    const token = jwt.sign(
      { userId: merchant._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('注册成功，返回商家信息');
    res.status(201).json({
      success: true,
      message: '商家注册成功，请等待审核',
      data: {
        token,
        user: {
          id: merchant._id,
          username: merchant.username,
          email: merchant.email,
          storeName: merchant.storeName
        }
      }
    });
  } catch (error) {
    console.error('商家注册错误:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    // MongoDB 特定错误处理
    if (error.code === 11000) {
      console.error('MongoDB 唯一索引冲突:', error.keyPattern);
      return res.status(400).json({
        success: false,
        message: '该用户名或邮箱已被使用'
      });
    }

    res.status(500).json({
      success: false,
      message: '注册失败：' + error.message
    });
  }
});

// AI工具相关路由
router.post('/ai/generate', auth, async (req, res) => {
  console.log('收到AI生成请求:', {
    body: req.body,
    headers: req.headers,
    ip: req.ip,
    method: req.method,
    path: req.path
  });

  try {
    const { type, template, currentItems } = req.body;

    if (!type || !template) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 构建提示词
    const prompt = buildPrompt(type, template, currentItems);

    // 调用OpenAI API
    const response = await axios.post(
      `${process.env.OPENAI_API_BASE_URL}/chat/completions`,
      {
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的商品详情页设计师，擅长根据行业特点生成吸引人的商品描述和图片。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const content = response.data.choices[0].message.content;

    if (type === 'description') {
      return res.json({
        success: true,
        data: {
          content
        }
      });
    } else if (type === 'image') {
      // 调用图片生成API
      const imageResponse = await axios.post(
        `${process.env.OPENAI_API_BASE_URL}/images/generations`,
        {
          prompt: content,
          n: 1,
          size: '1024x1024'
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return res.json({
        success: true,
        data: {
          imageUrl: imageResponse.data.data[0].url
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: '不支持的生成类型'
      });
    }
  } catch (error) {
    console.error('AI生成错误:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: `AI服务错误: ${error.response.data.error?.message || error.message}`
      });
    }

    res.status(500).json({
      success: false,
      message: '生成失败：' + error.message
    });
  }
});

// 保存AI作品
router.post('/ai/save', auth, async (req, res) => {
  try {
    const { template, items } = req.body;
    const userId = req.user.userId;

    // 这里可以添加保存到数据库的逻辑
    // 例如：await AITemplate.save({ userId, template, items });

    res.json({
      success: true,
      message: '保存成功'
    });
  } catch (error) {
    console.error('保存AI作品错误:', error);
    res.status(500).json({
      success: false,
      message: '保存失败：' + error.message
    });
  }
});

// 获取AI作品列表
router.get('/ai/works', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // 这里可以添加从数据库获取作品的逻辑
    // 例如：const works = await AITemplate.find({ userId });

    res.json({
      success: true,
      data: {
        works: [] // 替换为实际的作品列表
      }
    });
  } catch (error) {
    console.error('获取AI作品列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取失败：' + error.message
    });
  }
});

function buildPrompt(type, template, currentItems) {
  const templatePrompts = {
    'clothing': '服装行业',
    'digital': '数码产品',
    'food': '食品',
    'beauty': '美妆产品'
  };

  const basePrompt = `请为${templatePrompts.get(template, '商品')}生成`;

  if (type === 'description') {
    return `${basePrompt}一段吸引人的商品描述，突出产品特点和优势。`;
  } else if (type === 'image') {
    return `${basePrompt}一张高质量的商品主图，要求突出产品特点，构图精美。`;
  } else if (type === 'tag') {
    return `${basePrompt}一组吸引人的营销标签，突出产品卖点。`;
  }

  return basePrompt;
}

module.exports = router; 