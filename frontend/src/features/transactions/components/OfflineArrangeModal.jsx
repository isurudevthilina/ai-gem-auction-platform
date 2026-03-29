import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const C = {
  bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
  goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
  text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const OfflineArrangeModal = ({ transaction, isOpen, onClose }) => {
  const [copied, setCopied] = useState(null);
  const navigate = useNavigate();
  const seller = transaction?.seller;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !transaction) return null;

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const initials = (seller?.full_name || 'S').charAt(0).toUpperCase();
  const location = [seller?.city, seller?.district].filter(Boolean).join(', ');

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
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12" stroke="#16a34a" strokeWidth="2" />
            <polyline points="9 14 12.5 17.5 19 11" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <h2 style={{ fontFamily: DISPLAY, fontSize: '1.2rem', fontWeight: 700, color: C.text, margin: 0 }}>
            Gem Reserved Successfully
          </h2>
        </div>

        {/* Success banner */}
        <div style={{
          background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)',
          borderRadius: 10, padding: '12px 16px', margin: '16px 0',
        }}>
          <p style={{ fontFamily: BODY, fontSize: '0.85rem', color: '#16a34a', margin: 0 }}>
            This gem has been reserved for you. It is no longer available to other buyers.
          </p>
        </div>

        {/* Reference */}
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <div style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.faint }}>Reference:</div>
          <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: C.sapphire, letterSpacing: '0.1em' }}>
            GBL-{transaction.id.slice(0, 8).toUpperCase()}
          </div>
        </div>

        {/* Seller contact card */}
        <div style={{
          background: C.bg, border: `0.5px solid ${C.border}`,
          borderRadius: 12, padding: '16px 18px', margin: '16px 0',
        }}>
          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: C.sapphire,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.85rem',
            }}>{initials}</div>
            <span style={{ fontFamily: BODY, fontWeight: 700, color: C.text }}>{seller?.full_name || 'Seller'}</span>
            {seller?.is_verified && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#16a34a" stroke="#16a34a" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" stroke="#fff" />
              </svg>
            )}
          </div>

          {/* Contact rows */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `0.5px solid ${C.border}` }}>
            <div>
              <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint }}>Phone</div>
              <div style={{ fontFamily: BODY, fontSize: '0.85rem', color: C.text }}>{seller?.phone_number || 'Contact via platform'}</div>
            </div>
            {seller?.phone_number && (
              <button onClick={() => copyToClipboard(seller.phone_number, 'phone')} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              }}>
                {copied === 'phone' ? (
                  <span style={{ fontFamily: BODY, fontSize: '0.72rem', color: '#16a34a' }}>Copied!</span>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                )}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `0.5px solid ${C.border}` }}>
            <div>
              <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint }}>Email</div>
              <div style={{ fontFamily: BODY, fontSize: '0.85rem', color: C.text }}>{seller?.email}</div>
            </div>
            {seller?.email && (
              <button onClick={() => copyToClipboard(seller.email, 'email')} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              }}>
                {copied === 'email' ? (
                  <span style={{ fontFamily: BODY, fontSize: '0.72rem', color: '#16a34a' }}>Copied!</span>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {seller?.business_name && (
            <div style={{ padding: '8px 0', borderBottom: `0.5px solid ${C.border}` }}>
              <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint }}>Business</div>
              <div style={{ fontFamily: BODY, fontSize: '0.85rem', color: C.text }}>{seller.business_name}</div>
            </div>
          )}

          {location && (
            <div style={{ padding: '8px 0' }}>
              <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint }}>Location</div>
              <div style={{ fontFamily: BODY, fontSize: '0.85rem', color: C.text }}>{location}</div>
            </div>
          )}
        </div>

        {/* Next steps */}
        <div style={{ fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: C.faint, marginTop: 16 }}>
          Next Steps
        </div>
        <ol style={{ fontFamily: BODY, fontSize: '0.85rem', color: C.text, lineHeight: 1.8, margin: '8px 0', paddingLeft: 20 }}>
          <li>Contact the seller using the details above</li>
          <li>Arrange a physical inspection of the gem</li>
          <li>We recommend independent GIA/GRS certification</li>
          <li>Complete payment directly with the seller</li>
          <li>Once done, the seller will confirm on GemBid LK</li>
        </ol>

        {/* Disclaimer */}
        <div style={{
          background: 'rgba(196,137,42,0.06)', border: `1px solid ${C.gold}20`,
          borderRadius: 10, padding: '12px 16px', margin: '16px 0',
        }}>
          <p style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted, lineHeight: 1.7, margin: 0 }}>
            GemBid LK facilitates introductions between buyers and sellers for high-value gemstones. We do not process payments, verify physical gem quality, or mediate disputes for offline transactions. Proceed with appropriate due diligence.
          </p>
        </div>

        {/* Certification tip */}
        <div style={{ borderLeft: `3px solid ${C.sapphire}`, paddingLeft: 12, margin: '12px 0' }}>
          <p style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted, lineHeight: 1.6, margin: 0 }}>
            Tip: Before completing payment, consider requesting an independent certificate from GIA (+1-760-603-4500) or GRS (grs.ch) to verify gem quality and authenticity.
          </p>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={() => { navigate('/transactions'); onClose(); }} style={{
            background: C.sapphire, color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 24px',
            fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          }}>View My Purchase Requests</button>
          <button onClick={() => { navigate('/gems'); onClose(); }} style={{
            background: 'transparent', border: `1px solid ${C.border}`, color: C.muted,
            borderRadius: 10, padding: '10px 24px',
            fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          }}>Back to Gems</button>
        </div>
      </div>
    </div>
  );
};

export default OfflineArrangeModal;
