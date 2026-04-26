const catchAsync = require('../../utils/catchAsync');
const apiResponse = require('../../utils/apiResponse');
const service = require('./reviews.service');
const ApiError = require('../../utils/apiError');

const UUID_V4_LIKE_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const assertUuid = (value, fieldName) => {
  if (!UUID_V4_LIKE_REGEX.test(String(value || ''))) {
    throw new ApiError(400, `Invalid ${fieldName}.`);
  }
};

const createReview = catchAsync(async (req, res) => {
  const review = await service.createReview(req.user.id, req.body);
  apiResponse(res, 201, review, 'Review submitted.');
});

const getReviewMediaUploadUrl = catchAsync(async (req, res) => {
  // CHANGE: reviews validate middleware stores parsed data on req.body, not req.validated.
  // This fixes a runtime TypeError that caused 500 responses on /api/reviews/upload-url.
  const result = await service.getReviewMediaUploadUrl(
    req.user.id,
    req.body.ext,
    req.body.media_type
  );
  apiResponse(res, 200, result, 'Review media upload URL generated.');
});

const getSellerReviews = catchAsync(async (req, res) => {
  assertUuid(req.params.sellerId, 'seller id');
  const filters = {
    rating: req.query.rating ? parseInt(req.query.rating) : undefined,
    sort: req.query.sort || 'newest',
    page: parseInt(req.query.page) || 0,
    limit: parseInt(req.query.limit) || 10,
  };
  const result = await service.getSellerReviews(req.params.sellerId, filters);
  apiResponse(res, 200, result, 'Reviews retrieved.');
});

const getSellerRatingSummary = catchAsync(async (req, res) => {
  assertUuid(req.params.sellerId, 'seller id');
  const rating = await service.getSellerRating(req.params.sellerId);
  apiResponse(res, 200, rating, 'Rating summary retrieved.');
});

const getMyReviews = catchAsync(async (req, res) => {
  const reviews = await service.getMyReviews(req.user.id);
  apiResponse(res, 200, reviews, 'Your reviews retrieved.');
});

const checkCanReview = catchAsync(async (req, res) => {
  assertUuid(req.params.transactionId, 'transaction id');
  const result = await service.checkCanReview(
    req.user.id, req.params.transactionId);
  apiResponse(res, 200, result, 'Check complete.');
});

const updateReview = catchAsync(async (req, res) => {
  assertUuid(req.params.id, 'review id');
  const review = await service.updateReview(
    req.user.id, req.params.id, req.body);
  apiResponse(res, 200, review, 'Review updated.');
});

const deleteReview = catchAsync(async (req, res) => {
  assertUuid(req.params.id, 'review id');
  const isAdmin = req.user.role === 'admin';
  await service.deleteReview(req.user.id, req.params.id, isAdmin);
  apiResponse(res, 200, { deleted: true }, 'Review deleted.');
});

const reportReview = catchAsync(async (req, res) => {
  assertUuid(req.params.id, 'review id');
  const report = await service.reportReview(req.user.id, req.params.id, req.body.reason);
  apiResponse(res, 201, report, 'Review reported to admin.');
});

const getReviewReports = catchAsync(async (req, res) => {
  const result = await service.getReviewReports({
    status: req.query.status,
    page: parseInt(req.query.page) || 0,
    limit: parseInt(req.query.limit) || 20,
  });
  apiResponse(res, 200, result, 'Review reports retrieved.');
});

const getMyReviewReports = catchAsync(async (req, res) => {
  const result = await service.getMyReviewReports(req.user.id, {
    status: req.query.status,
    page: parseInt(req.query.page) || 0,
    limit: parseInt(req.query.limit) || 20,
  });
  apiResponse(res, 200, result, 'Your review reports retrieved.');
});

const resolveReviewReport = catchAsync(async (req, res) => {
  assertUuid(req.params.reportId, 'report id');
  const result = await service.resolveReviewReport(req.user.id, req.params.reportId, req.body);
  apiResponse(res, 200, result, 'Review report resolved.');
});

module.exports = {
  createReview, getReviewMediaUploadUrl, getSellerReviews, getSellerRatingSummary,
  getMyReviews, checkCanReview, updateReview, deleteReview,
  reportReview, getReviewReports, getMyReviewReports, resolveReviewReport,
};
