import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Gavel, Award, ShoppingBag, Plus, TrendingUp } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import SellerStatus from '../components/SellerStatus';
import MyListings from '../components/MyListings';
import MyAuctions from '../components/MyAuctions';
import CertificateUpload from '../../certificates/components/CertificateUpload';

/* ─── Design tokens ─── */
const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
    text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const getAuthHeaders = () => {
    const token = localStorage.getItem('gembid_token');
    return token
        ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        : { 'Content-Type': 'application/json' };
};
const apiFetch = async (path, options = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { ...getAuthHeaders(), ...options.headers },
    });
    const data = await res.json();
    if (!res.ok) throw { ...data, status: res.status };
    return data;
};

const TABS = [
    { id: 'overview',     label: 'Overview',     Icon: LayoutDashboard },
    { id: 'listings',     label: 'My Listings',  Icon: Package },
    { id: 'auctions',     label: 'My Auctions',  Icon: Gavel },
    { id: 'certificates', label: 'Certificates', Icon: Award },
    { id: 'purchases',    label: 'Purchases',    Icon: ShoppingBag },
];

const SellerDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        apiFetch('/api/users/me').then(r => setProfile(r.data)).catch(() => {});
    }, []);

    // Allow deep-linking via location.state
    useEffect(() => {
        if (location.state?.tab && location.state.tab !== activeTab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state?.tab]);

    const displayName = profile?.full_name || user?.full_name || 'Seller';
    const initials = displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 18) return 'Good afternoon';
        return 'Good evening';
    })();

    return (
        <div style={{ minHeight: 'calc(100vh - 88px)', background: C.bg, fontFamily: BODY }}>

            {/* ═══════════ HERO HEADER ═══════════ */}
            <div style={{
                background: `linear-gradient(135deg, ${C.sapphire} 0%, #0F3460 60%, #0A1F3F 100%)`,
                padding: '40px 0 0',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative gem pattern */}
                <div style={{
                    position: 'absolute', top: -60, right: -40, width: 260, height: 260,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(196,137,42,0.12) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: -30, left: '15%', width: 180, height: 180,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px' }}>
                    {/* ── Welcome row ── */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            {/* Avatar */}
                            {user?.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={displayName}
                                    style={{
                                        width: 56, height: 56, borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '2.5px solid rgba(196,137,42,0.5)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: 56, height: 56, borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.12)',
                                    border: '2.5px solid rgba(196,137,42,0.4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1rem', fontWeight: 700, fontFamily: DISPLAY,
                                    color: '#fff', letterSpacing: '0.04em',
                                }}>
                                    {initials}
                                </div>
                            )}
                            <div>
                                <div style={{
                                    fontFamily: BODY, fontSize: '0.78rem', fontWeight: 500,
                                    color: 'rgba(255,255,255,0.55)', marginBottom: 4,
                                }}>
                                    {greeting},
                                </div>
                                <h1 style={{
                                    margin: 0, fontFamily: DISPLAY, fontWeight: 700,
                                    fontSize: '1.55rem', color: '#fff', letterSpacing: '0.04em',
                                    lineHeight: 1.15,
                                }}>
                                    {displayName}
                                </h1>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                    marginTop: 8, padding: '3px 12px', borderRadius: 20,
                                    background: 'rgba(196,137,42,0.18)',
                                    fontFamily: BODY, fontSize: '0.62rem', fontWeight: 700,
                                    color: C.gold, textTransform: 'uppercase', letterSpacing: '0.1em',
                                }}>
                                    <TrendingUp size={11} />
                                    Seller
                                </div>
                            </div>
                        </div>

                        {/* Quick action */}
                        <button
                            onClick={() => navigate('/gems/new')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '11px 24px', borderRadius: 10,
                                background: C.gold, border: 'none',
                                color: '#fff', fontFamily: BODY, fontSize: '0.85rem', fontWeight: 700,
                                cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: '0 4px 16px rgba(196,137,42,0.35)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(196,137,42,0.45)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(196,137,42,0.35)'; }}
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            List a Gem
                        </button>
                    </div>

                    {/* ── Horizontal tab navigation ── */}
                    <nav style={{
                        display: 'flex', gap: 2,
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}>
                        {TABS.map(({ id, label, Icon }) => {
                            const active = activeTab === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '13px 22px',
                                        background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        border: 'none',
                                        borderBottom: active ? `2.5px solid ${C.gold}` : '2.5px solid transparent',
                                        borderRadius: '8px 8px 0 0',
                                        cursor: 'pointer',
                                        fontFamily: BODY, fontSize: '0.84rem',
                                        fontWeight: active ? 700 : 500,
                                        color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                                        transition: 'all 0.2s',
                                        whiteSpace: 'nowrap',
                                    }}
                                    onMouseEnter={e => {
                                        if (!active) {
                                            e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!active) {
                                            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                                    {label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* ═══════════ CONTENT ═══════════ */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 40px 56px' }}>
                {activeTab === 'overview'     && <SellerStatus profile={profile} />}
                {activeTab === 'listings'     && <MyListings />}
                {activeTab === 'auctions'     && <MyAuctions />}
                {activeTab === 'certificates' && <CertificateUpload />}
                {activeTab === 'purchases'    && (
                    <div style={{
                        textAlign: 'center', padding: '64px 20px',
                        background: C.white, borderRadius: 16,
                        border: `1px solid ${C.border}`,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: C.goldLight, margin: '0 auto 18px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <ShoppingBag size={28} style={{ color: C.gold }} />
                        </div>
                        <div style={{ fontFamily: SERIF, fontSize: '1.15rem', color: C.text, fontWeight: 600, marginBottom: 8 }}>
                            Incoming Purchase Requests
                        </div>
                        <div style={{ color: C.muted, fontSize: '0.88rem', fontFamily: BODY, marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
                            Review and complete buyer purchase requests for your gems.
                        </div>
                        <button
                            onClick={() => navigate('/transactions')}
                            style={{
                                padding: '11px 32px', borderRadius: 10, border: 'none',
                                background: C.sapphire, color: '#fff', fontFamily: BODY,
                                fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                                transition: 'opacity 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                        >
                            Open Purchase Requests
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerDashboard;
