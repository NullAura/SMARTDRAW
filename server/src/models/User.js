const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['user', 'designer'],
    default: 'user'
  },
  // 设计师特有字段
  description: {
    type: String,
    maxlength: 500
  },
  portfolio: [{
    type: String // 作品集文件路径
  }],
  skills: [{
    type: String
  }],
  works: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Work'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('开始验证密码');
  console.log('候选密码:', candidatePassword);
  console.log('存储的密码:', this.password);
  console.log('密码长度:', {
    candidate: candidatePassword.length,
    stored: this.password.length
  });
  console.log('密码类型:', {
    candidate: typeof candidatePassword,
    stored: typeof this.password
  });
  
  try {
    // 确保密码是字符串类型
    const candidate = String(candidatePassword);
    const stored = String(this.password);
    
    console.log('转换后的密码:', {
      candidate,
      stored
    });
    
    const isMatch = await bcrypt.compare(candidate, stored);
    console.log('密码验证结果:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('密码验证错误:', error);
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema); 