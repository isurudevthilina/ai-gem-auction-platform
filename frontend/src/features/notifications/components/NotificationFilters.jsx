const BODY = "'Jost', sans-serif";
const C = {
  sapphire: '#1A4D8C',
  border: 'rgba(30,42,80,0.14)',
  muted: '#64748B',
  gold: '#C4892A',
  bg: '#F0EDE8',
};

const typeGroups = [
  { label: 'All', value: undefined },
  { label: 'Bids', value: 'bids' },
  { label: 'Auctions', value: 'auctions' },
  { label: 'Certificates', value: 'certs' },
];

const bidTypes = ['outbid', 'new_bid'];
const auctionTypes = ['auction_won', 'auction_ending', 'auction_cancelled', 'auction_started'];
const certTypes = ['certificate_verified', 'certificate_rejected'];

const readOptions = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Read', value: 'read' },
];

export const getTypeFilterValues = (group) => {
  if (group === 'bids') return bidTypes;
  if (group === 'auctions') return auctionTypes;
  if (group === 'certs') return certTypes;
  return undefined;
};

export default function NotificationFilters({ filters, onChange, unreadCount }) {
  const activeGroup = filters._group;
  const activeRead = filters.is_read || 'all';

  const handleGroupChange = (group) => {
    onChange({
      ...filters,
      _group: group,
      type: undefined,
      page: 0,
    });
  };

  const handleReadChange = (value) => {
    onChange({ ...filters, is_read: value, page: 0 });
  };

  const pillStyle = (active) => ({
    fontFamily: BODY,
    fontSize: '0.72rem',
    fontWeight: 500,
    padding: '5px 14px',
    borderRadius: 20,
    border: active ? 'none' : `1px solid ${C.border}`,
    background: active ? C.sapphire : 'transparent',
    color: active ? '#fff' : C.muted,
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  });

  return (
    <div
      style={{
        background: '#fff',
        border: `0.5px solid ${C.border}`,
        borderRadius: 14,
        padding: '12px 16px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {/* Type group pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {typeGroups.map((g) => (
          <button
            key={g.label}
            onClick={() => handleGroupChange(g.value)}
            style={pillStyle(activeGroup === g.value)}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div style={{ width: 1, height: 20, background: C.border, margin: '0 4px' }} />

      {/* Read status pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {readOptions.map((r) => (
          <button
            key={r.value}
            onClick={() => handleReadChange(r.value)}
            style={pillStyle(activeRead === r.value)}
          >
            {r.label}
            {r.value === 'unread' && unreadCount > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  background: activeRead === 'unread' ? 'rgba(255,255,255,0.25)' : C.gold,
                  color: activeRead === 'unread' ? '#fff' : '#fff',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: 10,
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
