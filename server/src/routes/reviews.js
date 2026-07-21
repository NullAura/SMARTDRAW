const express = require('express');
const Review = require('../models/Review');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res, next) => {
  const rating = Number(req.body?.rating);
  const content = typeof req.body?.review === 'string' ? req.body.review.trim() : '';
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !content || content.length > 1000) {
    return res.status(400).json({ success: false, message: '请提供 1–5 分及有效评价内容' });
  }
  try {
    const review = await Review.create({ user: req.user._id, rating, content });
    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    return next(error);
  }
});

router.get('/mine', auth, async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
    return res.json({ success: true, data: reviews });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
