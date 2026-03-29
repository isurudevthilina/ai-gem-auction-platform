import AdminStatCard from './AdminStatCard';
import { useCurrency } from '../../../../context/CurrencyContext';

/* ── tiny SVG icons ── */
const I = {
  users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  userPlus: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  store: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  bag: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  gavel: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 3.5l6 6M2 22l4-4m3.5-3.5l6-6m-6 6L4 20m11.5-8.5l3-3a2.12 2.12 0 00-3-3l-3 3"/></svg>,
  bolt: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  star: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  receipt: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2v20l4-2 4 2 4-2 4 2V2l-4 2-4-2-4 2z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>,
  dollar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
};

const fmt = (n) => {
  if (n == null) return '--';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const AdminStatsStrip = ({ stats, isLoading }) => {
  const { formatPrice } = useCurrency();
  const s = stats || {};
  const cards = [
    { label: 'Total Users', value: fmt(s.total_users), subValue: s.new_users_today != null ? `+${s.new_users_today} today` : undefined, icon: I.users, color: 'navy', trend: s.new_users_this_week ? { direction: 'up', value: `+${s.new_users_this_week} this week` } : undefined },
    { label: 'New Today', value: fmt(s.new_users_today), icon: I.userPlus, color: 'green' },
    { label: 'Total Sellers', value: fmt(s.users_by_role?.seller), icon: I.store, color: 'navy' },
    { label: 'Total Buyers', value: fmt(s.users_by_role?.buyer), icon: I.bag, color: 'navy' },
    { label: 'Active Auctions', value: fmt(s.active_auctions), subValue: s.total_auctions != null ? `of ${s.total_auctions} total` : undefined, icon: I.gavel, color: 'gold' },
    { label: 'Bids Today', value: fmt(s.total_bids_today), icon: I.bolt, color: 'amber' },
    { label: 'Pending Certificates', value: fmt(s.pending_certificates), icon: I.shield, color: s.pending_certificates > 0 ? 'amber' : 'green' },
    { label: 'Platform Rating', value: s.avg_rating_platform ?? 'N/A', subValue: s.total_reviews != null ? `${s.total_reviews} reviews` : undefined, icon: I.star, color: 'gold' },
    { label: 'Total Transactions', value: fmt(s.total_transactions), subValue: s.completed_transactions != null ? `${s.completed_transactions} completed` : undefined, icon: I.receipt, color: 'navy' },
    { label: 'Simulated Revenue', value: s.total_revenue_simulated != null ? formatPrice(s.total_revenue_simulated) : '--', subValue: 'Demo transactions only', icon: I.dollar, color: 'green' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 12,
    }}>
      {cards.map((c, i) => (
        <AdminStatCard key={i} {...c} loading={isLoading} />
      ))}
    </div>
  );
};

export default AdminStatsStrip;
