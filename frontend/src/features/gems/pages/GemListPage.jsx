import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, X, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import FilterSidebar from '../../../shared/components/FilterSidebar';
import GemGrid from '../components/GemGrid';
import { getGems, getGemCategories } from '../services/gemsService';

/* ── Design Tokens ── */
const C = {
    parchment: '#F0EDE8',
    navy: '#1A4D8C',
    navyDark: '#1A2B5C',
    gold: '#C4892A',
    white: '#FFFFFF',
    text: '#1A1A2E',
    muted: '#6B6B7B',
    faint: '#9A9AAB',
    border: 'rgba(26,77,140,0.12)',
};
const BRAND = "'Cinzel', serif";
const DISPLAY = "'Cormorant Garamond', serif";

const SORT_OPTIONS = [
    { label: 'Newest First', sort: 'created_at', order: 'desc' },
    { label: 'Oldest First', sort: 'created_at', order: 'asc' },
    { label: 'Price: Low to High', sort: 'buy_now_price', order: 'asc' },
    { label: 'Price: High to Low', sort: 'buy_now_price', order: 'desc' },
    { label: 'Carat: Light to Heavy', sort: 'carat_weight', order: 'asc' },
    { label: 'Carat: Heavy to Light', sort: 'carat_weight', order: 'desc' },
    { label: 'Ending Soonest', sort: 'auction_end', order: 'asc' },
    { label: 'Most Bids', sort: 'bid_count', order: 'desc' },
    { label: 'Top Rated Sellers', sort: 'seller_rating', order: 'desc' },
];

const SHAPE_OPTIONS = [
    'Cushion', 'Fancy', 'Heart', 'Marquise', 'Octagon',
    'Other', 'Oval', 'Pear', 'Round', 'Trillion',
];

const CLARITY_OPTIONS = [
    { value: 'VVS (Eye Clean 1)', label: 'VVS (Eye Clean 1)', sub: 'Best clarity' },
    { value: 'VS (Eye Clean 2)', label: 'VS (Eye Clean 2)' },
    { value: 'SI1 (Slightly Included 1)', label: 'SI1 (Slightly Included 1)' },
    { value: 'SI2 (Slightly Included 2)', label: 'SI2 (Slightly Included 2)' },
    { value: 'I1 (Included 1)', label: 'I1 (Included 1)' },
];

const COLOR_SWATCHES = [
    { value: 'Royal Blue', label: 'Royal Blue', swatch: '#1a4d8c' },
    { value: 'Red', label: 'Red', swatch: '#9b2335' },
    { value: 'Green', label: 'Green', swatch: '#1a6b3c' },
    { value: 'Yellow', label: 'Yellow', swatch: '#d4a017' },
    { value: 'Pink', label: 'Pink', swatch: '#e8a0b4' },
    { value: 'Purple', label: 'Purple', swatch: '#6b4c9a' },
    { value: 'Teal', label: 'Teal', swatch: '#0f6e56' },
    { value: 'Orange', label: 'Orange', swatch: '#d4610f' },
    { value: 'White', label: 'White', swatch: '#f5f5f5' },
];

const ORIGIN_OPTIONS = [
    { label: 'Sri Lanka (Ceylon)', value: 'Sri Lanka (Ceylon)', dot: '#1a4d8c' },
    { label: 'Burma (Myanmar)', value: 'Burma (Myanmar)' },
    { label: 'Madagascar', value: 'Madagascar' },
    { label: 'Thailand', value: 'Thailand' },
    { label: 'Colombia', value: 'Colombia' },
    { label: 'Brazil', value: 'Brazil' },
    { label: 'Zambia', value: 'Zambia' },
    { label: 'Tanzania', value: 'Tanzania' },
    { label: 'India', value: 'India' },
    { label: 'Afghanistan', value: 'Afghanistan' },
    { label: 'Australia', value: 'Australia' },
    { label: 'Other', value: 'Other' },
];

const TREATMENT_OPTIONS = [
    { label: 'Untreated', value: 'Untreated', dot: '#16a34a' },
    { label: 'Heated', value: 'Heated' },
    { label: 'Be Heated', value: 'Be Heated' },
    { label: 'Fracture Filled', value: 'Fracture Filled' },
    { label: 'Irradiated', value: 'Irradiated' },
];

const CARAT_PRESETS = [
    { label: 'Under 1ct', min: '', max: '1' },
    { label: '1-2ct', min: '1', max: '2' },
    { label: '2-5ct', min: '2', max: '5' },
    { label: '5ct+', min: '5', max: '' },
];

const PRICE_PRESETS = [
    { label: 'Under $500', min: '', max: '500' },
    { label: '$500-1k', min: '500', max: '1000' },
    { label: '$1k-5k', min: '1000', max: '5000' },
    { label: '$5k+', min: '5000', max: '' },
];

/* ── Sort Dropdown (custom, not native) ── */
const SortDropdown = ({ sortIndex, onChange }) => {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ position: 'relative' }}>
            <button onClick={() => setOpen(v => !v)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 4, cursor: 'pointer',
                    background: C.white, border: `0.5px solid ${C.border}`,
                    fontFamily: BRAND, fontSize: 11, color: C.navy, letterSpacing: '0.02em',
                }}
            >
                Sort by: {SORT_OPTIONS[sortIndex].label}
                <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {open && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
                    <div style={{
                        position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 50,
                        background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 4,
                        boxShadow: '0 8px 24px rgba(26,77,140,0.1)', minWidth: 200, overflow: 'hidden',
                    }}>
                        {SORT_OPTIONS.map((o, i) => (
                            <button key={i}
                                onClick={() => { onChange(i); setOpen(false); }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    width: '100%', padding: '10px 14px', border: 'none', cursor: 'pointer',
                                    background: 'transparent', fontFamily: DISPLAY, fontSize: 14,
                                    color: sortIndex === i ? C.navy : C.text,
                                    fontWeight: sortIndex === i ? 600 : 400,
                                    transition: 'background 0.1s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,77,140,0.04)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                                {o.label}
                                {sortIndex === i && <span style={{ color: C.gold }}>✓</span>}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   GemListPage — Complete Vostok-inspired Redesign
═══════════════════════════════════════════════════ */
const GemListPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    /* ── All existing state preserved ── */
    const [gems, setGems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [categoryId, setCategoryId] = useState(() => searchParams.get('category') || '');
    const [cut, setCut] = useState(() => searchParams.get('cut') || '');
    const [color, setColor] = useState(() => searchParams.get('color') || '');
    const [clarity, setClarity] = useState(() => searchParams.get('clarity') || '');
    const [origin, setOrigin] = useState(() => searchParams.get('origin') || '');
    const [treatment, setTreatment] = useState(() => searchParams.get('treatment') || '');
    const [minPrice, setMinPrice] = useState(() => searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(() => searchParams.get('max_price') || '');
    const [minCarat, setMinCarat] = useState(() => searchParams.get('min_carat') || '');
    const [maxCarat, setMaxCarat] = useState(() => searchParams.get('max_carat') || '');
    const [sortIndex, setSortIndex] = useState(() => Number(searchParams.get('sort')) || 0);
    const [searchInput, setSearchInput] = useState(() => searchParams.get('q') || '');
    const [search, setSearch] = useState(() => searchParams.get('q') || '');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('gemViewMode') || 'grid');
    const [certifiedOnly, setCertifiedOnly] = useState(false);
    const [verifiedSellers, setVerifiedSellers] = useState(false);

    const LIMIT = 16;

    /* ── Data fetching (unchanged) ── */
    useEffect(() => {
        getGemCategories()
            .then((response) => setCategories(response.data || []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => setSearch(searchInput), 350);
        return () => clearTimeout(timeout);
    }, [searchInput]);

    useEffect(() => {
        localStorage.setItem('gemViewMode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.set('q', search);
        if (categoryId) params.set('category', categoryId);
        if (cut) params.set('cut', cut);
        if (color) params.set('color', color);
        if (clarity) params.set('clarity', clarity);
        if (origin) params.set('origin', origin);
        if (treatment) params.set('treatment', treatment);
        if (minPrice) params.set('min_price', minPrice);
        if (maxPrice) params.set('max_price', maxPrice);
        if (minCarat) params.set('min_carat', minCarat);
        if (maxCarat) params.set('max_carat', maxCarat);
        if (sortIndex) params.set('sort', String(sortIndex));
        if (page > 1) params.set('page', String(page));
        setSearchParams(params, { replace: true });
    }, [search, categoryId, cut, color, clarity, origin, treatment, minPrice, maxPrice, minCarat, maxCarat, sortIndex, page, setSearchParams]);

    useEffect(() => {
        setPage(1);
    }, [categoryId, cut, color, clarity, origin, treatment, minPrice, maxPrice, minCarat, maxCarat, sortIndex, search]);

    const fetchCatalog = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { sort, order } = SORT_OPTIONS[sortIndex];
            const response = await getGems({
                category_id: categoryId || undefined,
                cut: cut || undefined,
                color: color || undefined,
                clarity: clarity || undefined,
                origin: origin || undefined,
                treatment: treatment || undefined,
                min_price: minPrice || undefined,
                max_price: maxPrice || undefined,
                min_carat: minCarat || undefined,
                max_carat: maxCarat || undefined,
                search: search || undefined,
                page,
                limit: LIMIT,
                sort,
                order,
            });
            setGems(response.data || []);
            setTotalPages(response.pagination?.totalPages || 1);
            setTotal(response.pagination?.total || 0);
        } catch (requestError) {
            setError(requestError?.message || 'Failed to load gems.');
        } finally {
            setLoading(false);
        }
    }, [categoryId, cut, color, clarity, origin, treatment, minPrice, maxPrice, minCarat, maxCarat, sortIndex, search, page]);

    useEffect(() => {
        fetchCatalog();
    }, [fetchCatalog]);

    const clearAll = () => {
        setCategoryId(''); setCut(''); setColor(''); setClarity('');
        setOrigin(''); setTreatment(''); setMinPrice(''); setMaxPrice('');
        setMinCarat(''); setMaxCarat(''); setCertifiedOnly(false); setVerifiedSellers(false);
    };

    const activeCount = [categoryId, cut, color, clarity, origin, treatment, minPrice, maxPrice, minCarat, maxCarat, certifiedOnly, verifiedSellers].filter(Boolean).length;

    const caratPresetIdx = CARAT_PRESETS.findIndex(p => p.min === minCarat && p.max === maxCarat);
    const pricePresetIdx = PRICE_PRESETS.findIndex(p => p.min === minPrice && p.max === maxPrice);

    /* ── Filters Body (shared between sidebar & mobile drawer) ── */
    const FiltersContent = () => (
        <>
            <FilterSidebar.Section label="Stone Type" defaultOpen>
                {categories.map((cat) => (
                    <FilterSidebar.Checkbox key={cat.id}
                        checked={categoryId === cat.id}
                        onChange={() => setCategoryId(categoryId === cat.id ? '' : cat.id)}
                        label={cat.name}
                    />
                ))}
            </FilterSidebar.Section>

            <FilterSidebar.Section label="Shape / Cut" defaultOpen={false}>
                {SHAPE_OPTIONS.map(s => (
                    <FilterSidebar.Checkbox key={s}
                        checked={cut === s}
                        onChange={() => setCut(cut === s ? '' : s)}
                        label={s}
                    />
                ))}
            </FilterSidebar.Section>

            <FilterSidebar.Section label="Colour" defaultOpen={false}>
                <FilterSidebar.ColorSwatches
                    colors={COLOR_SWATCHES}
                    active={color}
                    onSelect={setColor}
                />
            </FilterSidebar.Section>

            <FilterSidebar.Section label="Clarity Grade" defaultOpen={false}>
                {CLARITY_OPTIONS.map(o => (
                    <FilterSidebar.Radio key={o.value}
                        checked={clarity === o.value}
                        onChange={() => setClarity(clarity === o.value ? '' : o.value)}
                        label={o.label}
                        sub={o.sub}
                    />
                ))}
            </FilterSidebar.Section>

            <FilterSidebar.Section label="Carat Weight" defaultOpen={false}>
                <FilterSidebar.RangeInputs
                    min={minCarat} max={maxCarat}
                    onMin={setMinCarat} onMax={setMaxCarat}
                    suffix="ct" step={0.1}
                />
                <FilterSidebar.PresetPills
                    presets={CARAT_PRESETS}
                    activeIdx={caratPresetIdx}
                    onSelect={i => { setMinCarat(CARAT_PRESETS[i].min); setMaxCarat(CARAT_PRESETS[i].max); }}
                />
            </FilterSidebar.Section>

            <FilterSidebar.Section label="Price (USD)" defaultOpen={false}>
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

            <FilterSidebar.Section label="Origin / Source" defaultOpen={false}>
                {ORIGIN_OPTIONS.map(o => (
                    <FilterSidebar.Checkbox key={o.value}
                        checked={origin === o.value}
                        onChange={() => setOrigin(origin === o.value ? '' : o.value)}
                        label={o.label}
                        dot={o.dot}
                    />
                ))}
            </FilterSidebar.Section>

            <FilterSidebar.Section label="Treatment" defaultOpen={false}>
                {TREATMENT_OPTIONS.map(o => (
                    <FilterSidebar.Checkbox key={o.value}
                        checked={treatment === o.value}
                        onChange={() => setTreatment(treatment === o.value ? '' : o.value)}
                        label={o.label}
                        dot={o.dot}
                    />
                ))}
            </FilterSidebar.Section>

            <FilterSidebar.Section label="Additional" defaultOpen={false}>
                <FilterSidebar.Toggle
                    checked={certifiedOnly}
                    onChange={() => setCertifiedOnly(v => !v)}
                    label="Certified Gems Only"
                    sub="GIA/GRS verified"
                />
                <FilterSidebar.Toggle
                    checked={verifiedSellers}
                    onChange={() => setVerifiedSellers(v => !v)}
                    label="Verified Sellers Only"
                />
            </FilterSidebar.Section>
        </>
    );

    return (
        <div style={{ minHeight: '100vh', background: C.parchment }}>
            {/* ═══ HERO BANNER ═══ */}
            <div style={{
                position: 'relative', overflow: 'hidden',
                background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDark} 100%)`,
                padding: '80px 40px 60px', textAlign: 'center',
            }}>
                {/* Dot grid decoration */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.08,
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <span style={{
                        fontFamily: BRAND, fontSize: 11, letterSpacing: '0.2em',
                        textTransform: 'uppercase', color: C.gold,
                    }}>GemBid LK</span>
                    <h1 style={{ margin: '12px 0 0', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, lineHeight: 1.1 }}>
                        <span style={{ fontFamily: BRAND, color: '#fff' }}>Precious Gems </span>
                        <em style={{ fontFamily: DISPLAY, fontStyle: 'italic', color: C.gold, fontWeight: 400 }}>Collection</em>
                    </h1>
                    <p style={{
                        margin: '14px auto 0', maxWidth: 500,
                        fontFamily: DISPLAY, fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5,
                    }}>
                        {loading ? 'Loading...' : `Discover ${total.toLocaleString()} certified gems from master cutters across Sri Lanka and beyond.`}
                    </p>
                </div>
            </div>

            {/* ═══ BREADCRUMB ═══ */}
            <div style={{ padding: '12px 40px', maxWidth: 1400, margin: '0 auto' }}>
                <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span onClick={() => navigate('/')} style={{ fontFamily: BRAND, fontSize: 11, color: C.navy, opacity: 0.6, cursor: 'pointer', letterSpacing: '0.02em' }}>Home</span>
                    <span style={{ fontFamily: BRAND, fontSize: 11, color: C.gold }}>/</span>
                    <span style={{ fontFamily: BRAND, fontSize: 11, color: C.navy, opacity: 0.6, letterSpacing: '0.02em' }}>Gems Catalogue</span>
                </nav>
            </div>

            {/* ═══ MAIN CONTENT ═══ */}
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px 60px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>

                {/* ── LEFT: Filter Sidebar (desktop) ── */}
                <aside className="gem-filter-sidebar" style={{
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
                                <div style={{ padding: '0 0 0' }}>
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
                                        Show {total} gem{total !== 1 ? 's' : ''}
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* ── RIGHT: Main Content ── */}
                <main style={{ flex: 1, minWidth: 0 }}>
                    {/* Results header */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                        marginBottom: 24, flexWrap: 'wrap', gap: 12,
                    }}>
                        <div>
                            <h2 style={{ margin: 0, fontFamily: BRAND, fontSize: 18, color: C.navy, fontWeight: 400, letterSpacing: '0.02em' }}>
                                Precious Gems Collection
                            </h2>
                            <p style={{ margin: '4px 0 0', fontFamily: DISPLAY, fontSize: 14, color: C.muted }}>
                                {loading ? 'Loading...' : `${total.toLocaleString()} gems available`}
                                {search && !loading && ` matching '${search}'`}
                                {categoryId && !loading && (() => {
                                    const cat = categories.find(c => c.id === categoryId);
                                    return cat ? ` in ${cat.name}` : '';
                                })()}
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {/* Search */}
                            <div style={{ position: 'relative' }}>
                                <Search size={13} color={C.faint} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                                <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                                    placeholder="Search gems..."
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
                            <SortDropdown sortIndex={sortIndex} onChange={setSortIndex} />
                        </div>
                    </div>

                    {/* "Showing X–Y of Z" */}
                    {!loading && !error && gems.length > 0 && (
                        <p style={{
                            margin: '0 0 16px', fontFamily: BRAND, fontSize: 11, color: C.muted,
                            letterSpacing: '0.02em', textAlign: 'center',
                        }}>
                            Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total.toLocaleString()} gems
                        </p>
                    )}

                    {/* Grid / List / Loading / Error / Empty */}
                    <GemGrid
                        gems={gems}
                        loading={loading}
                        error={error}
                        viewMode={viewMode}
                        onRetry={fetchCatalog}
                        onClear={clearAll}
                        hasFilters={activeCount > 0}
                        onGemClick={(gem) => navigate(`/gem/${gem.id}`)}
                    />

                    {/* ═══ PAGINATION ═══ */}
                    {totalPages > 1 && !loading && (
                        <div style={{ marginTop: 48, textAlign: 'center' }}>
                            <p style={{ fontFamily: BRAND, fontSize: 11, color: C.muted, margin: '0 0 12px', letterSpacing: '0.02em' }}>
                                Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total.toLocaleString()} gems
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                                {/* Previous */}
                                <button disabled={page <= 1} onClick={() => setPage(v => v - 1)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        padding: '8px 14px', borderRadius: 4,
                                        border: `0.5px solid rgba(26,77,140,0.15)`,
                                        background: C.white, color: page <= 1 ? C.faint : C.navy,
                                        fontFamily: DISPLAY, fontSize: 14,
                                        cursor: page <= 1 ? 'not-allowed' : 'pointer',
                                        opacity: page <= 1 ? 0.4 : 1,
                                    }}
                                >
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    Previous
                                </button>

                                {/* Page numbers */}
                                {(() => {
                                    const pages = [];
                                    const maxShow = 7;
                                    let start = Math.max(1, page - Math.floor(maxShow / 2));
                                    let end = Math.min(totalPages, start + maxShow - 1);
                                    if (end - start < maxShow - 1) start = Math.max(1, end - maxShow + 1);

                                    if (start > 1) {
                                        pages.push(1);
                                        if (start > 2) pages.push('...');
                                    }
                                    for (let i = start; i <= end; i++) pages.push(i);
                                    if (end < totalPages) {
                                        if (end < totalPages - 1) pages.push('...');
                                        pages.push(totalPages);
                                    }

                                    return pages.map((p, i) =>
                                        p === '...' ? (
                                            <span key={`e${i}`} style={{ padding: '0 4px', color: C.muted, fontFamily: DISPLAY, fontSize: 14 }}>…</span>
                                        ) : (
                                            <button key={p} onClick={() => setPage(p)}
                                                style={{
                                                    width: 40, height: 40, borderRadius: 4,
                                                    border: page === p ? 'none' : `0.5px solid rgba(26,77,140,0.15)`,
                                                    background: page === p ? C.navy : C.white,
                                                    color: page === p ? C.parchment : C.navy,
                                                    fontFamily: DISPLAY, fontSize: 14,
                                                    cursor: 'pointer', transition: 'all 0.15s',
                                                }}
                                                onMouseEnter={e => { if (page !== p) { e.currentTarget.style.background = C.navy; e.currentTarget.style.color = C.parchment; } }}
                                                onMouseLeave={e => { if (page !== p) { e.currentTarget.style.background = C.white; e.currentTarget.style.color = C.navy; } }}
                                            >{p}</button>
                                        )
                                    );
                                })()}

                                {/* Next */}
                                <button disabled={page >= totalPages} onClick={() => setPage(v => v + 1)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        padding: '8px 14px', borderRadius: 4,
                                        border: `0.5px solid rgba(26,77,140,0.15)`,
                                        background: C.white, color: page >= totalPages ? C.faint : C.navy,
                                        fontFamily: DISPLAY, fontSize: 14,
                                        cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                                        opacity: page >= totalPages ? 0.4 : 1,
                                    }}
                                >
                                    Next
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* ── Mobile floating filter button ── */}
            <button
                className="gem-mobile-filter-btn"
                onClick={() => setMobileFiltersOpen(true)}
                style={{
                    position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 100, display: 'none',
                    alignItems: 'center', gap: 8,
                    padding: '12px 24px', borderRadius: 4, border: 'none',
                    background: C.navy, color: C.parchment,
                    fontFamily: BRAND, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
                    cursor: 'pointer', boxShadow: '0 4px 20px rgba(26,77,140,0.3)',
                }}
            >
                <SlidersHorizontal size={14} />
                Filter & Sort
                {activeCount > 0 && (
                    <span style={{
                        width: 18, height: 18, borderRadius: '50%', background: C.gold,
                        color: C.white, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{activeCount}</span>
                )}
            </button>

            <style>{`
                @keyframes gemPulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                .gem-filter-sidebar::-webkit-scrollbar { width: 3px; }
                .gem-filter-sidebar::-webkit-scrollbar-thumb { background: rgba(26,77,140,0.15); border-radius: 999px; }

                @media (max-width: 860px) {
                    .gem-filter-sidebar { display: none !important; }
                    .gem-mobile-filter-btn { display: inline-flex !important; }
                }
                @media (max-width: 768px) {
                    .gem-filter-sidebar { display: none !important; }
                    .gem-mobile-filter-btn { display: inline-flex !important; }
                }
            `}</style>
        </div>
    );
};

export default GemListPage;
