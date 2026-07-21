const mongoose = require('mongoose');

const workSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    category: {
      type: String,
      required: true,
      enum: ['UI设计', '平面设计', '插画设计', '动画设计', '其他']
    },
    designer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    coverImage: { type: String, required: true, maxlength: 1000 },
    files: [{ type: String, required: true, maxlength: 1000 }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    views: { type: Number, default: 0, min: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true, trim: true, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    tags: [{ type: String, trim: true, maxlength: 30 }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Work', workSchema);
