const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'merchant', 'designer', 'admin'],
      default: 'user'
    },
    storeName: {
      type: String,
      trim: true,
      maxlength: 100,
      required() {
        return this.role === 'merchant';
      }
    },
    phone: {
      type: String,
      trim: true,
      required() {
        return this.role === 'merchant';
      }
    },
    address: {
      type: String,
      trim: true,
      maxlength: 300,
      required() {
        return this.role === 'merchant';
      }
    },
    businessLicense: {
      type: String,
      trim: true,
      maxlength: 100,
      required() {
        return this.role === 'merchant';
      }
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default() {
        return this.role === 'merchant' ? 'pending' : 'approved';
      }
    },
    description: { type: String, trim: true, maxlength: 500 },
    portfolio: [{ type: String, maxlength: 500 }],
    skills: [{ type: String, trim: true, maxlength: 50 }],
    works: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Work' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  {
    timestamps: true,
    toJSON: {
      transform(_document, result) {
        delete result.password;
        delete result.__v;
        return result;
      }
    }
  }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
