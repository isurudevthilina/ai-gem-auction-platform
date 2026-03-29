import { useGetSellerRating } from '../hooks/useReviews';

const C = {
  gold: '#C4892A', sapphire: '#1A4D8C', muted: '#6B6B7B', border: '#E0DCD6',
};
const BODY = "'Jost','Inter',sans-serif";

const SellerRatingBadge = ({ sellerId }) => {
  const { data, isLoading } = useGetSellerRating(sellerId);

  if (isLoading) {
    return (
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: C.border, display: 'inline-block',
      }} />
    );
  }

  if (!data || data.review_count === 0) return null;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill={C.gold}>
        <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z"/>
      </svg>
      <span style={{ fontFamily: BODY, fontSize: 12, color: C.sapphire, fontWeight: 600 }}>
        {parseFloat(data.avg_rating).toFixed(1)}
      </span>
      <span style={{ fontFamily: BODY, fontSize: 11, color: C.muted }}>
        ({data.review_count})
      </span>
    </span>
  );
};

export default SellerRatingBadge;
