import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../config/supabase';
import { useGetBidHistory, useGetBidStats } from '../hooks/useBidHistory';
import BidHistoryStats from '../components/BidHistoryStats';
import BidHistoryFilters from '../components/BidHistoryFilters';
import BidHistoryCard from '../components/BidHistoryCard';
import ContactSellerModal from '../components/ContactSellerModal';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF   = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const GavelSvg = ({ size = 64 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.sapphire}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 3l-1 1 7 7 1-1a2.12 2.12 0 0 0 0-3L18 3.5a2.12 2.12 0 0 0-3 0z"/>
        <path d="M3 21l3.5-3.5"/><path d="M6.5 12.5L3 16l3 3 3.5-3.5"/><path d="m8 10 5.5 5.5"/>
    </svg>
);

const ChevronLeft = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const ChevronRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

const BidHistoryPage = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const gridRef = useRef(null);

    const [filters, setFilters] = useState({ status: 'all', sort: 'newest', page: 0 });
    const [contactItem, setContactItem] = useState(null);

    const { data: statsData, isLoading: statsLoading } = useGetBidStats();
    const { data: historyData, isLoading: historyLoading, isPlaceholderData } = useGetBidHistory(filters);

    const items = historyData?.data || [];
    const total = historyData?.total || 0;
    const pageSize = filters.limit || 12;
    const totalPages = Math.ceil(total / pageSize);

    // Realtime subscription for active auctions
    useEffect(() => {
        const activeIds = items
            .filter(i => i.bid_outcome === 'winning' || i.bid_outcome === 'outbid')
            .map(i => i.auction_id);

        if (activeIds.length === 0) return;

        const channel = supabase
            .channel('bid-history-live')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'auctions',
                filter: `id=in.(${activeIds.join(',')})`,
            }, (payload) => {
                const updated = payload.new;
                if (updated.status === 'completed' || updated.status !== payload.old?.status) {
                    qc.invalidateQueries({ queryKey: ['bid-history'] });
                    qc.invalidateQueries({ queryKey: ['bid-stats'] });
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [items, qc]);

    const onPageChange = (newPage) => {
        setFilters(f => ({ ...f, page: newPage }));
        gridRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Pagination page numbers (max 5 visible)
    const getPageNumbers = () => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i);
        const current = filters.page;
        let start = Math.max(0, current - 2);
        let end = start + 5;
        if (end > totalPages) { end = totalPages; start = end - 5; }
        const pages = [];
        for (let i = start; i < end; i++) pages.push(i);
        return pages;
    };

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: BODY }}>
            <style>{`@keyframes bhp-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>

            <main style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 24px 80px' }}>
                {/* Header */}
                <h1 style={{
                    fontFamily: DISPLAY, fontSize: '1.8rem', color: C.text,
                    margin: '0 0 4px', fontWeight: 700,
                }}>My Bid History</h1>
                <p style={{
                    fontFamily: BODY, fontSize: '0.92rem', color: C.muted, margin: '0 0 28px',
                }}>Track all your auction activity</p>

                <BidHistoryStats stats={statsData} isLoading={statsLoading} />

                <BidHistoryFilters
                    filters={filters}
                    onFiltersChange={(newFilters) => setFilters({ ...newFilters, page: 0 })}
                />

                {/* Grid */}
                <div ref={gridRef}>
                    {historyLoading && !isPlaceholderData ? (
                        <div>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} style={{
                                    height: 160, background: '#E8E5E0', borderRadius: 16,
                                    marginBottom: 16, animation: 'bhp-pulse 1.5s ease-in-out infinite',
                                }} />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        /* Empty state */
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', padding: '60px 20px', textAlign: 'center',
                        }}>
                            <GavelSvg size={filters.status === 'all' ? 64 : 40} />
                            <h3 style={{
                                fontFamily: SERIF, fontSize: '1.2rem', color: C.text,
                                margin: '16px 0 8px',
                            }}>
                                {filters.status === 'all' ? 'No bids yet' : `No ${filters.status} bids`}
                            </h3>
                            <p style={{
                                fontFamily: BODY, fontSize: '0.88rem', color: C.muted, margin: '0 0 20px',
                            }}>
                                {filters.status === 'all'
                                    ? 'Start bidding on live auctions to see your history here.'
                                    : 'Try a different filter'}
                            </p>
                            <button onClick={() => {
                                if (filters.status === 'all') navigate('/auctions');
                                else setFilters({ status: 'all', sort: 'newest', page: 0 });
                            }} style={{
                                background: C.sapphire, color: '#fff', border: 'none',
                                borderRadius: 10, padding: '12px 28px',
                                fontFamily: BODY, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                            }}>
                                {filters.status === 'all' ? 'Browse Auctions' : 'View All Bids'}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div style={{ opacity: isPlaceholderData ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                                {items.map(item => (
                                    <BidHistoryCard key={item.id} item={item}
                                        onContactSeller={setContactItem} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: 8, marginTop: 40, flexWrap: 'wrap',
                                }}>
                                    <span style={{
                                        fontFamily: BODY, fontSize: '0.82rem', color: C.muted, marginRight: 16,
                                    }}>
                                        Showing {filters.page * pageSize + 1}&ndash;{Math.min((filters.page + 1) * pageSize, total)} of {total} bids
                                    </span>

                                    <button disabled={filters.page === 0}
                                        onClick={() => onPageChange(filters.page - 1)}
                                        style={{
                                            width: 36, height: 36, borderRadius: '50%', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            background: 'transparent', border: `1px solid ${C.border}`,
                                            color: filters.page === 0 ? C.border : C.muted,
                                            cursor: filters.page === 0 ? 'default' : 'pointer',
                                        }}>
                                        <ChevronLeft />
                                    </button>

                                    {getPageNumbers().map(p => (
                                        <button key={p} onClick={() => onPageChange(p)}
                                            style={{
                                                width: 36, height: 36, borderRadius: '50%',
                                                fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600,
                                                cursor: 'pointer', border: 'none',
                                                background: p === filters.page ? C.sapphire : 'transparent',
                                                color: p === filters.page ? '#fff' : C.muted,
                                                outline: p === filters.page ? 'none' : `1px solid ${C.border}`,
                                            }}>
                                            {p + 1}
                                        </button>
                                    ))}

                                    <button disabled={filters.page >= totalPages - 1}
                                        onClick={() => onPageChange(filters.page + 1)}
                                        style={{
                                            width: 36, height: 36, borderRadius: '50%', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            background: 'transparent', border: `1px solid ${C.border}`,
                                            color: filters.page >= totalPages - 1 ? C.border : C.muted,
                                            cursor: filters.page >= totalPages - 1 ? 'default' : 'pointer',
                                        }}>
                                        <ChevronRight />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <ContactSellerModal
                isOpen={!!contactItem}
                onClose={() => setContactItem(null)}
                item={contactItem}
            />
        </div>
    );
};

export default BidHistoryPage;
