import { useTheme } from '../../context/ThemeContext';

const Features = () => {
    const { isDark } = useTheme();
    const t = {
        heading: isDark ? '#f1f5f9' : '#111827',
        muted: isDark ? '#94a3b8' : '#6b7280',
        accent: isDark ? '#a5b4fc' : '#4f46e5',
        sectionBg: isDark ? 'transparent' : 'white',
        glowTop: isDark ? 'linear-gradient(90deg, transparent, rgba(99,102,241,0.35), transparent)' : 'none',
        radial: isDark ? 'radial-gradient(ellipse 60% 40% at 50% 10%, rgba(99,102,241,0.06) 0%, transparent 70%)' : 'none',
        cardInner: isDark ? 'rgba(255,255,255,0.08)' : 'white',
        cardInnerBorder: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
        cardInnerName: isDark ? 'rgba(255,255,255,0.9)' : '#111827',
        cardInnerRole: isDark ? 'rgba(255,255,255,0.5)' : '#9ca3af',
        cardInnerText: isDark ? 'rgba(255,255,255,0.7)' : '#4b5563',
        cardInnerShadow: isDark ? '0 4px 15px rgba(0,0,0,0.2)' : '0 4px 15px rgba(0,0,0,0.1)',
        feature1: isDark ? 'linear-gradient(145deg, #4338ca 0%, #6d28d9 100%)' : 'linear-gradient(145deg, #6d52f8 0%, #7c3aed 100%)',
        feature2: isDark ? 'linear-gradient(145deg, #6d28d9 0%, #4338ca 100%)' : 'linear-gradient(145deg, #6d52f8 0%, #7c3aed 100%)',
        invoiceBg: isDark ? 'rgba(255,255,255,0.07)' : 'white',
        invoiceBorder: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
        invoiceLabel: isDark ? 'rgba(255,255,255,0.5)' : '#9ca3af',
        invoiceAmount: isDark ? 'white' : '#111827',
        barInactive: isDark ? 'rgba(255,255,255,0.2)' : '#e0e7ff',
        barActive: isDark ? 'rgba(255,255,255,0.9)' : '#4f46e5',
        avatarCenter: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.25)',
        avatarCenterBorder: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.5)',
    };

    return (
        <section id="features" style={{ padding: '100px 24px', position: 'relative', background: t.sectionBg }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '800px', height: '1px', background: t.glowTop, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 0, background: t.radial, pointerEvents: 'none' }} />

            <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div className="section-pill" style={{ marginBottom: '16px' }}>Features</div>
                    <h2 style={{ fontSize: 'clamp(1.9rem,3.5vw,2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', color: t.heading, marginBottom: '14px' }}>
                        Features Overview
                    </h2>
                    <p style={{ fontSize: '0.95rem', color: t.muted, maxWidth: '460px', margin: '0 auto', lineHeight: 1.75 }}>
                        A visual collection of our most recent works - each piece crafted with intention, emotion and style.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '24px', marginBottom: '40px' }}>

                    {/* Transparency Dashboard — Explainable AI (SHAP) */}
                    <div>
                        <div className="feature-card" style={{ height: '240px', padding: '24px', position: 'relative', marginBottom: '20px', background: t.feature1, overflow: 'hidden' }}>
                            <div style={{ background: t.cardInner, backdropFilter: isDark ? 'blur(10px)' : 'none', borderRadius: '12px', padding: '16px', height: '100%', boxShadow: t.cardInnerShadow, border: `1px solid ${t.cardInnerBorder}`, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: t.cardInnerName, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>SHAP Value Analysis</div>

                                {/* Mock SHAP Horizontal Bar Chart */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {[
                                        { label: 'Color Intensity', val: '+42%', color: '#f59e0b', width: '85%' },
                                        { label: 'Weight (Carat)', val: '+28%', color: '#f59e0b', width: '60%' },
                                        { label: 'Origin Factor', val: '-12%', color: '#ec4899', width: '35%', align: 'left' },
                                        { label: 'Clarity Grade', val: '+15%', color: '#f59e0b', width: '45%' },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '65px', fontSize: '0.6rem', color: t.cardInnerText, fontWeight: 600 }}>{item.label}</div>
                                            <div style={{ flex: 1, height: '8px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    left: item.align === 'left' ? 'auto' : '0',
                                                    right: item.align === 'left' ? '0' : 'auto',
                                                    width: item.width,
                                                    height: '100%',
                                                    background: item.color,
                                                    borderRadius: '4px'
                                                }} />
                                            </div>
                                            <div style={{ width: '25px', fontSize: '0.6rem', color: item.color, fontWeight: 800 }}>{item.val}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: t.heading, marginBottom: '8px' }}>Explainable AI (SHAP)</h3>
                        <p style={{ fontSize: '0.855rem', color: t.muted, lineHeight: 1.7 }}>
                            Our <span style={{ color: t.accent, fontWeight: 600 }}>Transparency Dashboard</span> uses SHAP to show buyers exactly how gem attributes affect the final price.
                        </p>
                    </div>

                    {/* Global Seller Portal — Multi-Vendor Hub */}
                    <div>
                        <div className="feature-card" style={{ height: '240px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', background: t.feature2 }}>
                            <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                                {/* Central Hub (Sri Lanka) */}
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(245,158,11,0.2)', border: '2px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, boxShadow: '0 0 30px rgba(245,158,11,0.4)' }}>
                                    <div style={{ fontSize: '1.2rem' }}>🇱🇰</div>
                                </div>

                                {/* Global Connections */}
                                {[{ x: -65, y: -45, flag: '🇺🇸' }, { x: 65, y: -45, flag: '🇨🇭' }, { x: -60, y: 60, flag: '🇦🇪' }, { x: 60, y: 60, flag: '🇸🇬' }].map((pos, i) => (
                                    <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`, width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', backdropFilter: 'blur(4px)' }}>
                                        {pos.flag}
                                    </div>
                                ))}

                                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 160 160">
                                    {[[-65, -45], [65, -45], [-60, 60], [60, 60]].map(([x, y], i) => (
                                        <line key={i} x1="80" y1="80" x2={80 + x} y2={80 + y} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.4" />
                                    ))}
                                </svg>
                            </div>
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: t.heading, marginBottom: '8px' }}>Multi-Vendor Hub</h3>
                        <p style={{ fontSize: '0.855rem', color: t.muted, lineHeight: 1.7 }}>
                            A <span style={{ color: t.accent, fontWeight: 600 }}>Global Seller Portal</span> connecting Sri Lankan sellers directly to international buyers, eliminating middlemen.
                        </p>
                    </div>

                    {/* ML Valuation Engine — AI Price Prediction */}
                    <div>
                        <div className="feature-card" style={{ height: '240px', padding: '24px', marginBottom: '20px', background: t.feature1 }}>
                            <div style={{ background: t.invoiceBg, backdropFilter: isDark ? 'blur(12px)' : 'none', borderRadius: '14px', padding: '20px', height: '100%', boxShadow: t.cardInnerShadow, border: `1px solid ${t.invoiceBorder}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: '0.65rem', color: t.invoiceLabel, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Predicted Valuation</div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b', letterSpacing: '-0.02em' }}>$4,850.00</div>
                                        <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>±9.2%</div>
                                    </div>
                                </div>

                                {/* Mock Regression Steps */}
                                <div style={{ display: 'flex', gap: '6px', height: '60px', alignItems: 'flex-end' }}>
                                    {[35, 50, 45, 75, 60, 95, 80, 85, 90, 100].map((h, i) => (
                                        <div key={i} style={{
                                            flex: 1,
                                            height: `${h}%`,
                                            background: i === 9 ? '#f59e0b' : 'rgba(245,158,11,0.2)',
                                            borderRadius: '2px',
                                            boxShadow: i === 9 ? '0 0 10px rgba(245,158,11,0.5)' : 'none'
                                        }} />
                                    ))}
                                </div>

                                <div style={{ fontSize: '0.6rem', color: t.invoiceLabel, textAlign: 'right' }}>Random Forest Regressor V2.1</div>
                            </div>
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: t.heading, marginBottom: '8px' }}>AI Price Prediction</h3>
                        <p style={{ fontSize: '0.855rem', color: t.muted, lineHeight: 1.7 }}>
                            Predict prices based on weight, cut, and origin with a <span style={{ color: t.accent, fontWeight: 600 }}>{'<'}10% error margin</span>.
                        </p>
                    </div>
                </div>

                {/* Second Row of Features */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '24px', marginTop: '24px' }}>

                    {/* Verified Rating System */}
                    <div>
                        <div className="feature-card" style={{ height: '240px', padding: '24px', position: 'relative', marginBottom: '20px', background: t.feature2, overflow: 'hidden' }}>
                            <div style={{ background: t.cardInner, backdropFilter: isDark ? 'blur(10px)' : 'none', borderRadius: '12px', padding: '16px', height: '100%', boxShadow: t.cardInnerShadow, border: `1px solid ${t.cardInnerBorder}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <div style={{ position: 'relative', marginBottom: '12px' }}>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.1)' }}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                    </div>
                                    <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: '#10b981', color: 'white', fontSize: '0.6rem', padding: '2px 8px', borderRadius: '100px', fontWeight: 900, border: `2px solid ${isDark ? '#0f172a' : 'white'}` }}>VERIFIED</div>
                                </div>
                                <div style={{ color: t.cardInnerName, fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>4.9/5 Rating</div>
                                <div style={{ fontSize: '0.7rem', color: t.cardInnerText, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Elite Gem Trader</div>
                                <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
                                    {[1, 2, 3, 4, 5].map(i => <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>)}
                                </div>
                            </div>
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: t.heading, marginBottom: '8px' }}>Verified Rating System</h3>
                        <p style={{ fontSize: '0.855rem', color: t.muted, lineHeight: 1.7 }}>
                            Building trust with <span style={{ color: t.accent, fontWeight: 600 }}>verified ratings</span> for every transaction, ensuring a secure marketplace.
                        </p>
                    </div>

                    {/* Transaction History — History */}
                    <div>
                        <div className="feature-card" style={{ height: '240px', padding: '24px', position: 'relative', marginBottom: '20px', background: t.feature1, overflow: 'hidden' }}>
                            <div style={{ background: t.cardInner, backdropFilter: isDark ? 'blur(10px)' : 'none', borderRadius: '12px', padding: '16px', height: '100%', boxShadow: t.cardInnerShadow, border: `1px solid ${t.cardInnerBorder}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: t.cardInnerName, textTransform: 'uppercase', opacity: 0.8 }}>Asset Ledger</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '7px', top: '5px', bottom: '5px', width: '2px', background: 'rgba(255,255,255,0.1)' }} />
                                    {[
                                        { label: 'Gem Bought', time: '2h ago', color: '#10b981', stone: 'Paraiba Tourmaline', price: '$2,450' },
                                        { label: 'Gem Sold', time: '1d ago', color: '#f59e0b', stone: 'Royal Blue Sapphire', price: '$5,800' },
                                        { label: 'Gem Bought', time: '4d ago', color: '#10b981', stone: 'Pink Spinel', price: '$1,200' }
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: item.color, border: '3px solid rgba(0,0,0,0.2)', flexShrink: 0 }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: t.cardInnerName }}>{item.label}</div>
                                                    <div style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 900 }}>{item.price}</div>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <div style={{ fontSize: '0.65rem', color: t.cardInnerText }}>{item.stone}</div>
                                                    <div style={{ fontSize: '0.6rem', color: t.cardInnerText, opacity: 0.6 }}>{item.time}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: t.heading, marginBottom: '8px' }}>Personal Activity Log</h3>
                        <p style={{ fontSize: '0.855rem', color: t.muted, lineHeight: 1.7 }}>
                            A <span style={{ color: t.accent, fontWeight: 600 }}>private ledger</span> for your journey. Buyers track their gemstone acquisitions, while sellers monitor their personal sales history.
                        </p>
                    </div>

                    {/* Personalized Watchlist */}
                    <div>
                        <div className="feature-card" style={{ height: '240px', padding: '24px', position: 'relative', marginBottom: '20px', background: t.feature2, overflow: 'hidden' }}>
                            <div style={{ background: t.cardInner, backdropFilter: isDark ? 'blur(10px)' : 'none', borderRadius: '12px', padding: '12px', height: '100%', boxShadow: t.cardInnerShadow, border: `1px solid ${t.cardInnerBorder}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: '8px', padding: '8px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '6px', right: '6px', color: '#ef4444' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                        </div>
                                        <div style={{ width: '100%', height: '40px', borderRadius: '6px', background: 'linear-gradient(45deg, #f59e0b22, #f59e0b55)', marginBottom: '6px' }} />
                                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: t.cardInnerName, whiteSpace: 'nowrap', overflow: 'hidden' }}>Rare Sapphire</div>
                                        <div style={{ fontSize: '0.55rem', color: '#f59e0b', fontWeight: 900 }}>$1,200</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: t.heading, marginBottom: '8px' }}>Personalized Watchlist</h3>
                        <p style={{ fontSize: '0.855rem', color: t.muted, lineHeight: 1.7 }}>
                            Save stones to your <span style={{ color: t.accent, fontWeight: 600 }}>watchlist</span> and receive instant notifications for bids.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
