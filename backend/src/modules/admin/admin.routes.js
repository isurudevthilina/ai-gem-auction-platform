const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const controller = require('./admin.controller');

router.use(authenticate, requireRole('admin'));

router.get('/dashboard', controller.getDashboardData);
router.get('/stats', controller.getPlatformStats);
router.get('/activity', controller.getRecentActivity);

module.exports = router;
