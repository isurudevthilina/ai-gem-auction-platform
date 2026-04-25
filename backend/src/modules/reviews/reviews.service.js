const repository = require('./reviews.repository');
const { supabaseAdmin } = require('../../config/supabase');
const ApiError = require('../../utils/apiError');

const REVIEW_WINDOW_MONTHS = 3;
const MAX_REVIEW_EDITS = 3;
const MAX_REVIEW_MEDIA_ITEMS = 6;
const MAX_REVIEW_REPOSTS = 2;
const MAX_REVIEW_POST_SEQUENCE = MAX_REVIEW_REPOSTS + 1;

const getRemainingDeleteAttempts = (postCount, hasExistingReview) => {
  const count = Number(postCount || 0);
  const usedDeletes = hasExistingReview ? Math.max(0, count - 1) : count;
  return Math.max(0, MAX_REVIEW_REPOSTS - usedDeletes);
};

const isWithinReviewWindow = (createdAt) => {
  if (!createdAt) return false;
  const purchaseDate = new Date(createdAt);
  const deadline = new Date(purchaseDate);
  deadline.setMonth(deadline.getMonth() + REVIEW_WINDOW_MONTHS);
  return Date.now() <= deadline.getTime();
};

const createReview = async (reviewerId, data) => {
  if (Array.isArray(data.media_urls) && data.media_urls.length > MAX_REVIEW_MEDIA_ITEMS) {
    throw new ApiError(400, `A review can include up to ${MAX_REVIEW_MEDIA_ITEMS} media items.`);
  }

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

  if (!isWithinReviewWindow(txn.created_at))
    throw new ApiError(400, 'Review period expired. Reviews are allowed only within 3 months of purchase.');

  const postCount = await repository.getReviewPostCount(reviewerId, data.transaction_id);
  const remainingDeleteAttempts = getRemainingDeleteAttempts(postCount, false);
  if (remainingDeleteAttempts <= 0) {
    throw new ApiError(400, `Repost limit reached. You can delete and re-add a review up to ${MAX_REVIEW_REPOSTS} times.`);
  }

  const existing = await repository.findByTransaction(data.transaction_id);
  if (existing)
    throw new ApiError(409, 'You have already reviewed this transaction');

  if (txn.seller_id === reviewerId)
    throw new ApiError(400, 'You cannot review yourself');

  const { data: postSequence, error: seqErr } = await supabaseAdmin.rpc('next_review_post_sequence', {
    p_reviewer_id: reviewerId,
    p_transaction_id: data.transaction_id,
  });
  if (seqErr) {
    const seqMessage = String(seqErr.message || '');
    if (seqMessage.includes('REVIEW_REPOST_LIMIT_REACHED')) {
      throw new ApiError(400, `Repost limit reached. You can delete and re-add a review up to ${MAX_REVIEW_REPOSTS} times.`);
    }
    throw new ApiError(500, 'Failed to track review post sequence', seqErr.message);
  }

  const review = await repository.create({
    reviewer_id: reviewerId,
    seller_id: txn.seller_id,
    transaction_id: data.transaction_id,
    rating: data.rating,
    comment: data.comment,
    media_urls: data.media_urls || [],
    post_sequence: Number(postSequence || 1),
  });

  supabaseAdmin
    .from('notifications')
    .insert({
      user_id: txn.seller_id,
      type: 'new_review',
      title: 'New Review Received',
      message: `A buyer left you a ${data.rating}-star review`,
      data: {
        review_id: review.id,
        rating: data.rating,
        seller_id: txn.seller_id,
        transaction_id: data.transaction_id,
      },
    })
    .then(() => {})
    .catch(() => {});

  return review;
};

const getReviewMediaUploadUrl = async (userId, ext, mediaType) => {
  // CHANGE: sanitize extension to avoid unsafe characters in storage path.
  const safeExt = String(ext || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);

  const allowedByType = {
    image: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    video: ['mp4', 'webm', 'mov'],
  };

  // CHANGE: enforce media-type specific extension whitelist.
  if (!allowedByType[mediaType]?.includes(safeExt)) {
    throw new ApiError(400, 'Unsupported media extension');
  }

  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  // CHANGE: auto-recover if the review-media bucket is missing.
  // This prevents "Internal server error" on upload when the bucket was not created yet.
  try {
    const upload = await repository.createSignedUploadUrl('review-media', path);
    return { path: upload.path, token: upload.token };
  } catch (err) {
    const details = String(err?.details || err?.message || '');
    const missingBucket = /bucket|not found|does not exist|storage/i.test(details);

    if (!missingBucket) {
      throw err;
    }

    const { error: createErr } = await supabaseAdmin.storage.createBucket('review-media', {
      public: true,
      allowedMimeTypes: [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/webm', 'video/quicktime',
      ],
      fileSizeLimit: 52428800,
    });

    if (createErr && !/already exists/i.test(createErr.message || '')) {
      throw new ApiError(500, 'Failed to initialize review media storage', createErr.message);
    }

    const upload = await repository.createSignedUploadUrl('review-media', path);
    return { path: upload.path, token: upload.token };
  }
};

const updateReview = async (reviewerId, reviewId, data) => {
  const review = await repository.findById(reviewId);

  if (review.reviewer_id !== reviewerId)
    throw new ApiError(403, 'You can only edit your own reviews');

  const editCount = Number(review.edit_count || 0);
  if (editCount >= MAX_REVIEW_EDITS) {
    throw new ApiError(400, `Edit limit reached. A review can be edited up to ${MAX_REVIEW_EDITS} times.`);
  }

  if (Array.isArray(data.media_urls) && data.media_urls.length > MAX_REVIEW_MEDIA_ITEMS) {
    throw new ApiError(400, `A review can include up to ${MAX_REVIEW_MEDIA_ITEMS} media items.`);
  }

  return await repository.update(reviewId, reviewerId, {
    ...data,
    edit_count: editCount + 1,
  });
};

const deleteReview = async (userId, reviewId, isAdmin) => {
  const review = await repository.findById(reviewId);

  if (!isAdmin && review.reviewer_id !== userId)
    throw new ApiError(403, 'You can only delete your own reviews');

  if (!isAdmin) {
    const postCount = await repository.getReviewPostCount(review.reviewer_id, review.transaction_id);
    const remainingDeleteAttempts = getRemainingDeleteAttempts(postCount, true);
    if (remainingDeleteAttempts <= 0) {
      throw new ApiError(400, `Delete limit reached. You can delete and re-add a review only ${MAX_REVIEW_REPOSTS} times.`);
    }
  }

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

  if (!isWithinReviewWindow(txn.created_at))
    return { canReview: false, reason: 'Review period expired (more than 3 months since purchase)' };

  const existing = await repository.findByTransaction(transactionId);
  const postCount = await repository.getReviewPostCount(buyerId, transactionId);
  const remainingDeleteAttempts = getRemainingDeleteAttempts(postCount, !!existing);

  if (existing)
    return {
      canReview: false,
      reason: 'Already reviewed',
      existingReviewId: existing.id,
      remainingDeleteAttempts,
      maxDeleteAttempts: MAX_REVIEW_REPOSTS,
    };

  if (remainingDeleteAttempts <= 0) {
    return {
      canReview: false,
      reason: `Repost limit reached. You can delete and re-add a review up to ${MAX_REVIEW_REPOSTS} times.`,
      remainingDeleteAttempts: 0,
      maxDeleteAttempts: MAX_REVIEW_REPOSTS,
    };
  }

  return {
    canReview: true,
    remainingDeleteAttempts,
    maxDeleteAttempts: MAX_REVIEW_REPOSTS,
  };
};

const reportReview = async (sellerId, reviewId, reason) => {
  const review = await repository.findById(reviewId);

  if (review.seller_id !== sellerId) {
    throw new ApiError(403, 'Only the reviewed seller can report this review');
  }

  const existingOpen = await repository.findOpenReportByReviewAndReporter(reviewId, sellerId);
  if (existingOpen) {
    throw new ApiError(409, 'You already have an open report for this review');
  }

  const report = await repository.createReport({
    review_id: review.id,
    reporter_id: sellerId,
    reviewer_id: review.reviewer_id,
    seller_id: review.seller_id,
    reason,
    status: 'open',
    review_comment_snapshot: review.comment || '',
    review_rating_snapshot: review.rating,
  });

  try {
    const adminIds = await repository.findAdminIds();
    if (adminIds.length > 0) {
      await repository.createNotifications(
        adminIds.map((adminId) => ({
          user_id: adminId,
          type: 'review_reported',
          title: 'Review Reported by Seller',
          message: 'A seller has reported a review for moderation.',
          data: { report_id: report.id, review_id: review.id, seller_id: review.seller_id, reviewer_id: review.reviewer_id },
        }))
      );
    }
  } catch {
    // Do not block report creation if notifications fail
  }

  return report;
};

const getReviewReports = async (filters) => {
  return repository.findReports(filters);
};

const getMyReviewReports = async (userId, filters) => {
  return repository.findReportsByReporter(userId, filters);
};

const resolveReviewReport = async (adminId, reportId, payload) => {
  const report = await repository.findReportById(reportId);
  if (report.status !== 'open') {
    throw new ApiError(400, 'This report has already been resolved');
  }

  if (payload.action === 'removed_and_warned' && report.review_id) {
    await deleteReview(adminId, report.review_id, true);

    const warningMessage = payload.warning_message
      || 'Your review was removed because it violated community guidelines. Please keep feedback respectful and appropriate.';

    await repository.createNotifications([
      {
        user_id: report.reviewer_id,
        type: 'admin_warning',
        title: 'Review Removed by Admin',
        message: warningMessage,
        data: { report_id: report.id, review_id: report.review_id, action: 'removed_and_warned' },
      },
    ]);
  }

  const resolved = await repository.resolveReport(reportId, {
    status: 'resolved',
    action_taken: payload.action,
    admin_note: payload.admin_note || null,
    resolved_by: adminId,
    resolved_at: new Date().toISOString(),
  });

  try {
    await repository.createNotifications([
      {
        user_id: report.reporter_id,
        type: 'review_reported',
        title: 'Review Report Resolved',
        message:
          payload.action === 'removed_and_warned'
            ? 'Admin removed the reported review and warned the reviewer.'
            : 'Admin reviewed the report and dismissed it.',
        data: { report_id: report.id, action: payload.action },
      },
    ]);
  } catch {
    // Keep moderation action successful even if follow-up notification fails
  }

  return resolved;
};

module.exports = {
  getReviewMediaUploadUrl,
  createReview, updateReview, deleteReview,
  getSellerReviews, getSellerRating, getMyReviews, checkCanReview,
  reportReview, getReviewReports, getMyReviewReports, resolveReviewReport,
};
