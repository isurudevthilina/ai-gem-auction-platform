import React from 'react';

const DISPLAY = "'Cinzel',serif";

const CONFIG = {
    winning:         { bg: '#16a34a', color: '#fff', label: 'Winning' },
    outbid:          { bg: '#B91C1C', color: '#fff', label: 'Outbid' },
    won:             { bg: '#C4892A', color: '#fff', label: 'Won' },
    lost:            { bg: '#6B6B7B', color: '#fff', label: 'Ended' },
    cancelled:       { bg: '#6B6B7B', color: '#fff', label: 'Cancelled' },
    reserve_not_met: { bg: '#d97706', color: '#fff', label: 'Reserve Not Met' },
    ended:           { bg: '#6B6B7B', color: '#fff', label: 'Ended' },
};

const BidStatusBadge = ({ outcome }) => {
    const cfg = CONFIG[outcome] || CONFIG.ended;
    return (
        <span style={{
            display: 'inline-block',
            padding: '3px 8px',
            borderRadius: 6,
            fontFamily: DISPLAY,
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            background: cfg.bg,
            color: cfg.color,
        }}>
            {cfg.label}
        </span>
    );
};

export default BidStatusBadge;
