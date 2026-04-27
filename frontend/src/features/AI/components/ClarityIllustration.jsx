/**
 * ClarityIllustration.jsx
 * SVG cross-section diagrams for the 5 dataset clarity grades.
 * Styled for the light parchment theme.
 */
import React from 'react';

const CLARITY_META = {
  'VVS (Eye Clean 1)': {
    label: 'VVS',
    subtitle: 'Eye Clean 1',
    dots: [],
    caption: 'Virtually no inclusions visible under 10× magnification',
  },
  'VS (Eye Clean 2)': {
    label: 'VS',
    subtitle: 'Eye Clean 2',
    dots: [
      { cx: 38, cy: 42, r: 1.2 },
      { cx: 58, cy: 55, r: 0.9 },
    ],
    caption: 'Very slight inclusions, difficult to see with naked eye',
  },
  'SI1 (Slightly Included 1)': {
    label: 'SI1',
    subtitle: 'Slightly Included 1',
    dots: [
      { cx: 30, cy: 35, r: 1.8 },
      { cx: 55, cy: 40, r: 1.4 },
      { cx: 45, cy: 58, r: 1.6 },
      { cx: 65, cy: 50, r: 1.1 },
    ],
    caption: 'Inclusions noticeable under 10×, may be eye-visible',
  },
  'SI2 (Slightly Included 2)': {
    label: 'SI2',
    subtitle: 'Slightly Included 2',
    dots: [
      { cx: 28, cy: 32, r: 2.2 },
      { cx: 52, cy: 38, r: 1.8 },
      { cx: 42, cy: 55, r: 2.0 },
      { cx: 62, cy: 48, r: 1.6 },
      { cx: 35, cy: 50, r: 1.4 },
      { cx: 58, cy: 62, r: 1.2 },
    ],
    caption: 'Inclusions easily visible under 10×, often eye-visible',
  },
  'I1 (Included 1)': {
    label: 'I1',
    subtitle: 'Included 1',
    dots: [
      { cx: 25, cy: 30, r: 3.0 },
      { cx: 50, cy: 35, r: 2.5 },
      { cx: 70, cy: 40, r: 2.8 },
      { cx: 35, cy: 50, r: 2.2 },
      { cx: 58, cy: 55, r: 2.0 },
      { cx: 45, cy: 68, r: 2.6 },
      { cx: 65, cy: 65, r: 1.8 },
      { cx: 30, cy: 65, r: 2.0 },
    ],
    caption: 'Obvious inclusions visible to the unaided eye',
  },
};

export const CLARITY_OPTIONS = Object.keys(CLARITY_META);

export default function ClarityIllustration({ clarity, selected = false, onClick, size = 90 }) {
  const meta = CLARITY_META[clarity];
  if (!meta) return null;

  const { label, subtitle, dots, caption } = meta;

  return (
    <button
      onClick={onClick}
      title={clarity}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '8px 6px',
        borderRadius: 8,
        background: selected ? 'rgba(26,77,140,0.06)' : '#FFFFFF',
        border: selected ? '2px solid #1A4D8C' : '0.5px solid rgba(26,77,140,0.12)',
        cursor: 'pointer',
        transition: 'all 0.18s',
        width: size + 20,
        boxShadow: selected ? '0 2px 10px rgba(26,77,140,0.1)' : '0 1px 4px rgba(26,77,140,0.04)',
      }}
      onMouseEnter={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'rgba(26,77,140,0.25)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,77,140,0.08)';
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'rgba(26,77,140,0.12)';
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(26,77,140,0.04)';
        }
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
        {/* Outer gem outline */}
        <polygon
          points="50,8 85,25 92,50 85,75 50,92 15,75 8,50 15,25"
          fill="rgba(200,220,255,0.15)"
          stroke={selected ? '#1A4D8C' : 'rgba(26,77,140,0.3)'}
          strokeWidth="1.8"
        />
        {/* Table facet */}
        <polygon
          points="50,22 70,32 70,52 50,62 30,52 30,32"
          fill="none"
          stroke={selected ? '#1A4D8C' : 'rgba(26,77,140,0.2)'}
          strokeWidth="0.8"
          opacity="0.7"
        />
        {/* Inclusion dots */}
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill="rgba(40,40,40,0.75)"
            opacity="0.85"
          />
        ))}
        {/* Sparkle highlight for VVS / VS */}
        {(clarity === 'VVS (Eye Clean 1)' || clarity === 'VS (Eye Clean 2)') && (
          <>
            <circle cx="50" cy="42" r="14" fill="none" stroke="rgba(26,77,140,0.12)" strokeWidth="0.8" />
            <path d="M50 28 L50 56 M36 42 L64 42" stroke="rgba(26,77,140,0.08)" strokeWidth="0.6" />
          </>
        )}
      </svg>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: selected ? '#1A4D8C' : '#1A1A2E', fontFamily: "'Inter', sans-serif" }}>
          {label}
        </div>
        <div style={{ fontSize: '0.58rem', fontWeight: 500, color: '#9A9AAB', marginTop: 1, fontFamily: "'Inter', sans-serif" }}>
          {subtitle}
        </div>
      </div>

      {selected && (
        <div style={{ fontSize: '0.58rem', color: '#6B6B7B', textAlign: 'center', lineHeight: 1.4, maxWidth: size, fontFamily: "'Inter', sans-serif" }}>
          {caption}
        </div>
      )}
    </button>
  );
}
