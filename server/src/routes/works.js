const express = require('express');
const mongoose = require('mongoose');
const Work = require('../models/Work');
const { auth, isDesigner } = require('../middleware/auth');

const router = express.Router();
const WRITABLE_FIELDS = ['title', 'description', 'category', 'coverImage', 'files', 'status', 'tags'];

router.param('id', (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return res.status(400).json({ success: false, message: '作品 ID 格式无效' });
  }
  return next();
});

router.get('/mine', auth, isDesigner, async (req, res, next) => {
  try {
    const works = await Work.find({ designer: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: works });
  } catch (error) {
    return next(error);
  }
});

router.post('/', auth, isDesigner, async (req, res, next) => {
  try {
    const values = Object.fromEntries(
      WRITABLE_FIELDS.filter(field => field in (req.body || {})).map(field => [field, req.body[field]])
    );
    const work = await Work.create({ ...values, designer: req.user._id });
    return res.status(201).json({ success: true, data: work });
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const query = { status: 'published' };
    if (req.query.category) query.category = req.query.category;
    if (req.query.designer && mongoose.isObjectIdOrHexString(req.query.designer)) {
      query.designer = req.query.designer;
    }
    if (req.query.tag) query.tags = req.query.tag;

    const works = await Work.find(query)
      .populate('designer', 'username')
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json({ success: true, data: works });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const work = await Work.findOneAndUpdate(
      { _id: req.params.id, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('designer', 'username')
      .populate('comments.user', 'username');
    if (!work) return res.status(404).json({ success: false, message: '作品不存在' });
    return res.json({ success: true, data: work });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', auth, isDesigner, async (req, res, next) => {
  const updates = Object.keys(req.body || {});
  if (!updates.length || !updates.every(field => WRITABLE_FIELDS.includes(field))) {
    return res.status(400).json({ success: false, message: '包含无效的更新字段' });
  }
  try {
    const work = await Work.findById(req.params.id);
    if (!work) return res.status(404).json({ success: false, message: '作品不存在' });
    if (!work.designer.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '没有权限更新此作品' });
    }
    for (const field of updates) work[field] = req.body[field];
    await work.save();
    return res.json({ success: true, data: work });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', auth, isDesigner, async (req, res, next) => {
  try {
    const work = await Work.findById(req.params.id);
    if (!work) return res.status(404).json({ success: false, message: '作品不存在' });
    if (!work.designer.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '没有权限删除此作品' });
    }
    await work.deleteOne();
    return res.json({ success: true, message: '作品已删除' });
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/like', auth, async (req, res, next) => {
  try {
    const work = await Work.findOne({ _id: req.params.id, status: 'published' });
    if (!work) return res.status(404).json({ success: false, message: '作品不存在' });
    const isLiked = work.likes.some(id => id.equals(req.user._id));
    const operation = isLiked ? '$pull' : '$addToSet';
    await Work.updateOne({ _id: work._id }, { [operation]: { likes: req.user._id } });
    return res.json({ success: true, message: isLiked ? '已取消点赞' : '点赞成功' });
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/comments', auth, async (req, res, next) => {
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
  if (!content || content.length > 1000) {
    return res.status(400).json({ success: false, message: '评论需为 1–1000 个字符' });
  }
  try {
    const work = await Work.findOneAndUpdate(
      { _id: req.params.id, status: 'published' },
      { $push: { comments: { user: req.user._id, content } } },
      { new: true, runValidators: true }
    );
    if (!work) return res.status(404).json({ success: false, message: '作品不存在' });
    return res.status(201).json({ success: true, data: work });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
