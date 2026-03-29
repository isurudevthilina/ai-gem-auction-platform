const repository = require('./reviews.repository');
const { supabaseAdmin } = require('../../config/supabase');
const ApiError = require('../../utils/apiError');

const createReview = async (reviewerId, data) => {
  const { data: txn, error: txnErr } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('id', data.transaction_id)
    .single();
  if (txnErr || !txn) throw new ApiError(404, 'Transaction not found');

  if (txn.buyer_id !== reviewerId)
    throw new ApiError(403, 'Only the buyer can review this transaction');

  if (txn.status !== 'completed')
    throw new ApiError(400, 'You can only review after the transaction is completed');

  const existing = await repository.findByTransaction(data.transaction_id);
  if (existing)
    throw new ApiError(409, 'You have already reviewed this transaction');

  if (txn.seller_id === reviewerId)
    throw new ApiError(400, 'You cannot review yourself');

  const review = await repository.create({
    reviewer_id: reviewerId,
    seller_id: txn.seller_id,
    transaction_id: data.transaction_id,
    rating: data.rating,
    comment: data.comment,
  });

  supabaseAdmin
    .from('notifications')
    .insert({
      user_id: txn.seller_id,
      type: 'new_bid',
      title: 'New Review Received',
      message: `A buyer left you a ${data.rating}-star review`,
      data: { review_id: review.id, rating: data.rating, seller_id: txn.seller_id },
    })
    .then(() => {})
    .catch(() => {});

  return review;
};

const updateReview = async (reviewerId, reviewId, data) => {
  const review = await repository.findById(reviewId);

  if (review.reviewer_id !== reviewerId)
    throw new ApiError(403, 'You can only edit your own reviews');

  if (new Date(review.created_at) < Date.now() - 7 * 24 * 60 * 60 * 1000)
    throw new ApiError(400, 'Reviews can only be edited within 7 days of posting');

  return await repository.update(reviewId, reviewerId, data);
};

const deleteReview = async (userId, reviewId, isAdmin) => {
  const review = await repository.findById(reviewId);

  if (!isAdmin && review.reviewer_id !== userId)
    throw new ApiError(403, 'You can only delete your own reviews');

  return await repository.delete(reviewId, userId, isAdmin);
};

const getSellerReviews = async (sellerId, filters) => {
  return await repository.findBySeller(sellerId, filters);
};

const getSellerRating = async (sellerId) => {
  const rating = await repository.getSellerRating(sellerId);
  if (!rating) {
    return {
      review_count: 0, avg_rating: 0,
      five_star: 0, four_star: 0, three_star: 0,
      two_star: 0, one_star: 0,
    };
  }
  return rating;
};

const getMyReviews = async (reviewerId) => {
  return await repository.findByReviewer(reviewerId);
};

const checkCanReview = async (buyerId, transactionId) => {
  const { data: txn } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single();
  if (!txn) return { canReview: false, reason: 'Transaction not found' };

  if (txn.buyer_id !== buyerId)
    return { canReview: false, reason: 'Not your transaction' };

  if (txn.status !== 'completed')
    return { canReview: false, reason: 'Transaction not yet completed' };

  const existing = await repository.findByTransaction(transactionId);
  if (existing)
    return { canReview: false, reason: 'Already reviewed', existingReviewId: existing.id };

  return { canReview: true };
};

module.exports = {
  createReview, updateReview, deleteReview,
  getSellerReviews, getSellerRating, getMyReviews, checkCanReview,
};
