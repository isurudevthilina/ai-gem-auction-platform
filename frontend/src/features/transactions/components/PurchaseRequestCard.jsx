import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionStatusBadge from './TransactionStatusBadge';
import { useCheckCanReview } from '../../reviews/hooks/useReviews';
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
      <span style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.green, fontWeight: 600 }}>
        ✓ Review Submitted
      </span>
    );
  }
  return null;
};

const PurchaseRequestCard = ({ item, role, onOpenPayment, onOpenOffline, onMarkComplete }) => {
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
              </>
            )}
            {item.status === 'pending' && requiresOffline && (
              <>
                <button onClick={() => onMarkComplete(item)} style={{ ...btnBase, background: C.gold, color: '#fff' }}>
                  Mark as Completed
                </button>
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
