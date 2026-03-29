const catchAsync = require('../../utils/catchAsync');
const apiResponse = require('../../utils/apiResponse');
const service = require('./reviews.service');

const createReview = catchAsync(async (req, res) => {
  const review = await service.createReview(req.user.id, req.body);
  apiResponse(res, 201, review, 'Review submitted.');
});

const getSellerReviews = catchAsync(async (req, res) => {
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
  const rating = await service.getSellerRating(req.params.sellerId);
  apiResponse(res, 200, rating, 'Rating summary retrieved.');
});

const getMyReviews = catchAsync(async (req, res) => {
  const reviews = await service.getMyReviews(req.user.id);
  apiResponse(res, 200, reviews, 'Your reviews retrieved.');
});

const checkCanReview = catchAsync(async (req, res) => {
  const result = await service.checkCanReview(
    req.user.id, req.params.transactionId);
  apiResponse(res, 200, result, 'Check complete.');
});

const updateReview = catchAsync(async (req, res) => {
  const review = await service.updateReview(
    req.user.id, req.params.id, req.body);
  apiResponse(res, 200, review, 'Review updated.');
});

const deleteReview = catchAsync(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  await service.deleteReview(req.user.id, req.params.id, isAdmin);
  apiResponse(res, 200, { deleted: true }, 'Review deleted.');
});

module.exports = {
  createReview, getSellerReviews, getSellerRatingSummary,
  getMyReviews, checkCanReview, updateReview, deleteReview,
};
