import { Link } from 'react-router-dom';

const C = {
  white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
  green: '#16a34a', amber: '#B45309', red: '#B91C1C',
  text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const Dot = ({ color }) => (
  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
);

const PlatformHealthPanel = ({ stats, pendingCerts, auctionsEndingSoon, isLoading }) => {
  if (isLoading) {
    return (
      <div style={{ background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 14, padding: '20px 24px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 14, borderRadius: 6, background: C.border, opacity: 0.4, marginBottom: 12, width: `${70 - i * 10}%` }} />
        ))}
      </div>
    );
  }

  const pendingCount = pendingCerts?.count || 0;
  const pendingColor = pendingCount === 0 ? C.green : pendingCount <= 5 ? C.amber : C.red;
  const soonList = auctionsEndingSoon || [];

  return (
    <div style={{
      background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 14,
      padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ fontFamily: DISPLAY, fontSize: '0.95rem', fontWeight: 700, color: C.sapphire }}>
        Platform Status
      </div>

      {/* Database */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Dot color={stats ? C.green : C.red} />
        <div>
          <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.text, fontWeight: 600 }}>Database</div>
          <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.muted }}>
            {stats ? 'Connected' : 'Error'}
          </div>
        </div>
      </div>

      {/* Active auctions */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Dot color={soonList.length > 0 ? C.amber : C.green} />
        <div>
          <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.text, fontWeight: 600 }}>
            Active Auctions
          </div>
          <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.muted }}>
            {stats?.active_auctions || 0} active
          </div>
          {soonList.length > 0 && (
            <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.amber, marginTop: 4 }}>
              {soonList.length} ending within 2 hours
            </div>
          )}
          {soonList.slice(0, 3).map(a => (
            <div key={a.id} style={{ fontFamily: BODY, fontSize: '0.65rem', color: C.faint, marginTop: 2 }}>
              {a.gem?.title || 'Auction'} — ends {new Date(a.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          ))}
        </div>
      </div>

      {/* Pending certs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Dot color={pendingColor} />
        <div>
          <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.text, fontWeight: 600 }}>
            Pending Certificates
          </div>
          <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.muted }}>
            {pendingCount} awaiting review
          </div>
        </div>
      </div>

      {/* System */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Dot color={C.green} />
        <div>
          <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.text, fontWeight: 600 }}>Recent Errors</div>
          <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.muted }}>
            No errors detected. System operating normally.
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ borderTop: `0.5px solid ${C.border}`, paddingTop: 14 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: '0.68rem', fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Quick Actions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { to: '/admin-dashboard/certs', label: 'Review Certificates' },
            { to: '/admin-dashboard/users', label: 'Manage Users' },
            { to: '/admin-dashboard/listings', label: 'View All Listings' },
          ].map(a => (
            <Link key={a.to} to={a.to} style={{
              fontFamily: BODY, fontSize: '0.75rem', color: C.sapphire,
              textDecoration: 'none', fontWeight: 600,
            }}>
              {a.label} →
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformHealthPanel;
