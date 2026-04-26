import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { placeBid } from '../services/auctionsService';
import { useCurrency } from '../../../context/CurrencyContext';

const C = {
    bg:        '#F0EDE8',
    white:     '#FFFFFF',
    sapphire:  '#1A4D8C',
    gold:      '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)',
    green:     '#16a34a',
    red:       '#B91C1C',
    text:      '#1A1A2E',
    muted:     '#6B6B7B',
    faint:     '#9A9AAB',
    border:    '#E0DCD6',
};
const DISPLAY = "'Cinzel', serif";
const BODY    = "'Jost', 'Inter', sans-serif";

/**
 * BidPanel
 * Props:
 *   auction     — full auction object (current_price, min_bid_increment, status, end_time)
 *   onBidPlaced — callback(newPrice) after successful bid
 *   isExpired   — bool from useCountdown
 */
const BidPanel = ({ auction, onBidPlaced, isExpired }) => {
    const { formatPrice } = useCurrency();
    const [amount,      setAmount]      = useState('');
    const [loading,     setLoading]     = useState(false);
    const [success,     setSuccess]     = useState(null);
    const [error,       setError]       = useState(null);
    const [flashGreen,  setFlashGreen]  = useState(false);

    const currentPrice  = Number(auction?.current_price || 0);
    const increment     = Number(auction?.min_bid_increment || 10);
    const minRequired   = currentPrice + increment;
    const isActive      = auction?.status === 'active' && !isExpired;

    const quickAmounts = [minRequired, minRequired + increment, minRequired + increment * 2];

    const handleBid = async () => {
        const parsed = parseFloat(amount);
        if (isNaN(parsed) || parsed <= 0) {
            setError('Please enter a valid bid amount.');
            return;
        }
        if (parsed < minRequired) {
            setError(`Minimum bid is ${formatPrice(minRequired)}.`);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await placeBid(auction.id, parsed);
            setSuccess(`Bid of ${formatPrice(parsed)} placed!`);
            setAmount('');
            setFlashGreen(true);
            setTimeout(() => setFlashGreen(false), 1500);
            if (onBidPlaced) onBidPlaced(res.data?.new_price);
        } catch (err) {
            setError(err?.message || err?.error_message || 'Failed to place bid.');
            if (err?.min_required) {
                setAmount(String(err.min_required));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            background:    C.white,
            border:        `1px solid ${C.border}`,
            borderRadius:  14,
            boxShadow:     '0 2px 12px rgba(0,0,0,0.04)',
            padding:       24,
            display:       'flex',
            flexDirection: 'column',
            gap:           18,
        }}>
            {/* Current price */}
            <motion.div
                animate={{ backgroundColor: flashGreen ? 'rgba(22,163,74,0.08)' : 'rgba(196,137,42,0.06)' }}
                transition={{ duration: 0.4 }}
                style={{
                    border:        `1px solid ${flashGreen ? 'rgba(22,163,74,0.25)' : 'rgba(196,137,42,0.18)'}`,
                    borderRadius:  10,
                    padding:       '14px 18px',
                    textAlign:     'center',
                }}
            >
                <div style={{ color: C.dim, fontSize: '0.7rem', fontFamily: DISPLAY, fontWeight: 600, letterSpacing: '0.1em', marginBottom: 4 }}>
                    {(auction?.bid_count || 0) === 0 ? 'STARTING BID' : 'CURRENT BID'}
                </div>
                <div style={{ color: flashGreen ? C.green : C.gold, fontSize: '2rem', fontFamily: BODY, fontWeight: 900, lineHeight: 1 }}>
                    {formatPrice(currentPrice)}
                </div>
                <div style={{ color: C.muted, fontSize: '0.75rem', fontFamily: BODY, marginTop: 4 }}>
                    {auction?.bid_count || 0} bids · min next: {formatPrice(minRequired)}
                </div>
            </motion.div>

            {/* Bid input + submit */}
            {isActive ? (
                <>
                    {/* Quick amounts */}
                    <div>
                        <div style={{ color: C.dim, fontSize: '0.7rem', fontFamily: DISPLAY, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8 }}>
                            QUICK BID
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {quickAmounts.map((amt) => (
                                <button
                                    key={amt}
                                    onClick={() => setAmount(String(amt))}
                                    style={{
                                        flex:         1,
                                        background:   amount === String(amt) ? C.goldLight : C.bg,
                                        border:       `1px solid ${amount === String(amt) ? 'rgba(196,137,42,0.35)' : C.border}`,
                                        borderRadius: 8,
                                        color:        amount === String(amt) ? C.gold : C.muted,
                                        fontSize:     '0.75rem',
                                        fontFamily:   BODY,
                                        fontWeight:   700,
                                        padding:      '7px 4px',
                                        cursor:       'pointer',
                                        transition:   'all 0.15s',
                                    }}
                                >
                                    {formatPrice(amt)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom amount input */}
                    <div>
                        <div style={{ color: C.dim, fontSize: '0.7rem', fontFamily: DISPLAY, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8 }}>
                            CUSTOM AMOUNT
                        </div>
                        <div style={{ position: 'relative' }}>
                            <span style={{
                                position: 'absolute', left: 14, top: '50%',
                                transform: 'translateY(-50%)',
                                color: C.muted, fontSize: '0.9rem', fontFamily: BODY, fontWeight: 700,
                            }}>$</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => { setAmount(e.target.value); setError(null); }}
                                onKeyDown={(e) => e.key === 'Enter' && handleBid()}
                                placeholder={minRequired.toString()}
                                min={minRequired}
                                style={{
                                    width:        '100%',
                                    background:   C.bg,
                                    border:       `1px solid ${error ? 'rgba(185,28,28,0.4)' : C.border}`,
                                    borderRadius: 8,
                                    color:        C.text,
                                    fontSize:     '1rem',
                                    fontFamily:   BODY,
                                    fontWeight:   700,
                                    padding:      '12px 14px 12px 28px',
                                    outline:      'none',
                                    boxSizing:    'border-box',
                                    transition:   'border-color 0.15s',
                                }}
                                onFocus={(e) => e.target.style.borderColor = C.gold}
                                onBlur={(e) => e.target.style.borderColor = error ? 'rgba(185,28,28,0.4)' : C.border}
                            />
                        </div>
                    </div>

                    {/* Feedback */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    background:   'rgba(185,28,28,0.06)',
                                    border:       '1px solid rgba(185,28,28,0.18)',
                                    borderRadius: 8,
                                    color:        C.red,
                                    fontSize:     '0.8rem',
                                    fontFamily:   BODY,
                                    padding:      '10px 12px',
                                    display:      'flex',
                                    alignItems:   'center',
                                    gap:          8,
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    background:   'rgba(22,163,74,0.06)',
                                    border:       '1px solid rgba(22,163,74,0.18)',
                                    borderRadius: 8,
                                    color:        C.green,
                                    fontSize:     '0.8rem',
                                    fontFamily:   BODY,
                                    padding:      '10px 12px',
                                    display:      'flex',
                                    alignItems:   'center',
                                    gap:          8,
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Place Bid button */}
                    <button
                        onClick={handleBid}
                        disabled={loading}
                        style={{
                            width:        '100%',
                            background:   loading ? C.border : C.gold,
                            color:        C.white,
                            border:       'none',
                            borderRadius: 10,
                            padding:      '14px',
                            fontSize:     '0.95rem',
                            fontFamily:   BODY,
                            fontWeight:   800,
                            cursor:       loading ? 'not-allowed' : 'pointer',
                            letterSpacing:'0.03em',
                            transition:   'opacity 0.2s',
                            display:      'flex',
                            alignItems:   'center',
                            justifyContent:'center',
                            gap:          8,
                        }}
                    >
                        {loading ? 'Placing Bid…' : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                </svg>
                                Place Bid
                            </>
                        )}
                    </button>
                </>
            ) : (
                <div style={{
                    textAlign:    'center',
                    color:        C.muted,
                    fontSize:     '0.85rem',
                    fontFamily:   BODY,
                    padding:      '12px',
                    background:   C.bg,
                    borderRadius: 10,
                    border:       `1px solid ${C.border}`,
                    display:      'flex',
                    alignItems:   'center',
                    justifyContent:'center',
                    gap:          8,
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    {isExpired ? 'Auction has ended' : `Auction is ${auction?.status}`}
                </div>
            )}
        </div>
    );
};

export default BidPanel;
