import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Shield, CheckCircle, XCircle, ChevronDown,
    Search, Filter, Activity, PauseCircle, PlayCircle, Clock
} from 'lucide-react';
import GemCard from '../components/GemCard';

/* ─── colour tokens — mirrors landing page ─── */
const C = {
    bg: '#0a0d14',
    panel: '#0f1220',
    card: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.08)',
    gold: '#f59e0b',
    goldDim: 'rgba(245,158,11,0.15)',
    green: '#10b981',
    red: '#ef4444',
    indigo: '#6366f1',
    text: '#f1f5f9',
    muted: '#94a3b8',
    dim: '#475569',
};

const glassCard = {
    background: 'rgba(13,17,28,0.85)',
    border: `1px solid ${C.border}`,
    borderRadius: '14px',
    backdropFilter: 'blur(18px)',
};

/* ════════════════════════════════════════════════════
   TOP NAVBAR
════════════════════════════════════════════════════ */
const Navbar = ({ active, setActive }) => {
    const navigate = useNavigate();

    const navLinks = [
        { id: 'users', label: 'Manage Users', icon: Users },
        { id: 'gems', label: 'Gem Approvals', icon: Shield },
        { id: 'auctions', label: 'Manage Auctions', icon: Activity },
    ];

    return (
        <header style={{
            position: 'sticky', top: 0, zIndex: 40,
            background: `${C.panel}ee`,
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center',
            padding: '0 32px', height: 64, gap: 32,
        }}>
            {/* Logo */}
            <div
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}
                onClick={() => navigate('/')}
            >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f59e0b"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.6))' }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span style={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.03em' }}>
                    <span style={{ color: C.text }}>Admin</span>
                    <span style={{ color: C.gold }}>Panel</span>
                </span>
            </div>

            {/* Nav links */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
                {navLinks.map(({ id, label, icon: Icon }) => {
                    const isActive = active === id;
                    return (
                        <button key={id} onClick={() => setActive(id)} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '7px 16px', borderRadius: 8, border: 'none',
                            background: isActive ? C.goldDim : 'transparent',
                            color: isActive ? C.gold : C.muted,
                            fontWeight: isActive ? 700 : 500, fontSize: '0.875rem',
                            cursor: 'pointer', transition: 'all 0.2s',
                            borderBottom: isActive ? `2px solid ${C.gold}` : '2px solid transparent',
                        }}
                            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = C.text; } }}
                            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = C.muted; } }}
                        >
                            <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                            {label}
                        </button>
                    );
                })}
            </nav>

            {/* Right side: Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                {/* Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/profile')}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#10b981,#047857)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '0.82rem', color: '#fff', flexShrink: 0,
                    }}>AD</div>
                    <div style={{ lineHeight: 1.25 }}>
                        <div style={{ color: C.text, fontWeight: 700, fontSize: '0.8rem' }}>Admin System</div>
                        <div style={{ color: C.green, fontSize: '0.65rem', fontWeight: 600 }}>🛡️ Super Admin</div>
                    </div>
                    <ChevronDown size={14} style={{ color: C.dim }} />
                </div>
            </div>
        </header>
    );
};

/* ════════════════════════════════════════════════════
   MOCK DATA
════════════════════════════════════════════════════ */
const mockUsers = [
    { id: 1, name: 'Amara Silva', email: 'amara@example.com', role: 'Seller', joined: 'Oct 12, 2025', status: 'Active', color: '#f59e0b' },
    { id: 2, name: 'John Doe', email: 'john@example.com', role: 'Buyer', joined: 'Jan 05, 2026', status: 'Active', color: '#3b82f6' },
    { id: 3, name: 'Elena Rosas', email: 'elena@example.com', role: 'Seller', joined: 'Sep 22, 2025', status: 'Suspended', color: '#ef4444' },
    { id: 4, name: 'Marcus Chen', email: 'marcus@example.com', role: 'Buyer', joined: 'Feb 14, 2026', status: 'Active', color: '#3b82f6' },
];

const pendingGems = [
    { id: 7, name: 'Unheated Yellow Sapphire', carat: 3.5, bid: 0, buyNow: 8000, status: 'Pending', ends: '7 Days', category: 'Sapphire', seller: 'Amara Silva' },
    { id: 8, name: 'Burmese Ruby Rough', carat: 5.2, bid: 0, buyNow: 15000, status: 'Pending', ends: '3 Days', category: 'Ruby', seller: 'GemCrafter Ltd' },
];

const activeAuctions = [
    { id: 10, name: 'Royal Blue Sapphire', carat: 2.5, currentBid: 12500, bids: 14, ends: '12h 30m', seller: 'Amara Silva', status: 'Live' },
    { id: 11, name: 'Pigeon Blood Ruby', carat: 1.8, currentBid: 28000, bids: 32, ends: '04h 15m', seller: 'RubyMasters', status: 'Live' },
    { id: 12, name: 'Suspicious Diamond', carat: 4.2, currentBid: 95000, bids: 89, ends: '01h 10m', seller: 'UnknownUser99', status: 'Under Review' },
];


/* ════════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
════════════════════════════════════════════════════ */
const AdminDashboard = () => {
    const [activePage, setActivePage] = useState('users');
    const [search, setSearch] = useState('');

    const renderUsers = () => (
        <div style={{ ...glassCard, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                        <th style={{ padding: '20px 24px', color: C.dim, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                        <th style={{ padding: '20px 24px', color: C.dim, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                        <th style={{ padding: '20px 24px', color: C.dim, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</th>
                        <th style={{ padding: '20px 24px', color: C.dim, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                        <th style={{ padding: '20px 24px', color: C.dim, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {mockUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase())).map((user, idx) => (
                        <tr key={user.id} style={{
                            borderBottom: idx === mockUsers.length - 1 ? 'none' : `1px solid ${C.border}`,
                            transition: 'background 0.2s'
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <td style={{ padding: '20px 24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${user.color}20`, color: user.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <div style={{ color: C.text, fontWeight: 700, fontSize: '0.95rem' }}>{user.name}</div>
                                        <div style={{ color: C.muted, fontSize: '0.8rem', marginTop: 2 }}>{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '20px 24px', color: C.text, fontSize: '0.9rem', fontWeight: 600 }}>{user.role}</td>
                            <td style={{ padding: '20px 24px', color: C.muted, fontSize: '0.9rem' }}>{user.joined}</td>
                            <td style={{ padding: '20px 24px' }}>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '6px 12px', borderRadius: '999px',
                                    background: user.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                    color: user.status === 'Active' ? C.green : C.red,
                                    fontSize: '0.75rem', fontWeight: 700
                                }}>
                                    {user.status === 'Active' ? <CheckCircle size={14} /> : <XCircle size={14} />} {user.status}
                                </span>
                            </td>
                            <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                <button style={{
                                    background: 'transparent', border: `1px solid ${C.border}`,
                                    color: user.status === 'Active' ? C.red : C.green,
                                    padding: '8px 16px', borderRadius: '8px',
                                    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = user.status === 'Active' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)';
                                        e.currentTarget.style.borderColor = user.status === 'Active' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.borderColor = C.border;
                                    }}
                                >
                                    {user.status === 'Active' ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                                    {user.status === 'Active' ? 'Suspend' : 'Activate'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderApprovals = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {pendingGems.map(gem => (
                <div key={gem.id} style={{ ...glassCard, overflow: 'hidden', padding: 24 }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div>
                            <div style={{ color: C.text, fontWeight: 800, fontSize: '1.2rem', marginBottom: 4 }}>{gem.name}</div>
                            <div style={{ color: C.dim, fontSize: '0.8rem', fontWeight: 600 }}>By: <span style={{ color: C.gold }}>{gem.seller}</span></div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 8, color: C.muted, fontWeight: 700, fontSize: '0.85rem' }}>
                            {gem.carat} ct
                        </div>
                    </div>

                    {/* Cert Image Placeholder */}
                    <div style={{
                        width: '100%', height: 160, borderRadius: 10, marginBottom: 20,
                        background: `linear-gradient(45deg, ${C.panel}, rgba(255,255,255,0.05))`,
                        border: `1px dashed ${C.border}`, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 8, position: 'relative', overflow: 'hidden'
                    }}>
                        {/* Mock Image Gradient to simulate a document */}
                        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #fff 10px, #fff 11px)' }} />
                        <Shield size={28} style={{ color: C.dim }} />
                        <span style={{ color: C.muted, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            View Certification Document
                        </span>
                        <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 6, backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle size={10} color={C.green} /> <span style={{ color: C.text, fontSize: '0.65rem', fontWeight: 700 }}>GIA SCAN.pdf</span>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 16, marginBottom: 24, border: `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            <span style={{ color: C.dim, fontSize: '0.8rem', fontWeight: 600 }}>Request Type:</span>
                            <span style={{ color: C.text, fontSize: '0.8rem', fontWeight: 700 }}>New Listing</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            <span style={{ color: C.dim, fontSize: '0.8rem', fontWeight: 600 }}>Buy Now Price:</span>
                            <span style={{ color: C.text, fontSize: '0.8rem', fontWeight: 700 }}>${gem.buyNow.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: C.dim, fontSize: '0.8rem', fontWeight: 600 }}>Status:</span>
                            <span style={{ color: C.gold, fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Activity size={12} /> Pending Verification
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button style={{
                            flex: 1, padding: '12px', background: 'transparent',
                            border: `1px solid ${C.red}50`, color: C.red,
                            borderRadius: 10, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            transition: 'all 0.2s'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = C.red; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${C.red}50`; }}
                        >
                            <XCircle size={16} /> Reject
                        </button>
                        <button style={{
                            flex: 1, padding: '12px', background: 'rgba(16,185,129,0.1)',
                            border: `1px solid ${C.green}50`, color: C.green,
                            borderRadius: 10, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(16,185,129,0.1)'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; e.currentTarget.style.borderColor = C.green; e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.borderColor = `${C.green}50`; e.currentTarget.style.boxShadow = '0 4px 15px rgba(16,185,129,0.1)' }}
                        >
                            <CheckCircle size={16} /> Approve
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderAuctions = () => (
        <div style={{ ...glassCard, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                        <th style={{ padding: '20px 24px', color: C.dim, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Auction Item</th>
                        <th style={{ padding: '20px 24px', color: C.dim, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seller</th>
                        <th style={{ padding: '20px 24px', color: C.dim, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Bid</th>
                        <th style={{ padding: '20px 24px', color: C.dim, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ends In</th>
                        <th style={{ padding: '20px 24px', color: C.dim, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Admin Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {activeAuctions.map((auction, idx) => (
                        <tr key={auction.id} style={{
                            borderBottom: idx === activeAuctions.length - 1 ? 'none' : `1px solid ${C.border}`,
                            transition: 'background 0.2s'
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <td style={{ padding: '20px 24px' }}>
                                <div style={{ color: C.text, fontWeight: 700, fontSize: '0.95rem' }}>{auction.name}</div>
                                <div style={{ color: C.muted, fontSize: '0.8rem', marginTop: 4 }}>{auction.carat} ct · {auction.bids} bids</div>
                            </td>
                            <td style={{ padding: '20px 24px', color: C.text, fontSize: '0.9rem', fontWeight: 600 }}>{auction.seller}</td>
                            <td style={{ padding: '20px 24px', color: C.gold, fontSize: '1rem', fontWeight: 800 }}>${auction.currentBid.toLocaleString()}</td>
                            <td style={{ padding: '20px 24px' }}>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '6px 10px', borderRadius: '6px',
                                    background: auction.status === 'Live' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                    color: auction.status === 'Live' ? C.gold : C.red,
                                    fontSize: '0.75rem', fontWeight: 700
                                }}>
                                    <Clock size={12} /> {auction.ends}
                                </span>
                            </td>
                            <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                    <button style={{
                                        background: 'transparent', border: `1px solid ${C.border}`, color: C.gold,
                                        padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                                        transition: 'all 0.2s'
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.borderColor = C.gold; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.border; }}
                                    >
                                        <PauseCircle size={14} /> Pause
                                    </button>
                                    <button style={{
                                        background: 'transparent', border: `1px solid ${C.border}`, color: C.red,
                                        padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                                        transition: 'all 0.2s'
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = C.red; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.border; }}
                                    >
                                        <XCircle size={14} /> Cancel
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter','Segoe UI',sans-serif", color: C.text }}>
            {/* ── Navbar ── */}
            <Navbar active={activePage} setActive={setActivePage} />

            {/* ── Page content ── */}
            <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 32px' }}>

                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
                    <div>
                        <div style={{ color: C.gold, fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>System Controller</div>
                        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.03em', color: C.text, margin: 0, lineHeight: 1.1 }}>
                            {activePage === 'users' ? 'Manage Users' : activePage === 'gems' ? 'Gem Approvals' : 'Manage Auctions'}
                        </h1>
                    </div>

                    {/* Dashboard Tools */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.dim }} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder={`Search ${activePage}...`}
                                style={{
                                    background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
                                    borderRadius: 10, padding: '11px 16px 11px 40px',
                                    color: C.text, fontSize: '0.9rem', outline: 'none', width: 280,
                                    transition: 'all 0.3s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                                }}
                                onFocus={e => { e.target.style.borderColor = `${C.gold}60`; e.target.style.background = 'rgba(255,255,255,0.05)' }}
                                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.background = 'rgba(255,255,255,0.03)' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Main View Area */}
                {activePage === 'users' && renderUsers()}
                {activePage === 'gems' && renderApprovals()}
                {activePage === 'auctions' && renderAuctions()}

            </main>
        </div>
    );
};

export default AdminDashboard;
