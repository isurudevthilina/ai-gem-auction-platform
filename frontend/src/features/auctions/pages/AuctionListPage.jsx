import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import AuctionCard from '../components/AuctionCard';
import { getAuctions } from '../services/auctionsService';

const C = {
    bg:      '#0a0d14',
    panel:   '#0f1220',
    gold:    '#f59e0b',
    goldDim: 'rgba(245,158,11,0.15)',
    text:    '#f1f5f9',
    muted:   '#94a3b8',
    dim:     '#475569',
    border:  'rgba(255,255,255,0.08)',
};

const STATUS_TABS = [
    { label: 'All',          value: 'all'        },
    { label: '🟢 Live',      value: 'active'     },
    { label: '✅ Completed', value: 'completed'  },
    { label: '❌ Cancelled', value: 'cancelled'  },
];

const SORT_OPTIONS = [
    { label: 'Ending Soon',     sort: 'end_time',      order: 'asc'  },
    { label: 'Newest First',    sort: 'created_at',    order: 'desc' },
    { label: 'Price: Low→High', sort: 'current_price', order: 'asc'  },
    { label: 'Price: High→Low', sort: 'current_price', order: 'desc' },
    { label: 'Most Bids',       sort: 'bid_count',     order: 'desc' },
];

const AuctionListPage = () => {
    const navigate = useNavigate();

    const [auctions,  setAuctions]  = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState(null);
    const [search,    setSearch]    = useState('');
    const [status,    setStatus]    = useState('active');
    const [sortIdx,   setSortIdx]   = useState(0);
    const [page,      setPage]      = useState(1);
    const [totalPages,setTotalPages]= useState(1);
    const [total,     setTotal]     = useState(0);

    const LIMIT = 12;

    const fetchAuctions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { sort, order } = SORT_OPTIONS[sortIdx];
            const res = await getAuctions({
                status,
                search: search || undefined,
                page,
                limit: LIMIT,
                sort,
                order,
            });
            setAuctions(res.data || []);
            setTotalPages(res.pagination?.totalPages || 1);
            setTotal(res.pagination?.total || 0);
        } catch (err) {
            setError(err?.message || 'Failed to load auctions.');
        } finally {
            setLoading(false);
        }
    }, [status, search, page, sortIdx]);

    useEffect(() => {
        setPage(1);
    }, [status, search, sortIdx]);

    useEffect(() => {
        fetchAuctions();
    }, [fetchAuctions]);

    // Debounced search
    const [searchInput, setSearchInput] = useState('');
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput), 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    return (
        <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, sans-serif' }}>
            {/* Aurora background */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                {[
                    { color: 'rgba(99,102,241,0.12)',  top: '10%',  left: '10%',  w: 500, h: 500 },
                    { color: 'rgba(168,85,247,0.09)',  top: '50%',  right: '5%',  w: 400, h: 400 },
                    { color: 'rgba(245,158,11,0.07)',  bottom: '5%',left: '30%',  w: 600, h: 300 },
                ].map((orb, i) => (
                    <div key={i} style={{
                        position:     'absolute', top: orb.top, left: orb.left, right: orb.right, bottom: orb.bottom,
                        width:        orb.w, height: orb.h,
                        background:   orb.color,
                        borderRadius: '50%',
                        filter:       'blur(80px)',
                    }} />
                ))}
            </div>

            <Navbar />

            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '100px 24px 60px', position: 'relative', zIndex: 1 }}>

                {/* Page header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 36 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.03em' }}>
                                Live <span style={{ color: C.gold }}>Auctions</span>
                            </h1>
                            <p style={{ color: C.muted, margin: '6px 0 0', fontSize: '0.9rem' }}>
                                {loading ? 'Loading…' : `${total} auction${total !== 1 ? 's' : ''} found`}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Filters row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 28, alignItems: 'center' }}>
                    {/* Status tabs */}
                    <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4 }}>
                        {STATUS_TABS.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setStatus(tab.value)}
                                style={{
                                    background:   status === tab.value ? C.goldDim : 'transparent',
                                    border:       `1px solid ${status === tab.value ? 'rgba(245,158,11,0.35)' : 'transparent'}`,
                                    borderRadius: 7,
                                    color:        status === tab.value ? C.gold : C.muted,
                                    fontSize:     '0.8rem',
                                    fontWeight:   status === tab.value ? 700 : 500,
                                    padding:      '6px 14px',
                                    cursor:       'pointer',
                                    transition:   'all 0.15s',
                                    whiteSpace:   'nowrap',
                                }}
                            >{tab.label}</button>
                        ))}
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                        <svg
                            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                            width="15" height="15" viewBox="0 0 24 24" fill="none"
                            stroke={C.dim} strokeWidth="2.5" strokeLinecap="round"
                        >
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search gems…"
                            style={{
                                width:        '100%',
                                background:   'rgba(255,255,255,0.04)',
                                border:       `1px solid ${C.border}`,
                                borderRadius: 10,
                                color:        C.text,
                                fontSize:     '0.87rem',
                                padding:      '10px 14px 10px 36px',
                                outline:      'none',
                                boxSizing:    'border-box',
                            }}
                        />
                    </div>

                    {/* Sort */}
                    <select
                        value={sortIdx}
                        onChange={(e) => setSortIdx(Number(e.target.value))}
                        style={{
                            background:   'rgba(255,255,255,0.04)',
                            border:       `1px solid ${C.border}`,
                            borderRadius: 10,
                            color:        C.text,
                            fontSize:     '0.83rem',
                            padding:      '10px 14px',
                            outline:      'none',
                            cursor:       'pointer',
                        }}
                    >
                        {SORT_OPTIONS.map((o, i) => (
                            <option key={i} value={i}>{o.label}</option>
                        ))}
                    </select>
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} style={{
                                height: 380, borderRadius: 14,
                                background: 'rgba(255,255,255,0.04)',
                                animation: 'pulse 1.5s ease-in-out infinite',
                            }} />
                        ))}
                    </div>
                ) : error ? (
                    <div style={{
                        textAlign: 'center', padding: '60px 20px',
                        color: '#ef4444', fontSize: '0.9rem',
                    }}>
                        ⚠ {error}
                        <br />
                        <button
                            onClick={fetchAuctions}
                            style={{
                                marginTop: 16, background: C.goldDim,
                                border: `1px solid rgba(245,158,11,0.3)`,
                                borderRadius: 8, color: C.gold,
                                padding: '8px 20px', cursor: 'pointer', fontSize: '0.85rem',
                            }}
                        >Retry</button>
                    </div>
                ) : auctions.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '80px 20px',
                        color: C.dim, fontSize: '0.95rem',
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>💎</div>
                        <div>No auctions found.</div>
                        <div style={{ fontSize: '0.82rem', marginTop: 8, color: C.dim }}>
                            Try a different filter or check back soon.
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}
                    >
                        {auctions.map((auction, i) => (
                            <motion.div
                                key={auction.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <AuctionCard auction={auction} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 36 }}>
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            style={{
                                background:   page <= 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
                                border:       `1px solid ${C.border}`,
                                borderRadius: 8,
                                color:        page <= 1 ? C.dim : C.text,
                                padding:      '8px 16px', cursor: page <= 1 ? 'not-allowed' : 'pointer',
                                fontSize:     '0.85rem',
                            }}
                        >← Prev</button>

                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const p = i + 1;
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    style={{
                                        background:   page === p ? C.goldDim : 'rgba(255,255,255,0.04)',
                                        border:       `1px solid ${page === p ? 'rgba(245,158,11,0.4)' : C.border}`,
                                        borderRadius: 8,
                                        color:        page === p ? C.gold : C.muted,
                                        fontWeight:   page === p ? 700 : 500,
                                        padding:      '8px 12px', cursor: 'pointer',
                                        fontSize:     '0.85rem', minWidth: 36,
                                    }}
                                >{p}</button>
                            );
                        })}

                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            style={{
                                background:   page >= totalPages ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
                                border:       `1px solid ${C.border}`,
                                borderRadius: 8,
                                color:        page >= totalPages ? C.dim : C.text,
                                padding:      '8px 16px', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                                fontSize:     '0.85rem',
                            }}
                        >Next →</button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50%       { opacity: 1;   }
                }
            `}</style>
        </div>
    );
};

export default AuctionListPage;
