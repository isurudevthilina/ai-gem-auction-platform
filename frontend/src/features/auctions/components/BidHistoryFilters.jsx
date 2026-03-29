import React from 'react';

const C = {
    sapphire: '#1A4D8C', white: '#FFFFFF', text: '#1A1A2E',
    muted: '#6B6B7B', border: '#E0DCD6',
};
const BODY = "'Jost','Inter',sans-serif";

const TABS = [
    { value: 'all',    label: 'All Bids' },
    { value: 'active', label: 'Active' },
    { value: 'won',    label: 'Won' },
    { value: 'ended',  label: 'Ended' },
];

const SORT_OPTIONS = [
    { value: 'newest',  label: 'Newest First' },
    { value: 'ending',  label: 'Ending Soonest' },
    { value: 'highest', label: 'Highest Bid' },
    { value: 'lowest',  label: 'Lowest Bid' },
];

const BidHistoryFilters = ({ filters, onFiltersChange }) => {
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 12, margin: '24px 0',
        }}>
            {/* Status tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {TABS.map(({ value, label }) => {
                    const active = filters.status === value;
                    return (
                        <button key={value} onClick={() => onFiltersChange({ ...filters, status: value, page: 0 })}
                            style={{
                                padding: '6px 16px', borderRadius: 20,
                                fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600,
                                cursor: 'pointer', transition: 'all 0.15s', border: 'none',
                                background: active ? C.sapphire : 'transparent',
                                color: active ? '#fff' : C.muted,
                                outline: active ? 'none' : `1px solid ${C.border}`,
                            }}>
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Sort select */}
            <div style={{ position: 'relative' }}>
                <select
                    value={filters.sort}
                    onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value, page: 0 })}
                    style={{
                        padding: '8px 32px 8px 12px', borderRadius: 10,
                        border: `1px solid ${C.border}`, fontFamily: BODY,
                        fontSize: '0.85rem', color: C.text, background: C.white,
                        cursor: 'pointer', outline: 'none', appearance: 'none',
                    }}
                >
                    {SORT_OPTIONS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
        </div>
    );
};

export default BidHistoryFilters;
