const express = require('express');
const router = express.Router();
const Work = require('../models/Work');
const { auth, isDesigner } = require('../middleware/auth');

// 创建作品
router.post('/', auth, isDesigner, async (req, res) => {
  try {
    const work = new Work({
      ...req.body,
      designer: req.user._id
    });
    await work.save();
    res.status(201).json(work);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 获取作品列表
router.get('/', async (req, res) => {
  try {
    const { category, status, designer, tag } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (designer) query.designer = designer;
    if (tag) query.tags = tag;

    const works = await Work.find(query)
      .populate('designer', 'username')
      .sort({ createdAt: -1 });

    res.json(works);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 获取单个作品
router.get('/:id', async (req, res) => {
  try {
    const work = await Work.findById(req.params.id)
      .populate('designer', 'username')
      .populate('comments.user', 'username');
    
    if (!work) {
      return res.status(404).json({ message: '作品不存在' });
    }

    // 增加浏览量
    work.views += 1;
    await work.save();

    res.json(work);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 更新作品
router.patch('/:id', auth, isDesigner, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'description', 'category', 'coverImage', 'files', 'status', 'tags'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: '无效的更新字段' });
  }

  try {
    const work = await Work.findById(req.params.id);
    if (!work) {
      return res.status(404).json({ message: '作品不存在' });
    }

    // 检查权限
    if (work.designer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '没有权限更新此作品' });
    }

    updates.forEach(update => work[update] = req.body[update]);
    await work.save();

    res.json(work);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除作品
router.delete('/:id', auth, isDesigner, async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    if (!work) {
      return res.status(404).json({ message: '作品不存在' });
    }

    // 检查权限
    if (work.designer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '没有权限删除此作品' });
    }

    await work.remove();
    res.json({ message: '作品已删除' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 点赞作品
router.post('/:id/like', auth, async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    if (!work) {
      return res.status(404).json({ message: '作品不存在' });
    }

    const isLiked = work.likes.includes(req.user._id);
    if (isLiked) {
      work.likes = work.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      work.likes.push(req.user._id);
    }

    await work.save();
    res.json({ message: isLiked ? '取消点赞成功' : '点赞成功' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 评论作品
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    if (!work) {
      return res.status(404).json({ message: '作品不存在' });
    }

    work.comments.push({
      user: req.user._id,
      content: req.body.content
    });

    await work.save();
    res.status(201).json(work);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 