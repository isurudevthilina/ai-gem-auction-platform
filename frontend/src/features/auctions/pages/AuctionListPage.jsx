import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import AuctionCard from '../components/AuctionCard';
import { getAuctions } from '../services/auctionsService';

const C = {
    bg:         '#F0EDE8',
    white:      '#FFFFFF',
    sapphire:   '#1A4D8C',
    sapphireBg: 'rgba(26,77,140,0.06)',
    gold:       '#C4892A',
    goldSoft:   'rgba(196,137,42,0.10)',
    text:       '#1A1A2E',
    muted:      '#6B6B7B',
    faint:      '#9A9AAB',
    border:     '#E0DCD6',
    green:      '#16a34a',
    red:        '#b91c1c',
};
const SERIF   = "'Cormorant Garamond', 'Georgia', serif";
const DISPLAY = "'Cinzel', serif";
const BODY    = "'Jost', 'Inter', sans-serif";

const STATUS_TABS = [
    { label: 'All',       value: 'all' },
    { label: 'Live',      value: 'active' },
    { label: 'Upcoming',  value: 'upcoming' },
    { label: 'Ended',     value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
];

const SORT_OPTIONS = [
    { label: 'Ending Soon',   sort: 'end_time',      order: 'asc'  },
    { label: 'Newest First',  sort: 'created_at',    order: 'desc' },
    { label: 'Lowest Price',  sort: 'current_price', order: 'asc'  },
    { label: 'Highest Price', sort: 'current_price', order: 'desc' },
    { label: 'Most Bids',     sort: 'bid_count',     order: 'desc' },
];

const GemIconSvg = ({ size = 64, color = C.sapphire }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 13L2 9z" />
        <path d="M11 3l1 10" />
        <path d="M2 9h20" />
        <path d="M6.5 3L12 13" />
        <path d="M17.5 3L12 13" />
    </svg>
);

const AuctionListPage = () => {
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
            const params = {
                search: search || undefined,
                page,
                limit: LIMIT,
                sort,
                order,
            };
            if (status === 'upcoming') {
                params.upcoming = true;
            } else if (status !== 'all') {
                params.status = status;
            }
            const res = await getAuctions(params);
            setAuctions(res.data || []);
            setTotalPages(res.pagination?.totalPages || 1);
            setTotal(res.pagination?.total || 0);
        } catch (err) {
            setError(err?.message || 'Failed to load auctions.');
        } finally {
            setLoading(false);
        }
    }, [status, search, page, sortIdx]);

    useEffect(() => { setPage(1); }, [status, search, sortIdx]);
    useEffect(() => { fetchAuctions(); }, [fetchAuctions]);

    const [searchInput, setSearchInput] = useState('');
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput), 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: BODY }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '90px 24px 60px' }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
                    <h1 style={{ fontFamily: DISPLAY, fontSize: '2.2rem', fontWeight: 700, color: C.sapphire, margin: 0 }}>
                        Gem Auctions
                    </h1>
                    <p style={{ fontFamily: BODY, color: C.muted, margin: '6px 0 0', fontSize: '0.9rem' }}>
                        {loading ? 'Loading...' : `${total} auction${total !== 1 ? 's' : ''} found`}
                    </p>
                </motion.div>

                {/* Filter bar */}
                <div style={{
                    position: 'sticky', top: 0, zIndex: 10,
                    background: C.white, borderBottom: `1px solid ${C.border}`,
                    borderRadius: 12, padding: '12px 16px', marginBottom: 28,
                    display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
                }}>
                    {/* Status tabs */}
                    <div style={{ display: 'flex', gap: 4 }}>
                        {STATUS_TABS.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setStatus(tab.value)}
                                style={{
                                    background:   status === tab.value ? C.sapphire : 'transparent',
                                    border:       'none',
                                    borderRadius: 8,
                                    color:        status === tab.value ? '#fff' : C.muted,
                                    fontSize:     '0.82rem',
                                    fontWeight:   status === tab.value ? 700 : 500,
                                    fontFamily:   BODY,
                                    padding:      '7px 16px',
                                    cursor:       'pointer',
                                    transition:   'all 0.15s',
                                    whiteSpace:   'nowrap',
                                }}
                            >{tab.label}</button>
                        ))}
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.faint }} />
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by gem name..."
                            style={{
                                width:        '100%',
                                background:   C.bg,
                                border:       `1px solid ${C.border}`,
                                borderRadius: 10,
                                color:        C.text,
                                fontSize:     '0.87rem',
                                fontFamily:   BODY,
                                padding:      '9px 14px 9px 36px',
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
                            background:   C.bg,
                            border:       `1px solid ${C.border}`,
                            borderRadius: 10,
                            color:        C.text,
                            fontSize:     '0.83rem',
                            fontFamily:   BODY,
                            padding:      '9px 14px',
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
                                background: C.white, border: `1px solid ${C.border}`,
                                animation: 'auctionPulse 1.5s ease-in-out infinite',
                            }} />
                        ))}
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <p style={{ color: C.red, fontSize: '0.9rem', fontFamily: BODY }}>{error}</p>
                        <button
                            onClick={fetchAuctions}
                            style={{
                                marginTop: 16, background: C.goldSoft,
                                border: `1px solid ${C.gold}`,
                                borderRadius: 8, color: C.gold,
                                padding: '8px 20px', cursor: 'pointer',
                                fontSize: '0.85rem', fontFamily: BODY, fontWeight: 600,
                            }}
                        >Retry</button>
                    </div>
                ) : auctions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <GemIconSvg size={64} color={C.faint} />
                        <p style={{ fontFamily: DISPLAY, color: C.muted, fontSize: '1rem', margin: '16px 0 4px' }}>
                            No auctions found.
                        </p>
                        <p style={{ fontFamily: BODY, color: C.faint, fontSize: '0.82rem', margin: 0 }}>
                            Try a different filter or check back soon.
                        </p>
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
                                transition={{ delay: i * 0.04 }}
                            >
                                <AuctionCard auction={auction} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 36, alignItems: 'center' }}>
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                background: C.white, border: `1px solid ${C.border}`,
                                borderRadius: 8, color: page <= 1 ? C.faint : C.text,
                                padding: '8px 14px', cursor: page <= 1 ? 'not-allowed' : 'pointer',
                                fontSize: '0.85rem', fontFamily: BODY, opacity: page <= 1 ? 0.5 : 1,
                            }}
                        ><ChevronLeft size={14} /> Prev</button>

                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            const p = i + 1;
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    style={{
                                        background:   page === p ? C.sapphire : C.white,
                                        border:       `1px solid ${page === p ? C.sapphire : C.border}`,
                                        borderRadius: 8,
                                        color:        page === p ? '#fff' : C.muted,
                                        fontWeight:   page === p ? 700 : 500,
                                        padding:      '8px 12px', cursor: 'pointer',
                                        fontSize:     '0.85rem', fontFamily: BODY, minWidth: 36,
                                    }}
                                >{p}</button>
                            );
                        })}

                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                background: C.white, border: `1px solid ${C.border}`,
                                borderRadius: 8, color: page >= totalPages ? C.faint : C.text,
                                padding: '8px 14px', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                                fontSize: '0.85rem', fontFamily: BODY, opacity: page >= totalPages ? 0.5 : 1,
                            }}
                        >Next <ChevronRight size={14} /></button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes auctionPulse {
                    0%, 100% { opacity: 0.5; }
                    50%       { opacity: 1;   }
                }
            `}</style>
        </div>
    );
};

export default AuctionListPage;
