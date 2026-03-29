import { useParams, useNavigate } from 'react-router-dom';
import { useGetTransaction } from '../hooks/useTransactions';
import TransactionStatusBadge from '../components/TransactionStatusBadge';

const C = {
  bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
  goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
  text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF   = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const ReceiptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: txn, isLoading } = useGetTransaction(id);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.sapphire} strokeWidth="2.5" strokeLinecap="round"
          style={{ animation: 'rcpt-spin 1s linear infinite' }}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        <style>{`@keyframes rcpt-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!txn) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ fontFamily: BODY, fontSize: '1rem', color: C.muted }}>Transaction not found</p>
        <button onClick={() => navigate('/transactions')} style={{
          fontFamily: BODY, fontSize: '0.85rem', color: C.sapphire,
          background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline',
        }}>Back to purchase requests</button>
      </div>
    );
  }

  const gem = txn.gem || {};
  const buyer = txn.buyer || {};
  const seller = txn.seller || {};
  const amt = parseFloat(txn.amount);
  const images = gem.images || [];
  const thumbSrc = images.find(i => typeof i === 'string' && !i.startsWith('model:'));
  const categoryName = gem.category?.name || '';
  const dateStr = new Date(txn.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const statusBanner = txn.status === 'completed'
    ? { bg: 'rgba(22,163,74,0.08)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.25)', text: 'Transaction Complete' }
    : txn.status === 'pending'
      ? { bg: 'rgba(217,119,6,0.08)', color: '#d97706', border: '1px solid rgba(217,119,6,0.25)', text: 'Awaiting Completion' }
      : txn.status === 'disputed'
        ? { bg: 'rgba(185,28,28,0.08)', color: C.red, border: `1px solid rgba(185,28,28,0.25)`, text: 'Disputed' }
        : { bg: C.bg, color: C.muted, border: `1px solid ${C.border}`, text: txn.status };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: BODY }}>
      <style>{`
        @media print {
          body { background: #fff !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header band */}
      <div style={{ background: C.white, borderBottom: `0.5px solid ${C.border}`, padding: '24px 32px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: DISPLAY, fontSize: '1rem', fontWeight: 700, color: C.sapphire }}>GemBid LK</div>
            <div style={{ fontFamily: DISPLAY, fontSize: '0.7rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Transaction Receipt</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, color: C.sapphire }}>
              GBL-{txn.id.slice(0, 8).toUpperCase()}
            </div>
            <div style={{ fontFamily: BODY, fontSize: '0.8rem', color: C.muted }}>{dateStr}</div>
          </div>
        </div>
      </div>

      {/* Body card */}
      <div style={{ maxWidth: 700, margin: '32px auto', padding: '0 24px' }}>

        {/* Status banner */}
        <div style={{
          background: statusBanner.bg, color: statusBanner.color,
          border: statusBanner.border, borderRadius: 10, padding: '12px 20px', margin: '0 0 24px',
          fontFamily: BODY, fontSize: '0.92rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {txn.status === 'completed' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )}
          {statusBanner.text}
        </div>

        {/* Gem summary */}
        <div style={{
          background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 14,
          padding: '20px 24px', marginBottom: 20,
        }}>
          <div style={{ fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.faint, marginBottom: 8 }}>
            Item Details
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            {thumbSrc ? (
              <img src={thumbSrc} alt={gem.title} style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: 10, background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B6B7B" strokeWidth="1.5">
                  <polygon points="12 2 2 7 2 17 12 22 22 17 22 7" />
                </svg>
              </div>
            )}
            <div style={{ flex: 1 }}>
              {categoryName && (
                <div style={{ fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: C.faint, letterSpacing: '0.1em' }}>
                  {categoryName}
                </div>
              )}
              <div style={{ fontFamily: SERIF, fontSize: '1.15rem', fontWeight: 700, color: C.sapphire }}>{gem.title}</div>
              <div style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.muted, marginTop: 4 }}>
                {[gem.carat_weight && `${gem.carat_weight}ct`, gem.color, gem.clarity, gem.cut].filter(Boolean).join(' · ')}
              </div>
              {gem.certification && (
                <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.green, marginTop: 4 }}>
                  Certified: {gem.certification}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment summary */}
        <div style={{
          background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 14,
          padding: '20px 24px', marginBottom: 20,
        }}>
          <div style={{ fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.faint, marginBottom: 12 }}>
            Payment Summary
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: BODY, fontSize: '0.85rem', color: C.muted }}>Gem Price</span>
            <span style={{ fontFamily: BODY, fontSize: '0.85rem', color: C.text }}>${amt.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: BODY, fontSize: '0.85rem', color: C.muted }}>Platform Fee</span>
            <span style={{ fontFamily: BODY, fontSize: '0.85rem', color: C.text }}>$0.00</span>
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: BODY, fontSize: '0.95rem', fontWeight: 700, color: C.text }}>Total</span>
            <span style={{ fontFamily: SERIF, fontSize: '1.3rem', fontWeight: 700, color: C.sapphire }}>${amt.toLocaleString()}</span>
          </div>
          {txn.payment_reference && (
            <div style={{ marginTop: 12, fontFamily: BODY, fontSize: '0.78rem', color: C.faint }}>
              Payment Reference: <span style={{ fontFamily: 'monospace', color: C.text }}>{txn.payment_reference}</span>
            </div>
          )}
          <div style={{ marginTop: 8 }}>
            <TransactionStatusBadge status={txn.status} amount={amt} />
          </div>
        </div>

        {/* Parties */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {/* Buyer */}
          <div style={{
            background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 14, padding: '16px 20px',
          }}>
            <div style={{ fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.faint, marginBottom: 8 }}>
              Buyer
            </div>
            <div style={{ fontFamily: BODY, fontSize: '0.92rem', fontWeight: 700, color: C.text }}>{buyer.full_name || 'N/A'}</div>
            <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted }}>{buyer.email}</div>
            {buyer.phone_number && <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted }}>{buyer.phone_number}</div>}
          </div>
          {/* Seller */}
          <div style={{
            background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 14, padding: '16px 20px',
          }}>
            <div style={{ fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.faint, marginBottom: 8 }}>
              Seller
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: BODY, fontSize: '0.92rem', fontWeight: 700, color: C.text }}>{seller.full_name || 'N/A'}</span>
              {seller.is_verified && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#16a34a" stroke="#16a34a" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" stroke="#fff" />
                </svg>
              )}
            </div>
            <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted }}>{seller.email}</div>
            {seller.business_name && <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted }}>{seller.business_name}</div>}
          </div>
        </div>

        {/* Actions */}
        <div className="no-print" style={{ display: 'flex', gap: 10, marginTop: 24, marginBottom: 40 }}>
          <button onClick={() => window.print()} style={{
            background: C.sapphire, color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 24px',
            fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Receipt
          </button>
          <button onClick={() => navigate('/transactions')} style={{
            background: 'transparent', border: `1px solid ${C.border}`, color: C.muted,
            borderRadius: 10, padding: '10px 24px',
            fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          }}>Back to Purchase Requests</button>
        </div>

        {/* Disclaimer */}
        <div style={{
          background: 'rgba(196,137,42,0.06)', border: `1px solid ${C.gold}20`,
          borderRadius: 10, padding: '12px 16px', marginBottom: 40,
        }}>
          <p style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint, lineHeight: 1.7, margin: 0 }}>
            This receipt is generated by GemBid LK for record-keeping purposes. GemBid LK is a marketplace platform and does not guarantee gem authenticity or process real payments. All transactions shown are simulated for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;
