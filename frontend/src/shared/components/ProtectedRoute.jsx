import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { user, isLoading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (isLoading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    const role = String(user?.role || '').trim().toLowerCase();
    if (roles && !roles.includes(role)) {
        return <Navigate to="/unauthorized?reason=role" replace />;
    }

    return children;
};

export default ProtectedRoute;
