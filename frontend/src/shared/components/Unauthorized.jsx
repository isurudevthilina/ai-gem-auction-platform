import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const REASONS = {
    expired: 'Your session has expired. Please sign in again.',
    role: 'Your account role does not have access to this page.',
    auth: 'You must be signed in to view this page.',
};

const Unauthorized = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const reason = searchParams.get('reason');

    const dashboard =
        user?.role === 'admin'  ? '/admin-dashboard'  :
        user?.role === 'seller' ? '/seller-dashboard' :
                                  '/overview';

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FDFAF6',
            fontFamily: "'Jost', sans-serif",
        }}>
            <div style={{ textAlign: 'center', maxWidth: 440, padding: '0 24px' }}>
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ marginBottom: 20 }}>
                    <circle cx="32" cy="32" r="28" stroke="#C9A84C" strokeWidth="2" opacity="0.3" />
                    <path d="M32 18v16" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="32" cy="42" r="2" fill="#C9A84C" />
                </svg>
                <h1 style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '2.5rem',
                    color: '#1B3A6B',
                    marginBottom: 8,
                    marginTop: 0,
                }}>
                    403
                </h1>
                <p style={{ fontSize: '1rem', marginBottom: 8, color: '#6B6B7B', lineHeight: 1.6 }}>
                    You do not have permission to access this page.
                </p>
                {reason && REASONS[reason] && (
                    <p style={{ fontSize: '0.88rem', color: '#B45309', marginBottom: 20, lineHeight: 1.5 }}>
                        {REASONS[reason]}
                    </p>
                )}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
                    <Link
                        to="/login"
                        style={{
                            display: 'inline-block',
                            padding: '12px 28px',
                            background: '#1B3A6B',
                            color: '#FFFFFF',
                            borderRadius: 10,
                            fontFamily: "'Cinzel', serif",
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            textDecoration: 'none',
                        }}
                    >
                        Sign In
                    </Link>
                    <Link
                        to={user ? dashboard : '/'}
                        style={{
                            display: 'inline-block',
                            padding: '12px 28px',
                            background: 'transparent',
                            color: '#6B6B7B',
                            border: '1px solid #E8E4DC',
                            borderRadius: 10,
                            fontFamily: "'Cinzel', serif",
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            textDecoration: 'none',
                        }}
                    >
                        {user ? 'Go to Dashboard' : 'Go Home'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
