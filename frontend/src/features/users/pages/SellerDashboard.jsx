import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Gavel, Award, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import DashboardSidebar, { SIDEBAR_W } from '../../../shared/components/DashboardSidebar';
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

const NAV_ITEMS = [
    { id: 'overview',      label: 'Overview',     Icon: LayoutDashboard },
    { id: 'listings',      label: 'Listings',     Icon: Package },
    { id: 'auctions',      label: 'Auctions',     Icon: Gavel },
    { id: 'certificates',  label: 'Certificates', Icon: Award },
    { id: 'purchases',     label: 'Purchases',    Icon: ShoppingBag },
];

const TAB_TITLES = {
    overview: 'Overview', listings: 'My Listings',
    auctions: 'My Auctions', certificates: 'Certificates',
    purchases: 'Purchase Requests',
};



const SellerDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        apiFetch('/api/users/me').then(r => setProfile(r.data)).catch(() => {});
    }, []);

    const displayName = profile?.full_name || user?.full_name || 'Seller';
    const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const handleSignOut = async () => {
        try { await logout(); } catch {}
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 88px)', background: C.bg, fontFamily: BODY }}>
            {/* ── Left Sidebar ── */}
            <DashboardSidebar
                navItems={NAV_ITEMS}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                role="Seller"
                displayName={displayName}
                initials={initials}
                onSignOut={handleSignOut}
            />

            {/* ── Main content ── */}
            <main style={{ flex: 1, marginLeft: SIDEBAR_W, overflowY: 'auto' }}>
                {/* Title strip */}
                <div style={{
                    padding: '28px 40px 20px',
                    borderBottom: `1px solid ${C.border}`,
                    background: C.white,
                }}>
                    <h1 style={{
                        margin: 0, fontFamily: DISPLAY, fontWeight: 700,
                        fontSize: '1.4rem', color: C.sapphire,
                        letterSpacing: '0.03em',
                    }}>
                        {TAB_TITLES[activeTab]}
                    </h1>
                </div>

                {/* Section content */}
                <div style={{ padding: '32px 40px 48px' }}>
                    {activeTab === 'overview'     && <SellerStatus profile={profile} />}
                    {activeTab === 'listings'      && <MyListings />}
                    {activeTab === 'auctions'      && <MyAuctions />}
                    {activeTab === 'certificates'  && <CertificateUpload />}
                    {activeTab === 'purchases'     && (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <ShoppingBag size={48} style={{ color: C.faint, marginBottom: 16 }} />
                            <div style={{ fontFamily: SERIF, fontSize: '1.1rem', color: C.text, marginBottom: 6 }}>Incoming Purchase Requests</div>
                            <div style={{ color: C.muted, fontSize: '0.85rem', marginBottom: 20 }}>Review and complete buyer purchase requests for your gems.</div>
                            <button onClick={() => navigate('/transactions')} style={{
                                padding: '10px 28px', borderRadius: 10, border: 'none',
                                background: C.sapphire, color: '#fff', fontFamily: BODY,
                                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                            }}>Open Purchase Requests</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SellerDashboard;
