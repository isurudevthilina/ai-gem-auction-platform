const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const controller = require('./notifications.controller');
const { markReadSchema } = require('./notifications.validation');

// All routes require authentication (any role)
router.get('/',              authenticate, controller.getNotifications);
router.get('/unread-count',  authenticate, controller.getUnreadCount);
router.get('/recent',        authenticate, controller.getRecent);
router.patch('/mark-read',   authenticate, validate(markReadSchema), controller.markAsRead);
router.patch('/mark-all-read', authenticate, controller.markAllAsRead);

// DELETE /read MUST come BEFORE /:id to avoid route conflict
router.delete('/read',       authenticate, controller.deleteAllRead);
router.delete('/:id',        authenticate, controller.deleteOne);

module.exports = router;
