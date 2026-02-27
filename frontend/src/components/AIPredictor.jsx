import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const AIPredictor = () => {
    const { isDark } = useTheme();
    const navigate = useNavigate();

    return (
        <section id="valuation-ai" style={{
            padding: '60px 24px',
            background: 'transparent',
        }}>
            <div style={{
                maxWidth: '900px',
                margin: '0 auto',
                borderRadius: '20px',
                padding: '44px 52px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '40px',
                flexWrap: 'wrap',
                background: isDark
                    ? 'linear-gradient(135deg, rgba(15,15,30,0.95) 0%, rgba(20,12,40,0.95) 100%)'
                    : 'linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%)',
                border: isDark
                    ? '1px solid rgba(139,92,246,0.25)'
                    : '1px solid rgba(139,92,246,0.2)',
                boxShadow: isDark
                    ? '0 0 0 1px rgba(255,255,255,0.04), 0 24px 60px rgba(0,0,0,0.4)'
                    : '0 8px 40px rgba(124,58,237,0.12)',
                backdropFilter: 'blur(12px)',
                position: 'relative',
                overflow: 'hidden',
            }}>

                {/* Subtle background glow */}
                <div style={{
                    position: 'absolute', top: '-40px', left: '-40px',
                    width: '200px', height: '200px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                {/* Left content */}
                <div style={{ flex: 1, minWidth: '260px' }}>

                    {/* Icon + headline */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '14px' }}>
                        <div style={{
                            fontSize: '2.4rem', lineHeight: 1,
                            filter: 'drop-shadow(0 0 12px rgba(245,158,11,0.4))',
                            flexShrink: 0, marginTop: '4px',
                        }}>🧠</div>
                        <h2 style={{
                            fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
                            fontWeight: 800,
                            color: isDark ? '#f1f5f9' : '#1e1b4b',
                            lineHeight: 1.25,
                            margin: 0,
                        }}>
                            Discover the Fair Market Value of your{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>Gems</span>
                        </h2>
                    </div>

                    {/* AI Tech subtitle */}
                    <p style={{
                        fontSize: '0.9rem',
                        color: isDark ? '#94a3b8' : '#6b7280',
                        marginBottom: '12px',
                        lineHeight: 1.5,
                    }}>
                        Using Explainable AI{' '}
                        <span style={{
                            color: '#f59e0b',
                            fontWeight: 700,
                        }}>(Random Forest &amp; SHAP)</span>
                    </p>

                    {/* Description */}
                    <p style={{
                        fontSize: '0.875rem',
                        color: isDark ? '#64748b' : '#9ca3af',
                        lineHeight: 1.75,
                        maxWidth: '420px',
                        margin: 0,
                    }}>
                        Get instant, accurate gem valuations powered by advanced machine learning. Our AI
                        analyzes carat, color, clarity, cut, and market trends to provide transparent pricing
                        insights.
                    </p>
                </div>

                <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '12px', flexShrink: 0,
                }}>
                    <button
                        onClick={() => navigate('/signup')}
                        style={{ padding: '12px 28px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, background: isDark ? 'white' : '#4338ca', color: isDark ? '#4338ca' : 'white', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                        onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'; }}
                        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'; }}
                    >
                        Create Account
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        style={{ padding: '12px 24px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: isDark ? '#94a3b8' : '#4b5563', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        Sign In
                    </button>

                    <p style={{
                        fontSize: '0.75rem',
                        color: isDark ? '#64748b' : '#9ca3af',
                        margin: 0,
                        display: 'flex', alignItems: 'center', gap: '5px',
                    }}>
                        <span>✨</span> Free for all registered users
                    </p>
                </div>

            </div>
        </section>
    );
};

export default AIPredictor;
