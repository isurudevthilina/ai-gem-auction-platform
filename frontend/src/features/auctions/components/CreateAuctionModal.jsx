import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createAuction } from '../services/auctionsService';
import { localDateTimeWithOffset } from '../utils/auctionState';

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

const inputStyle = {
    width:        '100%',
    background:   'rgba(255,255,255,0.04)',
    border:       `1px solid ${C.border}`,
    borderRadius: 8,
    color:        C.text,
    fontSize:     '0.9rem',
    padding:      '11px 14px',
    outline:      'none',
    boxSizing:    'border-box',
};

const labelStyle = {
    color:        C.dim,
    fontSize:     '0.72rem',
    fontWeight:   600,
    letterSpacing:'0.08em',
    marginBottom: 6,
    display:      'block',
};

/**
 * CreateAuctionModal
 * Props:
 *   sellerGems  — array of { id, title } (unsold gems belonging to seller)
 *   onClose     — fn()
 *   onCreated   — fn(auction)
 */
const CreateAuctionModal = ({ sellerGems = [], onClose, onCreated, preSelectedGemId = '' }) => {
    const [form, setForm] = useState({
        gem_id:            preSelectedGemId,
        starting_price:    '',
        min_bid_increment: '10',
        start_time:        localDateTimeWithOffset(0),
        end_time:          localDateTimeWithOffset(24),
    });
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!form.gem_id)          return setError('Please select a gem.');
        if (!form.starting_price)  return setError('Starting price is required.');
        if (parseFloat(form.starting_price) <= 0) return setError('Starting price must be > 0.');
        if (new Date(form.end_time) <= new Date(form.start_time)) return setError('End time must be after start time.');

        setLoading(true);
        try {
            const res = await createAuction({
                gem_id:            form.gem_id,
                starting_price:    parseFloat(form.starting_price),
                min_bid_increment: parseFloat(form.min_bid_increment || 10),
                start_time:        new Date(form.start_time).toISOString(),
                end_time:          new Date(form.end_time).toISOString(),
            });
            onCreated?.(res.data);
            onClose();
        } catch (err) {
            setError(err?.message || 'Failed to create auction.');
        } finally {
            setLoading(false);
        }
    };

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position:   'fixed', inset: 0, zIndex: 1100,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    display:    'flex', alignItems: 'center', justifyContent: 'center',
                    padding:    20,
                }}
            >
                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background:    'rgba(13,17,28,0.97)',
                        border:        `1px solid ${C.border}`,
                        borderRadius:  16,
                        backdropFilter:'blur(24px)',
                        width:         '100%',
                        maxWidth:      520,
                        maxHeight:     '90vh',
                        overflowY:     'auto',
                        padding:       28,
                    }}
                >
                    {/* Title */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <div>
                            <h2 style={{ color: C.text, fontWeight: 800, fontSize: '1.15rem', margin: 0 }}>
                                Create Auction
                            </h2>
                            <p style={{ color: C.muted, fontSize: '0.8rem', margin: '4px 0 0' }}>
                                List a gem for live bidding
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            style={{ background: 'none', border: 'none', color: C.dim, fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}
                        >×</button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Gem selector */}
                        <div>
                            <label style={labelStyle}>SELECT GEM *</label>
                            <select
                                value={form.gem_id}
                                onChange={(e) => set('gem_id', e.target.value)}
                                required
                                style={{ ...inputStyle, appearance: 'none' }}
                            >
                                <option value="" disabled>Choose a gem to auction…</option>
                                {sellerGems.length === 0 && (
                                    <option disabled>No available gems — add gems first</option>
                                )}
                                {sellerGems.map((g) => (
                                    <option key={g.id} value={g.id}>{g.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Starting price + min increment */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={labelStyle}>STARTING PRICE ($) *</label>
                                <input
                                    type="number"
                                    value={form.starting_price}
                                    onChange={(e) => set('starting_price', e.target.value)}
                                    placeholder="e.g. 500"
                                    min="1"
                                    step="any"
                                    required
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                                    onBlur={(e) => e.target.style.borderColor = C.border}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>MIN BID INCREMENT ($)</label>
                                <input
                                    type="number"
                                    value={form.min_bid_increment}
                                    onChange={(e) => set('min_bid_increment', e.target.value)}
                                    placeholder="10"
                                    min="1"
                                    step="any"
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                                    onBlur={(e) => e.target.style.borderColor = C.border}
                                />
                            </div>
                        </div>

                        {/* Start time + End time */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={labelStyle}>START TIME</label>
                                <input
                                    type="datetime-local"
                                    value={form.start_time}
                                    onChange={(e) => set('start_time', e.target.value)}
                                    style={{ ...inputStyle, colorScheme: 'dark' }}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                                    onBlur={(e) => e.target.style.borderColor = C.border}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>END TIME *</label>
                                <input
                                    type="datetime-local"
                                    value={form.end_time}
                                    onChange={(e) => set('end_time', e.target.value)}
                                    required
                                    style={{ ...inputStyle, colorScheme: 'dark' }}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                                    onBlur={(e) => e.target.style.borderColor = C.border}
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{
                                background:   'rgba(239,68,68,0.1)',
                                border:       '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 8,
                                color:        C.red,
                                fontSize:     '0.8rem',
                                padding:      '10px 14px',
                            }}>
                                ⚠ {error}
                            </div>
                        )}

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    flex:         1,
                                    background:   'rgba(255,255,255,0.04)',
                                    border:       `1px solid ${C.border}`,
                                    borderRadius: 10,
                                    color:        C.muted,
                                    fontSize:     '0.88rem',
                                    fontWeight:   600,
                                    padding:      '12px',
                                    cursor:       'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex:         2,
                                    background:   loading ? 'rgba(245,158,11,0.4)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    color:        '#0a0d14',
                                    border:       'none',
                                    borderRadius: 10,
                                    fontSize:     '0.9rem',
                                    fontWeight:   800,
                                    padding:      '12px',
                                    cursor:       loading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {loading ? 'Creating…' : '🔨 Start Auction'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CreateAuctionModal;
