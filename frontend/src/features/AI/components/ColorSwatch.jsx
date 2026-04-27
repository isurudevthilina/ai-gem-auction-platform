/**
 * ColorSwatch.jsx
 * Oval gradient swatches for each of the 22 exact dataset color labels.
 * Styled for the light parchment theme.
 */
import React from 'react';

export const COLOR_HEX_MAP = {
  'Black':       '#1a1a1a',
  'Blood Red':   '#660000',
  'Blue':        '#1565C0',
  'Brown':       '#8B4513',
  'Gold':        '#FFD700',
  'Green':       '#2E7D32',
  'Iris':        '#6B5B95',
  'Lavender':    '#E6E6FA',
  'Magenta':     '#C71585',
  'Multicolor':  'linear-gradient(135deg,#ff0000,#ffaa00,#00ff00,#0000ff)',
  'Orange':      '#FF8C00',
  'Orange-Gold': '#FFAA33',
  'Pink':        '#FF69B4',
  'Pinkish Red': '#E85D75',
  'Purple':      '#800080',
  'Red':         '#DC143C',
  'Rose':        '#FF007F',
  'Violet':      '#8B00FF',
  'White':       '#F5F5F5',
  'Wine':        '#722F37',
  'Wine Red':    '#58181F',
  'Yellow':      '#FFEB3B',
};

export const COLOR_OPTIONS = Object.keys(COLOR_HEX_MAP);

export default function ColorSwatch({ color, selected = false, onClick, size = 64 }) {
  const hex = COLOR_HEX_MAP[color] || '#888888';
  const isGradient = hex.startsWith('linear-gradient');
  const isLight = color === 'White' || color === 'Lavender';

  return (
    <button
      onClick={onClick}
      title={color}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        padding: '5px 3px',
        borderRadius: 8,
        background: selected ? 'rgba(26,77,140,0.06)' : 'transparent',
        border: selected ? '2px solid #1A4D8C' : '2px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.18s',
        width: size + 10,
      }}
      onMouseEnter={e => {
        if (!selected) e.currentTarget.style.borderColor = 'rgba(26,77,140,0.2)';
      }}
      onMouseLeave={e => {
        if (!selected) e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      <div
        style={{
          width: size,
          height: size * 0.6,
          borderRadius: '50%',
          background: isGradient ? hex : hex,
          border: isLight
            ? '1.5px solid rgba(0,0,0,0.2)'
            : '1.5px solid rgba(0,0,0,0.15)',
          boxShadow: selected
            ? `0 0 10px ${isGradient ? 'rgba(26,77,140,0.4)' : hex + '88'}, inset 0 0 6px rgba(255,255,255,0.3)`
            : `inset 0 0 4px rgba(255,255,255,0.2)`,
          transition: 'box-shadow 0.2s',
        }}
      />
      <span
        style={{
          fontSize: '0.6rem',
          fontWeight: 600,
          color: selected ? '#1A4D8C' : '#6B6B7B',
          textAlign: 'center',
          lineHeight: 1.2,
          maxWidth: size,
          wordBreak: 'break-word',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {color}
      </span>
    </button>
  );
}
