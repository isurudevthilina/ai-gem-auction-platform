import { useRef } from 'react';
import { motion } from 'framer-motion';

const C = {
    white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)', text: '#1A1A2E',
    muted: '#6B6B7B', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const ProfileHeader = ({ profile, onAvatarChange, isUploading }) => {
    const fileRef = useRef(null);

    const initials = (profile?.full_name || 'U')
        .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

    const roleBadge = {
        buyer: { label: 'Buyer', bg: C.goldLight, color: C.gold },
        seller: { label: 'Seller', bg: 'rgba(26,77,140,0.10)', color: C.sapphire },
        admin: { label: 'Admin', bg: 'rgba(185,28,28,0.10)', color: '#B91C1C' },
    }[profile?.role] || { label: profile?.role, bg: C.goldLight, color: C.gold };

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (file) onAvatarChange(file);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            style={{
                background: C.white, borderRadius: 16, padding: '32px 36px',
                border: `1px solid ${C.border}`, display: 'flex',
                alignItems: 'center', gap: 28, flexWrap: 'wrap',
            }}
        >
            {/* Avatar */}
            <div
                onClick={() => !isUploading && fileRef.current?.click()}
                style={{
                    position: 'relative', width: 96, height: 96, borderRadius: '50%',
                    overflow: 'hidden', cursor: isUploading ? 'wait' : 'pointer',
                    border: `3px solid ${C.gold}`, flexShrink: 0,
                }}
            >
                {profile?.avatar_url ? (
                    <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{
                        width: '100%', height: '100%', background: C.goldLight,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: DISPLAY, fontSize: '1.6rem', fontWeight: 700, color: C.gold,
                    }}>
                        {initials}
                    </div>
                )}
                {/* Hover overlay */}
                <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.40)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s',
                }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = 0; }}
                >
                    <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                    </svg>
                </div>
                <input
                    ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }} onChange={handleFile}
                />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
                <h1 style={{
                    fontFamily: DISPLAY, fontSize: '1.55rem', fontWeight: 700,
                    color: C.text, margin: 0, letterSpacing: '0.02em',
                }}>
                    {profile?.full_name || 'Your Name'}
                </h1>
                <p style={{ fontFamily: BODY, fontSize: '0.92rem', color: C.muted, margin: '4px 0 10px' }}>
                    {profile?.email}
                </p>
                <span style={{
                    display: 'inline-block', padding: '4px 14px', borderRadius: 20,
                    background: roleBadge.bg, color: roleBadge.color,
                    fontFamily: BODY, fontWeight: 600, fontSize: '0.78rem',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                    {roleBadge.label}
                </span>
            </div>

            {/* Member Since */}
            <div style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.muted }}>
                    Member since
                </span>
                <p style={{ fontFamily: BODY, fontWeight: 600, color: C.text, margin: '2px 0 0', fontSize: '0.95rem' }}>
                    {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                        : '—'}
                </p>
            </div>
        </motion.div>
    );
};

export default ProfileHeader;
