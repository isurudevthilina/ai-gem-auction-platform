import { useState } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { useCheckCanReview, useGetMyReviews } from '../hooks/useReviews';
import ReviewForm from '../components/ReviewForm';

const C = {
  bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
  green: '#16a34a', red: '#B91C1C',
  text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF   = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const WriteReviewPage = () => {
  const [searchParams] = useSearchParams();
  const { reviewId } = useParams();
  const navigate = useNavigate();

  const transactionId = searchParams.get('transactionId');
  const isEdit = !!reviewId;

  const [showSuccess, setShowSuccess] = useState(false);
  const [sellerId, setSellerId] = useState(null);

  const canReviewQuery = useCheckCanReview(isEdit ? null : transactionId);
  const canReviewData = canReviewQuery.data;

  const { data: myReviews, isLoading: myReviewsLoading } = useGetMyReviews();
  const existingReview = isEdit && myReviews
    ? myReviews.find(r => r.id === reviewId)
    : null;

  const handleSuccess = () => {
    if (isEdit && existingReview) {
      setSellerId(existingReview.seller_id);
    } else if (canReviewData) {
      // Try to extract seller_id from transaction context
    }
    setShowSuccess(true);
  };

  // Skeleton
  const skeleton = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 20, borderRadius: 8, background: C.border, opacity: 0.5 }} />
      ))}
    </div>
  );

  // Success state
  if (showSuccess) {
    const reviewSellerId = sellerId || existingReview?.seller_id;
    return (
      <div style={{ background: C.bg, minHeight: '100vh', padding: '32px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', padding: '48px 0' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke={C.green} strokeWidth="2" fill="rgba(22,163,74,0.1)" />
            <path d="M8 12l3 3 5-5" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontFamily: SERIF, fontSize: '1.8rem', color: C.sapphire, marginTop: 16 }}>
            Review Published!
          </div>
          <div style={{ fontFamily: SERIF, fontSize: '1.1rem', color: C.muted, marginTop: 8 }}>
            Thank you for helping the community.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
            {reviewSellerId && (
              <button
                onClick={() => navigate(`/sellers/${reviewSellerId}/reviews`)}
                style={{
                  padding: '12px 24px', borderRadius: 10, border: 'none',
                  background: C.gold, color: '#fff', fontFamily: BODY,
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                }}
              >
                See All Reviews
              </button>
            )}
            <button
              onClick={() => navigate('/transactions')}
              style={{
                padding: '12px 24px', borderRadius: 10,
                border: `1px solid ${C.border}`, background: 'transparent',
                color: C.sapphire, fontFamily: BODY,
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Back to Purchases
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Back link */}
        <Link
          to="/transactions"
          style={{ fontFamily: BODY, fontSize: '0.8rem', color: C.muted, textDecoration: 'none', display: 'block', marginBottom: 24 }}
        >
          ← Back to Purchase Requests
        </Link>

        {/* Page heading */}
        <h1 style={{ fontFamily: DISPLAY, fontSize: '1.5rem', color: C.sapphire, margin: '0 0 24px' }}>
          {isEdit ? 'Edit Your Review' : 'Write a Review'}
        </h1>

        {/* NEW REVIEW MODE */}
        {!isEdit && (
          <>
            {canReviewQuery.isLoading && skeleton}

            {canReviewData && canReviewData.canReview === false && (
              <div style={{
                border: `0.5px solid ${C.border}`, borderRadius: 16,
                padding: 32, background: C.white,
              }}>
                {canReviewData.reason === 'Transaction not yet completed' && (
                  <>
                    <div style={{ fontFamily: DISPLAY, fontSize: '1.1rem', color: C.sapphire, marginBottom: 8 }}>
                      Transaction Not Yet Complete
                    </div>
                    <p style={{ fontFamily: BODY, fontSize: '0.88rem', color: C.muted, lineHeight: 1.6, margin: '0 0 16px' }}>
                      You can leave a review once the transaction is marked as completed by both parties.
                    </p>
                    <button
                      onClick={() => navigate(`/transactions/${transactionId}`)}
                      style={{
                        padding: '10px 20px', borderRadius: 10, border: 'none',
                        background: C.sapphire, color: '#fff', fontFamily: BODY,
                        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      View Transaction
                    </button>
                  </>
                )}
                {canReviewData.reason === 'Already reviewed' && (
                  <>
                    <div style={{ fontFamily: DISPLAY, fontSize: '1.1rem', color: C.sapphire, marginBottom: 8 }}>
                      Already Reviewed
                    </div>
                    <p style={{ fontFamily: BODY, fontSize: '0.88rem', color: C.muted, lineHeight: 1.6, margin: '0 0 16px' }}>
                      You have already submitted a review for this purchase.
                    </p>
                    {canReviewData.existingReviewId && (
                      <button
                        onClick={() => navigate(`/reviews/${canReviewData.existingReviewId}/edit`)}
                        style={{
                          padding: '10px 20px', borderRadius: 10, border: 'none',
                          background: C.gold, color: '#fff', fontFamily: BODY,
                          fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        Edit Review
                      </button>
                    )}
                  </>
                )}
                {canReviewData.reason !== 'Transaction not yet completed' &&
                 canReviewData.reason !== 'Already reviewed' && (
                  <>
                    <div style={{ fontFamily: DISPLAY, fontSize: '1.1rem', color: C.sapphire, marginBottom: 8 }}>
                      Cannot Review
                    </div>
                    <p style={{ fontFamily: BODY, fontSize: '0.88rem', color: C.muted, lineHeight: 1.6, margin: 0 }}>
                      {canReviewData.reason}
                    </p>
                  </>
                )}
              </div>
            )}

            {canReviewData && canReviewData.canReview === true && (
              <ReviewForm
                transactionId={transactionId}
                onSuccess={handleSuccess}
              />
            )}
          </>
        )}

        {/* EDIT MODE */}
        {isEdit && (
          <>
            {myReviewsLoading && skeleton}

            {!myReviewsLoading && !existingReview && (
              <div style={{
                border: `0.5px solid ${C.border}`, borderRadius: 16,
                padding: 32, background: C.white,
              }}>
                <div style={{ fontFamily: DISPLAY, fontSize: '1.1rem', color: C.sapphire, marginBottom: 8 }}>
                  Review Not Found
                </div>
                <p style={{ fontFamily: BODY, fontSize: '0.88rem', color: C.muted, margin: 0 }}>
                  This review could not be found or does not belong to you.
                </p>
              </div>
            )}

            {existingReview && (
              <ReviewForm
                transactionId={existingReview.transaction_id}
                existingReview={existingReview}
                gemTitle={existingReview.transaction?.gem?.title}
                sellerName=""
                transactionDate={existingReview.created_at}
                transactionAmount={existingReview.transaction?.amount}
                gemThumbnail={
                  (existingReview.transaction?.gem?.images || [])
                    .find(i => typeof i === 'string' && !i.startsWith('model:'))
                }
                onSuccess={handleSuccess}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WriteReviewPage;
