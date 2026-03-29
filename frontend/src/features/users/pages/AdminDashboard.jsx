import { useAuth } from '../../../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useGetDashboardData } from '../hooks/useAdminStats';
import AdminSidebar from '../components/admin/AdminSidebar';
import { SIDEBAR_W } from '../../../shared/components/DashboardSidebar';
import AdminStatsStrip from '../components/admin/AdminStatsStrip';
import PendingCertsBanner from '../components/admin/PendingCertsBanner';
import RecentActivityFeed from '../components/admin/RecentActivityFeed';
import PlatformHealthPanel from '../components/admin/PlatformHealthPanel';
import RecentUsersTable from '../components/admin/RecentUsersTable';
import RecentListingsPanel from '../components/admin/RecentListingsPanel';

const C = {
  bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C',
  gold: '#C4892A', text: '#1A1A2E', muted: '#6B6B7B',
  faint: '#9A9AAB', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const AdminDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetDashboardData();

  const stats = data?.stats;
  const recentUsers = data?.recentUsers;
  const recentListings = data?.recentListings;
  const pendingCerts = data?.pendingCerts;
  const auctionsEndingSoon = data?.auctionsEndingSoon;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin'] });
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 88px)', background: C.bg }}>
      <AdminSidebar pendingCount={pendingCerts?.count || 0} />

      <main style={{ marginLeft: SIDEBAR_W, padding: '32px 40px', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <h1 style={{ fontFamily: DISPLAY, fontSize: '1.6rem', fontWeight: 700, color: C.sapphire, margin: '4px 0 0' }}>
              Welcome back, {user?.full_name?.split(' ')[0] || 'Admin'}
            </h1>
          </div>
          <button onClick={handleRefresh} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 20px', borderRadius: 10,
            background: C.white, border: `0.5px solid ${C.border}`,
            fontFamily: BODY, fontSize: '0.78rem', fontWeight: 600,
            color: C.sapphire, cursor: 'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* Pending Certs Banner */}
        {pendingCerts?.count > 0 && (
          <div style={{ marginBottom: 24 }}>
            <PendingCertsBanner count={pendingCerts.count} />
          </div>
        )}

        {/* Stats Strip */}
        <div style={{ marginBottom: 28 }}>
          <AdminStatsStrip stats={stats} isLoading={isLoading} />
        </div>

        {/* Two-column: Activity + Health */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, marginBottom: 28 }}>
          <RecentActivityFeed />
          <PlatformHealthPanel
            stats={stats}
            pendingCerts={pendingCerts}
            auctionsEndingSoon={auctionsEndingSoon}
            isLoading={isLoading}
          />
        </div>

        {/* Two-column: Users + Listings */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <RecentUsersTable
            users={recentUsers}
            total={stats?.total_users}
            isLoading={isLoading}
          />
          <RecentListingsPanel
            listings={recentListings}
            total={stats?.total_gems}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
