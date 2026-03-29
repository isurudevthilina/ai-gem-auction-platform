const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const ctrl = require('./reviews.controller');
const { createReviewSchema, updateReviewSchema } =
  require('./reviews.validation');

// Public routes (no auth) — static paths first
router.get('/seller/:sellerId', ctrl.getSellerReviews);
router.get('/seller/:sellerId/summary', ctrl.getSellerRatingSummary);

// Auth-protected — static paths before parameterised
router.post('/', authenticate, validate(createReviewSchema), ctrl.createReview);
router.get('/my-reviews', authenticate, ctrl.getMyReviews);
router.get('/check/:transactionId', authenticate, ctrl.checkCanReview);
router.patch('/:id', authenticate, validate(updateReviewSchema), ctrl.updateReview);
router.delete('/:id', authenticate, ctrl.deleteReview);

module.exports = router;
