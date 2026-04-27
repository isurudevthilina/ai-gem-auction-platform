/**
 * GemShapeSVG.jsx
 * Top-view facet outline SVGs for all 10 dataset gem shapes.
 * Rendered inside selection cards in the AI wizard Step 2.
 *
 * Props:
 *   shape    {string}  — One of the 10 dataset shape labels
 *   size     {number}  — Bounding box size in px (default 72)
 *   selected {bool}    — Adds golden glow ring when true
 *   color    {string}  — Hex fill for the gem body (default translucent gold)
 */

import React from 'react';

const DEFAULT_FILL = 'rgba(26,77,140,0.12)';
const DEFAULT_STROKE = 'rgba(26,77,140,0.70)';

// Each shape returns an inner SVG subtree (paths, polygons, etc.)
// Coordinate system: 0 0 100 100 viewBox
const SHAPES = {
    Round: ({ fill, stroke }) => (
        <>
            <circle cx="50" cy="50" r="38" fill={fill} stroke={stroke} strokeWidth="2.5" />
            {/* Table facet */}
            <circle cx="50" cy="50" r="22" fill="none" stroke={stroke} strokeWidth="1.2" opacity="0.6" />
            {/* Star facets */}
            {[0,45,90,135,180,225,270,315].map((a, i) => {
                const rad = (a * Math.PI) / 180;
                const x1 = 50 + 22 * Math.cos(rad);
                const y1 = 50 + 22 * Math.sin(rad);
                const x2 = 50 + 38 * Math.cos(rad);
                const y2 = 50 + 38 * Math.sin(rad);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth="1" opacity="0.5" />;
            })}
        </>
    ),

    Oval: ({ fill, stroke }) => (
        <>
            <ellipse cx="50" cy="50" rx="36" ry="26" fill={fill} stroke={stroke} strokeWidth="2.5" />
            <ellipse cx="50" cy="50" rx="20" ry="14" fill="none" stroke={stroke} strokeWidth="1.2" opacity="0.6" />
            {[0,60,120,180,240,300].map((a, i) => {
                const rad = (a * Math.PI) / 180;
                const x1 = 50 + 20 * Math.cos(rad) * (36/26);
                const y1 = 50 + 14 * Math.sin(rad);
                const x2 = 50 + 36 * Math.cos(rad);
                const y2 = 50 + 26 * Math.sin(rad);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth="1" opacity="0.5" />;
            })}
        </>
    ),

    Cushion: ({ fill, stroke }) => (
        <>
            <rect x="16" y="16" width="68" height="68" rx="18" ry="18" fill={fill} stroke={stroke} strokeWidth="2.5" />
            <rect x="28" y="28" width="44" height="44" rx="10" ry="10" fill="none" stroke={stroke} strokeWidth="1.2" opacity="0.6" />
            <line x1="28" y1="28" x2="16" y2="16" stroke={stroke} strokeWidth="1" opacity="0.5" />
            <line x1="72" y1="28" x2="84" y2="16" stroke={stroke} strokeWidth="1" opacity="0.5" />
            <line x1="28" y1="72" x2="16" y2="84" stroke={stroke} strokeWidth="1" opacity="0.5" />
            <line x1="72" y1="72" x2="84" y2="84" stroke={stroke} strokeWidth="1" opacity="0.5" />
        </>
    ),

    Heart: ({ fill, stroke }) => (
        <path
            d="M50 82
               C50 82 14 60 14 36
               C14 24 23 16 34 18
               C40 19 46 24 50 30
               C54 24 60 19 66 18
               C77 16 86 24 86 36
               C86 60 50 82 50 82Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.5"
        />
    ),

    Marquise: ({ fill, stroke }) => (
        <>
            <ellipse cx="50" cy="50" rx="42" ry="22" fill={fill} stroke={stroke} strokeWidth="2.5" />
            <ellipse cx="50" cy="50" rx="24" ry="12" fill="none" stroke={stroke} strokeWidth="1.2" opacity="0.6" />
            <line x1="26" y1="50" x2="8" y2="50" stroke={stroke} strokeWidth="1" opacity="0.5" />
            <line x1="74" y1="50" x2="92" y2="50" stroke={stroke} strokeWidth="1" opacity="0.5" />
        </>
    ),

    Octagon: ({ fill, stroke }) => {
        const pts = [0,1,2,3,4,5,6,7].map((i) => {
            const a = (i * 45 - 22.5) * (Math.PI / 180);
            return `${50 + 36 * Math.cos(a)},${50 + 36 * Math.sin(a)}`;
        }).join(' ');
        const innerPts = [0,1,2,3,4,5,6,7].map((i) => {
            const a = (i * 45 - 22.5) * (Math.PI / 180);
            return `${50 + 20 * Math.cos(a)},${50 + 20 * Math.sin(a)}`;
        }).join(' ');
        return (
            <>
                <polygon points={pts} fill={fill} stroke={stroke} strokeWidth="2.5" />
                <polygon points={innerPts} fill="none" stroke={stroke} strokeWidth="1.2" opacity="0.6" />
            </>
        );
    },

    Pear: ({ fill, stroke }) => (
        <>
            <path
                d="M50 84
                   C35 84 16 68 16 50
                   C16 34 28 22 40 20
                   C44 19 46 18 50 14
                   C54 18 56 19 60 20
                   C72 22 84 34 84 50
                   C84 68 65 84 50 84Z"
                fill={fill}
                stroke={stroke}
                strokeWidth="2.5"
            />
            <ellipse cx="50" cy="55" rx="18" ry="14" fill="none" stroke={stroke} strokeWidth="1.2" opacity="0.6" />
        </>
    ),

    Trillion: ({ fill, stroke }) => {
        const pts = '50,14 88,78 12,78';
        const innerPts = '50,30 72,68 28,68';
        return (
            <>
                <polygon points={pts} fill={fill} stroke={stroke} strokeWidth="2.5" />
                <polygon points={innerPts} fill="none" stroke={stroke} strokeWidth="1.2" opacity="0.6" />
                <line x1="50" y1="14" x2="50" y2="30" stroke={stroke} strokeWidth="1" opacity="0.5" />
                <line x1="88" y1="78" x2="72" y2="68" stroke={stroke} strokeWidth="1" opacity="0.5" />
                <line x1="12" y1="78" x2="28" y2="68" stroke={stroke} strokeWidth="1" opacity="0.5" />
            </>
        );
    },

    Fancy: ({ fill, stroke }) => (
        // A free-form irregular faceted stone (radiating wedge pattern)
        <>
            <ellipse cx="50" cy="50" rx="34" ry="28" fill={fill} stroke={stroke} strokeWidth="2.5" />
            {[0,40,80,120,160,200,240,280,320].map((a, i) => {
                const rad = (a * Math.PI) / 180;
                const x1 = 50 + 12 * Math.cos(rad);
                const y1 = 50 + 10 * Math.sin(rad);
                const x2 = 50 + 34 * Math.cos(rad);
                const y2 = 50 + 28 * Math.sin(rad);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth="1" opacity="0.45" />;
            })}
            <ellipse cx="50" cy="50" rx="12" ry="10" fill="none" stroke={stroke} strokeWidth="1.2" opacity="0.6" />
        </>
    ),

    Other: ({ fill, stroke }) => (
        <>
            <circle cx="50" cy="50" r="36" fill={fill} stroke={stroke} strokeWidth="2.5" strokeDasharray="6 3" />
            <text x="50" y="56" textAnchor="middle" fontSize="22" fill={stroke} fontWeight="bold" opacity="0.9">?</text>
        </>
    ),
};

export default function GemShapeSVG({ shape, size = 72, selected = false, color }) {
    const ShapeComponent = SHAPES[shape] ?? SHAPES.Other;

    const fill = color
        ? `${color}44`   // 27% alpha hex color
        : DEFAULT_FILL;
    const stroke = color ?? DEFAULT_STROKE;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            style={{
                display: 'block',
                filter: selected
                    ? 'drop-shadow(0 0 8px rgba(245,158,11,0.9))'
                    : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                transition: 'filter 0.2s ease',
            }}
        >
            <ShapeComponent fill={fill} stroke={stroke} />
        </svg>
    );
}
