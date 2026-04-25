import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionStatusBadge from './TransactionStatusBadge';
import { useCheckCanReview, useDeleteReview } from '../../reviews/hooks/useReviews';
import { useCurrency } from '../../../context/CurrencyContext';

const C = {
  bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
  goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
  text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF   = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const btnBase = {
  borderRadius: 10, padding: '9px 16px', fontFamily: BODY, fontSize: '0.82rem',
  fontWeight: 700, cursor: 'pointer', border: 'none',
};

const ReviewButton = ({ transactionId }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useCheckCanReview(transactionId);
  const deleteReview = useDeleteReview();
  const remainingDeleteAttempts = Number(data?.remainingDeleteAttempts ?? 0);
  const maxDeleteAttempts = Number(data?.maxDeleteAttempts ?? 2);
  const isDeleteBlocked = remainingDeleteAttempts <= 0;

  const handleDelete = () => {
    if (!data?.existingReviewId || deleteReview.isPending) return;
    if (isDeleteBlocked) {
      window.alert(`Delete limit reached. You can delete and re-add a review only ${maxDeleteAttempts} times.`);
      return;
    }

    const confirmed = window.confirm(`Delete this review? You have ${remainingDeleteAttempts} delete attempt(s) remaining.`);
    if (!confirmed) return;

    deleteReview.mutate(data.existingReviewId, {
      onError: (err) => {
        window.alert(err?.message || 'Failed to delete review. Please try again.');
      },
    });
  };

  if (isLoading || !data) return null;
  if (data.canReview) {
    return (
      <button onClick={() => navigate(`/reviews/new?transactionId=${transactionId}`)} style={{ ...btnBase, background: C.gold, color: '#fff' }}>
        Leave Review
      </button>
    );
  }
  if (data.existingReviewId) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, width: '100%' }}>
        <div style={{
          fontFamily: BODY,
          fontSize: '0.70rem',
          color: isDeleteBlocked ? C.red : C.faint,
          textAlign: 'right',
          maxWidth: 180,
          lineHeight: 1.4,
        }}>
          Delete attempts left: {remainingDeleteAttempts}/{maxDeleteAttempts}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
          <button
            onClick={() => navigate(`/reviews/${data.existingReviewId}/edit`)}
            title="Edit review"
            aria-label="Edit review"
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              border: `1px solid ${C.border}`,
              background: '#fff',
              color: C.sapphire,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteReview.isPending || isDeleteBlocked}
            title={isDeleteBlocked ? 'Delete limit reached' : 'Delete review'}
            aria-label="Delete review"
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: 'rgba(185,28,28,0.06)',
              border: '1px solid rgba(185,28,28,0.22)',
              color: C.red,
              cursor: deleteReview.isPending || isDeleteBlocked ? 'default' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              opacity: deleteReview.isPending || isDeleteBlocked ? 0.5 : 1,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (!data.canReview) {
    const isLimitReached = typeof data.reason === 'string' && data.reason.toLowerCase().includes('limit');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, width: '100%' }}>
        <button
          disabled
          title="Review is unavailable"
          aria-label="Review unavailable"
          style={{
            ...btnBase,
            background: '#f5f5f5',
            color: C.faint,
            cursor: 'default',
            border: `1px solid ${C.border}`,
            opacity: 0.9,
          }}
        >
          Leave Review
        </button>
        <div style={{
          fontFamily: BODY,
          fontSize: '0.70rem',
          color: isLimitReached ? C.red : C.faint,
          textAlign: 'right',
          maxWidth: 190,
          lineHeight: 1.35,
        }}>
          {isLimitReached ? 'No review re-posts left' : (data.reason || 'Review unavailable')}
        </div>
      </div>
    );
  }

  return null;
};

const PurchaseRequestCard = ({ item, role, onOpenPayment, onOpenOffline, onMarkComplete, onOfferNextBidder }) => {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const gem = item.gem || {};
  const images = gem.images || [];
  const thumbSrc = images.find(i => typeof i === 'string' && !i.startsWith('model:'));
  const amt = parseFloat(item.amount);
  const requiresOffline = item.requires_offline;
  const categoryName = gem.category?.name || '';

  return (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: C.white, border: `0.5px solid ${C.border}`,
        borderRadius: 16, marginBottom: 16, display: 'flex', flexDirection: 'row',
        overflow: 'hidden', transition: 'box-shadow 0.2s',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      {/* LEFT — thumbnail */}
      <div style={{ width: 100, minHeight: 120, flexShrink: 0 }}>
        {thumbSrc ? (
          <img src={thumbSrc} alt={gem.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B6B7B" strokeWidth="1.5">
              <polygon points="12 2 2 7 2 17 12 22 22 17 22 7" />
            </svg>
          </div>
        )}
      </div>

      {/* CENTER */}
      <div style={{ flex: 1, padding: '16px 20px' }}>
        {categoryName && (
          <div style={{ fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: C.faint, letterSpacing: '0.1em' }}>
            {categoryName}
          </div>
        )}
        <div onClick={() => navigate(`/gem/${gem.id}`)} style={{
          fontFamily: SERIF, fontSize: '1.15rem', fontWeight: 700, color: C.sapphire, cursor: 'pointer',
        }}>
          {gem.title}
        </div>
        <div style={{ fontFamily: BODY, fontSize: '0.8rem', color: C.muted, margin: '4px 0 12px' }}>
          {gem.carat_weight ? `${gem.carat_weight}ct` : ''}{gem.cut ? ` · ${gem.cut}` : ''}
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ background: 'rgba(26,77,140,0.08)', color: C.sapphire, borderRadius: 4, padding: '2px 8px', fontFamily: BODY, fontSize: '0.72rem', fontWeight: 600 }}>
            Direct Sale
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: C.faint }}>
            GBL-{item.id.slice(0, 8).toUpperCase()}
          </span>
          <span style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.faint }}>
            Requested {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Amount + type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: SERIF, fontSize: '1.2rem', fontWeight: 700, color: C.sapphire }}>
            {formatPrice(amt)}
          </span>
          {requiresOffline ? (
            <span style={{ background: 'rgba(217,119,6,0.10)', color: '#d97706', borderRadius: 4, padding: '2px 8px', fontFamily: BODY, fontSize: '0.72rem', fontWeight: 600 }}>
              Offline Arrangement
            </span>
          ) : (
            <span style={{ background: 'rgba(22,163,74,0.10)', color: '#16a34a', borderRadius: 4, padding: '2px 8px', fontFamily: BODY, fontSize: '0.72rem', fontWeight: 600 }}>
              Online Payment
            </span>
          )}
        </div>
      </div>

      {/* RIGHT — actions */}
      <div style={{
        padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
        alignItems: 'flex-end', justifyContent: 'center',
        borderLeft: `0.5px solid ${C.border}`, minWidth: 160,
      }}>
        <TransactionStatusBadge status={item.status} amount={amt} />

        {/* BUYER view */}
        {role === 'buyer' && (
          <>
            {item.status === 'pending' && !requiresOffline && (
              <button onClick={() => onOpenPayment(item)} style={{ ...btnBase, background: C.gold, color: '#fff' }}>
                Complete Payment
              </button>
            )}
            {item.status === 'pending' && requiresOffline && (
              <button onClick={() => onOpenOffline(item)} style={{ ...btnBase, background: C.sapphire, color: '#fff' }}>
                View Seller Contact
              </button>
            )}
            {item.status === 'completed' && (
              <>
                <button onClick={() => navigate(`/transactions/${item.id}`)} style={{
                  ...btnBase, background: 'transparent', border: `1px solid ${C.border}`, color: C.sapphire, fontWeight: 600,
                }}>
                  View Receipt
                </button>
                <ReviewButton transactionId={item.id} />
              </>
            )}
            {item.status === 'disputed' && (
              <button onClick={() => navigate(`/transactions/${item.id}`)} style={{
                ...btnBase, background: 'transparent', border: `1px solid ${C.border}`, color: C.sapphire, fontWeight: 600,
              }}>
                View Details
              </button>
            )}
          </>
        )}

        {/* SELLER view */}
        {role === 'seller' && (
          <>
            {item.status === 'pending' && !requiresOffline && (
              <>
                <div style={{ background: C.bg, color: C.muted, borderRadius: 10, padding: '9px 16px', fontFamily: BODY, fontSize: '0.78rem' }}>
                  Awaiting Buyer Payment
                </div>
                <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint, textAlign: 'right', marginTop: 4 }}>
                  Buyer has not completed payment yet
                </div>
                {item.type === 'auction_win' && (
                  <button onClick={() => onOfferNextBidder?.(item)} style={{ ...btnBase, background: C.sapphire, color: '#fff' }}>
                    Offer to Next Bidder
                  </button>
                )}
              </>
            )}
            {item.status === 'pending' && requiresOffline && (
              <>
                <button onClick={() => onMarkComplete(item)} style={{ ...btnBase, background: C.gold, color: '#fff' }}>
                  Mark as Completed
                </button>
                {item.type === 'auction_win' && (
                  <button onClick={() => onOfferNextBidder?.(item)} style={{ ...btnBase, background: C.sapphire, color: '#fff' }}>
                    Offer to Next Bidder
                  </button>
                )}
                <button onClick={() => navigate(`/transactions/${item.id}`)} style={{
                  ...btnBase, background: 'transparent', border: `1px solid ${C.border}`, color: C.sapphire, fontWeight: 600,
                }}>
                  View Transaction
                </button>
              </>
            )}
            {item.status === 'completed' && (
              <button onClick={() => navigate(`/transactions/${item.id}`)} style={{
                ...btnBase, background: 'transparent', border: `1px solid ${C.border}`, color: C.sapphire, fontWeight: 600,
              }}>
                View Receipt
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PurchaseRequestCard;
