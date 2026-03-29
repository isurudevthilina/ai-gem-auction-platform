import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import StarRating from './StarRating';
import { useCreateReview, useUpdateReview } from '../hooks/useReviews';
import { useCurrency } from '../../../context/CurrencyContext';

const C = {
  bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
  goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
  text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF   = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const newReviewSchema = z.object({
  rating: z.number().int().min(1, 'Please select a rating').max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters')
    .max(1000).trim().optional().or(z.literal('')),
});

const sentimentMap = {
  0: '', 1: 'Poor — Very disappointed', 2: 'Fair — Below expectations',
  3: 'Good — Met expectations', 4: 'Very Good — Exceeded expectations',
  5: 'Excellent — Outstanding experience',
};
const sentimentColor = (r) => {
  if (r <= 2) return 'rgba(185,28,28,0.6)';
  if (r === 3) return '#d97706';
  return C.green;
};

const labelStyle = {
  fontFamily: DISPLAY, fontSize: '0.68rem', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.1em', color: C.faint,
  marginBottom: 8, display: 'block',
};

const tips = [
  'Describe if the gem matched the listing photos',
  'Comment on seller communication',
  'Mention packaging and delivery experience',
  'Note if gem matched the certification provided',
];

const ReviewForm = ({
  transactionId,
  existingReview = null,
  gemTitle = '',
  sellerName = '',
  transactionDate = '',
  transactionAmount = 0,
  gemThumbnail = null,
  onSuccess,
}) => {
  const isEdit = !!existingReview;
  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();
  const mutation = isEdit ? updateMutation : createMutation;

  const { formatPrice } = useCurrency();
  const [commentFocused, setCommentFocused] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const daysSinceCreated = existingReview
    ? Math.floor((Date.now() - new Date(existingReview.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const canStillEdit = !existingReview || daysSinceCreated < 7;
  const daysRemaining = 7 - daysSinceCreated;

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(newReviewSchema),
    defaultValues: existingReview
      ? { rating: existingReview.rating, comment: existingReview.comment || '' }
      : { rating: 0, comment: '' },
  });

  const ratingValue = watch('rating');
  const commentValue = watch('comment') || '';

  if (isEdit && !canStillEdit) {
    return (
      <div style={{
        background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.3)',
        borderRadius: 10, padding: '16px 20px',
      }}>
        <span style={{ fontFamily: BODY, fontSize: '0.82rem', color: '#d97706' }}>
          This review can no longer be edited — the 7-day window has passed.
        </span>
      </div>
    );
  }

  const onSubmit = (data) => {
    const payload = isEdit
      ? { id: existingReview.id, rating: data.rating, comment: data.comment || undefined }
      : { transaction_id: transactionId, rating: data.rating, comment: data.comment || undefined };

    mutation.mutate(payload, {
      onSuccess: () => onSuccess?.(),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Gem preview card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: C.bg, borderRadius: 12, border: `0.5px solid ${C.border}`,
        padding: '12px 16px', width: '100%', boxSizing: 'border-box',
      }}>
        {gemThumbnail ? (
          <img src={gemThumbnail} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#1A1A2E', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SERIF, fontSize: '0.95rem', fontWeight: 600, color: C.text }}>
            {gemTitle || 'Gem Purchase'}
          </div>
          {sellerName && (
            <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted }}>
              Reviewing purchase from {sellerName}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {transactionAmount > 0 && (
            <div style={{ fontFamily: SERIF, fontSize: '1rem', fontWeight: 700, color: C.sapphire }}>
              {formatPrice(transactionAmount)}
            </div>
          )}
          {transactionDate && (
            <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint }}>
              {new Date(transactionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      {/* Edit mode banner */}
      {isEdit && canStillEdit && (
        <div style={{
          background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.3)',
          borderRadius: 10, padding: '12px 16px',
        }}>
          <span style={{ fontFamily: BODY, fontSize: '0.82rem', color: '#d97706' }}>
            Reviews can only be edited within 7 days of posting. {daysRemaining} day(s) remaining.
          </span>
        </div>
      )}

      {/* Rating section */}
      <div>
        <label style={labelStyle}>Your Rating</label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <StarRating
              value={field.value}
              onChange={field.onChange}
              size="lg"
              precision="full"
            />
          )}
        />
        {ratingValue > 0 && (
          <div style={{
            fontFamily: SERIF, fontSize: '0.8rem', fontStyle: 'italic',
            color: sentimentColor(ratingValue), marginTop: 6,
          }}>
            {sentimentMap[ratingValue]}
          </div>
        )}
        {errors.rating && (
          <div style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.red, marginTop: 4 }}>
            {errors.rating.message}
          </div>
        )}
      </div>

      {/* Comment section */}
      <div>
        <label style={labelStyle}>Your Review</label>
        <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.muted, marginBottom: 8 }}>
          Optional but helpful for other buyers
        </div>
        <Controller
          name="comment"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              onFocus={() => setCommentFocused(true)}
              onBlur={(e) => { setCommentFocused(false); field.onBlur(e); }}
              placeholder="Describe your experience with this seller. Was the gem as described? How was communication and delivery?"
              style={{
                minHeight: 120, width: '100%', boxSizing: 'border-box',
                padding: '12px 14px', borderRadius: 10,
                border: '1px solid', borderColor: commentFocused ? C.sapphire : C.border,
                background: C.bg, fontFamily: SERIF, fontSize: '0.95rem',
                color: C.text, resize: 'vertical', outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          )}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <div>
            {errors.comment && (
              <span style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.red }}>
                {errors.comment.message}
              </span>
            )}
          </div>
          <span style={{
            fontFamily: BODY, fontSize: '0.72rem',
            color: commentValue.length > 900 ? C.red : C.faint,
          }}>
            {commentValue.length} / 1000
          </span>
        </div>
      </div>

      {/* Review tips */}
      <div>
        <span
          onClick={() => setShowTips(!showTips)}
          style={{
            fontFamily: BODY, fontSize: '0.78rem', color: C.gold,
            cursor: 'pointer', userSelect: 'none',
          }}
        >
          {showTips ? 'Hide tips' : 'Tips for a helpful review'}
        </span>
        {showTips && (
          <ul style={{
            margin: '8px 0 0', paddingLeft: 20,
            opacity: 1, transform: 'translateY(0)',
            transition: 'opacity 0.2s, transform 0.2s',
          }}>
            {tips.map((t, i) => (
              <li key={i} style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted, lineHeight: 1.8 }}>
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          type="submit"
          disabled={mutation.isPending}
          style={{
            padding: '12px 28px', borderRadius: 10, border: 'none',
            background: C.gold, color: '#fff', fontFamily: BODY,
            fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
            opacity: mutation.isPending ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {mutation.isPending && (
            <span style={{ display: 'inline-block', animation: 'reviewSpin 0.8s linear infinite', marginRight: 6 }}>&#9676;</span>
          )}
          {isEdit ? 'Update Review' : 'Submit Review'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={() => window.history.back()}
            style={{
              padding: '12px 28px', borderRadius: 10,
              border: `1px solid ${C.border}`, background: 'transparent',
              color: C.muted, fontFamily: BODY, fontSize: '0.88rem',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {mutation.error && (
        <div style={{
          background: 'rgba(185,28,28,0.06)', borderLeft: `3px solid ${C.red}`,
          borderRadius: 6, padding: '10px 14px',
          fontFamily: BODY, fontSize: '0.82rem', color: C.red,
        }}>
          {mutation.error.message || 'Failed to submit review.'}
        </div>
      )}

      <style>{`@keyframes reviewSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  );
};

export default ReviewForm;
