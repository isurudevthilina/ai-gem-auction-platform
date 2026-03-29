import { useGetRecentActivity } from '../../hooks/useAdminStats';

const C = {
  white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
  green: '#16a34a', amber: '#B45309', teal: '#0d9488',
  text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const TYPE_CFG = {
  new_user:       { bg: C.sapphire, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/></svg>, fmt: (l, s) => `${l || 'User'} registered as ${s}` },
  new_listing:    { bg: C.teal,     icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg>, fmt: (l) => `New gem listed: ${l}` },
  new_bid:        { bg: C.gold,     icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, fmt: (l) => `Bid of $${l} placed` },
  cert_submitted: { bg: C.amber,    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, fmt: (l) => `${l} certificate submitted for review` },
  txn_completed:  { bg: C.green,    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>, fmt: (l) => `Transaction completed — $${l}` },
};

const relativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const RecentActivityFeed = () => {
  const { data: activity, isLoading } = useGetRecentActivity();

  const skeletonRow = (key) => (
    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.border, opacity: 0.5 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 12, borderRadius: 6, background: C.border, width: '70%', opacity: 0.5, marginBottom: 4 }} />
        <div style={{ height: 10, borderRadius: 6, background: C.border, width: '30%', opacity: 0.3 }} />
      </div>
    </div>
  );

  return (
    <div style={{
      background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 14,
      padding: '20px 24px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: DISPLAY, fontSize: '0.95rem', fontWeight: 700, color: C.sapphire }}>
            Recent Activity
          </div>
          <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.faint }}>Last 48 hours</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: C.green,
            display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite',
          }} />
          <span style={{ fontFamily: BODY, fontSize: '0.65rem', color: C.green, fontWeight: 600 }}>Live</span>
        </div>
      </div>

      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {isLoading && [1, 2, 3, 4, 5].map(skeletonRow)}

        {!isLoading && (!activity || activity.length === 0) && (
          <div style={{ textAlign: 'center', padding: '24px 0', fontFamily: BODY, fontSize: '0.82rem', color: C.faint }}>
            No activity in the last 48 hours
          </div>
        )}

        {!isLoading && activity?.map((item, idx) => {
          const cfg = TYPE_CFG[item.type] || TYPE_CFG.new_listing;
          return (
            <div key={`${item.type}-${item.reference_id}-${idx}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: cfg.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {cfg.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: BODY, fontSize: '0.78rem', color: C.text,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {cfg.fmt(item.label, item.sub_label)}
                  </div>
                </div>
                <div style={{ fontFamily: BODY, fontSize: '0.65rem', color: C.faint, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {relativeTime(item.created_at)}
                </div>
              </div>
              {idx < activity.length - 1 && (
                <div style={{ height: 0.5, background: C.border }} />
              )}
            </div>
          );
        })}
      </div>

      <style>{`@keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
};

export default RecentActivityFeed;
