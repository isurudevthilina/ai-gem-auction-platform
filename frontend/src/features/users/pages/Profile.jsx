import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home, Activity, Clock, Heart, ChevronDown,
    User, Mail, Phone, MapPin, Shield, Camera, Edit2, CheckCircle, Folder, X
} from 'lucide-react';

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

const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${C.border}`,
    borderRadius: '10px',
    padding: '12px 14px',
    color: C.text,
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
};

/* ════════════════════════════════════════════════════
   TOP NAVBAR (Reused for consistency)
════════════════════════════════════════════════════ */
const Navbar = ({ active, setActive }) => {
    const navigate = useNavigate();

    return (
        <header style={{
            position: 'sticky', top: 0, zIndex: 40,
            background: `${C.panel}ee`,
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
                    <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
                    <path d="m16 16 6-6" />
                    <path d="m8 8 6-6" />
                    <path d="m9 7 8 8" />
                    <path d="m21 11-8-8" />
                </svg>
                <span style={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.03em' }}>
                    <span style={{ color: C.text }}>Gem</span>
                    <span style={{ color: C.gold }}>Bid</span>
                </span>
            </div>

            {/* Back to Dashboard */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={() => navigate('/buyer-dashboard')} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 16px', borderRadius: 8, border: 'none',
                    background: 'transparent',
                    color: C.muted,
                    fontWeight: 600, fontSize: '0.875rem',
                    cursor: 'pointer', transition: 'all 0.2s',
                }}
                    onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = 'transparent'; }}
                >
                    <Home size={15} strokeWidth={2} /> Dashboard
                </button>
            </nav>

            {/* Right side: Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                {/* Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '0.82rem', color: '#fff', flexShrink: 0,
                    }}>JD</div>
                    <div style={{ lineHeight: 1.25 }}>
                        <div style={{ color: C.text, fontWeight: 700, fontSize: '0.8rem' }}>John Doe</div>
                        <div style={{ color: C.indigo, fontSize: '0.65rem', fontWeight: 600 }}>🌟 Premium Buyer</div>
                    </div>
                </div>
            </div>
        </header>
    );
};

/* ════════════════════════════════════════════════════
   PHOTO UPLOAD MODAL (Drag & Drop Style)
════════════════════════════════════════════════════ */
const PhotoUploadModal = ({ onClose }) => {
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(5, 7, 10, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                background: C.panel,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: '32px',
                width: '100%',
                maxWidth: 600,
                position: 'relative',
                boxShadow: `0 25px 50px rgba(0,0,0,0.5)`,
            }}>
                {/* Close Button */}
                <button onClick={onClose} style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'transparent', border: 'none', color: C.dim,
                    cursor: 'pointer', transition: 'color 0.2s'
                }}
                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                    onMouseLeave={e => e.currentTarget.style.color = C.dim}
                >
                    <X size={20} />
                </button>

                <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', fontWeight: 800, color: C.text }}>
                    Update Profile Picture
                </h3>

                {/* Dropzone Area (Mimics Screenshot Exactly) */}
                <div style={{
                    border: `2px dashed rgba(245,158,11,0.4)`,
                    borderRadius: 12,
                    background: 'rgba(245,158,11,0.02)',
                    padding: '50px 20px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = C.gold;
                        e.currentTarget.style.background = 'rgba(245,158,11,0.05)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)';
                        e.currentTarget.style.background = 'rgba(245,158,11,0.02)';
                    }}
                >
                    {/* Folder Icon */}
                    <div style={{ marginBottom: 16, color: '#fcd34d' }}>
                        <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                        </svg>
                    </div>

                    <div style={{ fontSize: '1rem', fontWeight: 600, color: C.muted, marginBottom: 8 }}>
                        Drop profile images here
                    </div>

                    <div style={{ fontSize: '0.8rem', color: C.dim, fontWeight: 500 }}>
                        High-resolution PNG or JPG · max 10 MB each
                    </div>
                </div>
            </div>
            <style>
                {`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}
            </style>
        </div>
    );
};

/* ════════════════════════════════════════════════════
   MAIN PROFILE PAGE
════════════════════════════════════════════════════ */
const Profile = () => {
    // Mock user state
    const [user, setUser] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Sapphire Lane, Suite 400',
        city: 'New York',
        country: 'United States',
        role: 'Premium Buyer'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        setIsEditing(false);
        // Here you would typically send data to your backend
    };

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter','Segoe UI',sans-serif", color: C.text }}>
            <Navbar active="profile" />

            <main style={{ maxWidth: 1000, margin: '0 auto', padding: '50px 32px' }}>

                {/* Header Page Title */}
                <div style={{ marginBottom: 40 }}>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.03em', color: C.text, margin: 0, lineHeight: 1.1 }}>
                        Account Settings
                    </h1>
                    <p style={{ color: C.muted, fontSize: '0.9rem', marginTop: 8 }}>
                        Manage your personal information and preferences.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: 40, alignItems: 'start' }}>

                    {/* LEFT SIDEBAR: Avatar & Summary */}
                    <div style={{ ...glassCard, padding: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Avatar */}
                        <div style={{ position: 'relative', marginBottom: 20 }}>
                            <div style={{
                                width: 120, height: 120, borderRadius: '50%',
                                background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '2.5rem', fontWeight: 900, color: '#fff',
                                boxShadow: `0 10px 30px rgba(99,102,241,0.3)`,
                                border: `4px solid ${C.panel}`
                            }}>
                                JD
                            </div>
                            {/* Upload Button */}
                            <button
                                onClick={() => setShowPhotoModal(true)}
                                style={{
                                    position: 'absolute', bottom: 0, right: 0,
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: C.panel, border: `1px solid ${C.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: C.text, cursor: 'pointer', transition: 'all 0.2s',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.borderColor = C.gold; }}
                                onMouseLeave={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.border; }}
                            >
                                <Camera size={16} />
                            </button>
                        </div>

                        {/* Summary Info */}
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{user.firstName} {user.lastName}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.indigo, fontSize: '0.85rem', fontWeight: 700, marginTop: 8 }}>
                            <Shield size={14} /> {user.role}
                        </div>

                        <div style={{ width: '100%', height: 1, background: C.border, margin: '24px 0' }} />

                        {/* Stats */}
                        <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ color: C.text, fontSize: '1.2rem', fontWeight: 800 }}>12</div>
                                <div style={{ color: C.dim, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginTop: 4 }}>Bids Placed</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ color: C.text, fontSize: '1.2rem', fontWeight: 800 }}>03</div>
                                <div style={{ color: C.dim, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginTop: 4 }}>Gems Won</div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Edit Form */}
                    <div style={{ ...glassCard, padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
                            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: C.text }}>Personal Details</h2>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '8px 16px', borderRadius: 8,
                                    background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`,
                                    color: C.text, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                >
                                    <Edit2 size={14} /> Edit Profile
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => setIsEditing(false)} style={{
                                        padding: '8px 16px', borderRadius: 8,
                                        background: 'transparent', border: `1px solid ${C.border}`,
                                        color: C.muted, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                                    }}>Cancel</button>
                                    <button onClick={handleSave} style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '8px 20px', borderRadius: 8,
                                        background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none',
                                        color: '#000', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                                        boxShadow: `0 4px 15px rgba(16,185,129,0.3)`
                                    }}>
                                        <CheckCircle size={14} /> Save Changes
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Form Fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 20px' }}>
                            {/* First Name */}
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.dim, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                                    <User size={14} /> First Name
                                </label>
                                <input
                                    name="firstName"
                                    value={user.firstName}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    style={{ ...inputStyle, opacity: isEditing ? 1 : 0.7, cursor: isEditing ? 'text' : 'not-allowed' }}
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.dim, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                                    <User size={14} /> Last Name
                                </label>
                                <input
                                    name="lastName"
                                    value={user.lastName}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    style={{ ...inputStyle, opacity: isEditing ? 1 : 0.7, cursor: isEditing ? 'text' : 'not-allowed' }}
                                />
                            </div>

                            {/* Email */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.dim, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                                    <Mail size={14} /> Email Address
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    value={user.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    style={{ ...inputStyle, opacity: isEditing ? 1 : 0.7, cursor: isEditing ? 'text' : 'not-allowed' }}
                                />
                            </div>

                            {/* Phone */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.dim, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                                    <Phone size={14} /> Phone Number
                                </label>
                                <input
                                    name="phone"
                                    value={user.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    style={{ ...inputStyle, opacity: isEditing ? 1 : 0.7, cursor: isEditing ? 'text' : 'not-allowed' }}
                                />
                            </div>

                            {/* Address */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.dim, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                                    <MapPin size={14} /> Address
                                </label>
                                <input
                                    name="address"
                                    value={user.address}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    style={{ ...inputStyle, opacity: isEditing ? 1 : 0.7, cursor: isEditing ? 'text' : 'not-allowed' }}
                                />
                            </div>

                            {/* City */}
                            <div>
                                <label style={{ display: 'block', color: C.dim, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                                    City
                                </label>
                                <input
                                    name="city"
                                    value={user.city}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    style={{ ...inputStyle, opacity: isEditing ? 1 : 0.7, cursor: isEditing ? 'text' : 'not-allowed' }}
                                />
                            </div>

                            {/* Country */}
                            <div>
                                <label style={{ display: 'block', color: C.dim, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                                    Country
                                </label>
                                <input
                                    name="country"
                                    value={user.country}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    style={{ ...inputStyle, opacity: isEditing ? 1 : 0.7, cursor: isEditing ? 'text' : 'not-allowed' }}
                                />
                            </div>
                        </div>

                        {/* Security Section Stub */}
                        <div style={{ marginTop: 40, paddingTop: 30, borderTop: `1px solid ${C.border}` }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: C.text, marginBottom: 16 }}>Security & Password</h3>
                            <button style={{
                                padding: '10px 20px', borderRadius: 8,
                                background: 'transparent', border: `1px solid ${C.border}`,
                                color: C.text, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
                                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                            >
                                Change Password
                            </button>
                        </div>

                    </div>
                </div>
            </main>

            {/* ══ FOOTER ══ */}
            <footer style={{
                borderTop: `1px solid ${C.border}`,
                background: 'rgba(0,0,0,0.25)',
                backdropFilter: 'blur(12px)',
                padding: '60px 32px 32px',
                marginTop: 40,
            }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', textAlign: 'center' }}>
                    <p style={{ color: C.dim, fontSize: '0.78rem' }}>
                        © 2026 <span style={{ color: C.text, fontWeight: 800 }}>Gem<span style={{ color: C.gold }}>Bid</span></span> Inc. All rights reserved.
                    </p>
                </div>
            </footer>

            {/* Modal Overlay */}
            {showPhotoModal && <PhotoUploadModal onClose={() => setShowPhotoModal(false)} />}
        </div>
    );
};

export default Profile;
