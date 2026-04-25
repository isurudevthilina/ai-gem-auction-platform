import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RoleDashboardRedirect = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) return null;

    // Centralized dashboard routing keeps post-login and manual /dashboard visits consistent.
    if (user?.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user?.role === 'seller') return <Navigate to="/seller-dashboard" replace />;
    return <Navigate to="/overview" replace />;
};

export default RoleDashboardRedirect;