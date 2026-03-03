import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { placeBid } from '../services/auctionsService';

const C = {
    bg:      '#0a0d14',
    panel:   '#0f1220',
    gold:    '#f59e0b',
    goldDim: 'rgba(245,158,11,0.12)',
    green:   '#10b981',
    red:     '#ef4444',
    text:    '#f1f5f9',
    muted:   '#94a3b8',
    dim:     '#475569',
    border:  'rgba(255,255,255,0.08)',
};

/**
 * BidPanel
 * Props:
 *   auction     — full auction object (current_price, min_bid_increment, status, end_time)
 *   onBidPlaced — callback(newPrice) after successful bid
 *   isExpired   — bool from useCountdown
 */
const BidPanel = ({ auction, onBidPlaced, isExpired }) => {
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
            setError(`Minimum bid is $${minRequired.toLocaleString()}.`);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await placeBid(auction.id, parsed);
            setSuccess(`Bid of $${parsed.toLocaleString()} placed!`);
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
            background:    'rgba(13,17,28,0.9)',
            border:        `1px solid ${C.border}`,
            borderRadius:  14,
            backdropFilter:'blur(18px)',
            padding:       24,
            display:       'flex',
            flexDirection: 'column',
            gap:           18,
        }}>
            {/* Current price */}
            <motion.div
                animate={{ backgroundColor: flashGreen ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.08)' }}
                transition={{ duration: 0.4 }}
                style={{
                    border:        `1px solid ${flashGreen ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.2)'}`,
                    borderRadius:  10,
                    padding:       '14px 18px',
                    textAlign:     'center',
                }}
            >
                <div style={{ color: C.dim, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 4 }}>
                    {(auction?.bid_count || 0) === 0 ? 'STARTING BID' : 'CURRENT BID'}
                </div>
                <div style={{ color: flashGreen ? C.green : C.gold, fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>
                    ${currentPrice.toLocaleString()}
                </div>
                <div style={{ color: C.muted, fontSize: '0.75rem', marginTop: 4 }}>
                    {auction?.bid_count || 0} bids · min next: ${minRequired.toLocaleString()}
                </div>
            </motion.div>

            {/* Bid input + submit */}
            {isActive ? (
                <>
                    {/* Quick amounts */}
                    <div>
                        <div style={{ color: C.dim, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8 }}>
                            QUICK BID
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {quickAmounts.map((amt) => (
                                <button
                                    key={amt}
                                    onClick={() => setAmount(String(amt))}
                                    style={{
                                        flex:         1,
                                        background:   amount === String(amt) ? C.goldDim : 'rgba(255,255,255,0.04)',
                                        border:       `1px solid ${amount === String(amt) ? 'rgba(245,158,11,0.4)' : C.border}`,
                                        borderRadius: 8,
                                        color:        amount === String(amt) ? C.gold : C.muted,
                                        fontSize:     '0.75rem',
                                        fontWeight:   700,
                                        padding:      '7px 4px',
                                        cursor:       'pointer',
                                        transition:   'all 0.15s',
                                    }}
                                >
                                    ${amt.toLocaleString()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom amount input */}
                    <div>
                        <div style={{ color: C.dim, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8 }}>
                            CUSTOM AMOUNT
                        </div>
                        <div style={{ position: 'relative' }}>
                            <span style={{
                                position: 'absolute', left: 14, top: '50%',
                                transform: 'translateY(-50%)',
                                color: C.muted, fontSize: '0.9rem', fontWeight: 700,
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
                                    background:   'rgba(255,255,255,0.04)',
                                    border:       `1px solid ${error ? 'rgba(239,68,68,0.5)' : C.border}`,
                                    borderRadius: 8,
                                    color:        C.text,
                                    fontSize:     '1rem',
                                    fontWeight:   700,
                                    padding:      '12px 14px 12px 28px',
                                    outline:      'none',
                                    boxSizing:    'border-box',
                                    transition:   'border-color 0.15s',
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                                onBlur={(e) => e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : C.border}
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
                                    background:   'rgba(239,68,68,0.1)',
                                    border:       '1px solid rgba(239,68,68,0.3)',
                                    borderRadius: 8,
                                    color:        C.red,
                                    fontSize:     '0.8rem',
                                    padding:      '10px 12px',
                                    display:      'flex',
                                    alignItems:   'center',
                                    gap:          8,
                                }}
                            >
                                <span>⚠</span> {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    background:   'rgba(16,185,129,0.1)',
                                    border:       '1px solid rgba(16,185,129,0.3)',
                                    borderRadius: 8,
                                    color:        C.green,
                                    fontSize:     '0.8rem',
                                    padding:      '10px 12px',
                                    display:      'flex',
                                    alignItems:   'center',
                                    gap:          8,
                                }}
                            >
                                <span>✓</span> {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Place Bid button */}
                    <button
                        onClick={handleBid}
                        disabled={loading}
                        style={{
                            width:        '100%',
                            background:   loading ? 'rgba(245,158,11,0.4)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color:        '#0a0d14',
                            border:       'none',
                            borderRadius: 10,
                            padding:      '14px',
                            fontSize:     '0.95rem',
                            fontWeight:   800,
                            cursor:       loading ? 'not-allowed' : 'pointer',
                            letterSpacing:'0.03em',
                            transition:   'opacity 0.2s',
                        }}
                    >
                        {loading ? 'Placing Bid…' : '⚡ Place Bid'}
                    </button>
                </>
            ) : (
                <div style={{
                    textAlign:    'center',
                    color:        C.muted,
                    fontSize:     '0.85rem',
                    padding:      '12px',
                    background:   'rgba(255,255,255,0.03)',
                    borderRadius: 10,
                    border:       `1px solid ${C.border}`,
                }}>
                    {isExpired ? '🔒 Auction has ended' : `🔒 Auction is ${auction?.status}`}
                </div>
            )}
        </div>
    );
};

export default BidPanel;
