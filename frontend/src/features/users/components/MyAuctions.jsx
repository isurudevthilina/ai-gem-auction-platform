import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getAuctions, deleteAuction } from '../../auctions/services/auctionsService';
import AuctionBidHistory from './AuctionBidHistory';

/* ─── Design tokens ─── */
const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
    text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const STATUS_STYLES = {
    active:    { bg: 'rgba(22,163,74,0.10)', color: C.green, label: 'Active' },
    scheduled: { bg: 'rgba(26,77,140,0.10)', color: C.sapphire, label: 'Scheduled' },
    completed: { bg: C.goldLight, color: C.gold, label: 'Completed' },
    cancelled: { bg: 'rgba(185,28,28,0.08)', color: C.red, label: 'Cancelled' },
};

const TABS = [
    { key: 'all',       label: 'All' },
    { key: 'active',    label: 'Active' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
];

/* Gem SVG placeholder */
const GemPlaceholder = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.faint}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
        <path d="m16 16 6-6" /><path d="m8 8 6-6" />
        <path d="m9 7 8 8" /><path d="m21 11-8-8" />
    </svg>
);

const classifyAuction = (a) => {
    const now = new Date();
    if (a.status === 'completed') return 'completed';
    if (a.status === 'cancelled') return 'cancelled';
    if (a.status === 'active') {
        if (new Date(a.start_time) > now) return 'scheduled';
        if (new Date(a.end_time) > now) return 'active';
        return 'completed';
    }
    return a.status;
};

const MyAuctions = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [confirmCancelId, setConfirmCancelId] = useState(null);
    const [toast, setToast] = useState(null);
    const [busy, setBusy] = useState(false);

    const fetchAuctions = async () => {
        setLoading(true);
        try {
            const res = await getAuctions({ seller_id: user?.id });
            setAuctions(res?.data || []);
        } catch (err) {
            console.error('MyAuctions fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (user?.id) fetchAuctions(); }, [user?.id]);

    const classified = auctions.map(a => ({ ...a, _class: classifyAuction(a) }));
    const filtered = tab === 'all' ? classified : classified.filter(a => a._class === tab);
    const countFor = (key) => key === 'all' ? classified.length : classified.filter(a => a._class === key).length;

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCancel = async (id) => {
        setBusy(true);
        try {
            await deleteAuction(id);
            showToast('Auction cancelled.');
            fetchAuctions();
        } catch (err) {
            showToast(err?.message || 'Cancel failed', 'error');
        } finally {
            setBusy(false);
            setConfirmCancelId(null);
        }
    };

    const formatEnd = (d) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{
                        background: C.white, borderRadius: 12, height: 72, marginBottom: 10,
                        border: `1px solid ${C.border}`,
                        animation: 'shimmer 1.5s infinite',
                    }} />
                ))}
                <style>{`@keyframes shimmer { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative' }}>
            {/* Global toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24,
                    padding: '10px 18px', borderRadius: 10,
                    background: toast.type === 'error' ? 'rgba(185,28,28,0.1)' : 'rgba(22,163,74,0.1)',
                    color: toast.type === 'error' ? C.red : C.green,
                    fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600,
                    border: `1px solid ${toast.type === 'error' ? 'rgba(185,28,28,0.2)' : 'rgba(22,163,74,0.2)'}`,
                    zIndex: 100, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}>
                    {toast.msg}
                </div>
            )}

            {/* ── Tabs ── */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: `1px solid ${C.border}` }}>
                {TABS.map(({ key, label }) => {
                    const active = tab === key;
                    const count = countFor(key);
                    return (
                        <button key={key} onClick={() => setTab(key)} style={{
                            padding: '10px 18px', border: 'none', cursor: 'pointer',
                            background: 'transparent',
                            borderBottom: active ? `2px solid ${C.gold}` : '2px solid transparent',
                            color: active ? C.gold : C.faint,
                            fontFamily: BODY, fontSize: '0.84rem', fontWeight: active ? 700 : 500,
                            transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            {label}
                            <span style={{
                                padding: '1px 7px', borderRadius: 20,
                                background: active ? C.goldLight : 'rgba(0,0,0,0.04)',
                                fontSize: '0.68rem', fontWeight: 700,
                                color: active ? C.gold : C.faint,
                            }}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* ── Rows ── */}
            {filtered.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '48px 0',
                    background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
                }}>
                    <div style={{ fontFamily: BODY, fontSize: '0.9rem', color: C.muted, fontWeight: 600 }}>
                        No auctions in this status.
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filtered.map(auction => {
                        const cls = auction._class;
                        const sts = STATUS_STYLES[cls] || STATUS_STYLES.active;
                        const coverUrl = auction.gem?.images?.find(u => !u.startsWith('model:'));
                        const isExpanded = expandedId === auction.id;

                        return (
                            <div key={auction.id}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 16,
                                    padding: '14px 18px',
                                    background: C.white, borderRadius: 10,
                                    border: `1px solid ${C.border}`,
                                    transition: 'box-shadow 0.15s',
                                    position: 'relative',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    {/* Gem cover */}
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 8, overflow: 'hidden',
                                        background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        {coverUrl
                                            ? <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : <GemPlaceholder />
                                        }
                                    </div>

                                    {/* Title + sub */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontFamily: SERIF, fontSize: '0.92rem', fontWeight: 700, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {auction.gem?.title || 'Gem Auction'}
                                        </div>
                                        <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint, marginTop: 2 }}>
                                            {auction.bid_count || 0} bids &middot; ends {formatEnd(auction.end_time)}
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div style={{ fontFamily: DISPLAY, fontSize: '1.1rem', fontWeight: 700, color: C.gold, flexShrink: 0, minWidth: 80, textAlign: 'right' }}>
                                        ${Number(auction.current_price || 0).toLocaleString()}
                                    </div>

                                    {/* Status badge */}
                                    <span style={{
                                        display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                                        background: sts.bg, color: sts.color,
                                        fontFamily: DISPLAY, fontSize: '0.62rem', fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: '0.08em',
                                        flexShrink: 0,
                                    }}>{sts.label}</span>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                        <button onClick={() => navigate(`/auctions/${auction.id}`)} title="View Auction" style={{
                                            width: 30, height: 30, borderRadius: 6,
                                            border: `1px solid ${C.border}`, background: C.white,
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: C.sapphire, transition: 'border-color 0.15s',
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = C.sapphire; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}
                                        >
                                            <Eye size={14} />
                                        </button>

                                        {(cls === 'active' || cls === 'scheduled') && (
                                            <button onClick={() => setConfirmCancelId(auction.id)} title="Cancel" style={{
                                                width: 30, height: 30, borderRadius: 6,
                                                border: `1px solid ${C.border}`, background: C.white,
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: C.red, transition: 'border-color 0.15s',
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}
                                            >
                                                <X size={14} />
                                            </button>
                                        )}

                                        {cls === 'completed' && (
                                            <button onClick={() => setExpandedId(isExpanded ? null : auction.id)} title="Bid History" style={{
                                                width: 30, height: 30, borderRadius: 6,
                                                border: `1px solid ${C.border}`, background: isExpanded ? C.goldLight : C.white,
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: C.gold, transition: 'all 0.15s',
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}
                                            >
                                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </button>
                                        )}
                                    </div>

                                    {/* Cancel confirm popover */}
                                    {confirmCancelId === auction.id && (
                                        <div style={{
                                            position: 'absolute', top: '100%', right: 16, marginTop: 4,
                                            background: C.white, borderRadius: 10,
                                            border: `1px solid ${C.border}`,
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                            padding: 16, zIndex: 20, width: 240,
                                        }}>
                                            <div style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.text, fontWeight: 600, marginBottom: 12 }}>
                                                Cancel this auction? This cannot be undone.
                                            </div>
                                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                <button onClick={() => setConfirmCancelId(null)} style={{
                                                    padding: '6px 14px', borderRadius: 6,
                                                    border: `1px solid ${C.border}`, background: 'transparent',
                                                    color: C.muted, fontFamily: BODY, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                                }}>Keep</button>
                                                <button onClick={() => handleCancel(auction.id)} disabled={busy} style={{
                                                    padding: '6px 14px', borderRadius: 6,
                                                    border: 'none', background: C.red, color: '#fff',
                                                    fontFamily: BODY, fontSize: '0.78rem', fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
                                                    opacity: busy ? 0.7 : 1,
                                                }}>Cancel Auction</button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Expanded bid history */}
                                {isExpanded && (
                                    <AuctionBidHistory auctionId={auction.id} auction={auction} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyAuctions;
