import { useState } from 'react';

const C = {
  gold: '#C4892A', border: '#E0DCD6', muted: '#6B6B7B',
};
const BODY = "'Jost','Inter',sans-serif";
const STAR_PATH = 'M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z';

const sizeMap = { sm: 14, md: 20, lg: 28 };

const StarRating = ({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
  showValue = false,
  precision = 'full',
}) => {
  const [hoverValue, setHoverValue] = useState(0);
  const px = sizeMap[size] || sizeMap.md;
  const interactive = !readOnly && typeof onChange === 'function';

  const renderStar = (index) => {
    const starNum = index + 1;
    const active = interactive ? (hoverValue || value) : value;

    let fillColor = '#D3D1C7';
    let strokeColor = C.border;
    let clipId = null;

    if (precision === 'half') {
      const diff = active - index;
      if (diff >= 1) {
        fillColor = C.gold;
        strokeColor = C.gold;
      } else if (diff >= 0.25) {
        clipId = `half-clip-${index}-${px}`;
      }
    } else {
      if (starNum <= Math.floor(active) || (interactive && starNum <= active)) {
        fillColor = C.gold;
        strokeColor = C.gold;
      }
    }

    return (
      <span
        key={index}
        role="radio"
        aria-label={`${starNum} star${starNum !== 1 ? 's' : ''}`}
        aria-checked={starNum === Math.round(value)}
        tabIndex={interactive ? 0 : -1}
        onMouseEnter={interactive ? () => setHoverValue(starNum) : undefined}
        onMouseLeave={interactive ? () => setHoverValue(0) : undefined}
        onClick={interactive ? () => onChange(starNum) : undefined}
        onKeyDown={interactive ? (e) => {
          if (e.key === 'ArrowRight' && value < 5) onChange(value + 1);
          if (e.key === 'ArrowLeft' && value > 1) onChange(value - 1);
        } : undefined}
        style={{
          cursor: interactive ? 'pointer' : 'default',
          display: 'inline-flex',
          transition: 'transform 0.1s',
        }}
      >
        <svg width={px} height={px} viewBox="0 0 24 24" style={{ transition: 'color 0.1s' }}>
          {clipId && (
            <defs>
              <clipPath id={clipId}>
                <rect x="0" y="0" width="12" height="24" />
              </clipPath>
            </defs>
          )}
          {/* Empty star background */}
          <path d={STAR_PATH} fill="#D3D1C7" stroke={C.border} strokeWidth="1" />
          {/* Filled star or half star */}
          {clipId ? (
            <path d={STAR_PATH} fill={C.gold} stroke={C.gold} strokeWidth="1" clipPath={`url(#${clipId})`} />
          ) : (
            <path d={STAR_PATH} fill={fillColor} stroke={strokeColor} strokeWidth="1" />
          )}
        </svg>
      </span>
    );
  };

  return (
    <span role="radiogroup" style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[0, 1, 2, 3, 4].map(renderStar)}
      {showValue && (
        <span style={{ fontFamily: BODY, fontSize: '0.8rem', color: C.muted, marginLeft: 4 }}>
          {parseFloat(value).toFixed(1)}
        </span>
      )}
    </span>
  );
};

export default StarRating;
