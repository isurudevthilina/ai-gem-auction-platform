const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { blockToxicText } = require('../../middleware/toxicity.middleware');
const ctrl = require('./reviews.controller');
const {
  createReviewSchema,
  updateReviewSchema,
  getReviewMediaUploadUrlSchema,
  reportReviewSchema,
  resolveReviewReportSchema,
} =
  require('./reviews.validation');

// Public routes (no auth) — static paths first
router.get('/seller/:sellerId', ctrl.getSellerReviews);
router.get('/seller/:sellerId/summary', ctrl.getSellerRatingSummary);

// Auth-protected — static paths before parameterised
// Toxicity check blocks abusive review comments before data reaches the service layer.
router.post('/', authenticate, validate(createReviewSchema), blockToxicText({ field: 'comment' }), ctrl.createReview);
router.post('/upload-url', authenticate, validate(getReviewMediaUploadUrlSchema), ctrl.getReviewMediaUploadUrl);
router.get('/my-reviews', authenticate, ctrl.getMyReviews);
router.get('/my-reports', authenticate, ctrl.getMyReviewReports);
router.get('/check/:transactionId', authenticate, ctrl.checkCanReview);
router.post('/:id/report', authenticate, validate(reportReviewSchema), ctrl.reportReview);
router.get('/reports', authenticate, requireRole('admin'), ctrl.getReviewReports);
router.post('/reports/:reportId/resolve', authenticate, requireRole('admin'), validate(resolveReviewReportSchema), ctrl.resolveReviewReport);
// Apply the same toxicity rule on edits to keep moderation consistent.
router.patch('/:id', authenticate, validate(updateReviewSchema), blockToxicText({ field: 'comment' }), ctrl.updateReview);
router.delete('/:id', authenticate, ctrl.deleteReview);

module.exports = router;
