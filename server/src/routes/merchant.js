const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
const AIGeneration = require('../models/AIGeneration');
const { auth, isMerchant, requireRole } = require('../middleware/auth');
const { signToken } = require('../utils/token');
const { getOpenAIConfig } = require('../config');
const { normalizeString, validateCredentials } = require('../utils/validation');

const router = express.Router();
const TEMPLATE_NAMES = {
  clothing: '服装行业',
  digital: '数码产品',
  food: '食品',
  beauty: '美妆产品'
};
const GENERATION_TYPES = new Set(['description', 'image', 'tag']);

function publicMerchant(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    storeName: user.storeName,
    role: user.role,
    status: user.status
  };
}

function buildPrompt(type, template, currentItems = []) {
  const industry = TEMPLATE_NAMES[template] || '通用商品';
  const existingContext = JSON.stringify(currentItems).slice(0, 4000);
  const requests = {
    description: '一段真实、清晰且有吸引力的商品描述，突出特点和使用场景',
    image: '一段可直接用于生成高质量商品主图的视觉提示词，包含构图、光线和背景',
    tag: '5 个简洁、准确、不夸大的营销标签'
  };
  return `请为${industry}生成${requests[type]}。现有页面内容：${existingContext}`;
}

router.post('/login', async (req, res, next) => {
  try {
    const account = normalizeString(req.body?.account);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!account || !password) {
      return res.status(400).json({ success: false, message: '请提供账号和密码' });
    }

    const user = await User.findOne({
      $or: [{ email: account.toLowerCase() }, { username: account }],
      role: 'merchant'
    }).select('+password');
    const passwordMatches = user ? await user.comparePassword(password) : false;
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: '账号或密码错误' });
    }
    if (user.status !== 'approved') {
      const message = user.status === 'rejected' ? '商家账号审核未通过' : '商家账号正在审核中';
      return res.status(403).json({ success: false, message });
    }

    return res.json({
      success: true,
      message: '登录成功',
      data: { token: signToken(user._id), user: publicMerchant(user) }
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const validation = validateCredentials(req.body || {});
    if (validation.error) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    const storeName = normalizeString(req.body.storeName);
    const phone = normalizeString(req.body.phone);
    const address = normalizeString(req.body.address);
    const businessLicense = normalizeString(req.body.businessLicense);
    if (!storeName || !/^1[3-9]\d{9}$/.test(phone) || !address || !businessLicense) {
      return res.status(400).json({ success: false, message: '请提供完整、有效的商家资料' });
    }

    const { username, email, password } = validation.value;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ success: false, message: '用户名或邮箱已被使用' });
    }

    const merchant = await User.create({
      username,
      email,
      password,
      role: 'merchant',
      storeName,
      phone,
      address,
      businessLicense
    });

    return res.status(201).json({
      success: true,
      message: '商家入驻申请已提交，请等待审核',
      data: { user: publicMerchant(merchant) }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: '用户名或邮箱已被使用' });
    }
    return next(error);
  }
});

router.get('/me', auth, isMerchant, (req, res) => {
  return res.json({ success: true, data: publicMerchant(req.user) });
});

router.post('/logout', auth, isMerchant, (_req, res) => {
  return res.json({ success: true, message: '登出成功' });
});

router.patch('/:id/status', auth, requireRole('admin'), async (req, res, next) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({ success: false, message: '商家 ID 格式无效' });
  }
  if (!['approved', 'rejected'].includes(req.body?.status)) {
    return res.status(400).json({ success: false, message: '审核状态无效' });
  }
  try {
    const merchant = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'merchant' },
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!merchant) return res.status(404).json({ success: false, message: '商家不存在' });
    return res.json({ success: true, data: publicMerchant(merchant) });
  } catch (error) {
    return next(error);
  }
});

router.post('/ai/generate', auth, isMerchant, async (req, res) => {
  const { type, template, currentItems = [] } = req.body || {};
  if (!GENERATION_TYPES.has(type) || !Object.hasOwn(TEMPLATE_NAMES, template)) {
    return res.status(400).json({ success: false, message: '生成类型或模板无效' });
  }
  if (!Array.isArray(currentItems) || currentItems.length > 100) {
    return res.status(400).json({ success: false, message: '页面内容格式无效' });
  }

  let aiConfig;
  try {
    aiConfig = getOpenAIConfig();
  } catch {
    return res.status(503).json({ success: false, message: 'AI 服务尚未配置' });
  }

  try {
    const completion = await axios.post(
      `${aiConfig.baseUrl}/chat/completions`,
      {
        model: aiConfig.textModel,
        messages: [
          {
            role: 'system',
            content: '你是严谨的电商页面设计助手。内容必须准确、简洁，不得虚构认证或效果。'
          },
          { role: 'user', content: buildPrompt(type, template, currentItems) }
        ],
        max_completion_tokens: 1000
      },
      {
        headers: { Authorization: `Bearer ${aiConfig.apiKey}` },
        timeout: 30000
      }
    );
    const content = completion.data?.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('INVALID_UPSTREAM_RESPONSE');

    if (type !== 'image') {
      return res.json({ success: true, data: { content } });
    }

    const imageResponse = await axios.post(
      `${aiConfig.baseUrl}/images/generations`,
      { model: aiConfig.imageModel, prompt: content, n: 1, size: '1024x1024' },
      {
        headers: { Authorization: `Bearer ${aiConfig.apiKey}` },
        timeout: 60000
      }
    );
    const image = imageResponse.data?.data?.[0];
    const imageUrl = image?.url || (image?.b64_json ? `data:image/png;base64,${image.b64_json}` : '');
    if (!imageUrl) throw new Error('INVALID_IMAGE_RESPONSE');
    return res.json({ success: true, data: { content, imageUrl } });
  } catch (error) {
    const status = error.response?.status === 429 ? 429 : 502;
    return res.status(status).json({
      success: false,
      message: status === 429 ? 'AI 请求过于频繁，请稍后再试' : 'AI 服务暂时不可用'
    });
  }
});

router.post('/ai/save', auth, isMerchant, async (req, res, next) => {
  try {
    const { template, items } = req.body || {};
    if (!Object.hasOwn(TEMPLATE_NAMES, template) || !Array.isArray(items) || items.length > 100) {
      return res.status(400).json({ success: false, message: '作品数据格式无效' });
    }
    const generation = await AIGeneration.create({ user: req.user._id, template, items });
    return res.status(201).json({ success: true, message: '保存成功', data: generation });
  } catch (error) {
    return next(error);
  }
});

router.get('/ai/works', auth, isMerchant, async (req, res, next) => {
  try {
    const works = await AIGeneration.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
    return res.json({ success: true, data: { works } });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
module.exports.buildPrompt = buildPrompt;
