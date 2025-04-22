const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
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
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'merchant', 'admin'],
    default: 'user'
  },
  // 商家相关字段
  storeName: {
    type: String,
    required: function() {
      return this.role === 'merchant';
    }
  },
  phone: {
    type: String,
    required: function() {
      return this.role === 'merchant';
    }
  },
  address: {
    type: String,
    required: function() {
      return this.role === 'merchant';
    }
  },
  businessLicense: {
    type: String,
    required: function() {
      return this.role === 'merchant';
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
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

// 密码比较方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 