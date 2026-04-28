const express = require('express');
const router = express.Router();
const validate = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { registerSchema, loginSchema, resendVerificationSchema, refreshSchema, forgotPasswordSchema, verifyOTPSchema, resetPasswordSchema, verifyEmailSchema } = require('./auth.validation');
const controller = require('./auth.controller');

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/logout', controller.logout);
router.get('/me', authenticate, controller.me);
router.post('/refresh', validate(refreshSchema), controller.refresh);
router.post('/resend-verification', validate(resendVerificationSchema), controller.resendVerification);
router.post('/verify-email', validate(verifyEmailSchema), controller.verifyEmail);
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/verify-otp', validate(verifyOTPSchema), controller.verifyOTP);
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);

module.exports = router;
