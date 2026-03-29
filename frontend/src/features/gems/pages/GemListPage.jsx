import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, X, SlidersHorizontal, LayoutGrid, List, Clock, Award, Gavel } from 'lucide-react';
import SellerRatingBadge from '../../reviews/components/SellerRatingBadge';
import { getGems, getGemCategories } from '../services/gemsService';

const T = {
    bg: '#FDFAF6',
    bgSoft: '#F5EFE6',
    white: '#FFFFFF',
    gold: '#C9A84C',
    goldSoft: 'rgba(201,168,76,0.12)',
    goldBorder: 'rgba(201,168,76,0.28)',
    navy: '#1B3A6B',
    sapphire: '#2E6DB4',
    text: '#1A1A2E',
    muted: '#6B6B7B',
    faint: '#9A9AAB',
    border: '#E8E4DC',
    green: '#1A7A50',
    greenSoft: 'rgba(26,122,80,0.1)',
    shadow: '0 6px 24px rgba(26,26,46,0.08)',
    shadowHover: '0 16px 44px rgba(26,26,46,0.14)',
};

const FONT_SERIF = "'Cormorant Garamond', serif";
const FONT_DISPLAY = "'Cinzel', serif";
const FONT_BODY = "'Jost', sans-serif";

const SORT_OPTIONS = [
    { label: 'Newest First', sort: 'created_at', order: 'desc' },
    { label: 'Oldest First', sort: 'created_at', order: 'asc' },
    { label: 'Price: Low to High', sort: 'buy_now_price', order: 'asc' },
    { label: 'Price: High to Low', sort: 'buy_now_price', order: 'desc' },
    { label: 'Carat: Low to High', sort: 'carat_weight', order: 'asc' },
    { label: 'Carat: High to Low', sort: 'carat_weight', order: 'desc' },
    { label: 'Ending Soonest', sort: 'auction_end', order: 'asc' },
    { label: 'Most Bids', sort: 'bid_count', order: 'desc' },
];

const SHAPE_OPTIONS = [
    'Round', 'Oval', 'Cushion', 'Pear', 'Emerald', 'Marquise',
    'Princess', 'Radiant', 'Asscher', 'Heart', 'Trillion', 'Cabochon',
];

const CLARITY_OPTIONS = [
    { value: 'Eye Clean', label: 'Eye Clean' },
    { value: 'Slightly Included (SI)', label: 'Slightly Included (SI)' },
    { value: 'Moderately Included (MI)', label: 'Moderately Included (MI)' },
    { value: 'Heavily Included (HI)', label: 'Heavily Included (HI)' },
    { value: 'Opaque', label: 'Opaque' },
];

const COLOR_OPTIONS = [
    { label: 'Blue', swatch: '#3B82F6' },
    { label: 'Royal Blue', swatch: '#1D4ED8' },
    { label: 'Cornflower Blue', swatch: '#6495ED' },
    { label: 'Padparadscha', swatch: '#FF7F50' },
    { label: 'Red', swatch: '#EF4444' },
    { label: 'Pigeon Blood', swatch: '#B91C1C' },
    { label: 'Pink', swatch: '#EC4899' },
    { label: 'Green', swatch: '#22C55E' },
    { label: 'Muzo Green', swatch: '#15803D' },
    { label: 'Yellow', swatch: '#EAB308' },
    { label: 'Orange', swatch: '#F97316' },
    { label: 'Purple', swatch: '#A855F7' },
    { label: 'White', swatch: '#E2E8F0', border: '#CBD5E1' },
    { label: 'Black', swatch: '#0F172A' },
];

const ORIGIN_OPTIONS = [
    'Sri Lanka', 'Myanmar', 'Colombia', 'Thailand', 'Madagascar',
    'Tanzania', 'Brazil', 'India', 'Afghanistan', 'Mozambique',
    'Kenya', 'Zambia', 'Australia',
];

const TREATMENT_OPTIONS = [
    { label: 'Unheated / None', value: 'None' },
    { label: 'Heat Treated', value: 'Heat Treated' },
    { label: 'Fracture Filled', value: 'Fracture Filled' },
    { label: 'Irradiation', value: 'Irradiation' },
];

const inputStyle = {
    width: '100%',
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    color: T.text,
    fontSize: '0.82rem',
    padding: '9px 12px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: FONT_BODY,
};

const DiamondPlaceholder = ({ size = 60, color = T.gold, opacity = 0.28 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" style={{ opacity }}>
        <path d="M16 22 24 12h16l8 10-16 30-16-30Z" stroke={color} strokeWidth="2.2" />
        <path d="M16 22h32M24 12l8 10 8-10M32 22v30" stroke={color} strokeWidth="2" />
    </svg>
);

const StatusIcon = ({ type }) => {
    if (type === 'error') {
        return (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="#B45309" strokeWidth="1.8" />
                <path d="M12 7v6" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="16.5" r="1" fill="#B45309" />
            </svg>
        );
    }

    return <DiamondPlaceholder size={54} color={T.gold} opacity={0.55} />;
};

const Chip = ({ label, accent = false }) => (
    <span
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 8px',
            borderRadius: 999,
            border: `1px solid ${accent ? 'rgba(46,109,180,0.18)' : T.border}`,
            background: accent ? 'rgba(46,109,180,0.08)' : T.bgSoft,
            color: accent ? T.sapphire : T.muted,
            fontSize: '0.68rem',
            fontWeight: 500,
            fontFamily: FONT_BODY,
        }}
    >
        {label}
    </span>
);

const OptionRow = ({ label, value, active, onSelect, swatch, swatchBorder }) => (
    <button
        onClick={() => onSelect(active ? '' : value)}
        style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'none',
            border: 'none',
            padding: '5px 0',
            cursor: 'pointer',
            textAlign: 'left',
        }}
    >
        <span
            style={{
                width: 15,
                height: 15,
                borderRadius: 4,
                border: active ? `2px solid ${T.gold}` : `1.5px solid ${T.border}`,
                background: active ? T.gold : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}
        >
            {active && (
                <svg width="8" height="8" viewBox="0 0 10 10">
                    <polyline
                        points="1.5,5 4,7.5 8.5,2"
                        stroke="#fff"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </span>
        {swatch && (
            <span
                style={{
                    width: 11,
                    height: 11,
                    borderRadius: '50%',
                    background: swatch,
                    border: `1px solid ${swatchBorder || 'rgba(0,0,0,0.08)'}`,
                    flexShrink: 0,
                }}
            />
        )}
        <span
            style={{
                color: active ? T.navy : T.muted,
                fontSize: '0.8rem',
                fontWeight: active ? 600 : 400,
                fontFamily: FONT_BODY,
            }}
        >
            {label}
        </span>
    </button>
);

const RangeInputs = ({ minValue, maxValue, onMin, onMax, prefix = '', step = 1 }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, position: 'relative' }}>
            {prefix && (
                <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: T.faint, fontSize: '0.72rem', fontFamily: FONT_BODY }}>
                    {prefix}
                </span>
            )}
            <input
                type="number"
                min="0"
                step={step}
                value={minValue}
                placeholder="Min"
                onChange={(event) => onMin(event.target.value)}
                style={{ ...inputStyle, paddingLeft: prefix ? 20 : 12 }}
            />
        </div>
        <span style={{ color: T.faint, fontSize: '0.75rem' }}>-</span>
        <div style={{ flex: 1, position: 'relative' }}>
            {prefix && (
                <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: T.faint, fontSize: '0.72rem', fontFamily: FONT_BODY }}>
                    {prefix}
                </span>
            )}
            <input
                type="number"
                min="0"
                step={step}
                value={maxValue}
                placeholder="Max"
                onChange={(event) => onMax(event.target.value)}
                style={{ ...inputStyle, paddingLeft: prefix ? 20 : 12 }}
            />
        </div>
    </div>
);

const FilterSection = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div style={{ borderBottom: `1px solid ${T.border}` }}>
            <button
                onClick={() => setOpen((value) => !value)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: T.navy,
                    fontFamily: FONT_DISPLAY,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                }}
            >
                {title}
                {open ? <ChevronUp size={14} color={T.gold} /> : <ChevronDown size={14} color={T.muted} />}
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ paddingBottom: 14 }}>{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AuctionBadge = ({ auction }) => {
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
        if (!auction?.end_time) return;
        const tick = () => {
            const diff = new Date(auction.end_time) - Date.now();
            if (diff <= 0) { setTimeLeft('Ended'); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            setTimeLeft(h > 0 ? `${h}h ${m}m` : `${m}m`);
        };
        tick();
        const id = setInterval(tick, 60000);
        return () => clearInterval(id);
    }, [auction?.end_time]);
    if (!timeLeft) return null;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: 'rgba(26,122,80,0.12)', border: '1px solid rgba(26,122,80,0.28)', color: '#1A7A50', fontSize: '0.56rem', fontWeight: 700, fontFamily: FONT_DISPLAY, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <Clock size={10} /> {timeLeft}
        </span>
    );
};

const GemCard = ({ gem, onClick, listView }) => {
    const [hovered, setHovered] = useState(false);
    const price = gem.buy_now_price || gem.predicted_price;
    const isUnheated = gem.treatment === 'None' || gem.treatment == null;
    // Supabase returns a single object (not array) when FK has UNIQUE constraint
    const auctionsArr = gem.auctions ? (Array.isArray(gem.auctions) ? gem.auctions : [gem.auctions]) : [];
    const activeAuction = auctionsArr.find(a => a.status === 'active');
    const certsArr = gem.certificates ? (Array.isArray(gem.certificates) ? gem.certificates : [gem.certificates]) : [];
    const certVerified = certsArr.some(c => c.status === 'verified');
    const certPending = !certVerified && certsArr.some(c => c.status === 'pending');
    const bidCount = activeAuction?.bid_count || 0;

    if (listView) {
        return (
            <div
                onClick={onClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    background: T.white,
                    border: `1px solid ${hovered ? T.goldBorder : T.border}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: hovered ? T.shadowHover : T.shadow,
                    transition: 'all 0.22s ease',
                    display: 'flex',
                    gap: 0,
                }}
            >
                <div style={{ width: 180, minHeight: 140, flexShrink: 0, background: `radial-gradient(circle at 60% 35%, rgba(201,168,76,0.11) 0%, ${T.bgSoft} 100%)`, position: 'relative', overflow: 'hidden' }}>
                    {gem.images?.find(u => !u.startsWith('model:')) ? (
                        <img src={gem.images.find(u => !u.startsWith('model:'))} alt={gem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DiamondPlaceholder size={48} color={T.gold} opacity={0.28} />
                        </div>
                    )}
                </div>
                <div style={{ flex: 1, padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, color: T.navy, fontFamily: FONT_SERIF, fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.2 }}>{gem.title}</h3>
                        {certVerified && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 6, background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.18)', color: '#16a34a', fontSize: '0.52rem', fontWeight: 700, fontFamily: FONT_DISPLAY, letterSpacing: '0.05em', textTransform: 'uppercase' }}><Award size={9} /> Certified</span>}
                        {certPending && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 6, background: 'rgba(180,83,9,0.08)', border: '1px solid rgba(180,83,9,0.18)', color: '#92400e', fontSize: '0.52rem', fontWeight: 700, fontFamily: FONT_DISPLAY, letterSpacing: '0.05em', textTransform: 'uppercase' }}><Award size={9} /> Cert Pending</span>}
                        {activeAuction && <AuctionBadge auction={activeAuction} />}
                        {bidCount > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 6, background: T.goldSoft, border: `1px solid ${T.goldBorder}`, color: '#8A640D', fontSize: '0.52rem', fontWeight: 700, fontFamily: FONT_DISPLAY, letterSpacing: '0.05em', textTransform: 'uppercase' }}><Gavel size={9} /> {bidCount} bids</span>}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {gem.carat_weight && <Chip label={`${gem.carat_weight} ct`} />}
                        {gem.cut && <Chip label={gem.cut} />}
                        {gem.color && <Chip label={gem.color} accent />}
                        {gem.origin && <Chip label={gem.origin} />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
                        {price && <span style={{ color: T.gold, fontFamily: FONT_SERIF, fontSize: '1.15rem', fontWeight: 700 }}>${Number(price).toLocaleString()}</span>}
                        {gem.predicted_price && gem.buy_now_price && <span style={{ color: T.faint, fontSize: '0.72rem', fontFamily: FONT_BODY }}>AI est. ${Number(gem.predicted_price).toLocaleString()}</span>}
                        {gem.seller_id && <SellerRatingBadge sellerId={gem.seller_id} />}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: T.white,
                border: `1px solid ${hovered ? T.goldBorder : T.border}`,
                borderRadius: 14,
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: hovered ? T.shadowHover : T.shadow,
                transition: 'all 0.22s ease',
                transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
            }}
        >
            <div
                style={{
                    height: 220,
                    background: `radial-gradient(circle at 60% 35%, rgba(201,168,76,0.11) 0%, ${T.bgSoft} 100%)`,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {gem.images?.find(u => !u.startsWith('model:')) ? (
                    <img
                        src={gem.images.find(u => !u.startsWith('model:'))}
                        alt={gem.title}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: hovered ? 'scale(1.05)' : 'scale(1)',
                            transition: 'transform 0.35s ease',
                        }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DiamondPlaceholder size={72} color={T.gold} opacity={0.28} />
                    </div>
                )}
                {gem.category?.name && (
                    <span
                        style={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            background: 'rgba(255,255,255,0.92)',
                            border: `1px solid ${T.goldBorder}`,
                            borderRadius: 6,
                            padding: '4px 9px',
                            color: T.navy,
                            fontFamily: FONT_DISPLAY,
                            fontSize: '0.56rem',
                            fontWeight: 700,
                            letterSpacing: '0.07em',
                            textTransform: 'uppercase',
                        }}
                    >
                        {gem.category.name}
                    </span>
                )}
                {isUnheated && (
                    <span
                        style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            background: T.greenSoft,
                            border: `1px solid rgba(26,122,80,0.28)`,
                            borderRadius: 6,
                            padding: '4px 9px',
                            color: T.green,
                            fontFamily: FONT_DISPLAY,
                            fontSize: '0.52rem',
                            fontWeight: 700,
                            letterSpacing: '0.07em',
                            textTransform: 'uppercase',
                        }}
                    >
                        Unheated
                    </span>
                )}
                {certVerified && (
                    <span style={{ position: 'absolute', bottom: 10, left: 10, display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(22,163,74,0.22)', color: '#16a34a', fontSize: '0.52rem', fontWeight: 700, fontFamily: FONT_DISPLAY, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        <Award size={9} /> Certified
                    </span>
                )}
                {certPending && (
                    <span style={{ position: 'absolute', bottom: 10, left: 10, display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(180,83,9,0.22)', color: '#92400e', fontSize: '0.52rem', fontWeight: 700, fontFamily: FONT_DISPLAY, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        <Award size={9} /> Cert Pending
                    </span>
                )}
                {activeAuction && (
                    <span style={{ position: 'absolute', bottom: 10, right: 10 }}>
                        <AuctionBadge auction={activeAuction} />
                    </span>
                )}
            </div>

            <div style={{ padding: '15px 16px 18px' }}>
                <h3
                    style={{
                        margin: 0,
                        color: T.navy,
                        fontFamily: FONT_SERIF,
                        fontSize: '1.12rem',
                        fontWeight: 700,
                        lineHeight: 1.2,
                    }}
                >
                    {gem.title}
                </h3>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 9 }}>
                    {gem.carat_weight && <Chip label={`${gem.carat_weight} ct`} />}
                    {gem.cut && <Chip label={gem.cut} />}
                    {gem.clarity && <Chip label={gem.clarity} />}
                    {gem.color && <Chip label={gem.color} accent />}
                </div>

                {gem.origin && (
                    <div style={{ marginTop: 8, color: T.muted, fontSize: '0.74rem', fontFamily: FONT_BODY }}>
                        Origin: {gem.origin}
                    </div>
                )}

                {(bidCount > 0 || gem.seller_id) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                        {bidCount > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 6, background: T.goldSoft, border: `1px solid ${T.goldBorder}`, color: '#8A640D', fontSize: '0.52rem', fontWeight: 700, fontFamily: FONT_DISPLAY, letterSpacing: '0.05em', textTransform: 'uppercase' }}><Gavel size={9} /> {bidCount} bids</span>}
                        {gem.seller_id && <SellerRatingBadge sellerId={gem.seller_id} />}
                    </div>
                )}

                <div style={{ height: 1, background: T.border, margin: '13px 0 12px' }} />

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                        {price ? (
                            <>
                                <div style={{ color: T.faint, fontFamily: FONT_DISPLAY, fontSize: '0.54rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    {gem.buy_now_price ? 'Price' : 'Est. Value'}
                                </div>
                                <div style={{ color: T.gold, fontFamily: FONT_SERIF, fontSize: '1.45rem', fontWeight: 700, lineHeight: 1.1 }}>
                                    ${Number(price).toLocaleString()}
                                </div>
                                {gem.predicted_price && gem.buy_now_price && (
                                    <div style={{ color: T.faint, fontSize: '0.68rem', fontFamily: FONT_BODY, marginTop: 2 }}>
                                        AI est. ${Number(gem.predicted_price).toLocaleString()}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ color: T.muted, fontSize: '0.8rem', fontFamily: FONT_BODY }}>
                                Contact Seller
                            </div>
                        )}
                    </div>

                    <button
                        onClick={(event) => {
                            event.stopPropagation();
                            onClick();
                        }}
                        style={{
                            padding: '8px 13px',
                            borderRadius: 8,
                            border: `1.5px solid ${T.navy}`,
                            background: hovered ? T.navy : 'transparent',
                            color: hovered ? T.white : T.navy,
                            fontFamily: FONT_DISPLAY,
                            fontSize: '0.58rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            transition: 'all 0.18s ease',
                        }}
                    >
                        View
                    </button>
                </div>
            </div>
        </div>
    );
};

const SkeletonCard = () => (
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: T.shadow }}>
        <div style={{ height: 220, background: T.bgSoft, animation: 'gemPulse 1.4s ease-in-out infinite' }} />
        <div style={{ padding: '15px 16px 18px' }}>
            <div style={{ height: 18, width: '68%', background: T.bgSoft, borderRadius: 4, animation: 'gemPulse 1.4s ease-in-out infinite' }} />
            <div style={{ height: 12, width: '48%', background: T.bgSoft, borderRadius: 4, marginTop: 10, animation: 'gemPulse 1.4s ease-in-out infinite' }} />
            <div style={{ height: 12, width: '35%', background: T.bgSoft, borderRadius: 4, marginTop: 8, animation: 'gemPulse 1.4s ease-in-out infinite' }} />
        </div>
    </div>
);

const PageButton = ({ children, disabled, onClick }) => (
    <button
        disabled={disabled}
        onClick={onClick}
        style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            background: disabled ? T.bgSoft : T.white,
            color: disabled ? T.faint : T.muted,
            fontFamily: FONT_BODY,
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer',
        }}
    >
        {children}
    </button>
);


const GemListPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

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

    const LIMIT = 16;

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
        setCategoryId('');
        setCut('');
        setColor('');
        setClarity('');
        setOrigin('');
        setTreatment('');
        setMinPrice('');
        setMaxPrice('');
        setMinCarat('');
        setMaxCarat('');
    };

    const activeCount = [categoryId, cut, color, clarity, origin, treatment, minPrice, maxPrice, minCarat, maxCarat].filter(Boolean).length;

    const activeTags = [
        ...(categoryId ? [{ label: categories.find((item) => item.id === categoryId)?.name || 'Stone Type', clear: () => setCategoryId('') }] : []),
        ...(cut ? [{ label: cut, clear: () => setCut('') }] : []),
        ...(color ? [{ label: color, clear: () => setColor('') }] : []),
        ...(clarity ? [{ label: clarity, clear: () => setClarity('') }] : []),
        ...(origin ? [{ label: origin, clear: () => setOrigin('') }] : []),
        ...(treatment ? [{ label: treatment, clear: () => setTreatment('') }] : []),
        ...((minPrice || maxPrice) ? [{ label: `$${minPrice || '0'}-$${maxPrice || 'max'}`, clear: () => { setMinPrice(''); setMaxPrice(''); } }] : []),
        ...((minCarat || maxCarat) ? [{ label: `${minCarat || '0'}-${maxCarat || 'max'} ct`, clear: () => { setMinCarat(''); setMaxCarat(''); } }] : []),
    ];

    const FiltersBody = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, marginBottom: 4, borderBottom: `2px solid ${T.goldBorder}` }}>
                <span style={{ color: T.navy, fontFamily: FONT_DISPLAY, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    Filters
                </span>
                {activeCount > 0 && (
                    <button
                        onClick={clearAll}
                        style={{ background: T.goldSoft, border: `1px solid ${T.goldBorder}`, color: '#8A640D', borderRadius: 6, padding: '4px 9px', fontSize: '0.72rem', fontWeight: 600, fontFamily: FONT_BODY, cursor: 'pointer' }}
                    >
                        Clear ({activeCount})
                    </button>
                )}
            </div>

            <FilterSection title="Stone Type">
                {categories.map((category) => (
                    <OptionRow key={category.id} label={category.name} value={category.id} active={categoryId === category.id} onSelect={setCategoryId} />
                ))}
            </FilterSection>

            <FilterSection title="Shape / Cut" defaultOpen={false}>
                {SHAPE_OPTIONS.map((shape) => (
                    <OptionRow key={shape} label={shape} value={shape} active={cut === shape} onSelect={setCut} />
                ))}
            </FilterSection>

            <FilterSection title="Colour" defaultOpen={false}>
                {COLOR_OPTIONS.map((option) => (
                    <OptionRow key={option.label} label={option.label} value={option.label} active={color === option.label} onSelect={setColor} swatch={option.swatch} swatchBorder={option.border} />
                ))}
            </FilterSection>

            <FilterSection title="Clarity Grade" defaultOpen={false}>
                {CLARITY_OPTIONS.map((option) => (
                    <OptionRow key={option.value} label={option.label} value={option.value} active={clarity === option.value} onSelect={setClarity} />
                ))}
            </FilterSection>

            <FilterSection title="Carat Weight" defaultOpen={false}>
                <RangeInputs minValue={minCarat} maxValue={maxCarat} onMin={setMinCarat} onMax={setMaxCarat} step={0.1} />
            </FilterSection>

            <FilterSection title="Price (USD)" defaultOpen={false}>
                <RangeInputs minValue={minPrice} maxValue={maxPrice} onMin={setMinPrice} onMax={setMaxPrice} prefix="$" />
            </FilterSection>

            <FilterSection title="Origin / Source" defaultOpen={false}>
                {ORIGIN_OPTIONS.map((item) => (
                    <OptionRow key={item} label={item} value={item} active={origin === item} onSelect={setOrigin} />
                ))}
            </FilterSection>

            <FilterSection title="Treatment" defaultOpen={false}>
                {TREATMENT_OPTIONS.map((option) => (
                    <OptionRow key={option.value} label={option.label} value={option.value} active={treatment === option.value} onSelect={setTreatment} />
                ))}
            </FilterSection>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: FONT_BODY }}>

            <div style={{ maxWidth: 1380, margin: '0 auto', padding: '24px 28px 0' }}>
                <nav style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.muted, fontSize: '0.74rem', fontFamily: FONT_BODY }}>
                    <span onClick={() => navigate('/')} style={{ color: T.sapphire, cursor: 'pointer' }}>Home</span>
                    <span>/</span>
                    <span style={{ color: T.text, fontWeight: 600 }}>Gems Catalogue</span>
                </nav>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginTop: 16 }}>
                    <div>
                        <h1 style={{ margin: 0, color: T.navy, fontFamily: FONT_SERIF, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 700, lineHeight: 1 }}>
                            Precious Gems <em style={{ color: T.gold, fontStyle: 'italic' }}>Collection</em>
                        </h1>
                        <p style={{ margin: '6px 0 0', color: T.muted, fontSize: '0.82rem' }}>
                            {loading ? 'Loading...' : `${total.toLocaleString()} gems available`}
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={14} color={T.muted} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search gems..." style={{ ...inputStyle, paddingLeft: 31, width: 220 }} />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <select value={sortIndex} onChange={(event) => setSortIndex(Number(event.target.value))} style={{ ...inputStyle, width: 190, appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', paddingRight: 34 }}>
                                {SORT_OPTIONS.map((option, index) => (
                                    <option key={index} value={index}>{option.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} color={T.muted} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>

                        <button
                            className="gem-mobile-filter-toggle"
                            onClick={() => setMobileFiltersOpen(true)}
                            style={{ display: 'none', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 8, border: `1px solid ${activeCount ? T.goldBorder : T.border}`, background: activeCount ? T.goldSoft : T.white, color: activeCount ? T.navy : T.muted, fontFamily: FONT_DISPLAY, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}
                        >
                            <SlidersHorizontal size={13} /> Filters{activeCount > 0 ? ` (${activeCount})` : ''}
                        </button>

                        <div style={{ display: 'flex', border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden' }}>
                            <button onClick={() => setViewMode('grid')} style={{ padding: '8px 10px', background: viewMode === 'grid' ? T.navy : T.white, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <LayoutGrid size={14} color={viewMode === 'grid' ? T.white : T.muted} />
                            </button>
                            <button onClick={() => setViewMode('list')} style={{ padding: '8px 10px', background: viewMode === 'list' ? T.navy : T.white, border: 'none', borderLeft: `1px solid ${T.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <List size={14} color={viewMode === 'list' ? T.white : T.muted} />
                            </button>
                        </div>
                    </div>
                </div>

                {activeTags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 14 }}>
                        {activeTags.map((tag, index) => (
                            <span key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, border: `1px solid ${T.goldBorder}`, background: T.goldSoft, color: '#8A640D', fontSize: '0.74rem', fontWeight: 600, fontFamily: FONT_BODY }}>
                                {tag.label}
                                <button onClick={tag.clear} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#8A640D', display: 'flex', alignItems: 'center' }}>
                                    <X size={11} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ maxWidth: 1380, margin: '20px auto 60px', padding: '0 28px', display: 'flex', alignItems: 'flex-start', gap: 24 }}>
                <aside className="gem-desktop-sidebar" style={{ width: 248, flexShrink: 0, background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: '18px 20px', position: 'sticky', top: 80, maxHeight: 'calc(100vh - 96px)', overflowY: 'auto', boxShadow: T.shadow }}>
                    <FiltersBody />
                </aside>

                <AnimatePresence>
                    {mobileFiltersOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileFiltersOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.36)', zIndex: 200 }} />
                            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.22 }} style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 300, background: T.white, zIndex: 201, overflowY: 'auto', padding: 20, boxShadow: '4px 0 36px rgba(0,0,0,0.16)' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                                    <button onClick={() => setMobileFiltersOpen(false)} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: T.bgSoft, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <X size={16} color={T.muted} />
                                    </button>
                                </div>
                                <FiltersBody />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <main style={{ flex: 1, minWidth: 0 }}>
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 20 }}>
                            {Array.from({ length: 8 }).map((_, index) => (
                                <SkeletonCard key={index} />
                            ))}
                        </div>
                    ) : error ? (
                        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: '64px 20px', textAlign: 'center' }}>
                            <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}><StatusIcon type="error" /></div>
                            <div style={{ color: '#B45309', fontWeight: 600, fontFamily: FONT_BODY }}>{error}</div>
                            <button onClick={fetchCatalog} style={{ marginTop: 16, padding: '9px 22px', borderRadius: 8, border: 'none', background: T.navy, color: T.white, fontFamily: FONT_DISPLAY, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', cursor: 'pointer' }}>
                                Try Again
                            </button>
                        </div>
                    ) : gems.length === 0 ? (
                        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: '72px 20px', textAlign: 'center' }}>
                            <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }}><StatusIcon type="empty" /></div>
                            <div style={{ color: T.navy, fontFamily: FONT_SERIF, fontSize: '1.55rem', fontWeight: 700 }}>No gems found</div>
                            <div style={{ color: T.muted, fontFamily: FONT_BODY, fontSize: '0.84rem', marginTop: 8 }}>Try adjusting your filters or search terms.</div>
                            {activeCount > 0 && (
                                <button onClick={clearAll} style={{ marginTop: 18, padding: '9px 22px', borderRadius: 8, border: `1px solid ${T.border}`, background: 'transparent', color: T.muted, fontFamily: FONT_DISPLAY, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: 12, color: T.muted, fontSize: '0.78rem', fontFamily: FONT_BODY }}>
                                Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total.toLocaleString()} gems
                            </div>
                            {viewMode === 'list' ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {gems.map((gem, index) => (
                                        <motion.div key={gem.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }}>
                                            <GemCard gem={gem} listView onClick={() => navigate(`/gem/${gem.id}`)} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 20 }}>
                                    {gems.map((gem, index) => (
                                        <motion.div key={gem.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                                            <GemCard gem={gem} onClick={() => navigate(`/gem/${gem.id}`)} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </>
                    )}

                    {totalPages > 1 && !loading && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 40 }}>
                            <PageButton disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</PageButton>
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, index) => index + 1).map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    onClick={() => setPage(pageNumber)}
                                    style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${page === pageNumber ? T.gold : T.border}`, background: page === pageNumber ? T.gold : T.white, color: page === pageNumber ? T.white : T.muted, fontFamily: FONT_BODY, fontSize: '0.8rem', fontWeight: page === pageNumber ? 700 : 500, cursor: 'pointer' }}
                                >
                                    {pageNumber}
                                </button>
                            ))}
                            <PageButton disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</PageButton>
                        </div>
                    )}
                </main>
            </div>

            <style>{`
                @keyframes gemPulse {
                    0%, 100% { opacity: 0.58; }
                    50% { opacity: 1; }
                }

                .gem-desktop-sidebar::-webkit-scrollbar {
                    width: 4px;
                }

                .gem-desktop-sidebar::-webkit-scrollbar-thumb {
                    background: ${T.border};
                    border-radius: 999px;
                }

                @media (max-width: 860px) {
                    .gem-desktop-sidebar {
                        display: none !important;
                    }

                    .gem-mobile-filter-toggle {
                        display: inline-flex !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default GemListPage;
