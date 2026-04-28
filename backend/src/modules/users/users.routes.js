const express = require('express');
const multer  = require('multer');
const router  = express.Router();
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const controller = require('./users.controller');
const {
    updateProfileSchema,
    changeEmailSchema,
    requestEmailChangeOTPSchema,
    requestPasswordChangeOTPSchema,
    changePasswordSchema,
    deleteAccountSchema,
    adminUpdateUserSchema,
} = require('./users.validation');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

/* ── Authenticated user routes ── */
router.get('/me',          authenticate, controller.getProfile);
router.patch('/me',        authenticate, validate(updateProfileSchema), controller.updateProfile);
router.patch('/me/avatar', authenticate, upload.single('avatar'), controller.uploadAvatar);
router.post('/me/email/otp', authenticate, validate(requestEmailChangeOTPSchema), controller.requestEmailChangeOTP);
router.patch('/me/email',  authenticate, validate(changeEmailSchema), controller.changeEmail);
router.post('/me/password/otp', authenticate, validate(requestPasswordChangeOTPSchema), controller.requestPasswordChangeOTP);
router.patch('/me/password', authenticate, validate(changePasswordSchema), controller.changePassword);
router.delete('/me',       authenticate, validate(deleteAccountSchema), controller.deleteAccount);

/* ── Public routes (before parameterised admin routes) ── */
router.get('/search/sellers', controller.searchSellers);
router.get('/:id/public',    controller.getPublicProfile);

/* ── Admin routes ── */
router.get('/admin/stats',  authenticate, requireRole('admin'), controller.getUserStats);
router.get('/admin/all',    authenticate, requireRole('admin'), controller.adminGetAllUsers);
router.get('/admin/:id',    authenticate, requireRole('admin'), controller.adminGetUserById);
router.patch('/admin/:id',  authenticate, requireRole('admin'), validate(adminUpdateUserSchema), controller.adminUpdateUser);
router.delete('/admin/:id', authenticate, requireRole('admin'), controller.adminDeactivateUser);

module.exports = router;
