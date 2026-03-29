import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle, maxWidth = 480 }) => {
    const containerRef = useRef(null);

    // Mouse parallax for the gem pattern layer
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springCfg = { stiffness: 70, damping: 22, mass: 1 };
    const springX = useSpring(mouseX, springCfg);
    const springY = useSpring(mouseY, springCfg);
    const patternX = useTransform(springX, [-0.5, 0.5], [-20, 20]);
    const patternY = useTransform(springY, [-0.5, 0.5], [-20, 20]);

    const handleMouseMove = (e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 20px' }}
        >
            {/* Layer 0 — base gradient */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(155deg, #E6ECF8 0%, #DDE6F6 55%, #EBE6F0 100%)' }} />

            {/* Layer 1 — atmospheric sapphire / gold wash */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
                background: `
                    radial-gradient(ellipse 65% 55% at 12% 25%, rgba(46,109,180,0.07) 0%, transparent 70%),
                    radial-gradient(ellipse 50% 45% at 88% 75%, rgba(212,175,55,0.06) 0%, transparent 70%)
                `,
            }} />

            {/* Layer 2 — gem pattern (luminance mask, parallax) */}
            <motion.div
                style={{
                    position: 'fixed', inset: '-50px', zIndex: 2, pointerEvents: 'none',
                    backgroundImage: 'url(/images/gem-pattern.png)',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '700px 700px',
                    backgroundColor: 'rgba(212,175,55,0.38)',
                    WebkitMaskImage: 'url(/images/gem-pattern.png)',
                    WebkitMaskRepeat: 'repeat',
                    WebkitMaskSize: '700px 700px',
                    maskImage: 'url(/images/gem-pattern.png)',
                    maskRepeat: 'repeat',
                    maskMode: 'luminance',
                    maskSize: '700px 700px',
                    opacity: 0.2,
                    filter: 'blur(5px)',
                    x: patternX,
                    y: patternY,
                }}
            />

            {/* Layer 3 — edge vignette */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 3, pointerEvents: 'none',
                background: 'radial-gradient(ellipse 92% 80% at 50% 50%, transparent 45%, rgba(18,28,60,0.2) 100%)',
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth }}>

                {/* Brand lockup */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55 }}
                    style={{ textAlign: 'center', marginBottom: '28px' }}
                >
                    <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.5))' }}>
                                <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
                                <path d="m16 16 6-6" /><path d="m8 8 6-6" />
                                <path d="m9 7 8 8" /><path d="m21 11-8-8" />
                            </svg>
                            <span style={{ fontFamily: "'Cinzel', serif", fontSize: '1.35rem', fontWeight: 700, color: '#1a2340', letterSpacing: '0.07em' }}>
                                GemBid <span style={{ color: '#D4AF37' }}>LK</span>
                            </span>
                        </div>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.8rem', fontStyle: 'italic', color: '#64748b', letterSpacing: '0.03em' }}>
                            Sri Lanka's Premier Gem Auction Platform
                        </span>
                    </Link>
                </motion.div>

                {/* Glass card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.1 }}
                    style={{
                        background: 'rgba(250, 247, 242, 0.74)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: '22px',
                        border: '1px solid rgba(255,255,255,0.9)',
                        boxShadow: '0 10px 48px rgba(26,35,64,0.11), 0 2px 8px rgba(26,35,64,0.05), inset 0 1px 0 rgba(255,255,255,0.95)',
                        padding: '44px 40px',
                    }}
                >
                    {title && (
                        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
                            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.65rem', fontWeight: 700, color: '#1a2340', margin: '0 0 8px', letterSpacing: '0.04em' }}>
                                {title}
                            </h1>
                            {subtitle && (
                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.98rem', fontStyle: 'italic', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                                    {subtitle}
                                </p>
                            )}
                            <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', margin: '16px auto 0' }} />
                        </div>
                    )}
                    {children}
                </motion.div>
            </div>
        </div>
    );
};

export default AuthLayout;
