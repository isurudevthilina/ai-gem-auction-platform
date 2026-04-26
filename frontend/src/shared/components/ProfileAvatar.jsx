import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, LayoutDashboard, Heart, Gavel, GemIcon, ListPlus, ShieldCheck, ShoppingBag, BarChart3 } from 'lucide-react';

const getMenuItems = (role) => {
    const items = [
        { label: 'My Profile', to: '/profile', icon: User },
    ];

    if (role === 'buyer') {
        items.push(
            { label: 'Overview', to: '/overview', icon: BarChart3 },
            { label: 'Watchlist', to: '/watchlist', icon: Heart },
            { label: 'My Bids', to: '/bid-history', icon: Gavel },
            { label: 'Purchases', to: '/transactions', icon: ShoppingBag },
        );
    } else if (role === 'seller') {
        items.push(
            { label: 'Seller Dashboard', to: '/seller-dashboard', icon: LayoutDashboard },
            { label: 'My Listings', to: '/seller-dashboard', icon: GemIcon, state: { tab: 'listings' } },
            { label: 'Watchlist', to: '/watchlist', icon: Heart },
            { label: 'List New Gem', to: '/gems/new', icon: ListPlus },
        );
    } else if (role === 'admin') {
        items.push(
            { label: 'Admin Dashboard', to: '/admin-dashboard', icon: ShieldCheck },
        );
    }

    return items;
};

export default function ProfileAvatar() {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const initials = user?.full_name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ?? '?';

    useEffect(() => {
        const handler = (e) => {
            if (!ref.current?.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSignOut = async () => {
        setOpen(false);
        await logout();
        navigate('/login');
    };

    const menuItems = getMenuItems(user?.role);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            {/* Avatar Button */}
            <button
                onClick={() => setOpen((v) => !v)}
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: open ? '1.5px solid #D4AF37' : '1.5px solid transparent',
                    boxShadow: open ? '0 0 0 3px rgba(212,175,55,0.15)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: '0.04em',
                    color: '#F7F5EF',
                    background: '#1B3A6B',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                    padding: 0,
                    flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                    if (!open) {
                        e.currentTarget.style.borderColor = '#D4AF37';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.12)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!open) {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.boxShadow = 'none';
                    }
                }}
            >
                {user?.avatar_url
                    ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : initials}
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: 230,
                    background: '#FDFCF8',
                    border: '1px solid rgba(30,42,80,0.12)',
                    borderRadius: 14,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    zIndex: 300,
                    overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '14px 16px',
                        borderBottom: '1px solid rgba(30,42,80,0.08)',
                    }}>
                        <p style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#1B3A6B',
                            margin: 0,
                            lineHeight: 1.3,
                        }}>
                            {user?.full_name || 'My Account'}
                        </p>
                        <p style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: '0.72rem',
                            color: '#6B6B7B',
                            margin: '2px 0 0',
                        }}>
                            {user?.email}
                        </p>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            marginTop: 8,
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            fontFamily: "'Jost', sans-serif",
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: '#9A6B1E',
                            background: 'rgba(201,168,76,0.12)',
                            padding: '3px 10px',
                            borderRadius: 6,
                        }}>
                            <span style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: '#C9A84C',
                                flexShrink: 0,
                            }} />
                            {user?.role}
                        </span>
                    </div>

                    {/* Menu Items */}
                    <div style={{ padding: '6px 0' }}>
                        {menuItems.map(({ label, to, icon: Icon, state }) => (
                            <button
                                key={to + label}
                                onClick={() => { navigate(to, state ? { state } : undefined); setOpen(false); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '10px 16px',
                                    fontSize: '0.84rem',
                                    fontFamily: "'Jost', sans-serif",
                                    fontWeight: 500,
                                    color: '#1E293B',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30,42,80,0.04)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                            >
                                <Icon size={15} strokeWidth={1.8} style={{ color: '#6B6B7B', flexShrink: 0 }} />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Sign Out */}
                    <div style={{ borderTop: '1px solid rgba(30,42,80,0.07)' }}>
                        <button
                            onClick={handleSignOut}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                width: '100%',
                                textAlign: 'left',
                                padding: '10px 16px',
                                fontSize: '0.84rem',
                                fontFamily: "'Jost', sans-serif",
                                fontWeight: 500,
                                color: '#dc2626',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <LogOut size={15} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
