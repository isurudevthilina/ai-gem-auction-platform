import { useEffect } from 'react';

const C = {
  bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
  goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
  text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF   = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const BuyNowModal = ({ gem, isOpen, onClose, onConfirm, isLoading }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !gem) return null;

  const price = parseFloat(gem.buy_now_price);
  const images = gem.images || [];
  const thumbSrc = images.find(i => typeof i === 'string' && !i.startsWith('model:'));
  const categoryName = gem.category?.name || '';
  const sellerName = gem.seller?.full_name || '';

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.white, borderRadius: 16, padding: 32,
        width: '100%', maxWidth: 520,
        boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontFamily: DISPLAY, fontSize: '1.2rem', fontWeight: 700, color: C.text, margin: 0 }}>
            Confirm Purchase
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Gem summary */}
        <div style={{ background: C.bg, borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, margin: '16px 0' }}>
          {thumbSrc ? (
            <img src={thumbSrc} alt={gem.title} style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: 8, background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B6B7B" strokeWidth="1.5">
                <polygon points="12 2 2 7 2 17 12 22 22 17 22 7" />
              </svg>
            </div>
          )}
          <div style={{ flex: 1 }}>
            {categoryName && (
              <div style={{ fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint }}>
                {categoryName}
              </div>
            )}
            <div style={{ fontFamily: SERIF, fontSize: '1rem', fontWeight: 700, color: C.sapphire }}>
              {gem.title}
            </div>
            <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted }}>
              {gem.carat_weight ? `${gem.carat_weight}ct` : ''}{sellerName ? ` · ${sellerName}` : ''}
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div style={{ margin: '16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: BODY, fontSize: '0.85rem', color: C.muted }}>Gem Price</span>
            <span style={{ fontFamily: BODY, fontSize: '0.85rem', color: C.text }}>${price.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <span style={{ fontFamily: BODY, fontSize: '0.85rem', color: C.muted }}>Platform Fee</span>
              <span style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint, marginLeft: 6 }}>(Free during beta)</span>
            </div>
            <span style={{ fontFamily: BODY, fontSize: '0.85rem', color: C.text }}>$0.00</span>
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: BODY, fontSize: '0.92rem', fontWeight: 700, color: C.text }}>Total</span>
            <span style={{ fontFamily: SERIF, fontSize: '1.2rem', fontWeight: 700, color: C.sapphire }}>${price.toLocaleString()}</span>
          </div>
        </div>

        {/* Threshold banner */}
        <div style={{ margin: '16px 0' }}>
          {price < 1000 ? (
            <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.20)', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontFamily: BODY, fontSize: '0.82rem', color: '#16a34a', fontWeight: 600, marginBottom: 8 }}>
                Secure simulated checkout. This is a demo transaction.
              </div>
              <div style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.muted, lineHeight: 1.6 }}>
                · Payment processed instantly<br />
                · Gem marked as sold immediately<br />
                · Receipt generated automatically
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(196,137,42,0.08)', border: `1px solid ${C.gold}30`, borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.gold, fontWeight: 600, marginBottom: 8 }}>
                High-value gem — offline arrangement required
              </div>
              <div style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.muted, lineHeight: 1.6 }}>
                Due to the high value of this gem, payment and delivery will be arranged directly between you and the seller.
              </div>
              <div style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.muted, lineHeight: 1.6, marginTop: 8 }}>
                · Gem reserved immediately (taken off market)<br />
                · Seller receives your contact information<br />
                · Arrange payment and inspection directly<br />
                · Seller confirms completion when deal closes
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint, lineHeight: 1.6, marginTop: 12 }}>
          GemBid LK is a marketplace platform. We do not guarantee gem authenticity. Independent certification recommended for all purchases.
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{
            background: 'transparent', border: `1px solid ${C.border}`, color: C.muted,
            borderRadius: 10, padding: '10px 24px',
            fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} style={{
            background: C.gold, color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 24px',
            fontFamily: BODY, fontSize: '0.85rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {isLoading && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            )}
            Confirm &amp; Continue
          </button>
        </div>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default BuyNowModal;
