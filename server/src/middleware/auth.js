const User = require('../models/User');
const { verifyToken } = require('../utils/token');

const auth = async (req, res, next) => {
  try {
    const authorization = req.get('Authorization') || '';
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return res.status(401).json({ success: false, message: '请先登录' });
    }

    const decoded = verifyToken(match[1]);
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ success: false, message: '登录状态已失效' });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: '登录状态已失效' });
  }
};

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: '没有执行此操作的权限' });
    }
    return next();
  };
}

const isDesigner = requireRole('designer', 'admin');
const isMerchant = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  if (req.user?.role === 'merchant' && req.user.status === 'approved') return next();
  return res.status(403).json({ success: false, message: '商家账号尚未通过审核' });
};

module.exports = { auth, isDesigner, isMerchant, requireRole };
