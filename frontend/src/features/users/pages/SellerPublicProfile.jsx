import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, ShieldCheck, Gem, Package, Gavel, Star, ExternalLink } from 'lucide-react';
import { getPublicProfile } from '../services/usersService';
import { getGems } from '../../gems/services/gemsService';
import RatingSummary from '../../reviews/components/RatingSummary';
import SellerRatingBadge from '../../reviews/components/SellerRatingBadge';
import { useCurrency } from '../../../context/CurrencyContext';

const FONT_SERIF = "'Cormorant Garamond', serif";
const FONT_DISPLAY = "'Cinzel', serif";
const FONT_BODY = "'Jost', sans-serif";
const T = {
    bg: '#FDFAF6', white: '#FFFFFF', gold: '#C4892A', navy: '#1A4D8C',
    text: '#1A1A2E', muted: '#6B6B7B', border: '#E8E4DC', green: '#1A7A50',
};

export default function SellerPublicProfile() {
    const { sellerId } = useParams();
    const { formatPrice } = useCurrency();

    const { data: profile, isLoading, error } = useQuery({
        queryKey: ['sellerPublicProfile', sellerId],
        queryFn: () => getPublicProfile(sellerId),
        staleTime: 60_000,
    });

    const { data: gemsData } = useQuery({
        queryKey: ['sellerPublicGems', sellerId],
        queryFn: () => getGems({ seller_id: sellerId, limit: 8 }),
        enabled: !!sellerId,
        staleTime: 60_000,
    });

    const seller = profile?.data;
    const gems = gemsData?.data || [];

    if (isLoading) {
        return (
            <div style={{ background: T.bg, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #E8E4DC', borderTopColor: T.gold, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error || !seller) {
        return (
            <div style={{ background: T.bg, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontFamily: FONT_BODY, color: T.muted }}>Seller not found.</p>
                <Link to="/gems" style={{ fontFamily: FONT_BODY, color: T.gold, textDecoration: 'none' }}>Browse Gems →</Link>
            </div>
        );
    }

    const memberSince = new Date(seller.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    return (
        <div style={{ background: T.bg, minHeight: '60vh', padding: '32px 24px 64px' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                {/* Header card */}
                <div style={{
                    background: T.white, borderRadius: 16, padding: '32px 36px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: `1px solid ${T.border}`,
                    display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap',
                }}>
                    {/* Avatar */}
                    {seller.avatar_url ? (
                        <img src={seller.avatar_url} alt="" style={{
                            width: 88, height: 88, borderRadius: '50%', objectFit: 'cover',
                            border: `3px solid ${T.gold}`,
                        }} />
                    ) : (
                        <div style={{
                            width: 88, height: 88, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1A4D8C, #2E6DB4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', color: '#fff', fontFamily: FONT_DISPLAY,
                        }}>
                            {seller.full_name?.charAt(0) || 'S'}
                        </div>
                    )}

                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <h1 style={{ fontFamily: FONT_SERIF, fontSize: '1.6rem', color: T.text, margin: 0 }}>
                                {seller.full_name}
                            </h1>
                            {seller.is_verified && (
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    fontFamily: FONT_BODY, fontSize: '0.7rem', fontWeight: 600,
                                    padding: '3px 10px', borderRadius: 99,
                                    background: 'rgba(26,122,80,0.1)', color: T.green,
                                }}>
                                    <ShieldCheck size={12} /> Verified
                                </span>
                            )}
                        </div>

                        {seller.business_name && (
                            <p style={{ fontFamily: FONT_BODY, fontSize: '0.85rem', color: T.muted, margin: '4px 0 0' }}>
                                {seller.business_name}
                            </p>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                            {(seller.district || seller.province) && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: FONT_BODY, fontSize: '0.8rem', color: T.muted }}>
                                    <MapPin size={13} />
                                    {[seller.district, seller.province].filter(Boolean).join(', ')}
                                </span>
                            )}
                            <span style={{ fontFamily: FONT_BODY, fontSize: '0.78rem', color: T.muted }}>
                                Member since {memberSince}
                            </span>
                            <SellerRatingBadge sellerId={sellerId} />
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                        <StatBox icon={Gem} label="Active Listings" value={seller.active_gem_count} />
                        <StatBox icon={Package} label="Gems Sold" value={seller.sold_count} />
                        <StatBox icon={Gavel} label="Active Auctions" value={seller.active_auction_count} />
                        <StatBox icon={Star} label="Reviews" value={seller.review_count} />
                    </div>
                </div>

                {/* Two-column layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 32 }}>
                    {/* Left - Active Gems */}
                    <div>
                        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: T.gold, marginBottom: 16 }}>
                            Active Listings
                        </h2>
                        {gems.length === 0 ? (
                            <div style={{
                                background: T.white, borderRadius: 12, padding: 32, textAlign: 'center',
                                border: `1px solid ${T.border}`,
                            }}>
                                <p style={{ fontFamily: FONT_BODY, color: T.muted, fontSize: '0.85rem' }}>
                                    No active listings at the moment.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {gems.map((gem) => (
                                    <Link key={gem.id} to={`/gem/${gem.id}`} style={{ textDecoration: 'none' }}>
                                        <div style={{
                                            background: T.white, borderRadius: 12, padding: 14,
                                            border: `1px solid ${T.border}`, display: 'flex', gap: 14,
                                            alignItems: 'center', transition: 'box-shadow 0.2s',
                                        }}
                                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                                        >
                                            {gem.images?.[0] ? (
                                                <img src={gem.images[0]} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: 56, height: 56, borderRadius: 8, background: '#E8E4DC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Gem size={20} color={T.muted} />
                                                </div>
                                            )}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontFamily: FONT_SERIF, fontSize: '0.95rem', color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {gem.title}
                                                </div>
                                                <div style={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: T.muted }}>
                                                    {gem.carat_weight}ct · {gem.category?.name || ''}
                                                </div>
                                            </div>
                                            {gem.buy_now_price && (
                                                <span style={{ fontFamily: FONT_BODY, fontSize: '0.88rem', fontWeight: 600, color: T.navy }}>
                                                    {formatPrice(gem.buy_now_price)}
                                                </span>
                                            )}
                                            <ExternalLink size={14} color={T.muted} />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right - Reviews */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: T.gold }}>
                                Reviews
                            </h2>
                            <Link to={`/sellers/${sellerId}/reviews`} style={{ fontFamily: FONT_BODY, fontSize: '0.78rem', color: T.gold, textDecoration: 'none' }}>
                                View All →
                            </Link>
                        </div>
                        <div style={{
                            background: T.white, borderRadius: 12, padding: 20,
                            border: `1px solid ${T.border}`,
                        }}>
                            <RatingSummary sellerId={sellerId} />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    div[style*="gridTemplateColumns: '1fr 1fr'"],
                    div[style*="grid-template-columns"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}

function StatBox({ icon: Icon, label, value }) {
    return (
        <div style={{ textAlign: 'center', minWidth: 70 }}>
            <Icon size={18} color="#C4892A" style={{ marginBottom: 4 }} />
            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#1A4D8C' }}>
                {value || 0}
            </div>
            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.65rem', color: '#6B6B7B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {label}
            </div>
        </div>
    );
}
