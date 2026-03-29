import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetSellerReviews, useGetSellerRating, useDeleteReview } from '../hooks/useReviews';
import { useAuth } from '../../../context/AuthContext';
import RatingSummary from '../components/RatingSummary';
import ReviewCard from '../components/ReviewCard';
import { supabase } from '../../../config/supabase';
import { useQuery } from '@tanstack/react-query';

const C = {
  bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
  goldLight: 'rgba(196,137,42,0.10)',
  green: '#16a34a', red: '#B91C1C',
  text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF   = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const RATINGS = ['All', 5, 4, 3, 2, 1];
const SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
];

const SellerReviewsPage = () => {
  const { sellerId } = useParams();
  const { user } = useAuth();
  const [ratingFilter, setRatingFilter] = useState(null);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const limit = 10;

  const currentUserId = user?.id;
  const isAdmin = user?.role === 'admin';
  const deleteMutation = useDeleteReview();
  const handleDelete = (reviewId) => deleteMutation.mutate(reviewId);

  /* ---------- seller profile ---------- */
  const { data: seller } = useQuery({
    queryKey: ['seller-profile', sellerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, business_name')
        .eq('id', sellerId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60_000,
  });

  /* ---------- reviews + rating ---------- */
  const reviewsQuery = useGetSellerReviews(sellerId, {
    rating: ratingFilter,
    sort,
    page: page - 1,
    limit,
  });
  const reviews  = reviewsQuery.data?.data || [];
  const total    = reviewsQuery.data?.count || 0;
  const totalPages = Math.ceil(total / limit);

  const ratingQuery = useGetSellerRating(sellerId);

  /* ---------- Shimmer ---------- */
  const shimmerCard = (
    <div style={{ background: C.white, borderRadius: 16, padding: 24, border: `0.5px solid ${C.border}` }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 14, borderRadius: 6, background: C.border, opacity: 0.4, marginBottom: 10, width: `${80 - i * 15}%` }} />
      ))}
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Seller header */}
        <div style={{
          background: C.white, borderRadius: 16, padding: '24px 28px',
          border: `0.5px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.sapphire}, ${C.gold})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontFamily: DISPLAY, fontSize: '1.1rem', fontWeight: 700,
            overflow: 'hidden',
          }}>
            {seller?.avatar_url
              ? <img src={seller.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (seller?.full_name || '?').charAt(0).toUpperCase()
            }
          </div>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: '1.4rem', color: C.sapphire, fontWeight: 700 }}>
              {seller?.business_name || seller?.full_name || 'Seller'}
            </div>
            <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted }}>
              Seller Reviews
            </div>
          </div>
        </div>

        {/* Rating summary */}
        <div style={{ marginBottom: 28 }}>
          <RatingSummary sellerId={sellerId} />
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10,
          marginBottom: 20,
        }}>
          {RATINGS.map(r => {
            const active = r === 'All' ? ratingFilter === null : ratingFilter === r;
            return (
              <button
                key={r}
                onClick={() => { setRatingFilter(r === 'All' ? null : r); setPage(1); }}
                style={{
                  padding: '6px 14px', borderRadius: 20,
                  border: `1px solid ${active ? C.gold : C.border}`,
                  background: active ? C.goldLight : 'transparent',
                  color: active ? C.gold : C.muted,
                  fontFamily: BODY, fontSize: '0.78rem', fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {r === 'All' ? 'All' : `${r} ★`}
              </button>
            );
          })}

          <div style={{ marginLeft: 'auto' }}>
            <select
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1); }}
              style={{
                padding: '6px 12px', borderRadius: 10,
                border: `1px solid ${C.border}`, background: C.white,
                fontFamily: BODY, fontSize: '0.78rem', color: C.text,
                cursor: 'pointer', outline: 'none',
              }}
            >
              {SORTS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reviews list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviewsQuery.isLoading && (
            <>{shimmerCard}{shimmerCard}{shimmerCard}</>
          )}

          {!reviewsQuery.isLoading && reviews.length === 0 && (
            <div style={{
              background: C.white, borderRadius: 16, padding: 48,
              border: `0.5px solid ${C.border}`, textAlign: 'center',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.4h7.6L12 2z"
                  stroke={C.faint} strokeWidth="1.2" fill="none" />
              </svg>
              <div style={{ fontFamily: SERIF, fontSize: '1.1rem', color: C.sapphire, marginTop: 12 }}>
                {ratingFilter ? 'No reviews with this rating' : 'No reviews yet'}
              </div>
              <div style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.muted, marginTop: 4 }}>
                {ratingFilter
                  ? 'Try a different filter or view all reviews.'
                  : 'Be the first to leave a review for this seller.'}
              </div>
            </div>
          )}

          {reviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 8,
            marginTop: 28, paddingBottom: 32,
          }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              style={{
                padding: '8px 16px', borderRadius: 10,
                border: `1px solid ${C.border}`, background: C.white,
                color: page <= 1 ? C.faint : C.sapphire,
                fontFamily: BODY, fontSize: '0.78rem', fontWeight: 600,
                cursor: page <= 1 ? 'default' : 'pointer',
                opacity: page <= 1 ? 0.5 : 1,
              }}
            >
              ← Previous
            </button>
            <span style={{
              fontFamily: BODY, fontSize: '0.78rem', color: C.muted,
              display: 'flex', alignItems: 'center',
            }}>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              style={{
                padding: '8px 16px', borderRadius: 10,
                border: `1px solid ${C.border}`, background: C.white,
                color: page >= totalPages ? C.faint : C.sapphire,
                fontFamily: BODY, fontSize: '0.78rem', fontWeight: 600,
                cursor: page >= totalPages ? 'default' : 'pointer',
                opacity: page >= totalPages ? 0.5 : 1,
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerReviewsPage;
