import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfirmPayment } from '../hooks/useTransactions';
import { useCurrency } from '../../../context/CurrencyContext';

const C = {
  bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
  goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
  text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF   = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: `1px solid ${C.border}`, fontFamily: BODY, fontSize: '0.88rem',
  color: C.text, background: C.white, outline: 'none', boxSizing: 'border-box',
};

const SimulatedPaymentModal = ({ transaction, isOpen, onClose }) => {
  const [step, setStep] = useState('form');
  const { formatPrice } = useCurrency();
  const [statusText, setStatusText] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [holderName, setHolderName] = useState('');
  const mutation = useConfirmPayment();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setStep('form'); setCardNum(''); setExpiry(''); setCvv(''); setHolderName(''); setStatusText('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !transaction) return null;

  const amount = parseFloat(transaction.amount || 0);

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const handleExpiryChange = (e) => {
    let v = e.target.value.replace(/[^\d/\s]/g, '');
    const raw = v.replace(/[\s/]/g, '');
    if (raw.length === 2 && expiry.replace(/[\s/]/g, '').length === 1) {
      v = raw + ' / ';
    }
    setExpiry(v.slice(0, 7));
  };

  const handlePay = () => {
    setStep('processing');
    setStatusText('Processing payment...');
    const last4 = cardNum.replace(/\s/g, '').slice(-4) || '0000';
    setTimeout(() => setStatusText('Verifying card...'), 800);
    setTimeout(() => setStatusText('Confirming with bank...'), 1400);
    setTimeout(() => {
      mutation.mutate(
        { id: transaction.id, paymentReference: last4 },
        { onSuccess: () => setStep('success'), onError: () => setStep('error') }
      );
    }, 2000);
  };

  const cardType = cardNum[0] === '4' ? 'Visa' : cardNum[0] === '5' ? 'Mastercard' : null;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Demo mode banner */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        background: 'linear-gradient(90deg,#1A4D8C,#C4892A)',
        color: '#fff', textAlign: 'center', padding: '8px 16px',
        fontFamily: DISPLAY, fontSize: '0.7rem', letterSpacing: '0.08em',
        textTransform: 'uppercase', zIndex: 1001,
      }}>
        💳 Demo Mode — No real payments are processed
      </div>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.white, borderRadius: 16, padding: 32, width: '100%', maxWidth: 480, marginTop: 32,
        boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
      }}>

        {/* FORM */}
        {step === 'form' && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span style={{ fontFamily: DISPLAY, fontSize: '1rem', fontWeight: 700, color: C.text }}>Secure Payment</span>
              <span style={{ background: '#d97706', color: '#fff', borderRadius: 4, padding: '2px 8px', fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700 }}>Demo Mode</span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: SERIF, fontSize: '0.95rem', color: C.sapphire }}>{transaction.gem?.title}</div>
              <div style={{ fontFamily: DISPLAY, fontSize: '1.4rem', fontWeight: 700, color: C.gold }}>{formatPrice(amount)}</div>
            </div>

            {/* Card Details */}
            <div style={{ fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: C.faint, margin: '16px 0 10px' }}>Card Details</div>
            <input style={inputStyle} placeholder="1234 5678 9012 3456" maxLength={19}
              value={cardNum} onChange={(e) => setCardNum(fmtCard(e.target.value))} />
            {cardType && <div style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.muted, marginTop: 4 }}>{cardType}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              <input style={inputStyle} placeholder="MM / YY" maxLength={7}
                value={expiry} onChange={handleExpiryChange} />
              <input style={inputStyle} type="password" placeholder="123" maxLength={3}
                value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} />
            </div>

            <input style={{ ...inputStyle, marginTop: 10 }} placeholder="Name as on card"
              value={holderName} onChange={(e) => setHolderName(e.target.value)} />

            {/* Demo notice */}
            <div style={{ background: 'rgba(196,137,42,0.08)', border: `1px solid ${C.gold}30`, borderRadius: 8, padding: '10px 14px', margin: '16px 0' }}>
              <p style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted, margin: 0, lineHeight: 1.6 }}>
                This is a simulated payment for demonstration purposes. No real money will be charged.
              </p>
            </div>

            <button onClick={handlePay} style={{
              width: '100%', background: C.sapphire, color: '#fff', border: 'none',
              borderRadius: 10, padding: '14px', fontFamily: BODY, fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer',
            }}>
              Pay {formatPrice(amount)}
            </button>
          </>
        )}

        {/* PROCESSING */}
        {step === 'processing' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '20px 0' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.sapphire} strokeWidth="2.5" strokeLinecap="round"
              style={{ animation: 'bhp-pulse 1s ease-in-out infinite' }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span style={{ fontFamily: BODY, fontSize: '0.92rem', color: C.muted }}>{statusText}</span>
          </div>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 0' }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="#16a34a" strokeWidth="2" />
              <polyline points="14 24 21 31 34 17" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <span style={{ fontFamily: SERIF, fontSize: '1.3rem', fontWeight: 700, color: '#16a34a' }}>Payment Successful!</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: C.muted }}>
              Transaction ID: SIM-{transaction.id.slice(-8).toUpperCase()}
            </span>
            <span style={{ fontFamily: BODY, fontSize: '0.88rem', color: C.text }}>
              Amount paid: {formatPrice(amount)}
            </span>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => navigate(`/transactions/${transaction.id}`)} style={{
                background: C.sapphire, color: '#fff', border: 'none',
                borderRadius: 10, padding: '10px 24px', fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              }}>View Receipt</button>
              <button onClick={() => { navigate('/gems'); onClose(); setStep('form'); }} style={{
                background: 'transparent', border: `1px solid ${C.border}`, color: C.muted,
                borderRadius: 10, padding: '10px 24px', fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              }}>Continue Browsing</button>
            </div>
          </div>
        )}

        {/* ERROR */}
        {step === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke={C.red} strokeWidth="2" />
              <line x1="14" y1="14" x2="26" y2="26" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="26" y1="14" x2="14" y2="26" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: SERIF, fontSize: '1.1rem', color: C.red }}>Payment Failed</span>
            <span style={{ fontFamily: BODY, fontSize: '0.85rem', color: C.muted }}>
              {mutation.error?.message || 'An error occurred'}
            </span>
            <button onClick={() => setStep('form')} style={{
              background: C.sapphire, color: '#fff', border: 'none',
              borderRadius: 10, padding: '10px 24px', fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              marginTop: 8,
            }}>Try Again</button>
          </div>
        )}

        <style>{`@keyframes bhp-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      </div>
    </div>
  );
};

export default SimulatedPaymentModal;
