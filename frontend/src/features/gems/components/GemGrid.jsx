import { motion } from 'framer-motion';
import GemCard, { GemCardRow } from './GemCard';

const C = {
    parchment: '#F0EDE8',
    navy: '#1A4D8C',
    white: '#FFFFFF',
    muted: '#6B6B7B',
    faint: '#9A9AAB',
    border: 'rgba(26,77,140,0.10)',
};
const BRAND = "'Cinzel', serif";
const DISPLAY = "'Cormorant Garamond', serif";

/* ── Skeleton Card ── */
const SkeletonCard = () => (
    <div style={{
        background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 4,
        overflow: 'hidden',
    }}>
        <div style={{
            paddingBottom: '110%', background: '#E8E5DF',
            animation: 'gemShimmer 1.5s infinite',
        }} />
        <div style={{ padding: '12px 14px 16px' }}>
            <div style={{ height: 10, width: '60%', background: '#E8E5DF', borderRadius: 2, marginBottom: 8, animation: 'gemShimmer 1.5s infinite' }} />
            <div style={{ height: 14, width: '80%', background: '#E8E5DF', borderRadius: 2, marginBottom: 6, animation: 'gemShimmer 1.5s infinite' }} />
            <div style={{ height: 10, width: '40%', background: '#E8E5DF', borderRadius: 2, animation: 'gemShimmer 1.5s infinite' }} />
        </div>
    </div>
);

/* ── Empty State ── */
const EmptyState = ({ onClear, hasFilters }) => (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ opacity: 0.25, margin: '0 auto 16px' }}>
            <path d="M16 22 24 12h16l8 10-16 30-16-30Z" stroke={C.navy} strokeWidth="2.2" />
            <path d="M16 22h32M24 12l8 10 8-10M32 22v30" stroke={C.navy} strokeWidth="2" />
        </svg>
        <h3 style={{ fontFamily: BRAND, fontSize: 20, color: C.navy, margin: '0 0 6px' }}>No gems found</h3>
        <p style={{ fontFamily: DISPLAY, fontSize: 15, color: C.muted, margin: '0 0 20px' }}>
            Try adjusting your filters or search terms
        </p>
        {hasFilters && (
            <button onClick={onClear} style={{
                padding: '9px 22px', borderRadius: 4,
                border: `0.5px solid ${C.navy}`, background: 'transparent',
                color: C.navy, fontFamily: BRAND, fontSize: 11,
                letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
            }}>Clear All Filters</button>
        )}
    </div>
);

/* ── Error State ── */
const ErrorState = ({ onRetry }) => (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 16px' }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke={C.faint} strokeWidth="1.5" fill="rgba(196,137,42,0.1)" />
            <line x1="12" y1="9" x2="12" y2="13" stroke="#C4892A" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="#C4892A" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <h3 style={{ fontFamily: BRAND, fontSize: 20, color: C.navy, margin: '0 0 6px' }}>Failed to load gems</h3>
        <p style={{ fontFamily: DISPLAY, fontSize: 15, color: C.muted, margin: '0 0 20px' }}>
            There was an error loading the catalogue.
        </p>
        <button onClick={onRetry} style={{
            padding: '9px 22px', borderRadius: 4, border: 'none',
            background: C.navy, color: C.parchment,
            fontFamily: BRAND, fontSize: 11, letterSpacing: '0.06em',
            textTransform: 'uppercase', cursor: 'pointer',
        }}>Try Again</button>
    </div>
);

/* ═══════════════════════════════
   GemGrid — Grid / List layout
═══════════════════════════════ */
const GemGrid = ({ gems, loading, error, viewMode = 'grid', onRetry, onClear, hasFilters, onGemClick }) => {
    if (loading) {
        return (
            <>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: 20,
                }}>
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
                <style>{`
                    @keyframes gemShimmer {
                        0% { opacity: 0.5; }
                        50% { opacity: 1; }
                        100% { opacity: 0.5; }
                    }
                `}</style>
            </>
        );
    }

    if (error) return <ErrorState onRetry={onRetry} />;
    if (!gems || gems.length === 0) return <EmptyState onClear={onClear} hasFilters={hasFilters} />;

    if (viewMode === 'list') {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
                {gems.map((gem, i) => (
                    <motion.div key={gem.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                        <GemCardRow gem={gem} onClick={() => onGemClick(gem)} />
                    </motion.div>
                ))}
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 20,
            }}
        >
            {gems.map((gem, i) => (
                <motion.div key={gem.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <GemCard gem={gem} onClick={() => onGemClick(gem)} />
                </motion.div>
            ))}
        </motion.div>
    );
};

export default GemGrid;
