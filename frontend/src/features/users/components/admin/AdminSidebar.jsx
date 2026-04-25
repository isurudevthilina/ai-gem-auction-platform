import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, Users, Gem, Gavel, Receipt, Star } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import DashboardSidebar from '../../../../shared/components/DashboardSidebar';

const ADMIN_NAV = [
  { id: 'dashboard',    label: 'Dashboard',    Icon: LayoutDashboard, path: '/admin-dashboard' },
  { id: 'certs',        label: 'Certificates', Icon: ShieldCheck,     path: '/admin-dashboard/certs', badge: true },
  { id: 'users',        label: 'Users',        Icon: Users,           path: '/admin-dashboard/users' },
  { id: 'listings',     label: 'Listings',     Icon: Gem,             path: '/admin-dashboard/listings' },
  { id: 'auctions',     label: 'Auctions',     Icon: Gavel,           path: '/admin-dashboard/auctions' },
  { id: 'transactions', label: 'Transactions', Icon: Receipt,         path: '/admin-dashboard/transactions' },
  { id: 'reviews',      label: 'Reviews',      Icon: Star,            path: '/admin-dashboard/reviews' },
];

const AdminSidebar = ({ pendingCount = 0 }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const initials = (user?.full_name || 'A').charAt(0).toUpperCase();

  const handleSignOut = async () => {
    try { await logout(); } catch {}
    // Replace history entry so account switching cannot bounce back to prior protected pages.
    navigate('/login', { replace: true, state: null });
  };

  return (
    <DashboardSidebar
      navItems={ADMIN_NAV}
      role="Admin"
      displayName={user?.full_name || 'Admin'}
      initials={initials}
      pendingCount={pendingCount}
      onSignOut={handleSignOut}
    />
  );
};

export default AdminSidebar;
