import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SellerRatingBadge from '../../reviews/components/SellerRatingBadge';
import { useCurrency } from '../../../context/CurrencyContext';
import AddToWatchlistButton from '../../watchlist/components/AddToWatchlistButton';

const C = {
    parchment: '#F0EDE8',
    navy: '#1A4D8C',
    gold: '#C4892A',
    white: '#FFFFFF',
    text: '#1A1A2E',
    muted: '#6B6B7B',
    faint: '#9A9AAB',
    border: 'rgba(26,77,140,0.10)',
    green: '#16a34a',
    teal: '#0f6e56',
    red: '#E24B4A',
    imgBg: '#F8F7F4',
};
const BRAND = "'Cinzel', serif";
const DISPLAY = "'Cormorant Garamond', serif";

/* ── Heart SVG ── */
const HeartIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

/* ── Star SVG ── */
const StarMini = () => (
    <svg width="8" height="8" viewBox="0 0 24 24" fill={C.navy}>
        <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z" />
    </svg>
);

/* ── Countdown badge for auction cards ── */
const CountdownBadge = ({ endTime }) => {
    const [label, setLabel] = useState('');
    const [urgency, setUrgency] = useState('normal');

    useEffect(() => {
        if (!endTime) return;
        const tick = () => {
            const diff = new Date(endTime) - Date.now();
            if (diff <= 0) { setLabel('Ended'); setUrgency('ended'); return; }
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            if (diff < 3600000) { setUrgency('critical'); setLabel(`${m}m`); }
            else if (diff < 86400000) { setUrgency('warning'); setLabel(`${h}h ${m}m`); }
            else { setUrgency('normal'); setLabel(`${d}d ${h}h`); }
        };
        tick();
        const id = setInterval(tick, 30000);
        return () => clearInterval(id);
    }, [endTime]);

    if (!label) return null;
    const bg = urgency === 'critical' ? C.red : urgency === 'warning' ? C.gold : C.navy;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 20,
            background: bg, color: '#fff',
            fontFamily: BRAND, fontSize: 9, letterSpacing: '0.03em', textTransform: 'uppercase',
            animation: urgency === 'critical' ? 'gemPulse 1s infinite' : 'none',
        }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            {label}
        </span>
    );
};

/* ═══════════════════════════════════════
   GemCard — Grid View
   Inspired by vostok-europe.us product cards
═══════════════════════════════════════ */
const GemCard = ({ gem, onClick }) => {
    const navigate = useNavigate();
    const { formatPrice } = useCurrency();
    const [hovered, setHovered] = useState(false);

    const images = (gem.images || []).filter(u => !u.startsWith('model:'));
    const img1 = images[0];
    const img2 = images[1] || img1;

    const price = gem.buy_now_price || gem.predicted_price;
    const isUnheated = gem.treatment === 'None' || gem.treatment == null;

    const auctionsArr = gem.auctions ? (Array.isArray(gem.auctions) ? gem.auctions : [gem.auctions]) : [];
    const activeAuction = auctionsArr.find(a => a.status === 'active');
    const certsArr = gem.certificates ? (Array.isArray(gem.certificates) ? gem.certificates : [gem.certificates]) : [];
    const certVerified = certsArr.some(c => c.status === 'verified');
    const certBody = certsArr.find(c => c.status === 'verified')?.certification_body;
    const has3D = (gem.images || []).some(u => u.startsWith('model:'));
    const bidCount = activeAuction?.bid_count || 0;
    const isAuction = !!activeAuction;
    const isDirectSell = !!gem.buy_now_price && !isAuction;

    const handleClick = () => onClick ? onClick() : navigate(`/gem/${gem.id}`);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={handleClick}
            style={{
                background: C.white,
                border: `0.5px solid ${C.border}`,
                borderRadius: 4,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                transform: hovered ? 'translateY(-3px)' : 'none',
                boxShadow: hovered ? '0 8px 32px rgba(26,77,140,0.12)' : 'none',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* ── IMAGE AREA (72% of card) ── */}
            <div style={{
                position: 'relative',
                paddingBottom: '110%', /* tall portrait like vostok */
                background: C.imgBg,
                overflow: 'hidden',
            }}>
                {/* Primary image */}
                {img1 ? (
                    <img src={img1} alt={gem.title}
                        style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            objectFit: 'contain', padding: 16,
                            opacity: hovered && img2 !== img1 ? 0 : 1,
                            transition: 'opacity 0.35s ease',
                        }}
                    />
                ) : (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" opacity={0.18}>
                            <path d="M16 22 24 12h16l8 10-16 30-16-30Z" stroke={C.navy} strokeWidth="2" />
                            <path d="M16 22h32M24 12l8 10 8-10M32 22v30" stroke={C.navy} strokeWidth="1.5" />
                        </svg>
                    </div>
                )}

                {/* Secondary image (hover swap) */}
                {img2 && img2 !== img1 && (
                    <img src={img2} alt={`${gem.title} angle 2`}
                        style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            objectFit: 'contain', padding: 16,
                            opacity: hovered ? 1 : 0,
                            transition: 'opacity 0.35s ease',
                        }}
                    />
                )}

                {/* TOP-LEFT BADGES */}
                <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 2 }}>
                    {isAuction && (
                        <span style={{
                            padding: '3px 8px', borderRadius: 20,
                            background: C.navy, color: '#fff',
                            fontFamily: BRAND, fontSize: 9, letterSpacing: '0.04em', textTransform: 'uppercase',
                        }}>Live Auction</span>
                    )}
                    {isDirectSell && !isAuction && (
                        <span style={{
                            padding: '3px 8px', borderRadius: 20,
                            background: C.teal, color: '#fff',
                            fontFamily: BRAND, fontSize: 9, letterSpacing: '0.04em', textTransform: 'uppercase',
                        }}>Buy Now</span>
                    )}
                    {activeAuction?.end_time && <CountdownBadge endTime={activeAuction.end_time} />}
                </div>

                {/* TOP-RIGHT BADGES */}
                <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 2 }}>
                    {certVerified && (
                        <span style={{
                            padding: '3px 8px', borderRadius: 20,
                            background: C.gold, color: '#fff',
                            fontFamily: BRAND, fontSize: 9, letterSpacing: '0.04em', textTransform: 'uppercase',
                        }}>{certBody || 'Certified'}</span>
                    )}
                    {has3D && (
                        <span style={{
                            padding: '3px 8px', borderRadius: 20,
                            background: C.navy, color: '#fff',
                            fontFamily: BRAND, fontSize: 9, letterSpacing: '0.04em', textTransform: 'uppercase',
                        }}>3D</span>
                    )}
                </div>

                {/* HOVER ACTION BUTTONS — slide up from bottom */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    display: 'flex', zIndex: 3,
                    transform: hovered ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 0.25s ease',
                }}>
                    <div onClick={e => e.stopPropagation()} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AddToWatchlistButton gemId={gem.id} auctionId={activeAuction?.id} size="sm" />
                    </div>
                    <button
                        onClick={e => { e.stopPropagation(); handleClick(); }}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                            padding: '10px 0', border: 'none', cursor: 'pointer',
                            background: C.navy, color: C.parchment,
                            fontFamily: BRAND, fontSize: 10, letterSpacing: '0.03em', textTransform: 'uppercase',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.gold; e.currentTarget.style.color = C.navy; }}
                        onMouseLeave={e => { e.currentTarget.style.background = C.navy; e.currentTarget.style.color = C.parchment; }}
                    >
                        {isAuction ? 'Place Bid' : 'View Details'}
                    </button>
                </div>
            </div>

            {/* ── CARD CONTENT (28%) ── */}
            <div style={{ padding: '12px 14px 16px', display: 'flex', flexDirection: 'column', gap: 0, flex: 1 }}>
                {/* ROW 1: Category + Rating */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: BRAND, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.gold, opacity: 0.8 }}>
                        {gem.category?.name || 'Gemstone'}
                    </span>
                    {gem.seller_id && <SellerRatingBadge sellerId={gem.seller_id} />}
                </div>

                {/* ROW 2: Title */}
                <h3 style={{
                    margin: '4px 0', fontFamily: DISPLAY, fontSize: 16, fontWeight: 500,
                    color: C.navy, lineHeight: 1.3,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {gem.title}
                </h3>

                {/* ROW 3: Specs */}
                <p style={{
                    margin: 0, fontFamily: DISPLAY, fontSize: 12, color: C.muted,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                    {[gem.carat_weight && `${gem.carat_weight}ct`, gem.cut, gem.certification_body].filter(Boolean).join(' · ')}
                </p>

                {/* ROW 4: Price */}
                <div style={{ marginTop: 8 }}>
                    {isAuction ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <span style={{ fontFamily: BRAND, fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted }}>Current Bid</span>
                                <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 500, color: C.navy }}>
                                    {formatPrice(activeAuction.current_price || activeAuction.starting_price)}
                                </div>
                            </div>
                            <span style={{ fontFamily: DISPLAY, fontSize: 10, color: C.muted }}>{bidCount} bid{bidCount !== 1 ? 's' : ''}</span>
                        </div>
                    ) : price ? (
                        <div>
                            <span style={{ fontFamily: BRAND, fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted }}>
                                {gem.buy_now_price ? 'Buy Now' : 'Est. Value'}
                            </span>
                            <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 500, color: gem.buy_now_price ? C.gold : C.navy }}>
                                {formatPrice(price)}
                            </div>
                        </div>
                    ) : (
                        <span style={{ fontFamily: DISPLAY, fontSize: 13, color: C.muted }}>Contact Seller</span>
                    )}
                </div>

                {/* AI estimate */}
                {gem.predicted_price && gem.buy_now_price && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                        <StarMini />
                        <span style={{ fontFamily: DISPLAY, fontSize: 10, color: C.muted }}>AI Est: {formatPrice(gem.predicted_price)}</span>
                    </div>
                )}

                {/* ROW 5: Treatment badge */}
                {isUnheated && (
                    <span style={{
                        display: 'inline-flex', alignSelf: 'flex-start', marginTop: 6,
                        padding: '2px 8px', borderRadius: 20,
                        background: 'rgba(22,163,74,0.08)', color: C.green,
                        fontFamily: BRAND, fontSize: 9, letterSpacing: '0.03em',
                    }}>Unheated</span>
                )}
            </div>
        </div>
    );
};

/* ═══════════════════════
   GemCard — List View
═══════════════════════ */
export const GemCardRow = ({ gem, onClick }) => {
    const navigate = useNavigate();
    const { formatPrice } = useCurrency();
    const [hovered, setHovered] = useState(false);

    const images = (gem.images || []).filter(u => !u.startsWith('model:'));
    const img1 = images[0];
    const price = gem.buy_now_price || gem.predicted_price;
    const isUnheated = gem.treatment === 'None' || gem.treatment == null;
    const auctionsArr = gem.auctions ? (Array.isArray(gem.auctions) ? gem.auctions : [gem.auctions]) : [];
    const activeAuction = auctionsArr.find(a => a.status === 'active');
    const certsArr = gem.certificates ? (Array.isArray(gem.certificates) ? gem.certificates : [gem.certificates]) : [];
    const certVerified = certsArr.some(c => c.status === 'verified');
    const certBody = certsArr.find(c => c.status === 'verified')?.certification_body;
    const isAuction = !!activeAuction;
    const bidCount = activeAuction?.bid_count || 0;

    const handleClick = () => onClick ? onClick() : navigate(`/gem/${gem.id}`);

    return (
        <div
            onClick={handleClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? 'rgba(26,77,140,0.02)' : C.white,
                border: `0.5px solid ${C.border}`,
                borderRadius: 8,
                padding: 16,
                display: 'flex',
                gap: 20,
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
            }}
        >
            {/* Image */}
            <div style={{
                width: 120, height: 120, flexShrink: 0,
                background: C.imgBg, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
            }}>
                {img1 ? (
                    <img src={img1} alt={gem.title} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
                ) : (
                    <svg width="40" height="40" viewBox="0 0 64 64" fill="none" opacity={0.18}>
                        <path d="M16 22 24 12h16l8 10-16 30-16-30Z" stroke={C.navy} strokeWidth="2" />
                    </svg>
                )}
            </div>

            {/* Center content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontFamily: BRAND, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.gold, opacity: 0.8 }}>
                    {gem.category?.name || 'Gemstone'}
                </span>
                <h3 style={{ margin: '2px 0 4px', fontFamily: DISPLAY, fontSize: 16, fontWeight: 500, color: C.navy, lineHeight: 1.3 }}>
                    {gem.title}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px', fontFamily: DISPLAY, fontSize: 13, color: C.muted }}>
                    {gem.carat_weight && <span>Carat: {gem.carat_weight}ct</span>}
                    {gem.cut && <span>Cut: {gem.cut}</span>}
                    {gem.clarity && <span>Clarity: {gem.clarity}</span>}
                    {gem.treatment && <span>Treatment: {gem.treatment}</span>}
                    {gem.certification_body && <span>Cert: {gem.certification_body}{gem.certification ? ' · ' + gem.certification : ''}</span>}
                    {certVerified && !gem.certification_body && <span>Cert: {certBody || 'Verified'}</span>}
                </div>
            </div>

            {/* Right: price + actions */}
            <div style={{ width: 140, flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {price && (
                    <div>
                        <span style={{ fontFamily: BRAND, fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted }}>
                            {isAuction ? 'Current Bid' : gem.buy_now_price ? 'Buy Now' : 'Est. Value'}
                        </span>
                        <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 500, color: isAuction ? C.navy : C.gold }}>
                            {formatPrice(isAuction ? (activeAuction.current_price || activeAuction.starting_price) : price)}
                        </div>
                        {isAuction && <span style={{ fontFamily: DISPLAY, fontSize: 10, color: C.muted }}>{bidCount} bids</span>}
                    </div>
                )}
                <button onClick={e => { e.stopPropagation(); handleClick(); }}
                    style={{
                        width: '100%', padding: '8px 0', borderRadius: 4, border: 'none',
                        background: C.navy, color: C.parchment,
                        fontFamily: BRAND, fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase',
                        cursor: 'pointer', transition: 'all 0.15s',
                    }}
                >{isAuction ? 'Place Bid' : 'View'}</button>
                <div onClick={e => e.stopPropagation()}>
                    <AddToWatchlistButton gemId={gem.id} auctionId={activeAuction?.id} size="sm" />
                </div>
            </div>
        </div>
    );
};

export default GemCard;
