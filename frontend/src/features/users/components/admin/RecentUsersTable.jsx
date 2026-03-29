import { Link } from 'react-router-dom';

const C = {
  white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
  goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a',
  text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const ROLE_STYLE = {
  buyer:  { bg: 'rgba(154,154,171,0.12)', color: C.faint },
  seller: { bg: C.goldLight, color: C.gold },
  admin:  { bg: C.sapphire, color: '#fff' },
};

const relativeTime = (dateStr) => {
  if (!dateStr) return '--';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const RecentUsersTable = ({ users, total, isLoading }) => {
  const skeletonRow = (key) => (
    <tr key={key}>
      {[1, 2, 3, 4].map(c => (
        <td key={c} style={{ padding: '10px 12px' }}>
          <div style={{ height: 12, borderRadius: 6, background: C.border, width: `${60 + c * 8}%`, opacity: 0.4 }} />
        </td>
      ))}
    </tr>
  );

  return (
    <div style={{
      background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 14,
      padding: '20px 24px', overflow: 'hidden',
    }}>
      <div style={{ fontFamily: DISPLAY, fontSize: '0.95rem', fontWeight: 700, color: C.sapphire, marginBottom: 16 }}>
        Recent Registrations
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['User', 'Role', 'Joined', 'Status'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '0 12px 10px',
                  fontFamily: BODY, fontSize: '0.65rem', fontWeight: 600,
                  color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em',
                  borderBottom: `0.5px solid ${C.border}`,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && [1, 2, 3, 4, 5].map(skeletonRow)}
            {!isLoading && users?.map(u => (
              <tr key={u.id} style={{ borderBottom: `0.5px solid ${C.border}` }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,77,140,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(26,77,140,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: DISPLAY, fontSize: '0.7rem', fontWeight: 700, color: C.sapphire,
                    }}>
                      {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.text, fontWeight: 600 }}>
                        {u.full_name || 'Unnamed'}
                      </div>
                      <div style={{ fontFamily: BODY, fontSize: '0.65rem', color: C.faint }}>
                        {u.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                    fontFamily: BODY, fontSize: '0.65rem', fontWeight: 600,
                    background: ROLE_STYLE[u.role]?.bg || C.border,
                    color: ROLE_STYLE[u.role]?.color || C.muted,
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', fontFamily: BODY, fontSize: '0.72rem', color: C.muted }}>
                  {relativeTime(u.created_at)}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                    fontFamily: BODY, fontSize: '0.65rem', fontWeight: 600,
                    background: u.is_verified ? 'rgba(22,163,74,0.1)' : 'rgba(180,83,9,0.1)',
                    color: u.is_verified ? C.green : '#B45309',
                  }}>
                    {u.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 14, paddingTop: 10, borderTop: `0.5px solid ${C.border}`,
      }}>
        <Link to="/admin-dashboard/users" style={{
          fontFamily: BODY, fontSize: '0.75rem', color: C.sapphire,
          textDecoration: 'none', fontWeight: 600,
        }}>
          View All Users →
        </Link>
        <span style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.faint }}>
          {total ?? '--'} total users
        </span>
      </div>
    </div>
  );
};

export default RecentUsersTable;
