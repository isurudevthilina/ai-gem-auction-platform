import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { useGetSellerRating } from '../hooks/useReviews';

const C = {
  bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
  red: '#B91C1C', text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB',
  border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const barColors = {
  5: '#C4892A',
  4: 'rgba(196,137,42,0.75)',
  3: '#d97706',
  2: '#f97316',
  1: '#B91C1C',
};

const RatingSummary = ({ sellerId, compact = false }) => {
  const { data: rating, isLoading } = useGetSellerRating(sellerId);

  if (isLoading) {
    if (compact) {
      return <span style={{ display: 'inline-block', width: 120, height: 12, borderRadius: 6, background: C.border }} />;
    }
    return <div style={{ height: 100, borderRadius: 12, background: C.border }} />;
  }

  if (!rating || rating.review_count === 0) {
    if (compact) return null;
    return (
      <div style={{ textAlign: 'center', padding: 32 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth="1.5">
          <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z"/>
        </svg>
        <div style={{ fontFamily: DISPLAY, fontSize: '0.9rem', color: C.faint, marginTop: 8 }}>
          No reviews yet
        </div>
        <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.faint }}>
          Be the first to review this seller.
        </div>
      </div>
    );
  }

  const avg = parseFloat(rating.avg_rating);

  if (compact) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <StarRating size="sm" readOnly value={avg} precision="half" />
        <span style={{ fontFamily: BODY, fontSize: '0.8rem', color: C.sapphire, fontWeight: 600 }}>
          {avg.toFixed(1)}
        </span>
        <Link
          to={`/sellers/${sellerId}/reviews`}
          style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.muted, textDecoration: 'none' }}
        >
          ({rating.review_count} review{rating.review_count !== 1 ? 's' : ''})
        </Link>
      </span>
    );
  }

  const starCounts = [
    { star: 5, count: rating.five_star || 0 },
    { star: 4, count: rating.four_star || 0 },
    { star: 3, count: rating.three_star || 0 },
    { star: 2, count: rating.two_star || 0 },
    { star: 1, count: rating.one_star || 0 },
  ];

  return (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
      {/* Left — score */}
      <div style={{ minWidth: 160 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: '3.5rem', color: C.sapphire, lineHeight: 1 }}>
          {avg.toFixed(1)}
        </div>
        <div style={{ marginTop: 8 }}>
          <StarRating size="lg" readOnly value={avg} precision="half" />
        </div>
        <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted, marginTop: 8 }}>
          Based on {rating.review_count} review{rating.review_count !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Right — breakdown */}
      <div style={{ flex: 1, minWidth: 200 }}>
        {starCounts.map(({ star, count }) => (
          <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.muted, width: 36, textAlign: 'right' }}>
              {star} ★
            </span>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.06)' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                width: `${rating.review_count > 0 ? (count / rating.review_count) * 100 : 0}%`,
                background: barColors[star],
                transition: 'width 0.4s ease',
              }} />
            </div>
            <span style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint, width: 24, textAlign: 'right' }}>
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingSummary;
