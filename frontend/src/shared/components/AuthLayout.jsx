import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle, welcomeText = "Discover the Gem of Your Dreams", welcomeSub = "Sign in to access world-class gemstone auctions" }) => {
    const { isDark } = useTheme();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: isDark ? '#090912' : '#f8fafc',
            overflow: 'hidden',
        }}>
            {/* ── Left Pane: Illustration & Branding ── */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '60px',
                position: 'relative',
                background: isDark
                    ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e1b4b 100%)'
                    : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                color: 'white',
                overflow: 'hidden',
                borderRight: isDark ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }} className="auth-left-pane">

                {/* Organic Blobs - Themed Gold/Indigo */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0],
                        x: [0, 15, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    style={{
                        position: 'absolute', top: '-15%', left: '-15%',
                        width: '70%', height: '70%',
                        background: 'rgba(245, 158, 11, 0.08)',
                        borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                        filter: 'blur(50px)',
                    }}
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, -10, 0],
                        y: [0, -40, 0]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                    style={{
                        position: 'absolute', bottom: '-25%', right: '-15%',
                        width: '80%', height: '80%',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '70% 30% 50% 50% / 30% 60% 40% 70%',
                        filter: 'blur(70px)',
                    }}
                />

                {/* Floating Spheres (Gem Colors) */}
                <motion.div
                    animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    style={{
                        position: 'absolute', top: '15%', right: '10%',
                        width: '140px', height: '140px',
                        background: 'radial-gradient(circle at 30% 30%, #f59e0b, #d97706)',
                        borderRadius: '50%',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.3), inset 0 5px 20px rgba(255,255,255,0.4)',
                        filter: 'drop-shadow(0 0 20px rgba(245,158,11,0.3))',
                        zIndex: 2
                    }}
                />
                <motion.div
                    animate={{ scale: [1, 1.15, 1], x: [0, -20, 0] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    style={{
                        position: 'absolute', bottom: '20%', left: '5%',
                        width: '100px', height: '100px',
                        background: 'radial-gradient(circle at 30% 30%, #3b82f6, #1d4ed8)',
                        borderRadius: '50%',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.3), inset 0 5px 20px rgba(255,255,255,0.4)',
                        filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.3))',
                        zIndex: 2
                    }}
                />

                {/* Top: Branding Logo */}
                <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ filter: 'drop-shadow(0 0 10px rgba(245,158,11,0.5))' }}>
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
                            <path d="m16 16 6-6" />
                            <path d="m8 8 6-6" />
                            <path d="m9 7 8 8" />
                            <path d="m21 11-8-8" />
                        </svg>
                    </div>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                        Gem<span style={{ color: '#f59e0b' }}>Bid</span>
                    </span>
                </div>

                {/* Middle: Welcome Text */}
                <div style={{ position: 'relative', zIndex: 10, textAlign: 'left', maxWidth: '440px' }}>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 0.6, x: 0 }}
                        style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', color: '#f59e0b' }}>
                        Experience the Luxury
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: '3.2rem', fontWeight: 900, marginBottom: '25px', lineHeight: 1.1, letterSpacing: '-1.5px' }}>
                        {welcomeText}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ delay: 0.3 }}
                        style={{ fontSize: '1.1rem', fontWeight: 400, lineHeight: 1.6, color: '#94a3b8' }}>
                        {welcomeSub}
                    </motion.p>
                </div>

                {/* Bottom: URL */}
                <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ opacity: 0.5, fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px' }}>
                        www.gembid.com
                    </span>
                    <div style={{ display: 'flex', gap: '20px', opacity: 0.5 }}>
                        {/* Simple social icons placeholders */}
                        <div style={{ width: '18px', height: '18px', border: '1.5px solid white', borderRadius: '50%' }} />
                        <div style={{ width: '18px', height: '18px', border: '1.5px solid white', borderRadius: '50%' }} />
                    </div>
                </div>
            </div>

            {/* ── Right Pane: Form ── */}
            <div style={{
                flex: 1,
                background: isDark ? '#070a13' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                position: 'relative',
                zIndex: 1
            }} className="auth-right-pane">

                <div style={{ width: '100%', maxWidth: '400px', animation: 'fadeInUp 0.6s ease-out' }}>
                    <style>{`
                        @keyframes fadeInUp {
                            from { opacity: 0; transform: translateY(20px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        @media (max-width: 992px) {
                            .auth-left-pane { display: none !important; }
                        }
                    `}</style>

                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: isDark ? '#f1f5f9' : '#1e1b4b', marginBottom: '8px', letterSpacing: '-1px' }}>{title}</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '44px', fontWeight: 500 }}>{subtitle}</p>

                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
