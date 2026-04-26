import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, MeshTransmissionMaterial, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════ */

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpV3(a, b, t) {
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

/* Map scroll progress within a range to 0–1 */
function rangeProgress(progress, start, end) {
    return clamp((progress - start) / (end - start), 0, 1);
}

/* Ease in-out cubic */
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ═══════════════════════════════════════════════
   3D SAPPHIRE MODEL — Scroll-driven transforms
═══════════════════════════════════════════════ */

function SapphireModel({ scrollProgress, mouse }) {
    const { scene } = useGLTF('/models/blue_sapphire.glb');
    const ref = useRef();
    const { viewport } = useThree();

    /* Extract mesh geometries from the loaded scene */
    const meshData = useMemo(() => {
        const meshes = [];
        scene.traverse((child) => {
            if (child.isMesh) {
                meshes.push({
                    geometry: child.geometry,
                    position: child.position.clone(),
                    rotation: child.rotation.clone(),
                    scale: child.scale.clone(),
                });
            }
        });
        return meshes;
    }, [scene]);

    /* Define keyframes for 3 sections */
    const keyframes = useMemo(() => [
        { // Section 1: gem centered-left, tilted to catch light
            position: [-1.2, 0.1, 0.3],
            rotation: [0.35, 0.6, -0.15],
            scale: 1.8,
        },
        { // Section 2: gem to the right, tilted
            position: [1.6, 0.3, 0.5],
            rotation: [0.3, Math.PI * 0.6, 0.2],
            scale: 2.0,
        },
        { // Section 3: gem centered-bottom, looking up
            position: [0, -0.5, 0.5],
            rotation: [-0.2, Math.PI * 1.2, 0],
            scale: 2.2,
        },
    ], []);

    useFrame((state, delta) => {
        if (!ref.current) return;

        const p = scrollProgress.current;

        // Determine which two keyframes to interpolate between
        let from, to, t;
        if (p < 0.5) {
            from = keyframes[0];
            to = keyframes[1];
            t = easeInOutCubic(rangeProgress(p, 0, 0.5));
        } else {
            from = keyframes[1];
            to = keyframes[2];
            t = easeInOutCubic(rangeProgress(p, 0.5, 1));
        }

        const targetPos = lerpV3(from.position, to.position, t);
        const targetRot = lerpV3(
            [from.rotation[0], from.rotation[1], from.rotation[2]],
            [to.rotation[0], to.rotation[1], to.rotation[2]],
            t
        );
        const targetScale = lerp(from.scale, to.scale, t);

        // Smooth follow (damped)
        const d = 3.0 * delta;
        ref.current.position.x += (targetPos[0] - ref.current.position.x) * d;
        ref.current.position.y += (targetPos[1] - ref.current.position.y) * d;
        ref.current.position.z += (targetPos[2] - ref.current.position.z) * d;

        ref.current.rotation.x += (targetRot[0] - ref.current.rotation.x) * d;
        ref.current.rotation.z += (targetRot[2] - ref.current.rotation.z) * d;

        // Continuous Y rotation + scroll-driven Y rotation
        ref.current.rotation.y += delta * 0.3;
        ref.current.rotation.y += (targetRot[1] - ref.current.rotation.y) * d * 0.3;

        const s = ref.current.scale.x + (targetScale - ref.current.scale.x) * d;
        ref.current.scale.setScalar(s);

        // Subtle mouse parallax (±5 deg = ±0.087 rad)
        const mx = (mouse.current.x - 0.5) * -0.12;
        const my = (mouse.current.y - 0.5) * 0.12;
        ref.current.rotation.x += (my - ref.current.rotation.x * 0.05) * 0.02;
        ref.current.rotation.z += (mx - ref.current.rotation.z * 0.05) * 0.02;
    });

    return (
        <group ref={ref} scale={1.8}>
            {meshData.map((m, i) => (
                <mesh
                    key={i}
                    geometry={m.geometry}
                    position={m.position}
                    rotation={m.rotation}
                    scale={m.scale}
                    castShadow
                >
                    <MeshTransmissionMaterial
                        transmission={1}
                        roughness={0.05}
                        thickness={0.8}
                        ior={2.4}
                        color="#629BFA"
                        envMapIntensity={2.5}
                        clearcoat={1}
                        clearcoatRoughness={0.08}
                        reflectivity={0.14}
                        anisotropicBlur={4}
                        chromaticAberration={0}
                        attenuationColor="#2B5FCC"
                        attenuationDistance={2.0}
                        samples={16}
                        resolution={1024}
                        backside={false}
                        backsideThickness={0}
                    />
                </mesh>
            ))}
        </group>
    );
}

useGLTF.preload('/models/blue_sapphire.glb');

/* ═══════════════════════════════════════════════
   FIXED 3D CANVAS
═══════════════════════════════════════════════ */

function FixedCanvas({ scrollProgress }) {
    const mouse = useRef({ x: 0.5, y: 0.5 });

    useEffect(() => {
        const handler = (e) => {
            mouse.current.x = e.clientX / window.innerWidth;
            mouse.current.y = e.clientY / window.innerHeight;
        };
        window.addEventListener('mousemove', handler);
        return () => window.removeEventListener('mousemove', handler);
    }, []);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1,
            pointerEvents: 'none',
        }}>
            <Canvas
                style={{ width: '100%', height: '100%', background: 'transparent' }}
                gl={{ alpha: true, antialias: true, toneMapping: THREE.LinearToneMapping, toneMappingExposure: 1.5 }}
                dpr={[1, 2]}
            >
                <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={35} />
                <ambientLight intensity={1.0} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={3} color="#ffffff" />
                <pointLight position={[-5, 3, 5]} intensity={2} color="#FFD700" />
                <pointLight position={[5, -2, -5]} intensity={1.5} color="#ffffff" />
                <pointLight position={[0, 5, 3]} intensity={1} color="#FFD700" />
                <pointLight position={[-3, -3, 5]} intensity={0.8} color="#ffffff" />

                <Suspense fallback={null}>
                    {/* Backdrop — matches page bg so FBO refraction looks natural */}
                    <mesh position={[0, 0, -5]}>
                        <planeGeometry args={[80, 80]} />
                        <meshBasicMaterial color="#E8EDF8" />
                    </mesh>
                    <SapphireModel scrollProgress={scrollProgress} mouse={mouse} />
                    <Environment preset="warehouse" />
                    <ContactShadows position={[0, -2.8, 0]} opacity={0.12} scale={12} blur={3} far={6} />
                </Suspense>

                <EffectComposer>
                    <Bloom intensity={0.3} luminanceThreshold={0.65} luminanceSmoothing={0.9} />
                </EffectComposer>
            </Canvas>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   DOT NAVIGATION (right side)
═══════════════════════════════════════════════ */

function DotNav({ activeSection }) {
    const labels = ['Discover', 'Eternal', 'Brilliance'];

    return (
        <div style={{
            position: 'fixed', right: '28px', top: '50%', transform: 'translateY(-50%)',
            zIndex: 100, display: 'flex', flexDirection: 'column', gap: '14px',
            alignItems: 'center',
        }}>
            {labels.map((label, i) => (
                <button
                    key={label}
                    onClick={() => {
                        window.scrollTo({
                            top: (i / 2) * (document.documentElement.scrollHeight - window.innerHeight),
                            behavior: 'smooth',
                        });
                    }}
                    title={label}
                    style={{
                        width: activeSection === i ? '10px' : '7px',
                        height: activeSection === i ? '10px' : '7px',
                        borderRadius: '50%',
                        background: activeSection === i ? 'var(--accent-gold)' : 'var(--text-muted)',
                        opacity: activeSection === i ? 1 : 0.35,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.4s ease',
                        padding: 0,
                    }}
                />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   MINIMAL NAVBAR
═══════════════════════════════════════════════ */

const navLinkStyle = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    letterSpacing: '0.04em',
    fontWeight: 500,
    transition: 'color 0.2s',
};

function MinimalNav() {
    return (
        <header style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
            padding: '20px 40px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(238, 233, 244, 0.72)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
                <span style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                }}>
                    GemBid LK
                </span>
            </Link>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                {[
                    { to: '/auctions', label: 'Live Auctions' },
                    { to: '/auctions', label: 'The Vault' },
                    { to: '/gems', label: 'Discover Gems' },
                    { to: '/ai-predictor', label: 'AI Valuation' },
                    { to: '/login', label: 'Sign In' },
                ].map(({ to, label }) => (
                    <Link
                        key={label}
                        to={to}
                        style={navLinkStyle}
                        onMouseEnter={e => e.target.style.color = 'var(--accent-deep)'}
                        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                    >{label}</Link>
                ))}
            </nav>
        </header>
    );
}

/* ═══════════════════════════════════════════════
   SCROLL OVERLAY SECTIONS
═══════════════════════════════════════════════ */

function OverlaySections({ progress, midX, midY, fgX, fgY }) {
    /* Compute fade for each section */
    const s1Opacity = progress < 0.25 ? 1 : 1 - rangeProgress(progress, 0.25, 0.4);
    const s2Opacity = progress < 0.3
        ? rangeProgress(progress, 0.2, 0.35)
        : progress > 0.65
            ? 1 - rangeProgress(progress, 0.6, 0.75)
            : 1;
    const s3Opacity = rangeProgress(progress, 0.65, 0.8);

    /* Derive blur from opacity for fade-and-blur entrance */
    const s1Blur = (1 - clamp(s1Opacity, 0, 1)) * 8;
    const s2Blur = (1 - clamp(s2Opacity, 0, 1)) * 8;
    const s3Blur = (1 - clamp(s3Opacity, 0, 1)) * 8;

    const glassStyle = {
        background: 'linear-gradient(135deg, rgba(46,109,180,0.12) 0%, rgba(212,175,55,0.08) 100%)',
        backdropFilter: 'blur(40px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
        border: '1px solid rgba(46,109,180,0.22)',
        boxShadow: '0 8px 40px rgba(46,109,180,0.12), inset 0 1px 3px rgba(255,255,255,0.7), 0 0 0 1px rgba(212,175,55,0.08)',
        borderRadius: '24px',
        padding: '40px',
    };

    /* Runway text style — massive blurred background words, centered upper */
    const runwayStyle = {
        position: 'absolute',
        fontFamily: "'Cinzel', serif",
        fontWeight: 700,
        letterSpacing: '-0.02em',
        textTransform: 'uppercase',
        lineHeight: 0.85,
        pointerEvents: 'none',
        userSelect: 'none',
        filter: 'blur(6px)',
        opacity: 1,
    };

    /* Rich sapphire liquid glass card — unified color */
    const accentColor = '#1A4D8C';
    const accentRgb = '26,77,140';
    const liquidGlassCard = () => ({
        flex: '1 1 0',
        padding: '28px 20px',
        borderRadius: '20px',
        background: `linear-gradient(145deg, rgba(${accentRgb},0.14) 0%, rgba(${accentRgb},0.06) 50%, rgba(212,175,55,0.05) 100%)`,
        backdropFilter: 'blur(40px) saturate(2)',
        WebkitBackdropFilter: 'blur(40px) saturate(2)',
        border: `1px solid rgba(${accentRgb},0.25)`,
        boxShadow: `0 8px 32px rgba(${accentRgb},0.12), inset 0 1px 2px rgba(255,255,255,0.8), 0 0 0 1px rgba(212,175,55,0.06)`,
        textAlign: 'center',
        transition: 'transform 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s',
    });

    return (
        <>
            {/* ─── Section 1: Hero — text RIGHT, gem LEFT ─── */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                padding: '0 8vw',
                opacity: s1Opacity,
                filter: `blur(${s1Blur}px)`,
                pointerEvents: s1Opacity < 0.1 ? 'none' : 'auto',
                transition: 'opacity 0.1s, filter 0.1s',
            }}>
                {/* Runway text — centered upper */}
                <motion.div style={{
                    ...runwayStyle,
                    x: midX, y: midY,
                    left: '50%', top: '18%',
                    fontSize: 'clamp(10rem, 22vw, 20rem)',
                    color: 'rgba(30, 41, 80, 0.38)',
                    overflow: 'visible',
                    whiteSpace: 'nowrap',
                    translateX: '-50%',
                }}>
                    DISCOVER
                </motion.div>

                <motion.div style={{ maxWidth: '560px', textAlign: 'right', ...glassStyle, x: fgX, y: fgY }}>
                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '0.75rem',
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                        color: 'var(--accent-gold)',
                        marginBottom: '12px',
                        fontWeight: 500,
                    }}>Sri Lanka's Premier Marketplace</p>

                    <h1 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(3.5rem, 8vw, 7rem)',
                        fontWeight: 300,
                        lineHeight: 0.95,
                        color: 'var(--text-primary)',
                        margin: '0 0 20px 0',
                        letterSpacing: '-0.02em',
                    }}>
                        <span style={{ display: 'block', fontSize: '0.4em', fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontStyle: 'italic', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '4px' }}>
                            Discover
                        </span>
                        Ceylon<br />
                        <span style={{ fontWeight: 600, color: 'var(--accent-deep)' }}>Gems</span>
                    </h1>

                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '1rem',
                        fontWeight: 400,
                        color: 'var(--text-muted)',
                        lineHeight: 1.7,
                        marginBottom: '28px',
                    }}>
                        AI-powered valuations meet real-time auctions.<br />
                        Certified gems from the heart of Sri Lanka.
                    </p>

                    <Link to="/auctions" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '12px',
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        padding: '12px 28px',
                        borderRadius: '999px',
                        border: '1px solid var(--text-primary)',
                        transition: 'all 0.3s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-deep)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--accent-deep)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
                    >
                        Start now
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 5v14M5 12l7 7 7-7" />
                        </svg>
                    </Link>

                    {/* Trust stat badges */}
                    <div style={{
                        display: 'flex', gap: '20px', justifyContent: 'flex-end',
                        marginTop: '28px',
                    }}>
                        {[
                            { value: '2,400+', label: 'Gems Listed' },
                            { value: '98%', label: 'Certified' },
                            { value: '₹12M+', label: 'Traded' },
                        ].map(({ value, label }) => (
                            <div key={label} style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: '1.5rem',
                                    fontWeight: 600,
                                    color: 'var(--accent-deep)',
                                    lineHeight: 1,
                                }}>{value}</div>
                                <div style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    marginTop: '4px',
                                    fontWeight: 500,
                                }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Scroll hint at bottom of section 1 */}
            <div style={{
                position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
                zIndex: 10, textAlign: 'center',
                opacity: s1Opacity * 0.65,
                pointerEvents: 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            }}>
                <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    margin: 0,
                    fontWeight: 500,
                }}>Scroll to Explore</p>
                <div style={{ animation: 'bounceArrow 1.6s ease-in-out infinite' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1.5">
                        <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                </div>
            </div>

            {/* ─── Section 2: gem RIGHT, text LEFT ─── */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                padding: '0 8vw',
                opacity: s2Opacity,
                filter: `blur(${s2Blur}px)`,
                pointerEvents: s2Opacity < 0.1 ? 'none' : 'auto',
                transition: 'opacity 0.1s, filter 0.1s',
            }}>
                {/* Runway text — centered upper */}
                <motion.div style={{
                    ...runwayStyle,
                    x: midX, y: midY,
                    left: '50%', top: '18%',
                    fontSize: 'clamp(10rem, 22vw, 20rem)',
                    color: 'rgba(30, 41, 80, 0.38)',
                    overflow: 'visible',
                    whiteSpace: 'nowrap',
                    translateX: '-50%',
                }}>
                    FOREVER
                </motion.div>

                <motion.div style={{ maxWidth: '540px', ...glassStyle, x: fgX, y: fgY }}>
                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '0.85rem',
                        fontWeight: 400,
                        fontStyle: 'italic',
                        color: 'var(--accent-gold)',
                        marginBottom: '4px',
                    }}>Certified to Last</p>

                    <h2 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(3rem, 7vw, 6rem)',
                        fontWeight: 600,
                        lineHeight: 0.9,
                        color: 'var(--text-primary)',
                        margin: '0 0 20px 0',
                        letterSpacing: '-0.02em',
                    }}>
                        For<br />Ever
                    </h2>

                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '1rem',
                        fontWeight: 400,
                        color: 'var(--text-muted)',
                        lineHeight: 1.7,
                        maxWidth: '420px',
                    }}>
                        Every gem on GemBid is verified with GIA, GRS, or IGI
                        certification — ensuring authenticity, value, and peace
                        of mind for every collector.
                    </p>

                    {/* Certification badges */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                        {['GIA Certified', 'GRS Verified', 'IGI Approved'].map((cert) => (
                            <span key={cert} style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                padding: '6px 14px',
                                borderRadius: '999px',
                                background: 'rgba(26,77,140,0.08)',
                                color: '#1A4D8C',
                                border: '1px solid rgba(26,77,140,0.18)',
                            }}>{cert}</span>
                        ))}
                    </div>

                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '1.15rem',
                        fontWeight: 600,
                        color: '#1A4D8C',
                        marginTop: '16px',
                        marginBottom: 0,
                    }}>8,200+ Certified Stones Traded</p>
                </motion.div>
            </div>

            {/* ─── Section 3: gem CENTER-BOTTOM, text TOP-CENTER ─── */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'flex-start',
                paddingTop: '12vh',
                opacity: s3Opacity,
                filter: `blur(${s3Blur}px)`,
                pointerEvents: s3Opacity < 0.1 ? 'none' : 'auto',
                transition: 'opacity 0.1s, filter 0.1s',
            }}>
                {/* Runway text — centered upper */}
                <motion.div style={{
                    ...runwayStyle,
                    x: midX, y: midY,
                    left: '50%', top: '18%',
                    fontSize: 'clamp(10rem, 22vw, 20rem)',
                    color: 'rgba(30, 41, 80, 0.38)',
                    whiteSpace: 'nowrap',
                    translateX: '-50%',
                    overflow: 'visible',
                }}>
                    BRILLIANCE
                </motion.div>

                <motion.div style={{ textAlign: 'center', maxWidth: '720px', position: 'relative', ...glassStyle, padding: '48px 44px', x: fgX, y: fgY }}>
                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '0.85rem',
                        fontWeight: 400,
                        fontStyle: 'italic',
                        color: 'var(--accent-gold)',
                        marginBottom: '4px',
                    }}>Powered by AI</p>

                    <h2 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(3rem, 7vw, 6rem)',
                        fontWeight: 300,
                        lineHeight: 0.95,
                        color: 'var(--text-primary)',
                        margin: '0 0 16px 0',
                    }}>
                        <span style={{ fontWeight: 600 }}>B</span>rilliance
                    </h2>

                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '1rem',
                        fontWeight: 400,
                        color: 'var(--text-muted)',
                        lineHeight: 1.7,
                        marginBottom: '28px',
                    }}>
                        From SHAP-explainable valuations to real-time Supabase bidding,<br />
                        experience the future of gem trading.
                    </p>

                    <Link to="/ai-predictor" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '10px',
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        padding: '12px 28px',
                        borderRadius: '999px',
                        border: '1px solid var(--text-primary)',
                        transition: 'all 0.3s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-deep)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--accent-deep)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
                    >
                        Try AI Valuation
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                    </Link>

                    {/* Apple liquid glass feature cards */}
                    <div style={{
                        display: 'flex', gap: '16px', justifyContent: 'center',
                        marginTop: '36px',
                        paddingTop: '24px',
                        borderTop: '1px solid var(--border-subtle)',
                    }}>
                        {/* AI Accuracy — unified sapphire */}
                        <div
                            style={{ ...liquidGlassCard(), padding: '32px 24px', position: 'relative', overflow: 'hidden' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 14px 40px rgba(${accentRgb},0.22), inset 0 1px 2px rgba(255,255,255,0.9)`; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 32px rgba(${accentRgb},0.12), inset 0 1px 2px rgba(255,255,255,0.8)`; }}
                        >
                            <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                            </div>
                            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.7rem', fontWeight: 600, color: accentColor, lineHeight: 1 }}>94.7%</div>
                            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '6px', fontWeight: 600 }}>AI Accuracy</div>
                            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5, fontWeight: 400 }}>SHAP-explainable pricing with transparent valuations</div>
                            <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: '3px', borderRadius: '3px 3px 0 0', background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
                        </div>

                        {/* Certified — unified sapphire */}
                        <div
                            style={{ ...liquidGlassCard(), padding: '32px 24px', position: 'relative', overflow: 'hidden' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 14px 40px rgba(${accentRgb},0.22), inset 0 1px 2px rgba(255,255,255,0.9)`; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 32px rgba(${accentRgb},0.12), inset 0 1px 2px rgba(255,255,255,0.8)`; }}
                        >
                            <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5"><path d="M9 12l2 2 4-4"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.7rem', fontWeight: 600, color: accentColor, lineHeight: 1 }}>GIA / GRS</div>
                            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '6px', fontWeight: 600 }}>Certified</div>
                            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5, fontWeight: 400 }}>GIA, GRS & IGI verified for every stone listed</div>
                            <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: '3px', borderRadius: '3px 3px 0 0', background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
                        </div>

                        {/* Live Bidding — unified sapphire */}
                        <div
                            style={{ ...liquidGlassCard(), padding: '32px 24px', position: 'relative', overflow: 'hidden' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 14px 40px rgba(${accentRgb},0.22), inset 0 1px 2px rgba(255,255,255,0.9)`; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 32px rgba(${accentRgb},0.12), inset 0 1px 2px rgba(255,255,255,0.8)`; }}
                        >
                            <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                            </div>
                            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.7rem', fontWeight: 600, color: accentColor, lineHeight: 1 }}>Real-Time</div>
                            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '6px', fontWeight: 600 }}>Live Bidding</div>
                            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5, fontWeight: 400 }}>WebSocket-powered live auction feed</div>
                            <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: '3px', borderRadius: '3px 3px 0 0', background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}

/* ═══════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════ */

function MinimalFooter() {
    return (
        <footer style={{
            position: 'relative',
            zIndex: 10,
            background: '#FDFDFD',
            borderTop: '1px solid rgba(212, 175, 55, 0.15)',
            padding: '48px 40px 32px',
        }}>
            <div style={{
                maxWidth: '1100px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '32px',
            }}>
                <div>
                    <div style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#1E293B',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        marginBottom: '8px',
                    }}>GemBid LK</div>
                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '0.85rem',
                        color: '#475569',
                        fontWeight: 400,
                        margin: 0,
                    }}>Sri Lanka's Premier Dual-Marketplace</p>
                </div>

                <nav style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    {[
                        { to: '/auctions', label: 'Auctions' },
                        { to: '/ai-predictor', label: 'AI Valuation' },
                        { to: '#', label: 'Terms' },
                        { to: '#', label: 'Privacy' },
                    ].map(({ to, label }) => (
                        <Link key={label} to={to} style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '0.85rem',
                            color: '#475569',
                            textDecoration: 'none',
                            fontWeight: 500,
                            transition: 'color 0.2s',
                        }}
                            onMouseEnter={e => e.target.style.color = '#D4AF37'}
                            onMouseLeave={e => e.target.style.color = '#475569'}
                        >{label}</Link>
                    ))}
                </nav>
            </div>

            <div style={{
                maxWidth: '1100px',
                margin: '24px auto 0',
                borderTop: '1px solid rgba(0,0,0,0.06)',
                paddingTop: '16px',
                textAlign: 'center',
            }}>
                <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '0.78rem',
                    color: '#94A3B8',
                    margin: 0,
                    fontWeight: 400,
                }}>&copy; {new Date().getFullYear()} GemBid LK. All rights reserved.</p>
            </div>
        </footer>
    );
}

/* ═══════════════════════════════════════════════
   LOADING SCREEN
═══════════════════════════════════════════════ */

function LoadingScreen({ onDone }) {
    const [phase, setPhase] = useState('visible'); // visible → fading → done

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('fading'), 2200);
        const t2 = setTimeout(() => { setPhase('done'); onDone(); }, 2700);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [onDone]);

    if (phase === 'done') return null;

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === 'fading' ? 0 : 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: '#F0EDE8',
                gap: '28px',
            }}
        >
            {/* Hexagonal gem icon */}
            <motion.div
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                style={{ perspective: '400px' }}
            >
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                    <polygon
                        points="28,4 50,16 50,40 28,52 6,40 6,16"
                        stroke="#D4AF37"
                        strokeWidth="1.5"
                        fill="none"
                    />
                    <polygon
                        points="28,12 42,20 42,36 28,44 14,36 14,20"
                        stroke="#2E6DB4"
                        strokeWidth="1"
                        fill="rgba(46,109,180,0.06)"
                    />
                </svg>
            </motion.div>

            <div style={{ textAlign: 'center' }}>
                <h2 style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '1.1rem',
                    letterSpacing: '0.2em',
                    color: '#1E293B',
                    margin: '0 0 8px',
                    fontWeight: 400,
                }}>GEMBID LK</h2>
                <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '0.78rem',
                    color: '#94A3B8',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    margin: 0,
                    fontWeight: 500,
                }}>Preparing Your Experience</p>
            </div>

            {/* Gold progress bar */}
            <div style={{
                width: '120px', height: '2px',
                background: 'rgba(212,175,55,0.15)',
                borderRadius: '2px',
                overflow: 'hidden',
            }}>
                <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.0, ease: 'easeInOut' }}
                    style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #D4AF37, #2E6DB4)',
                        borderRadius: '2px',
                    }}
                />
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════
   MAIN SCROLL LANDING PAGE
═══════════════════════════════════════════════ */

export default function ScrollLandingPage() {
    const [progress, setProgress] = useState(0);
    const scrollRef = useRef(0);
    const [activeSection, setActiveSection] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const handleLoaded = React.useCallback(() => setLoaded(true), []);

    /* Framer Motion parallax for heritage layer */
    const { scrollYProgress } = useScroll();
    const heritageY = useTransform(scrollYProgress, [0, 1], [0, -200]);

    /* Lenis smooth scroll */
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });
        let rafId;
        function raf(time) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);
        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);

    useEffect(() => {
        const handler = () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const p = maxScroll > 0 ? window.scrollY / maxScroll : 0;
            scrollRef.current = p;
            setProgress(p);
            setActiveSection(p < 0.33 ? 0 : p < 0.66 ? 1 : 2);
        };
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    /* Mouse parallax background */
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 40, damping: 18 });
    const springY = useSpring(mouseY, { stiffness: 40, damping: 18 });
    const bgX = useTransform(springX, [-0.5, 0.5], [-80, 80]);
    const bgY = useTransform(springY, [-0.5, 0.5], [-80, 80]);
    /* Gem pattern moves at a different (slower) speed for depth parallax */
    const patternX = useTransform(springX, [-0.5, 0.5], [-30, 30]);
    const patternY = useTransform(springY, [-0.5, 0.5], [-30, 30]);
    const midX = useTransform(springX, [-0.5, 0.5], [-30, 30]);
    const midY = useTransform(springY, [-0.5, 0.5], [-30, 30]);
    const fgX = useTransform(springX, [-0.5, 0.5], [-12, 12]);
    const fgY = useTransform(springY, [-0.5, 0.5], [-12, 12]);

    useEffect(() => {
        const handler = (e) => {
            mouseX.set(e.clientX / window.innerWidth - 0.5);
            mouseY.set(e.clientY / window.innerHeight - 0.5);
        };
        window.addEventListener('mousemove', handler);
        return () => window.removeEventListener('mousemove', handler);
    }, [mouseX, mouseY]);

    return (
        <div style={{
            '--text-primary': '#1E293B',
            '--text-muted': '#475569',
            '--accent-deep': '#D4AF37',
            '--accent-gold': '#D4AF37',
            '--accent-sapphire': '#2E6DB4',
            '--border-subtle': 'rgba(212, 175, 55, 0.2)',
            '--bg-primary': '#F0EDE8',
            background: 'transparent',
            minHeight: '100vh',
            position: 'relative',
            color: '#1E293B',
        }}>
            {/* Loading screen */}
            <AnimatePresence>
                {!loaded && <LoadingScreen onDone={handleLoaded} />}
            </AnimatePresence>
            {/* Base gradient background */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0,
                pointerEvents: 'none',
                background: 'linear-gradient(155deg, #E6ECF8 0%, #EEF1FA 28%, #F6F2EC 52%, #E8ECF7 76%, #DDE6F6 100%)',
            }} />

            {/* Soft atmospheric colour wash */}
            <motion.div style={{
                position: 'fixed',
                inset: '-100px',
                zIndex: 1,
                pointerEvents: 'none',
                x: bgX,
                y: bgY,
                backgroundImage: [
                    'radial-gradient(ellipse 68% 52% at 10% 8%, rgba(98,155,250,0.18) 0%, transparent 65%)',
                    'radial-gradient(ellipse 52% 38% at 88% 10%, rgba(212,175,55,0.14) 0%, transparent 58%)',
                    'radial-gradient(ellipse 62% 50% at 50% 45%, rgba(255,252,245,0.38) 0%, transparent 65%)',
                    'radial-gradient(ellipse 54% 44% at 94% 88%, rgba(8,18,58,0.16) 0%, transparent 58%)',
                    'radial-gradient(ellipse 54% 44% at 6% 92%, rgba(26,77,140,0.18) 0%, transparent 62%)',
                ].join(', '),
            }} />

            {/* Repeating gem pattern — same ghosted role as runway text, behind it but above canvas */}
            <motion.div style={{
                position: 'fixed',
                inset: '-120px',
                zIndex: 5,
                pointerEvents: 'none',
                x: patternX,
                y: patternY,
                backgroundImage: 'linear-gradient(135deg, rgba(48,78,126,0.34) 0%, rgba(212,175,55,0.30) 52%, rgba(70,104,160,0.28) 100%)',
                WebkitMaskImage: 'url(/images/gem-pattern.png)',
                maskImage: 'url(/images/gem-pattern.png)',
                WebkitMaskRepeat: 'repeat',
                maskRepeat: 'repeat',
                WebkitMaskPosition: 'center center',
                maskPosition: 'center center',
                WebkitMaskSize: '760px 760px',
                maskSize: '760px 760px',
                WebkitMaskMode: 'luminance',
                maskMode: 'luminance',
                filter: 'blur(8px)',
                opacity: 0.24,
            }} />

            {/* Edge vignette — frames the page like a jewel case */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 7,
                pointerEvents: 'none',
                background: [
                    'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(8,18,58,0.12) 0%, transparent 70%)',
                    'radial-gradient(ellipse 100% 50% at 50% 100%, rgba(8,18,58,0.15) 0%, transparent 70%)',
                    'radial-gradient(ellipse 28% 100% at 0% 50%, rgba(8,18,58,0.07) 0%, transparent 70%)',
                    'radial-gradient(ellipse 28% 100% at 100% 50%, rgba(8,18,58,0.07) 0%, transparent 70%)',
                ].join(', '),
            }} />

            {/* Film grain noise overlay — sits between bg and content, not on gem/cards */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 8,
                pointerEvents: 'none',
                opacity: 0.035,
                mixBlendMode: 'multiply',
            }}>
                <svg width="100%" height="100%">
                    <filter id="grainFilter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#grainFilter)" />
                </svg>
            </div>

            {/* Heritage layer — Liyawela ornamental pattern with parallax */}
            <motion.div style={{
                position: 'fixed', inset: 0, zIndex: 0,
                y: heritageY,
                pointerEvents: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <svg width="600" height="600" viewBox="0 0 600 600" fill="none" style={{ opacity: 0.07 }}>
                    <g transform="translate(300, 300)" stroke="#C9A84C" strokeWidth="0.5" fill="none">
                        <circle r="60" />
                        <circle r="100" />
                        <circle r="140" />
                        <circle r="180" />
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                            <g key={angle} transform={`rotate(${angle})`}>
                                <path d="M0,-60 C20,-90 20,-130 0,-180 C-20,-130 -20,-90 0,-60" />
                                <path d="M0,-100 C10,-115 10,-125 0,-140 C-10,-125 -10,-115 0,-100" />
                            </g>
                        ))}
                        <circle r="30" strokeWidth="1" />
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
                            <circle
                                key={i}
                                cx={Math.cos((i * Math.PI) / 8) * 200}
                                cy={Math.sin((i * Math.PI) / 8) * 200}
                                r="3"
                                fill="#C9A84C"
                                fillOpacity="0.3"
                                stroke="none"
                            />
                        ))}
                    </g>
                </svg>
            </motion.div>

            {/* Fixed 3D canvas */}
            <Suspense fallback={
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-primary)',
                }}>
                    <div style={{
                        width: '48px', height: '48px',
                        border: '3px solid var(--border-subtle)',
                        borderTopColor: 'var(--accent-gold)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                    }} />
                </div>
            }>
                <FixedCanvas scrollProgress={scrollRef} />
            </Suspense>

            {/* Gold scroll-progress bar */}
            <div style={{
                position: 'fixed', top: 0, left: 0, zIndex: 300,
                height: '2px',
                width: `${progress * 100}%`,
                background: 'linear-gradient(90deg, var(--accent-gold) 0%, var(--accent-sapphire) 100%)',
                transition: 'width 0.05s linear',
                pointerEvents: 'none',
            }} />

            {/* Shared Navbar */}
            <Navbar />

            {/* Dot nav */}
            <DotNav activeSection={activeSection} />

            {/* Overlay text sections */}
            <OverlaySections progress={progress} midX={midX} midY={midY} fgX={fgX} fgY={fgY} />

            {/* Scrollable spacer — creates the scroll height (3 viewports) */}
            <div style={{ height: '300vh', position: 'relative', zIndex: 0, pointerEvents: 'none' }} />

            {/* Shared Footer */}
            <div style={{ position: 'relative', zIndex: 10 }}>
                <Footer />
            </div>

            {/* Keyframes */}
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes bounceArrow {
                    0%, 100% { transform: translateY(0); opacity: 0.7; }
                    50% { transform: translateY(5px); opacity: 1; }
                }
                @keyframes gemPulse {
                    0%, 100% { opacity: 0.06; transform: scale(1); }
                    50% { opacity: 0.1; transform: scale(1.02); }
                }
            `}</style>
        </div>
    );
}
