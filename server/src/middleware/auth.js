const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: '请先登录' });
  }
};

const isDesigner = async (req, res, next) => {
  if (req.user.userType !== 'designer') {
    return res.status(403).json({ message: '需要设计师权限' });
  }
  next();
};

module.exports = { auth, isDesigner }; 