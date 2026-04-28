import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import AuctionCard from '../components/AuctionCard';
import FilterSidebar from '../../../shared/components/FilterSidebar';
import { getAuctions } from '../services/auctionsService';
import { isAuctionLive } from '../utils/auctionState';

/* ── Design tokens ── */
const C = {
    parchment: '#F0EDE8',
    white:     '#FFFFFF',
    navy:      '#1A4D8C',
    navyDark:  '#1A2B5C',
    gold:      '#C4892A',
    text:      '#1A1A2E',
    muted:     '#6B6B7B',
    faint:     '#9A9AAB',
    border:    'rgba(26,77,140,0.12)',
    green:     '#16a34a',
    red:       '#b91c1c',
};
const DISPLAY = "'Cormorant Garamond', 'Georgia', serif";
const BRAND   = "'Cinzel', serif";

const STATUS_TABS = [
    { label: 'All Auctions', value: 'all'       },
    { label: 'Live Now',     value: 'active'     },
    { label: 'Upcoming',     value: 'upcoming'   },
    { label: 'Ended',        value: 'completed'  },
    { label: 'Cancelled',    value: 'cancelled'  },
];

const SORT_OPTIONS = [
    { label: 'Ending Soon',   sort: 'end_time',      order: 'asc'  },
    { label: 'Newest First',  sort: 'created_at',     order: 'desc' },
    { label: 'Lowest Price',  sort: 'current_price',  order: 'asc'  },
    { label: 'Highest Price', sort: 'current_price',  order: 'desc' },
    { label: 'Most Bids',     sort: 'bid_count',      order: 'desc' },
];

const PRICE_PRESETS = [
    { label: 'Under $500',  min: '', max: '500'  },
    { label: '$500-2k',     min: '500', max: '2000' },
    { label: '$2k-10k',     min: '2000', max: '10000' },
    { label: '$10k+',       min: '10000', max: '' },
];

/* Custom sort dropdown */
const SortDropdown = ({ sortIdx, onChange }) => {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ position: 'relative' }}>
            <button onClick={() => setOpen(v => !v)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', background: C.white, border: `0.5px solid ${C.border}`,
                borderRadius: 4, cursor: 'pointer', fontFamily: BRAND, fontSize: 11, color: C.navy,
                letterSpacing: '0.02em',
            }}>
                {SORT_OPTIONS[sortIdx].label}
                <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {open && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
                    <div style={{
                        position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 50,
                        background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 4,
                        boxShadow: '0 8px 24px rgba(26,77,140,0.1)', minWidth: 180, overflow: 'hidden',
                    }}>
                        {SORT_OPTIONS.map((o, i) => (
                            <button key={i} onClick={() => { onChange(i); setOpen(false); }} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                width: '100%', padding: '10px 14px', border: 'none', cursor: 'pointer',
                                background: 'transparent', fontFamily: DISPLAY, fontSize: 14,
                                color: sortIdx === i ? C.navy : C.text, fontWeight: sortIdx === i ? 600 : 400,
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,77,140,0.04)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                                {o.label}
                                {sortIdx === i && <span style={{ color: C.gold }}>✓</span>}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   AuctionListPage — Vostok-inspired redesign
═══════════════════════════════════════════════════ */
const AuctionListPage = () => {
    const navigate = useNavigate();

    /* ── ALL state preserved ── */
    const [auctions,   setAuctions]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);
    const [search,     setSearch]     = useState('');
    const [status,     setStatus]     = useState('active');
    const [sortIdx,    setSortIdx]    = useState(0);
    const [page,       setPage]       = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total,      setTotal]      = useState(0);
    const [viewMode,   setViewMode]   = useState('grid');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const LIMIT = 12;

    /* ── Data fetching (unchanged) ── */
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
                min_price: minPrice || undefined,
                max_price: maxPrice || undefined,
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
    }, [status, search, page, sortIdx, minPrice, maxPrice]);

    useEffect(() => { setPage(1); }, [status, search, sortIdx, minPrice, maxPrice]);
    useEffect(() => { fetchAuctions(); }, [fetchAuctions]);

    const [searchInput, setSearchInput] = useState('');
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput), 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const activeCount = [status !== 'active' && status !== 'all' ? status : '', minPrice, maxPrice].filter(Boolean).length;
    const clearAll = () => { setStatus('active'); setMinPrice(''); setMaxPrice(''); };

    const pricePresetIdx = PRICE_PRESETS.findIndex(p => p.min === minPrice && p.max === maxPrice);

    /* ── Filters content ── */
    const FiltersContent = () => (
        <>
            <FilterSidebar.Section label="Auction Status" defaultOpen>
                {STATUS_TABS.map(tab => (
                    <FilterSidebar.Radio key={tab.value}
                        checked={status === tab.value}
                        onChange={() => setStatus(tab.value)}
                        label={tab.label}
                    />
                ))}
            </FilterSidebar.Section>

            <FilterSidebar.Section label="Price Range" defaultOpen={false}>
                <FilterSidebar.RangeInputs
                    min={minPrice} max={maxPrice}
                    onMin={setMinPrice} onMax={setMaxPrice}
                    prefix="$"
                />
                <FilterSidebar.PresetPills
                    presets={PRICE_PRESETS}
                    activeIdx={pricePresetIdx}
                    onSelect={i => { setMinPrice(PRICE_PRESETS[i].min); setMaxPrice(PRICE_PRESETS[i].max); }}
                />
            </FilterSidebar.Section>
        </>
    );

    /* ── Live indicator strip ── */
    const liveCount = auctions.filter(a => {
        return isAuctionLive(a);
    }).length;

    return (
        <div style={{ minHeight: '100vh', background: C.parchment }}>
            {/* ═══ HERO BANNER ═══ */}
            <div style={{
                position: 'relative', overflow: 'hidden',
                background: `linear-gradient(135deg, ${C.navyDark} 0%, ${C.navy} 60%, #2A5D9C 100%)`,
                padding: '80px 40px 60px', textAlign: 'center',
            }}>
                {/* Dot grid */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.06,
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }} />

                {/* Live indicator strip */}
                {liveCount > 0 && !loading && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                        background: `linear-gradient(90deg, transparent, ${C.green}, transparent)`,
                        animation: 'auctionLiveStrip 2s ease-in-out infinite',
                    }} />
                )}

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <span style={{
                        fontFamily: BRAND, fontSize: 11, letterSpacing: '0.2em',
                        textTransform: 'uppercase', color: C.gold,
                    }}>GemBid LK</span>
                    <h1 style={{ margin: '12px 0 0', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, lineHeight: 1.1 }}>
                        <span style={{ fontFamily: BRAND, color: '#fff' }}>Gem </span>
                        <em style={{ fontFamily: DISPLAY, fontStyle: 'italic', color: C.gold, fontWeight: 400 }}>Auctions</em>
                    </h1>
                    <p style={{
                        margin: '14px auto 0', maxWidth: 520, fontFamily: DISPLAY, fontSize: 16,
                        color: 'rgba(255,255,255,0.6)', lineHeight: 1.5,
                    }}>
                        {loading ? 'Loading...' : `${total} auction${total !== 1 ? 's' : ''} available`}
                        {liveCount > 0 && !loading && (
                            <span style={{ color: C.green }}> · {liveCount} live now</span>
                        )}
                    </p>
                </div>
            </div>

            {/* ═══ BREADCRUMB ═══ */}
            <div style={{ padding: '12px 40px', maxWidth: 1400, margin: '0 auto' }}>
                <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span onClick={() => navigate('/')} style={{ fontFamily: BRAND, fontSize: 11, color: C.navy, opacity: 0.6, cursor: 'pointer', letterSpacing: '0.02em' }}>Home</span>
                    <span style={{ fontFamily: BRAND, fontSize: 11, color: C.gold }}>/</span>
                    <span style={{ fontFamily: BRAND, fontSize: 11, color: C.navy, opacity: 0.6, letterSpacing: '0.02em' }}>Auctions</span>
                </nav>
            </div>

            {/* ═══ STATUS PILL TABS ═══ */}
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                    {STATUS_TABS.map(tab => {
                        const active = status === tab.value;
                        return (
                            <button key={tab.value} onClick={() => setStatus(tab.value)}
                                style={{
                                    padding: '8px 18px', border: 'none', cursor: 'pointer',
                                    fontFamily: BRAND, fontSize: 10, fontWeight: active ? 700 : 500,
                                    letterSpacing: '0.06em', textTransform: 'uppercase',
                                    background: active ? C.navy : C.white,
                                    color: active ? C.parchment : C.navy,
                                    borderRadius: 4, transition: 'all 0.15s',
                                    boxShadow: active ? 'none' : `inset 0 0 0 0.5px ${C.border}`,
                                }}
                            >
                                {tab.label}
                                {tab.value === 'active' && liveCount > 0 && !loading && (
                                    <span style={{
                                        marginLeft: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        width: 16, height: 16, borderRadius: '50%', fontSize: 9,
                                        background: active ? C.gold : 'rgba(22,163,74,0.12)',
                                        color: active ? C.white : C.green,
                                    }}>{liveCount}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ═══ MAIN CONTENT ═══ */}
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px 60px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>

                {/* ── LEFT: Filter Sidebar (desktop) ── */}
                <aside className="auction-filter-sidebar" style={{
                    width: 260, flexShrink: 0, position: 'sticky', top: 80,
                    maxHeight: 'calc(100vh - 96px)', overflowY: 'auto',
                }}>
                    <FilterSidebar activeCount={activeCount} onClear={clearAll}>
                        <FiltersContent />
                    </FilterSidebar>
                </aside>

                {/* ── Mobile filter drawer ── */}
                <AnimatePresence>
                    {mobileFiltersOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setMobileFiltersOpen(false)}
                                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }}
                            />
                            <motion.div
                                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                                transition={{ type: 'tween', duration: 0.25 }}
                                style={{
                                    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
                                    background: C.white, borderRadius: '16px 16px 0 0',
                                    maxHeight: '85vh', overflowY: 'auto', padding: '0 0 80px',
                                }}
                            >
                                <div style={{
                                    position: 'sticky', top: 0, background: C.white, zIndex: 2,
                                    padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    borderBottom: `0.5px solid ${C.border}`,
                                }}>
                                    <span style={{ fontFamily: BRAND, fontSize: 13, color: C.navy, letterSpacing: '0.06em' }}>Filters</span>
                                    <button onClick={() => setMobileFiltersOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                                        <X size={18} color={C.muted} />
                                    </button>
                                </div>
                                <div style={{ padding: 0 }}>
                                    <FilterSidebar activeCount={activeCount} onClear={clearAll}>
                                        <FiltersContent />
                                    </FilterSidebar>
                                </div>
                                <div style={{
                                    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 202,
                                    padding: '12px 20px', background: C.white, borderTop: `0.5px solid ${C.border}`,
                                }}>
                                    <button onClick={() => setMobileFiltersOpen(false)} style={{
                                        width: '100%', padding: '12px', borderRadius: 4, border: 'none',
                                        background: C.gold, color: C.white, fontFamily: BRAND, fontSize: 12,
                                        letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
                                    }}>
                                        Show {total} auction{total !== 1 ? 's' : ''}
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* ── RIGHT: Main Content ── */}
                <main style={{ flex: 1, minWidth: 0 }}>
                    {/* Results header + controls */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                        marginBottom: 24, flexWrap: 'wrap', gap: 12,
                    }}>
                        <div>
                            <h2 style={{ margin: 0, fontFamily: BRAND, fontSize: 18, color: C.navy, fontWeight: 400, letterSpacing: '0.02em' }}>
                                {STATUS_TABS.find(t => t.value === status)?.label || 'Auctions'}
                            </h2>
                            <p style={{ margin: '4px 0 0', fontFamily: DISPLAY, fontSize: 14, color: C.muted }}>
                                {loading ? 'Loading...' : `${total.toLocaleString()} auction${total !== 1 ? 's' : ''}`}
                                {search && !loading && ` matching '${search}'`}
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {/* Search */}
                            <div style={{ position: 'relative' }}>
                                <Search size={13} color={C.faint} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                                <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                                    placeholder="Search auctions..."
                                    style={{
                                        width: 190, padding: '8px 12px 8px 30px', borderRadius: 4,
                                        border: `0.5px solid ${C.border}`, background: C.parchment,
                                        fontFamily: BRAND, fontSize: 11, color: C.text, outline: 'none',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>

                            {/* Grid/List toggle */}
                            <div style={{ display: 'flex', border: `0.5px solid ${C.border}`, borderRadius: 4, overflow: 'hidden' }}>
                                <button onClick={() => setViewMode('grid')} style={{
                                    padding: '7px 9px', border: 'none', cursor: 'pointer',
                                    background: viewMode === 'grid' ? C.navy : C.white,
                                    display: 'flex', alignItems: 'center',
                                }}>
                                    <LayoutGrid size={13} color={viewMode === 'grid' ? C.parchment : C.navy} />
                                </button>
                                <button onClick={() => setViewMode('list')} style={{
                                    padding: '7px 9px', border: 'none', borderLeft: `0.5px solid ${C.border}`, cursor: 'pointer',
                                    background: viewMode === 'list' ? C.navy : C.white,
                                    display: 'flex', alignItems: 'center',
                                }}>
                                    <List size={13} color={viewMode === 'list' ? C.parchment : C.navy} />
                                </button>
                            </div>

                            {/* Sort */}
                            <SortDropdown sortIdx={sortIdx} onChange={setSortIdx} />
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: viewMode === 'list' ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: 20,
                        }}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} style={{
                                    background: C.white, overflow: 'hidden',
                                    height: viewMode === 'list' ? 120 : undefined,
                                }}>
                                    <div style={{
                                        width: '100%', paddingBottom: viewMode === 'list' ? 0 : '110%',
                                        height: viewMode === 'list' ? 120 : undefined,
                                        background: C.parchment,
                                        animation: 'auctionPulse 1.4s ease-in-out infinite',
                                    }} />
                                    {viewMode !== 'list' && (
                                        <div style={{ padding: 16 }}>
                                            <div style={{ height: 14, width: '65%', background: C.parchment, borderRadius: 3, marginBottom: 8, animation: 'auctionPulse 1.4s ease-in-out infinite' }} />
                                            <div style={{ height: 10, width: '40%', background: C.parchment, borderRadius: 3, animation: 'auctionPulse 1.4s ease-in-out infinite' }} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 16px', display: 'block' }}>
                                <circle cx="12" cy="12" r="9" stroke={C.gold} strokeWidth="1.5" />
                                <path d="M12 7v6" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" />
                                <circle cx="12" cy="16.5" r="1" fill={C.gold} />
                            </svg>
                            <p style={{ color: C.navy, fontFamily: DISPLAY, fontSize: 18, margin: '0 0 6px' }}>{error}</p>
                            <button onClick={fetchAuctions} style={{
                                marginTop: 12, padding: '10px 24px', borderRadius: 4, border: 'none',
                                background: C.navy, color: C.parchment, fontFamily: BRAND, fontSize: 11,
                                letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
                            }}>Try Again</button>
                        </div>
                    ) : auctions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                            <svg width="56" height="56" viewBox="0 0 64 64" fill="none" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }}>
                                <path d="M16 22 24 12h16l8 10-16 30-16-30Z" stroke={C.navy} strokeWidth="2" />
                                <path d="M16 22h32M24 12l8 10 8-10M32 22v30" stroke={C.navy} strokeWidth="1.5" />
                            </svg>
                            <p style={{ fontFamily: DISPLAY, fontSize: 20, color: C.navy, margin: '0 0 4px' }}>No auctions found</p>
                            <p style={{ fontFamily: DISPLAY, fontSize: 14, color: C.muted, margin: 0 }}>
                                {status !== 'all' ? 'Try a different status filter or check back soon.' : 'Check back soon for new listings.'}
                            </p>
                            {activeCount > 0 && (
                                <button onClick={clearAll} style={{
                                    marginTop: 16, padding: '9px 20px', borderRadius: 4,
                                    border: `0.5px solid ${C.border}`, background: 'transparent',
                                    color: C.navy, fontFamily: BRAND, fontSize: 11,
                                    letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer',
                                }}>Clear Filters</button>
                            )}
                        </div>
                    ) : (
                        <>
                            {!loading && (
                                <p style={{
                                    margin: '0 0 16px', fontFamily: BRAND, fontSize: 11, color: C.muted,
                                    letterSpacing: '0.02em', textAlign: 'center',
                                }}>
                                    Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total.toLocaleString()} auctions
                                </p>
                            )}
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: viewMode === 'list' ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
                                    gap: 20,
                                }}
                            >
                                {auctions.map((auction, i) => (
                                    <motion.div key={auction.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                    >
                                        <AuctionCard auction={auction} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </>
                    )}

                    {/* ═══ PAGINATION ═══ */}
                    {totalPages > 1 && !loading && (
                        <div style={{ marginTop: 48, textAlign: 'center' }}>
                            <p style={{ fontFamily: BRAND, fontSize: 11, color: C.muted, margin: '0 0 12px', letterSpacing: '0.02em' }}>
                                Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total.toLocaleString()} auctions
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                                <button disabled={page <= 1} onClick={() => setPage(v => v - 1)} style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    padding: '8px 14px', borderRadius: 4,
                                    border: `0.5px solid rgba(26,77,140,0.15)`,
                                    background: C.white, color: page <= 1 ? C.faint : C.navy,
                                    fontFamily: DISPLAY, fontSize: 14,
                                    cursor: page <= 1 ? 'not-allowed' : 'pointer',
                                    opacity: page <= 1 ? 0.4 : 1,
                                }}>
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    Previous
                                </button>

                                {(() => {
                                    const pages = [];
                                    const maxShow = 7;
                                    let start = Math.max(1, page - Math.floor(maxShow / 2));
                                    let end = Math.min(totalPages, start + maxShow - 1);
                                    if (end - start < maxShow - 1) start = Math.max(1, end - maxShow + 1);
                                    if (start > 1) { pages.push(1); if (start > 2) pages.push('...'); }
                                    for (let i = start; i <= end; i++) pages.push(i);
                                    if (end < totalPages) { if (end < totalPages - 1) pages.push('...'); pages.push(totalPages); }
                                    return pages.map((p, i) =>
                                        p === '...' ? (
                                            <span key={`e${i}`} style={{ padding: '0 4px', color: C.muted, fontFamily: DISPLAY, fontSize: 14 }}>…</span>
                                        ) : (
                                            <button key={p} onClick={() => setPage(p)} style={{
                                                width: 40, height: 40, borderRadius: 4,
                                                border: page === p ? 'none' : `0.5px solid rgba(26,77,140,0.15)`,
                                                background: page === p ? C.navy : C.white,
                                                color: page === p ? C.parchment : C.navy,
                                                fontFamily: DISPLAY, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
                                            }}
                                                onMouseEnter={e => { if (page !== p) { e.currentTarget.style.background = C.navy; e.currentTarget.style.color = C.parchment; }}}
                                                onMouseLeave={e => { if (page !== p) { e.currentTarget.style.background = C.white; e.currentTarget.style.color = C.navy; }}}
                                            >{p}</button>
                                        )
                                    );
                                })()}

                                <button disabled={page >= totalPages} onClick={() => setPage(v => v + 1)} style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    padding: '8px 14px', borderRadius: 4,
                                    border: `0.5px solid rgba(26,77,140,0.15)`,
                                    background: C.white, color: page >= totalPages ? C.faint : C.navy,
                                    fontFamily: DISPLAY, fontSize: 14,
                                    cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                                    opacity: page >= totalPages ? 0.4 : 1,
                                }}>
                                    Next
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* ── Mobile floating filter button ── */}
            <button className="auction-mobile-filter-btn" onClick={() => setMobileFiltersOpen(true)} style={{
                position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                zIndex: 100, display: 'none', alignItems: 'center', gap: 8,
                padding: '12px 24px', borderRadius: 4, border: 'none',
                background: C.navy, color: C.parchment,
                fontFamily: BRAND, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: 'pointer', boxShadow: '0 4px 20px rgba(26,77,140,0.3)',
            }}>
                <SlidersHorizontal size={14} /> Filter & Sort
            </button>

            <style>{`
                @keyframes auctionPulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
                @keyframes auctionLiveStrip {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }
                .auction-filter-sidebar::-webkit-scrollbar { width: 3px; }
                .auction-filter-sidebar::-webkit-scrollbar-thumb { background: rgba(26,77,140,0.15); border-radius: 999px; }

                @media (max-width: 860px) {
                    .auction-filter-sidebar { display: none !important; }
                    .auction-mobile-filter-btn { display: inline-flex !important; }
                }
            `}</style>
        </div>
    );
};

export default AuctionListPage;
