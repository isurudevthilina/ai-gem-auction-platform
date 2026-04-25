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

const ReviewCard = ({ review, currentUserId, isAdmin, onDelete, canReport = false, onReport, reportStatus = 'none' }) => {
  const [showFull, setShowFull] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(null);

  const reviewer = review.reviewer || {};
  const txn = review.transaction || {};
  const gem = txn.gem || {};
  const gemImages = gem.images || [];
  const gemThumb = gemImages.find(i => typeof i === 'string' && !i.startsWith('model:'));

  const isOwner = currentUserId && currentUserId === review.reviewer_id;
  const canDelete = isOwner || isAdmin;
  const maxEdits = 3;
  const usedEdits = Number(review.edit_count || 0);
  const postSequence = Number(review.post_sequence || 1);
  const canEdit = usedEdits < maxEdits;
  const editsRemaining = Math.max(maxEdits - usedEdits, 0);

  const initials = (reviewer.full_name || '?').charAt(0).toUpperCase();
  const dateStr = new Date(review.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const comment = review.comment || '';
  const isLong = comment.length > 200;
  const mediaUrls = Array.isArray(review.media_urls) ? review.media_urls : [];
  const hasActiveMedia = activeMediaIndex !== null && activeMediaIndex >= 0 && activeMediaIndex < mediaUrls.length;
  const activeMediaUrl = hasActiveMedia ? mediaUrls[activeMediaIndex] : null;
  const activeIsVideo = activeMediaUrl ? /\.(mp4|webm|mov)(\?|$)/i.test(activeMediaUrl) : false;

  const closeMediaViewer = () => setActiveMediaIndex(null);
  const showPrevMedia = () => {
    if (!mediaUrls.length || activeMediaIndex === null) return;
    setActiveMediaIndex((activeMediaIndex - 1 + mediaUrls.length) % mediaUrls.length);
  };
  const showNextMedia = () => {
    if (!mediaUrls.length || activeMediaIndex === null) return;
    setActiveMediaIndex((activeMediaIndex + 1) % mediaUrls.length);
  };

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
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {usedEdits > 0 && (
                <span style={{
                  background: 'rgba(26,77,140,0.10)',
                  color: C.sapphire,
                  fontFamily: BODY,
                  fontSize: '0.64rem',
                  borderRadius: 999,
                  padding: '2px 8px',
                  fontWeight: 700,
                }}>
                  Edited
                </span>
              )}
              {postSequence > 1 && (
                <span style={{
                  background: 'rgba(217,119,6,0.12)',
                  color: '#b45309',
                  fontFamily: BODY,
                  fontSize: '0.64rem',
                  borderRadius: 999,
                  padding: '2px 8px',
                  fontWeight: 700,
                }}>
                  {postSequence === 2 ? 'Second Post' : `Post #${postSequence}`}
                </span>
              )}
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

      {mediaUrls.length > 0 && (
        <div style={{
          marginTop: 12,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 10,
        }}>
          {mediaUrls.map((url, idx) => {
            const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);
            return (
              <div
                key={`${review.id}-media-${idx}`}
                onClick={() => setActiveMediaIndex(idx)}
                style={{
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: `1px solid ${C.border}`,
                  background: C.bg,
                  cursor: 'zoom-in',
                  position: 'relative',
                }}
              >
                {isVideo ? (
                  <video src={url} muted style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <img src={url} alt="Review media" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                )}
                <div
                  style={{
                    position: 'absolute',
                    right: 6,
                    bottom: 6,
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    borderRadius: 999,
                    padding: '2px 8px',
                    fontFamily: BODY,
                    fontSize: '0.65rem',
                  }}
                >
                  View
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasActiveMedia && (
        <div
          onClick={closeMediaViewer}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 18,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(1200px, 96vw)',
              maxHeight: '92vh',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={closeMediaViewer}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                transform: 'translate(40%, -40%)',
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(0,0,0,0.75)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ✕
            </button>

            {mediaUrls.length > 1 && (
              <button
                onClick={showPrevMedia}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translate(-120%, -50%)',
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(0,0,0,0.75)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                }}
              >
                ‹
              </button>
            )}

            {activeIsVideo ? (
              <video
                src={activeMediaUrl}
                controls
                autoPlay
                style={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  borderRadius: 10,
                  background: '#000',
                }}
              />
            ) : (
              <img
                src={activeMediaUrl}
                alt="Review media full size"
                style={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  borderRadius: 10,
                  objectFit: 'contain',
                  background: '#111',
                }}
              />
            )}

            {mediaUrls.length > 1 && (
              <button
                onClick={showNextMedia}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translate(120%, -50%)',
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(0,0,0,0.75)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                }}
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer — owner / admin actions */}
      {(canDelete && onDelete) || (canReport && onReport) ? (
        <div style={{
          marginTop: 14, paddingTop: 12,
          borderTop: `0.5px solid ${C.border}`,
          display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
        }}>
          {isOwner && canEdit && (
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
          {isOwner && !canEdit && (
            <span style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint }}>
              Edit limit reached (3 of 3 edits used)
            </span>
          )}
          {isOwner && canEdit && (
            <span style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint }}>
              {editsRemaining} edit(s) remaining
            </span>
          )}
          {canReport && onReport && (
            reportStatus === 'open' ? (
              <span
                style={{
                  fontFamily: BODY,
                  fontSize: '0.76rem',
                  color: '#92400e',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginLeft: 'auto',
                  background: 'rgba(217,119,6,0.12)',
                  border: '1px solid rgba(217,119,6,0.25)',
                  borderRadius: 14,
                  padding: '4px 10px',
                  fontWeight: 600,
                }}
              >
                Reported to Admin
              </span>
            ) : (
              <span
                onClick={() => onReport(review.id)}
                style={{
                  fontFamily: BODY,
                  fontSize: '0.78rem',
                  color: '#b45309',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  marginLeft: 'auto',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.4 6H20"/>
                  <path d="M14.4 10H20"/>
                  <path d="M14.4 14H20"/>
                  <path d="M4 18V5a2 2 0 0 1 2-2h7l5 5v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>
                </svg>
                Report to Admin
              </span>
            )
          )}

          {canDelete && onDelete && (
            <span
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                fontFamily: BODY, fontSize: '0.78rem', color: C.red,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                marginLeft: !canReport ? (isOwner && canEdit ? 0 : 'auto') : 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              {isAdmin && !isOwner ? 'Remove (Admin)' : 'Delete'}
            </span>
          )}

          {canDelete && onDelete && showDeleteConfirm && (
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
      ) : null}
    </div>
  );
};

export default ReviewCard;
