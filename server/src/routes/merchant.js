const express = require('express');
const { auth, isMerchant, requireRole } = require('../middleware/auth');
const merchantController = require('../controllers/merchantController');

const router = express.Router();

router.post('/login', merchantController.login);
router.post('/register', merchantController.register);
router.get('/me', auth, isMerchant, merchantController.getCurrent);
router.post('/logout', auth, isMerchant, merchantController.logout);
router.patch('/:id/status', auth, requireRole('admin'), merchantController.updateStatus);
router.post('/ai/generate', auth, isMerchant, merchantController.generateAi);
router.post('/ai/save', auth, isMerchant, merchantController.saveAiWork);
router.get('/ai/works', auth, isMerchant, merchantController.listAiWorks);

module.exports = router;
