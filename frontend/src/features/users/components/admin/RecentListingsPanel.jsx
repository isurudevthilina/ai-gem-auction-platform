import { Link, useNavigate } from 'react-router-dom';

const C = {
  white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
  green: '#16a34a', teal: '#0d9488',
  text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const SERIF   = "'Cormorant Garamond','Georgia',serif";
const BODY    = "'Jost','Inter',sans-serif";

const STATUS_STYLE = {
  draft:      { bg: 'rgba(154,154,171,0.12)', color: C.faint },
  listed:     { bg: 'rgba(13,148,136,0.1)', color: C.teal },
  in_auction: { bg: 'rgba(26,77,140,0.1)', color: C.sapphire },
  sold:       { bg: 'rgba(22,163,74,0.1)', color: C.green },
};

const getThumb = (images) => {
  if (!Array.isArray(images)) return null;
  return images.find(i => typeof i === 'string' && !i.startsWith('model:')) || null;
};

const RecentListingsPanel = ({ listings, total, isLoading }) => {
  const navigate = useNavigate();

  const skeletonRow = (key) => (
    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
      <div style={{ width: 48, height: 48, borderRadius: 8, background: C.border, opacity: 0.4 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 12, borderRadius: 6, background: C.border, width: '60%', opacity: 0.4, marginBottom: 4 }} />
        <div style={{ height: 10, borderRadius: 6, background: C.border, width: '40%', opacity: 0.3 }} />
      </div>
    </div>
  );

  return (
    <div style={{
      background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 14,
      padding: '20px 24px',
    }}>
      <div style={{ fontFamily: DISPLAY, fontSize: '0.95rem', fontWeight: 700, color: C.sapphire, marginBottom: 16 }}>
        Recent Gem Listings
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {isLoading && [1, 2, 3, 4, 5].map(skeletonRow)}

        {!isLoading && listings?.map((gem, idx) => {
          const thumb = getThumb(gem.images);
          const ss = STATUS_STYLE[gem.status] || STATUS_STYLE.draft;
          return (
            <div key={gem.id}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', cursor: 'pointer' }}
                onClick={() => navigate(`/gem/${gem.id}`)}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,77,140,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {thumb ? (
                  <img src={thumb} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: 48, height: 48, borderRadius: 8, background: 'rgba(26,77,140,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.sapphire} strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
                    </svg>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: SERIF, fontSize: '0.88rem', fontWeight: 700, color: C.sapphire,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {gem.title}
                  </div>
                  <div style={{ fontFamily: BODY, fontSize: '0.65rem', color: C.faint }}>
                    {gem.seller?.full_name || 'Unknown seller'}
                    {gem.seller?.is_verified && ' \u2714'}
                    {gem.category?.name ? ` · ${gem.category.name}` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                    fontFamily: BODY, fontSize: '0.62rem', fontWeight: 600,
                    background: ss.bg, color: ss.color,
                  }}>
                    {gem.status?.replace('_', ' ')}
                  </span>
                  <div style={{ fontFamily: BODY, fontSize: '0.62rem', color: C.faint, marginTop: 2 }}>
                    {gem.listing_type === 'auction' ? 'Auction' : 'Direct Sale'}
                  </div>
                </div>
              </div>
              {idx < listings.length - 1 && <div style={{ height: 0.5, background: C.border }} />}
            </div>
          );
        })}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 14, paddingTop: 10, borderTop: `0.5px solid ${C.border}`,
      }}>
        <Link to="/admin-dashboard/listings" style={{
          fontFamily: BODY, fontSize: '0.75rem', color: C.sapphire,
          textDecoration: 'none', fontWeight: 600,
        }}>
          View All Listings →
        </Link>
        <span style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.faint }}>
          {total ?? '--'} total listings
        </span>
      </div>
    </div>
  );
};

export default RecentListingsPanel;
