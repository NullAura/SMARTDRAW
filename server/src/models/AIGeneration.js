const mongoose = require('mongoose');

const aiGenerationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    template: {
      type: String,
      enum: ['clothing', 'digital', 'food', 'beauty'],
      required: true
    },
    items: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
      validate: value => Array.isArray(value) && value.length <= 100
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIGeneration', aiGenerationSchema);
