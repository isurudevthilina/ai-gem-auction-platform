/**
 * CreateAuctionPage.jsx — /auctions/new
 * Protected: seller & admin only.
 * Entry paths:
 *   A) /auctions/new?gemId=<uuid>  — redirected from CreateGemPage after "Save & Create Auction"
 *   B) /auctions/new               — seller picks gem from dropdown
 */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getGem } from '../../gems/services/gemsService';
import { getMyGems } from '../../gems/services/gemsService';
import { createAuction } from '../services/auctionsService';
import { CheckCircle, AlertCircle, X, Clock, DollarSign, Gavel, ArrowRight, Gem, ChevronDown } from 'lucide-react';
import { useCurrency } from '../../../context/CurrencyContext';
import { localDateTimeWithOffset } from '../utils/auctionState';

/* ── Design tokens (matching project palette) ── */
const T = {
    bg:       '#F0EDE8',
    sapphire: '#1A4D8C',
    gold:     '#C4892A',
    goldLight:'rgba(196,137,42,0.10)',
    text:     '#1A1A2E',
    muted:    '#6B6B7B',
    error:    '#B91C1C',
    white:    '#FFFFFF',
    border:   '#E0DCD6',
    green:    '#16a34a',
};
const SERIF   = "'Cormorant Garamond', serif";
const DISPLAY = "'Cinzel', serif";
const BODY    = "'Jost', 'Inter', sans-serif";

/* ── Duration presets ── */
const DURATION_PRESETS = [
    { label: '1 hour',   hours: 1 },
    { label: '6 hours',  hours: 6 },
    { label: '12 hours', hours: 12 },
    { label: '1 day',    hours: 24 },
    { label: '3 days',   hours: 72 },
    { label: '7 days',   hours: 168 },
];

/* ── Toast component ── */
const Toast = ({ message, type = 'success', onClose }) => (
    <div style={{
        position: 'fixed', top: 24, right: 24, zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 22px', borderRadius: 10,
        background: T.white, border: `0.5px solid ${T.border}`,
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        animation: 'slideIn 0.3s ease-out',
    }}>
        {type === 'success'
            ? <CheckCircle size={18} color={T.green} />
            : <AlertCircle size={18} color={T.error} />}
        <span style={{ fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, color: T.text }}>{message}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 8 }}>
            <X size={14} color={T.muted} />
        </button>
    </div>
);

/* ── Shared styles ── */
const labelStyle = {
    display:       'block',
    fontFamily:    DISPLAY,
    fontSize:      '0.72rem',
    fontWeight:    600,
    letterSpacing: '0.1em',
    color:         T.muted,
    marginBottom:  6,
    textTransform: 'uppercase',
};

const inputStyle = {
    width:        '100%',
    boxSizing:    'border-box',
    padding:      '12px 14px',
    fontFamily:   BODY,
    fontSize:     '0.92rem',
    color:        T.text,
    background:   T.white,
    border:       `1px solid ${T.border}`,
    borderRadius: 8,
    outline:      'none',
    transition:   'border-color 0.2s',
};

const focusProps = {
    onFocus: (e) => e.target.style.borderColor = T.gold,
    onBlur:  (e) => e.target.style.borderColor = T.border,
};

/* ─── Main Page Component ─── */
const CreateAuctionPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { formatPrice } = useCurrency();
    const [searchParams] = useSearchParams();
    const preGemId = searchParams.get('gemId') || '';

    /* State */
    const [gem, setGem]                 = useState(null);
    const [sellerGems, setSellerGems]   = useState([]);
    const [gemsLoading, setGemsLoading] = useState(true);
    const [gemLoading, setGemLoading]   = useState(!!preGemId);

    const [form, setForm] = useState({
        gem_id:            preGemId,
        starting_price:    '',
        reserve_price:     '',
        min_bid_increment: '10',
        start_time:        localDateTimeWithOffset(0),
        end_time:          localDateTimeWithOffset(24),
    });
    const [activeDuration, setActiveDuration] = useState(3); // index of "1 day"
    const [submitting, setSubmitting]   = useState(false);
    const [error, setError]             = useState(null);
    const [toast, setToast]             = useState(null);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    /* ── Fetch seller's gems (for dropdown) ── */
    useEffect(() => {
        if (!user?.id) return;
        getMyGems()
            .then(res => {
                const gems = res.data || [];
                const available = gems.filter(g => g.status !== 'sold');
                setSellerGems(available);
            })
            .catch(() => {})
            .finally(() => setGemsLoading(false));
    }, [user?.id]);

    /* ── If gemId in URL, fetch that gem's details ── */
    useEffect(() => {
        if (!preGemId) { setGemLoading(false); return; }
        getGem(preGemId)
            .then(res => {
                setGem(res.data);
                set('gem_id', res.data.id);
            })
            .catch(() => setError('Could not load gem details.'))
            .finally(() => setGemLoading(false));
    }, [preGemId]);

    /* ── When gem_id changes via dropdown, fetch its details ── */
    useEffect(() => {
        if (!form.gem_id || form.gem_id === preGemId) return;
        setGemLoading(true);
        getGem(form.gem_id)
            .then(res => setGem(res.data))
            .catch(() => setGem(null))
            .finally(() => setGemLoading(false));
    }, [form.gem_id]);

    /* ── Duration preset handler ── */
    const handleDuration = (idx) => {
        setActiveDuration(idx);
        const preset = DURATION_PRESETS[idx];
        set('end_time', localDateTimeWithOffset(preset.hours));
    };

    /* ── Auto-dismiss toast ── */
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    /* ── Computed: form valid ── */
    const isValid = useMemo(() => {
        if (!form.gem_id) return false;
        if (!form.starting_price || parseFloat(form.starting_price) <= 0) return false;
        if (!form.end_time) return false;
        if (new Date(form.end_time) <= new Date(form.start_time)) return false;
        if (form.reserve_price && parseFloat(form.reserve_price) <= 0) return false;
        return true;
    }, [form]);

    /* ── Submit ── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!form.gem_id)         return setError('Please select a gem.');
        if (!form.starting_price || parseFloat(form.starting_price) <= 0) return setError('Starting price must be greater than $0.');
        if (new Date(form.end_time) <= new Date(form.start_time)) return setError('End time must be after start time.');
        if (form.reserve_price && parseFloat(form.reserve_price) <= 0) return setError('Reserve price must be greater than $0.');

        setSubmitting(true);
        try {
            const payload = {
                gem_id:            form.gem_id,
                starting_price:    parseFloat(form.starting_price),
                min_bid_increment: parseFloat(form.min_bid_increment || 10),
                start_time:        new Date(form.start_time).toISOString(),
                end_time:          new Date(form.end_time).toISOString(),
            };
            if (form.reserve_price) {
                payload.reserve_price = parseFloat(form.reserve_price);
            }

            const res = await createAuction(payload);
            setToast({ message: 'Auction created successfully!', type: 'success' });
            setTimeout(() => navigate(`/auctions/${res.data.id}`), 800);
        } catch (err) {
            setError(err?.message || 'Failed to create auction. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Loading state ── */
    if (gemsLoading) {
        return (
            <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Gavel size={36} color={T.gold} style={{ marginBottom: 12, opacity: 0.6 }} />
                    <p style={{ fontFamily: BODY, color: T.muted, fontSize: '0.9rem' }}>Loading your gems…</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: T.bg }}>
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>
                {/* ── Page Header ── */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h1 style={{ margin: '0 0 8px', fontFamily: SERIF, fontSize: '2.2rem', fontWeight: 700, color: T.text }}>
                        Create an <span style={{ color: T.gold }}>Auction</span>
                    </h1>
                    <p style={{ margin: 0, fontFamily: BODY, fontSize: '0.92rem', color: T.muted }}>
                        Set your terms and let buyers compete for your gemstone
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    {/* ── Two-column layout: Gem Preview + Auction Form ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: gem ? '320px 1fr' : '1fr', gap: 28, alignItems: 'start' }}>

                        {/* ── LEFT: Gem Preview Card ── */}
                        {gem && (
                            <div style={{
                                background: T.white, borderRadius: 14,
                                border: `1px solid ${T.border}`,
                                overflow: 'hidden',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                            }}>
                                {/* Image */}
                                <div style={{
                                    width: '100%', aspectRatio: '4/3',
                                    background: '#e8e4df',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden',
                                }}>
                                    {gem.images?.find(u => !u.startsWith('model:')) ? (
                                        <img src={gem.images.find(u => !u.startsWith('model:'))} alt={gem.title}
                                             style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Gem size={48} color={T.muted} style={{ opacity: 0.3 }} />
                                    )}
                                </div>

                                {/* Details */}
                                <div style={{ padding: '16px 18px' }}>
                                    <h3 style={{
                                        margin: '0 0 6px', fontFamily: SERIF,
                                        fontSize: '1.15rem', fontWeight: 700, color: T.text,
                                    }}>
                                        {gem.title}
                                    </h3>
                                    {gem.category?.name && (
                                        <span style={{
                                            display: 'inline-block', padding: '2px 10px',
                                            borderRadius: 20, fontSize: '0.68rem', fontWeight: 600,
                                            fontFamily: DISPLAY, letterSpacing: '0.06em',
                                            background: T.goldLight, color: T.gold,
                                            marginBottom: 10, textTransform: 'uppercase',
                                        }}>
                                            {gem.category.name}
                                        </span>
                                    )}

                                    {/* Spec grid */}
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: '1fr 1fr',
                                        gap: '6px 12px', marginTop: 8,
                                    }}>
                                        {[
                                            ['Carat', gem.carat_weight ? `${gem.carat_weight} ct` : '—'],
                                            ['Cut', gem.cut || '—'],
                                            ['Clarity', gem.clarity || '—'],
                                            ['Color', gem.color || '—'],
                                            ['Origin', gem.origin || '—'],
                                            ['Treatment', gem.treatment || '—'],
                                        ].map(([label, value]) => (
                                            <div key={label}>
                                                <div style={{ fontSize: '0.62rem', fontFamily: DISPLAY, letterSpacing: '0.08em', color: T.muted, textTransform: 'uppercase' }}>
                                                    {label}
                                                </div>
                                                <div style={{ fontSize: '0.82rem', fontFamily: BODY, fontWeight: 600, color: T.text }}>
                                                    {value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Prices */}
                                    {(gem.buy_now_price || gem.predicted_price) && (
                                        <div style={{
                                            marginTop: 12, paddingTop: 12,
                                            borderTop: `1px solid ${T.border}`,
                                            display: 'flex', gap: 16,
                                        }}>
                                            {gem.predicted_price && (
                                                <div>
                                                    <div style={{ fontSize: '0.62rem', fontFamily: DISPLAY, letterSpacing: '0.08em', color: T.muted, textTransform: 'uppercase' }}>
                                                        AI Estimate
                                                    </div>
                                                    <div style={{ fontSize: '0.95rem', fontFamily: BODY, fontWeight: 700, color: T.sapphire }}>
                                                        ${Number(gem.predicted_price).toLocaleString()}
                                                    </div>
                                                </div>
                                            )}
                                            {gem.buy_now_price && (
                                                <div>
                                                    <div style={{ fontSize: '0.62rem', fontFamily: DISPLAY, letterSpacing: '0.08em', color: T.muted, textTransform: 'uppercase' }}>
                                                        Buy Now
                                                    </div>
                                                    <div style={{ fontSize: '0.95rem', fontFamily: BODY, fontWeight: 700, color: T.gold }}>
                                                        ${Number(gem.buy_now_price).toLocaleString()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── RIGHT: Auction Settings ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                            {/* Gem selector (shown when no preGemId or when user wants to change) */}
                            {!preGemId && (
                                <div style={{
                                    background: T.white, borderRadius: 14,
                                    border: `1px solid ${T.border}`,
                                    padding: '20px 22px',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                                }}>
                                    <label style={labelStyle}>
                                        <Gem size={13} style={{ marginRight: 5, verticalAlign: -2 }} />
                                        Select Gem *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={form.gem_id}
                                            onChange={(e) => set('gem_id', e.target.value)}
                                            required
                                            style={{ ...inputStyle, appearance: 'none', paddingRight: 36 }}
                                            {...focusProps}
                                        >
                                            <option value="" disabled>Choose a gem to auction…</option>
                                            {sellerGems.length === 0 && (
                                                <option disabled>No available gems — create a listing first</option>
                                            )}
                                            {sellerGems.map(g => (
                                                <option key={g.id} value={g.id}>
                                                    {g.title} — {g.carat_weight}ct {g.color} ({g.status})
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} color={T.muted}
                                            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                    </div>
                                </div>
                            )}

                            {/* Pre-selected gem banner */}
                            {preGemId && gem && (
                                <div style={{
                                    background: T.goldLight, borderRadius: 10,
                                    border: `1px solid rgba(196,137,42,0.20)`,
                                    padding: '12px 16px',
                                    display: 'flex', alignItems: 'center', gap: 10,
                                }}>
                                    <Gavel size={16} color={T.gold} />
                                    <span style={{ fontFamily: BODY, fontSize: '0.85rem', color: T.text }}>
                                        Creating auction for <strong>{gem.title}</strong>
                                    </span>
                                </div>
                            )}

                            {/* ── Pricing Card ── */}
                            <div style={{
                                background: T.white, borderRadius: 14,
                                border: `1px solid ${T.border}`,
                                padding: '22px',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                            }}>
                                <h3 style={{
                                    margin: '0 0 18px', fontFamily: SERIF,
                                    fontSize: '1.1rem', fontWeight: 700, color: T.text,
                                    display: 'flex', alignItems: 'center', gap: 8,
                                }}>
                                    <DollarSign size={18} color={T.gold} />
                                    Pricing
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    {/* Starting price */}
                                    <div>
                                        <label style={labelStyle}>Starting Price ($) *</label>
                                        <input
                                            type="number"
                                            value={form.starting_price}
                                            onChange={(e) => set('starting_price', e.target.value)}
                                            placeholder="e.g. 500"
                                            min="1" step="any" required
                                            style={inputStyle}
                                            {...focusProps}
                                        />
                                    </div>

                                    {/* Reserve price */}
                                    <div>
                                        <label style={labelStyle}>Reserve Price ($)</label>
                                        <input
                                            type="number"
                                            value={form.reserve_price}
                                            onChange={(e) => set('reserve_price', e.target.value)}
                                            placeholder="Optional minimum"
                                            min="1" step="any"
                                            style={inputStyle}
                                            {...focusProps}
                                        />
                                        <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: T.muted, fontFamily: BODY }}>
                                            Auction won't finalize below this price
                                        </p>
                                    </div>

                                    {/* Min bid increment */}
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Min Bid Increment ($)</label>
                                        <input
                                            type="number"
                                            value={form.min_bid_increment}
                                            onChange={(e) => set('min_bid_increment', e.target.value)}
                                            placeholder="10"
                                            min="1" step="any"
                                            style={{ ...inputStyle, maxWidth: 200 }}
                                            {...focusProps}
                                        />
                                        <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: T.muted, fontFamily: BODY }}>
                                            Minimum amount each new bid must exceed the current price
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ── Timing Card ── */}
                            <div style={{
                                background: T.white, borderRadius: 14,
                                border: `1px solid ${T.border}`,
                                padding: '22px',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                            }}>
                                <h3 style={{
                                    margin: '0 0 18px', fontFamily: SERIF,
                                    fontSize: '1.1rem', fontWeight: 700, color: T.text,
                                    display: 'flex', alignItems: 'center', gap: 8,
                                }}>
                                    <Clock size={18} color={T.gold} />
                                    Duration & Schedule
                                </h3>

                                {/* Duration presets */}
                                <label style={{ ...labelStyle, marginBottom: 10 }}>Quick Duration</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                                    {DURATION_PRESETS.map((p, idx) => (
                                        <button
                                            key={p.label}
                                            type="button"
                                            onClick={() => handleDuration(idx)}
                                            style={{
                                                padding: '7px 16px',
                                                borderRadius: 20,
                                                fontFamily: BODY,
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                border: idx === activeDuration
                                                    ? `1.5px solid ${T.gold}`
                                                    : `1px solid ${T.border}`,
                                                background: idx === activeDuration ? T.goldLight : T.white,
                                                color: idx === activeDuration ? T.gold : T.muted,
                                            }}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Start / End datetime */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <label style={labelStyle}>Start Time</label>
                                        <input
                                            type="datetime-local"
                                            value={form.start_time}
                                            onChange={(e) => set('start_time', e.target.value)}
                                            style={inputStyle}
                                            {...focusProps}
                                        />
                                        <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: T.muted, fontFamily: BODY }}>
                                            Defaults to now (immediate start)
                                        </p>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>End Time *</label>
                                        <input
                                            type="datetime-local"
                                            value={form.end_time}
                                            onChange={(e) => {
                                                set('end_time', e.target.value);
                                                setActiveDuration(-1); // deselect presets
                                            }}
                                            required
                                            style={inputStyle}
                                            {...focusProps}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Error ── */}
                    {error && (
                        <div style={{
                            background: 'rgba(185,28,28,0.06)',
                            border: '1px solid rgba(185,28,28,0.18)',
                            borderRadius: 10, padding: '12px 18px',
                            display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                            <AlertCircle size={16} color={T.error} />
                            <span style={{ fontFamily: BODY, fontSize: '0.85rem', color: T.error }}>{error}</span>
                        </div>
                    )}

                    {/* ── Submit Row ── */}
                    <div style={{
                        display: 'flex', justifyContent: 'flex-end',
                        gap: 12, marginTop: 4,
                    }}>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            style={{
                                padding: '13px 28px', borderRadius: 10,
                                fontFamily: BODY, fontSize: '0.88rem', fontWeight: 600,
                                cursor: 'pointer', transition: 'all 0.2s',
                                background: T.white,
                                border: `1px solid ${T.border}`,
                                color: T.muted,
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !isValid}
                            style={{
                                padding: '13px 32px', borderRadius: 10,
                                fontFamily: BODY, fontSize: '0.88rem', fontWeight: 700,
                                cursor: submitting || !isValid ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                background: submitting || !isValid ? T.border : T.gold,
                                border: 'none',
                                color: submitting || !isValid ? T.muted : T.white,
                                display: 'flex', alignItems: 'center', gap: 8,
                                boxShadow: submitting || !isValid ? 'none' : '0 4px 16px rgba(196,137,42,0.3)',
                            }}
                        >
                            <Gavel size={16} />
                            {submitting ? 'Creating Auction…' : 'Create Auction'}
                            {!submitting && <ArrowRight size={16} />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAuctionPage;
