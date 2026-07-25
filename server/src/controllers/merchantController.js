const mongoose = require('mongoose');
const User = require('../models/User');
const AIGeneration = require('../models/AIGeneration');
const { signToken } = require('../utils/token');
const { normalizeString, validateCredentials } = require('../utils/validation');
const {
  GENERATION_TYPES,
  TEMPLATE_NAMES,
  generateMerchantContent
} = require('../services/merchantAiService');

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

async function login(req, res, next) {
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
}

async function register(req, res, next) {
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
}

function getCurrent(req, res) {
  return res.json({ success: true, data: publicMerchant(req.user) });
}

function logout(_req, res) {
  return res.json({ success: true, message: '登出成功' });
}

async function updateStatus(req, res, next) {
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
}

async function generateAi(req, res) {
  const { type, template, currentItems = [] } = req.body || {};
  if (!GENERATION_TYPES.has(type) || !Object.hasOwn(TEMPLATE_NAMES, template)) {
    return res.status(400).json({ success: false, message: '生成类型或模板无效' });
  }
  if (!Array.isArray(currentItems) || currentItems.length > 100) {
    return res.status(400).json({ success: false, message: '页面内容格式无效' });
  }

  try {
    const data = await generateMerchantContent({ type, template, currentItems });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.status || 502).json({
      success: false,
      message: error.publicMessage || 'AI 服务暂时不可用'
    });
  }
}

async function saveAiWork(req, res, next) {
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
}

async function listAiWorks(req, res, next) {
  try {
    const works = await AIGeneration.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
    return res.json({ success: true, data: { works } });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  generateAi,
  getCurrent,
  listAiWorks,
  login,
  logout,
  register,
  saveAiWork,
  updateStatus
};
