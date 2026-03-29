import { useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';

const C = {
  bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
  goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
  text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF   = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const ReviewCard = ({ review, currentUserId, isAdmin, onDelete }) => {
  const [showFull, setShowFull] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const reviewer = review.reviewer || {};
  const txn = review.transaction || {};
  const gem = txn.gem || {};
  const gemImages = gem.images || [];
  const gemThumb = gemImages.find(i => typeof i === 'string' && !i.startsWith('model:'));

  const isOwner = currentUserId && currentUserId === review.reviewer_id;
  const canDelete = isOwner || isAdmin;
  const daysSince = Math.floor((Date.now() - new Date(review.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const withinEditWindow = daysSince < 7;

  const initials = (reviewer.full_name || '?').charAt(0).toUpperCase();
  const dateStr = new Date(review.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const comment = review.comment || '';
  const isLong = comment.length > 200;

  return (
    <div style={{
      background: C.white, border: `0.5px solid ${C.border}`,
      borderRadius: 14, padding: '20px 24px', marginBottom: 14,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Left — reviewer info */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {reviewer.avatar_url ? (
            <img
              src={reviewer.avatar_url}
              alt=""
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: C.sapphire,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 14, color: '#fff', lineHeight: '40px' }}>
                {initials}
              </span>
            </div>
          )}
          <div>
            <div style={{ fontFamily: SERIF, fontSize: '0.95rem', color: C.sapphire, fontWeight: 600 }}>
              {reviewer.full_name || 'Anonymous'}
            </div>
            <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint }}>
              {dateStr}
            </div>
            {txn.amount && parseFloat(txn.amount) > 1000 && (
              <div style={{
                background: C.goldLight, color: C.gold, fontFamily: BODY,
                fontSize: '0.65rem', borderRadius: 4, padding: '1px 7px',
                marginTop: 3, display: 'inline-block',
              }}>
                Verified Purchase
              </div>
            )}
          </div>
        </div>

        {/* Right — star rating */}
        <div style={{ textAlign: 'right' }}>
          <StarRating readOnly size="md" precision="full" value={review.rating} />
          <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint, marginTop: 4 }}>
            {review.rating}.0 / 5.0
          </div>
        </div>
      </div>

      {/* Gem context */}
      {gem.title && (
        <div style={{
          marginTop: 12, marginBottom: 12, background: C.bg,
          borderRadius: 8, padding: '8px 12px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {gemThumb ? (
            <img src={gemThumb} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: 6, background: '#1A1A2E' }} />
          )}
          <span style={{ fontFamily: SERIF, fontSize: '0.85rem', color: C.muted }}>
            for: {gem.title}
          </span>
          {gem.carat_weight && (
            <span style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint }}>
              {gem.carat_weight}ct
            </span>
          )}
        </div>
      )}

      {/* Review body */}
      <div style={{ marginTop: 12 }}>
        {comment ? (
          <div>
            <p style={{
              fontFamily: SERIF, fontSize: '0.95rem', color: C.text,
              lineHeight: 1.75, margin: 0,
            }}>
              {isLong && !showFull ? comment.slice(0, 200) + '...' : comment}
            </p>
            {isLong && (
              <span
                onClick={() => setShowFull(!showFull)}
                style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.gold, cursor: 'pointer' }}
              >
                {showFull ? 'Read less' : 'Read more'}
              </span>
            )}
          </div>
        ) : (
          <p style={{ fontFamily: SERIF, fontSize: '0.88rem', color: C.faint, fontStyle: 'italic', margin: 0 }}>
            No written review
          </p>
        )}
      </div>

      {/* Footer — owner / admin actions */}
      {canDelete && onDelete && (
        <div style={{
          marginTop: 14, paddingTop: 12,
          borderTop: `0.5px solid ${C.border}`,
          display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
        }}>
          {isOwner && withinEditWindow && (
            <Link
              to={`/reviews/${review.id}/edit`}
              style={{
                fontFamily: BODY, fontSize: '0.78rem', color: C.muted,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </Link>
          )}
          {isOwner && !withinEditWindow && (
            <span style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint }}>
              Edit window expired ({daysSince} days ago)
            </span>
          )}
          <span
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              fontFamily: BODY, fontSize: '0.78rem', color: C.red,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
              marginLeft: isOwner && withinEditWindow ? 0 : 'auto',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            {isAdmin && !isOwner ? 'Remove (Admin)' : 'Delete'}
          </span>
          {showDeleteConfirm && (
            <div style={{
              width: '100%', marginTop: 6, padding: '10px 12px',
              borderRadius: 8, background: 'rgba(217,119,6,0.08)',
              fontFamily: BODY, fontSize: '0.78rem', color: '#d97706',
            }}>
              {isAdmin && !isOwner
                ? 'Remove this review as admin? This cannot be undone.'
                : 'Delete this review? This cannot be undone.'}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '4px 14px', borderRadius: 6, border: `1px solid ${C.border}`,
                    background: 'transparent', fontFamily: BODY, fontSize: '0.75rem',
                    color: C.muted, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onDelete(review.id); setShowDeleteConfirm(false); }}
                  style={{
                    padding: '4px 14px', borderRadius: 6, border: 'none',
                    background: C.red, color: '#fff', fontFamily: BODY,
                    fontSize: '0.75rem', cursor: 'pointer',
                  }}
                >
                  {isAdmin && !isOwner ? 'Remove' : 'Delete'}
                </button>
                  </div>
                </div>
              )}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
