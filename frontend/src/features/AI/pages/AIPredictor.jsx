/**
 * AIPredictor.jsx — /ai-predictor
 * Multi-step gem price prediction wizard (Gemval-style).
 * Works with the mock aiPredictorService until the ML model is trained.
 */
import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles, TrendingUp, Info, ArrowRight, Share2 } from 'lucide-react';
import { usePricePredictor } from '../hooks/usePricePredictor';
import SHAPWaterfallChart from '../components/SHAPWaterfallChart';

// ─── Design tokens (matches existing pages) ─────────────────────────────────
const C = {
    bg: '#0a0d14',
    panel: '#0f1220',
    card: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.08)',
    borderHover: 'rgba(255,255,255,0.16)',
    gold: '#f59e0b',
    goldDim: 'rgba(245,158,11,0.12)',
    goldBorder: 'rgba(245,158,11,0.35)',
    green: '#10b981',
    text: '#f1f5f9',
    muted: '#94a3b8',
    dim: '#475569',
    red: '#ef4444',
    purple: '#8b5cf6',
};

const glassCard = {
    background: 'rgba(13,17,28,0.85)',
    border: `1px solid ${C.border}`,
    borderRadius: '16px',
    backdropFilter: 'blur(18px)',
};

// ─── GEM FAMILIES (8 types from gemselect.com scrape) ───────────────────────
const GEM_FAMILIES = [
    { name: 'Sapphire',     emoji: '💎', color: '#3b82f6', glow: 'rgba(59,130,246,0.25)',  desc: 'Corundum · Blue & Fancy' },
    { name: 'Ruby',         emoji: '🔴', color: '#ef4444', glow: 'rgba(239,68,68,0.25)',   desc: 'Corundum · Vivid Red' },
    { name: 'Emerald',      emoji: '💚', color: '#10b981', glow: 'rgba(16,185,129,0.25)',  desc: 'Beryl · Lush Green' },
    { name: 'Alexandrite',  emoji: '🟣', color: '#8b5cf6', glow: 'rgba(139,92,246,0.25)', desc: 'Chrysoberyl · Color-Change' },
    { name: 'Garnet',       emoji: '🍷', color: '#991b1b', glow: 'rgba(153,27,27,0.30)',   desc: 'Silicate · Deep Red' },
    { name: 'Spinel',       emoji: '💖', color: '#ec4899', glow: 'rgba(236,72,153,0.25)',  desc: 'Oxide · Magenta & Red' },
    { name: 'Tourmaline',   emoji: '🌈', color: '#06b6d4', glow: 'rgba(6,182,212,0.25)',   desc: 'Boron Silicate · Multi' },
    { name: 'Aquamarine',   emoji: '🩵', color: '#0ea5e9', glow: 'rgba(14,165,233,0.25)',  desc: 'Beryl · Sea Blue' },
];

// ─── CUT OPTIONS ─────────────────────────────────────────────────────────────
const CUT_OPTIONS = ['Round', 'Oval', 'Cushion', 'Pear', 'Emerald Cut', 'Marquise', 'Heart'];

// ─── CLARITY OPTIONS ─────────────────────────────────────────────────────────
const CLARITY_OPTIONS = [
    { grade: 'IF',   label: 'IF',   desc: 'Internally Flawless' },
    { grade: 'VVS1', label: 'VVS1', desc: 'Very Very Slightly Included' },
    { grade: 'VVS2', label: 'VVS2', desc: 'Very Very Slightly Included' },
    { grade: 'VS1',  label: 'VS1',  desc: 'Very Slightly Included' },
    { grade: 'VS2',  label: 'VS2',  desc: 'Very Slightly Included' },
    { grade: 'SI1',  label: 'SI1',  desc: 'Slightly Included' },
    { grade: 'SI2',  label: 'SI2',  desc: 'Slightly Included' },
    { grade: 'I1',   label: 'I1',   desc: 'Included' },
];

// ─── COLOR OPTIONS per gem family ─────────────────────────────────────────────
const COLOR_OPTIONS = {
    Sapphire:    ['Royal Blue', 'Cornflower Blue', 'Vivid Blue', 'Light Blue', 'Padparadscha', 'Yellow', 'Pink'],
    Ruby:        ['Pigeon Blood', 'Vivid Red', 'Deep Red', 'Pinkish Red', 'Dark Red'],
    Emerald:     ['Vivid Green', 'Muzo Green', 'Medium Green', 'Yellowish Green', 'Bluish Green'],
    Alexandrite: ['Green to Red', 'Teal to Purple', 'Green to Purple'],
    Garnet:      ['Deep Red', 'Orangy Red', 'Raspberry Red', 'Brownish Red'],
    Spinel:      ['Red', 'Hot Pink', 'Cobalt Blue', 'Lavender', 'Orange'],
    Tourmaline:  ['Paraiba Blue', 'Rubellite Pink', 'Chrome Green', 'Bi-Color', 'Indicolite'],
    Aquamarine:  ['Santa Maria Blue', 'Vivid Blue', 'Medium Blue', 'Light Blue'],
};

// ─── TREATMENT OPTIONS ───────────────────────────────────────────────────────
const TREATMENT_OPTIONS = ['None', 'Heat Treated', 'Fracture Filled', 'Irradiation'];

// ─── ORIGIN OPTIONS ──────────────────────────────────────────────────────────
const ORIGIN_OPTIONS = ['Sri Lanka', 'Myanmar', 'Colombia', 'Brazil', 'Thailand', 'Madagascar', 'Russia', 'Other'];

// ─── Pill button helper ──────────────────────────────────────────────────────
const PillButton = ({ label, selected, onClick, accent = C.gold }) => (
    <button
        onClick={onClick}
        style={{
            padding: '8px 16px',
            borderRadius: 99,
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.18s',
            border: selected ? `1.5px solid ${accent}` : `1px solid ${C.border}`,
            background: selected ? `linear-gradient(135deg, ${accent}22, ${accent}0a)` : C.card,
            color: selected ? accent : C.muted,
            letterSpacing: '0.02em',
            boxShadow: selected ? `0 4px 14px ${accent}22` : 'none',
        }}
        onMouseEnter={e => {
            if (!selected) {
                e.currentTarget.style.borderColor = C.borderHover;
                e.currentTarget.style.color = C.text;
            }
        }}
        onMouseLeave={e => {
            if (!selected) {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.color = C.muted;
            }
        }}
    >
        {label}
    </button>
);

// ─── Step progress bar ────────────────────────────────────────────────────────
const StepProgressBar = ({ step, total }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
        {Array.from({ length: total }).map((_, i) => {
            const idx = i + 1;
            const done = step > idx;
            const active = step === idx;
            return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: idx < total ? 1 : 'auto' }}>
                    <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.72rem', fontWeight: 800, flexShrink: 0,
                        border: done ? `2px solid ${C.green}` : active ? `2px solid ${C.gold}` : `2px solid ${C.border}`,
                        background: done ? C.green : active ? C.goldDim : 'transparent',
                        color: done ? '#fff' : active ? C.gold : C.dim,
                        transition: 'all 0.3s',
                        boxShadow: active ? `0 0 12px ${C.gold}44` : done ? `0 0 8px ${C.green}44` : 'none',
                    }}>
                        {done ? '✓' : idx}
                    </div>
                    {idx < total && (
                        <div style={{
                            flex: 1, height: 2, borderRadius: 99,
                            background: done ? C.green : C.border,
                            transition: 'background 0.3s',
                        }} />
                    )}
                </div>
            );
        })}
    </div>
);

// ─── Step header ──────────────────────────────────────────────────────────────
const StepHeader = ({ step, label, sub }) => (
    <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: C.gold, textTransform: 'uppercase', marginBottom: 8 }}>
            Step {step} of 4
        </div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.6rem', fontWeight: 900, color: C.text, letterSpacing: '-0.02em' }}>{label}</h2>
        {sub && <p style={{ margin: 0, fontSize: '0.88rem', color: C.muted, lineHeight: 1.6 }}>{sub}</p>}
    </div>
);

// ─── Nav buttons row ──────────────────────────────────────────────────────────
const NavRow = ({ onBack, onNext, onPredict, isLoading, isValid, showPredict, showBack }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 36 }}>
        <button
            onClick={onBack}
            style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', borderRadius: 10,
                background: 'transparent', border: `1px solid ${C.border}`,
                color: showBack ? C.muted : 'transparent', cursor: showBack ? 'pointer' : 'default',
                fontSize: '0.88rem', fontWeight: 700, transition: 'all 0.18s',
                pointerEvents: showBack ? 'auto' : 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.borderHover; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
        >
            <ChevronLeft size={16} /> Back
        </button>

        {showPredict ? (
            <button
                onClick={onPredict}
                disabled={!isValid || isLoading}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '14px 32px', borderRadius: 12,
                    background: isValid && !isLoading
                        ? `linear-gradient(135deg, ${C.gold}, #d97706)`
                        : 'rgba(255,255,255,0.06)',
                    border: 'none',
                    color: isValid && !isLoading ? '#000' : C.dim,
                    fontSize: '0.95rem', fontWeight: 800, cursor: isValid && !isLoading ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    boxShadow: isValid && !isLoading ? `0 6px 24px rgba(245,158,11,0.35)` : 'none',
                    letterSpacing: '0.02em',
                }}
                onMouseEnter={e => { if (isValid && !isLoading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
                {isLoading ? (
                    <>
                        <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                        Predicting...
                    </>
                ) : (
                    <><Sparkles size={16} /> Predict Price</>
                )}
            </button>
        ) : (
            <button
                onClick={onNext}
                disabled={!isValid}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px 28px', borderRadius: 12,
                    background: isValid ? `linear-gradient(135deg, ${C.gold}22, ${C.gold}0a)` : 'rgba(255,255,255,0.04)',
                    border: isValid ? `1.5px solid ${C.goldBorder}` : `1px solid ${C.border}`,
                    color: isValid ? C.gold : C.dim,
                    fontSize: '0.9rem', fontWeight: 800, cursor: isValid ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    boxShadow: isValid ? `0 4px 16px ${C.gold}22` : 'none',
                }}
                onMouseEnter={e => { if (isValid) { e.currentTarget.style.background = `linear-gradient(135deg, ${C.gold}30, ${C.gold}12)`; e.currentTarget.style.boxShadow = `0 6px 20px ${C.gold}33`; }}}
                onMouseLeave={e => { if (isValid) { e.currentTarget.style.background = `linear-gradient(135deg, ${C.gold}22, ${C.gold}0a)`; e.currentTarget.style.boxShadow = `0 4px 16px ${C.gold}22`; }}}
            >
                Continue <ChevronRight size={16} />
            </button>
        )}
    </div>
);

// ════════════════════════════════════════════════════════════════════════════
//  STEP SCREENS
// ════════════════════════════════════════════════════════════════════════════

// ── Step 0: Landing ──────────────────────────────────────────────────────────
const LandingScreen = ({ onStart }) => (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{
            width: 100, height: 100, borderRadius: '50%', margin: '0 auto 28px',
            background: `radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3.2rem',
            boxShadow: `0 0 40px rgba(245,158,11,0.15)`,
            border: `1px solid ${C.goldBorder}`,
            animation: 'pulse-glow 3s ease-in-out infinite',
        }}>
            💎
        </div>

        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 99,
            background: 'rgba(245,158,11,0.10)',
            border: `1px solid ${C.goldBorder}`,
            fontSize: '0.72rem', fontWeight: 700, color: C.gold,
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20,
        }}>
            <Sparkles size={11} /> AI-Powered · SHAP Explainable
        </div>

        <h1 style={{
            margin: '0 0 16px 0',
            fontSize: 'clamp(2rem, 5vw, 2.8rem)',
            fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1,
            color: C.text,
        }}>
            Gem Price{' '}
            <span style={{
                background: `linear-gradient(135deg, ${C.gold}, #f97316)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Predictor</span>
        </h1>

        <p style={{ color: C.muted, fontSize: '1rem', lineHeight: 1.7, maxWidth: 500, margin: '0 auto 36px', fontWeight: 400 }}>
            Get an instant AI-powered valuation for any gemstone.
            Answer 4 simple questions and our model returns a predicted market price with a full
            <span style={{ color: C.gold, fontWeight: 700 }}> SHAP breakdown</span> — showing exactly
            why each feature affects the price.
        </p>

        {/* Process overview */}
        <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
            maxWidth: 560, margin: '0 auto 44px',
        }}>
            {[
                { step: '01', label: 'Gem Family', icon: '💎' },
                { step: '02', label: 'Physical', icon: '⚖️' },
                { step: '03', label: 'Grading', icon: '🔬' },
                { step: '04', label: 'Origin', icon: '🌍' },
            ].map(({ step, label, icon }) => (
                <div key={step} style={{
                    padding: '16px 10px', borderRadius: 12,
                    background: C.card, border: `1px solid ${C.border}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                }}>
                    <div style={{ fontSize: '1.4rem' }}>{icon}</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: C.gold, letterSpacing: '0.08em' }}>STEP {step}</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: C.text }}>{label}</div>
                </div>
            ))}
        </div>

        <button
            onClick={onStart}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '16px 44px', borderRadius: 14,
                background: `linear-gradient(135deg, ${C.gold}, #d97706)`,
                border: 'none', color: '#000',
                fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
                boxShadow: `0 8px 28px rgba(245,158,11,0.38)`,
                transition: 'all 0.2s', letterSpacing: '0.02em',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 36px rgba(245,158,11,0.48)`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 28px rgba(245,158,11,0.38)`; }}
        >
            Start Appraisal <ArrowRight size={18} />
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 32 }}>
            {[['Random Forest ML', '🤖'], ['SHAP Explainability', '🧠'], ['8 Gem Families', '💎']].map(([label, icon]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: C.dim, fontWeight: 600 }}>
                    <span>{icon}</span> {label}
                </div>
            ))}
        </div>
    </div>
);

// ── Step 1: Gem Family ────────────────────────────────────────────────────────
const Step1GemFamily = ({ formData, updateField }) => (
    <div>
        <StepHeader step={1} label="Select Gem Family" sub="Choose the primary gemstone variety. This is the most important factor in valuation." />
        <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14,
        }}>
            {GEM_FAMILIES.map(({ name, emoji, color, glow, desc }) => {
                const selected = formData.gemFamily === name;
                return (
                    <button
                        key={name}
                        onClick={() => updateField('gemFamily', name)}
                        style={{
                            padding: '20px 18px', borderRadius: 14, textAlign: 'left',
                            background: selected
                                ? `linear-gradient(135deg, ${glow}, rgba(0,0,0,0.3))`
                                : C.card,
                            border: selected ? `2px solid ${color}` : `1px solid ${C.border}`,
                            cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: selected ? `0 6px 24px ${glow}, 0 0 0 1px ${color}33` : 'none',
                            transform: selected ? 'translateY(-2px)' : 'none',
                        }}
                        onMouseEnter={e => {
                            if (!selected) {
                                e.currentTarget.style.borderColor = color + '80';
                                e.currentTarget.style.background = `linear-gradient(135deg, ${glow}80, rgba(0,0,0,0.2))`;
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                        }}
                        onMouseLeave={e => {
                            if (!selected) {
                                e.currentTarget.style.borderColor = C.border;
                                e.currentTarget.style.background = C.card;
                                e.currentTarget.style.transform = 'none';
                            }
                        }}
                    >
                        <div style={{ fontSize: '2rem', marginBottom: 10 }}>{emoji}</div>
                        <div style={{ fontWeight: 800, color: selected ? color : C.text, fontSize: '1rem', marginBottom: 4 }}>{name}</div>
                        <div style={{ fontSize: '0.72rem', color: C.dim, fontWeight: 500 }}>{desc}</div>
                        {selected && (
                            <div style={{
                                marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 4,
                                fontSize: '0.68rem', fontWeight: 700, color, letterSpacing: '0.06em',
                            }}>
                                ✓ Selected
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    </div>
);

// ── Step 2: Physical Properties ────────────────────────────────────────────────
const Step2Physical = ({ formData, updateField }) => {
    const carat = parseFloat(formData.caratWeight) || 0;

    return (
        <div>
            <StepHeader step={2} label="Physical Properties" sub="Enter the carat weight and specify how the stone has been cut." />

            {/* Carat Weight */}
            <div style={{ marginBottom: 36 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: C.muted, textTransform: 'uppercase', marginBottom: 14 }}>
                    Carat Weight
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 14 }}>
                    <input
                        type="number"
                        min="0.1"
                        max="30"
                        step="0.01"
                        value={formData.caratWeight}
                        onChange={e => updateField('caratWeight', e.target.value)}
                        placeholder="e.g. 2.50"
                        style={{
                            width: 120, padding: '12px 16px', borderRadius: 10,
                            background: C.card, border: `1px solid ${formData.caratWeight ? C.goldBorder : C.border}`,
                            color: C.text, fontSize: '1.2rem', fontWeight: 800, outline: 'none',
                            transition: 'border-color 0.2s',
                            fontVariantNumeric: 'tabular-nums',
                        }}
                        onFocus={e => e.target.style.borderColor = C.gold}
                        onBlur={e => e.target.style.borderColor = formData.caratWeight ? C.goldBorder : C.border}
                    />
                    <span style={{ color: C.muted, fontWeight: 700, fontSize: '0.9rem' }}>carats (ct)</span>
                    {carat > 0 && (
                        <span style={{
                            padding: '4px 12px', borderRadius: 99,
                            background: C.goldDim, border: `1px solid ${C.goldBorder}`,
                            fontSize: '0.75rem', fontWeight: 700, color: C.gold,
                        }}>
                            {carat < 0.5 ? 'Melee' : carat < 1 ? 'Small' : carat < 3 ? 'Standard' : carat < 6 ? 'Large' : 'Exceptional'}
                        </span>
                    )}
                </div>

                {/* Slider */}
                <input
                    type="range" min="0.1" max="15" step="0.1"
                    value={formData.caratWeight || 0}
                    onChange={e => updateField('caratWeight', parseFloat(e.target.value).toFixed(2))}
                    style={{ width: '100%', accentColor: C.gold, cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: C.dim, fontWeight: 600, marginTop: 4 }}>
                    <span>0.1 ct</span>
                    <span>7.5 ct</span>
                    <span>15.0 ct</span>
                </div>
            </div>

            {/* Cut */}
            <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: C.muted, textTransform: 'uppercase', marginBottom: 14 }}>
                    Cut / Shape
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {CUT_OPTIONS.map(cut => (
                        <PillButton
                            key={cut}
                            label={cut}
                            selected={formData.cut === cut}
                            onClick={() => updateField('cut', cut)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// ── Step 3: Quality Grading ────────────────────────────────────────────────────
const Step3Quality = ({ formData, updateField }) => {
    const colors = COLOR_OPTIONS[formData.gemFamily] || [];

    return (
        <div>
            <StepHeader step={3} label="Quality Grading" sub="Color, clarity, and treatment are the biggest quality drivers in gem valuation." />

            {/* Clarity */}
            <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: C.muted, textTransform: 'uppercase', marginBottom: 14 }}>
                    Clarity Grade
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {CLARITY_OPTIONS.map(({ grade, label, desc }) => (
                        <button
                            key={grade}
                            onClick={() => updateField('clarity', grade)}
                            title={desc}
                            style={{
                                padding: '10px 18px', borderRadius: 99,
                                cursor: 'pointer', transition: 'all 0.18s',
                                border: formData.clarity === grade ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                                background: formData.clarity === grade ? 'rgba(16,185,129,0.12)' : C.card,
                                color: formData.clarity === grade ? C.green : C.muted,
                                fontSize: '0.82rem', fontWeight: 800,
                                boxShadow: formData.clarity === grade ? `0 4px 14px rgba(16,185,129,0.22)` : 'none',
                            }}
                            onMouseEnter={e => { if (formData.clarity !== grade) { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.color = C.text; }}}
                            onMouseLeave={e => { if (formData.clarity !== grade) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                {formData.clarity && (
                    <p style={{ marginTop: 8, fontSize: '0.78rem', color: C.dim }}>
                        {CLARITY_OPTIONS.find(c => c.grade === formData.clarity)?.desc}
                    </p>
                )}
            </div>

            {/* Color */}
            <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: C.muted, textTransform: 'uppercase', marginBottom: 14 }}>
                    Color Description
                    <span style={{ color: C.dim, fontWeight: 500, marginLeft: 8, fontSize: '0.68rem', textTransform: 'none', letterSpacing: 0 }}>
                        (specific to {formData.gemFamily || 'selected gem'})
                    </span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {colors.map(color => (
                        <PillButton
                            key={color}
                            label={color}
                            selected={formData.color === color}
                            onClick={() => updateField('color', color)}
                            accent={C.purple}
                        />
                    ))}
                </div>
            </div>

            {/* Treatment */}
            <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: C.muted, textTransform: 'uppercase', marginBottom: 14 }}>
                    Treatment
                    <span style={{ color: C.dim, fontWeight: 500, marginLeft: 8, fontSize: '0.68rem', textTransform: 'none', letterSpacing: 0 }}>
                        "None" commands highest premium
                    </span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {TREATMENT_OPTIONS.map(t => (
                        <PillButton
                            key={t}
                            label={t}
                            selected={formData.treatment === t}
                            onClick={() => updateField('treatment', t)}
                            accent={t === 'None' ? C.green : C.red}
                        />
                    ))}
                </div>
                {formData.treatment && formData.treatment !== 'None' && (
                    <div style={{
                        marginTop: 14, padding: '10px 14px', borderRadius: 10,
                        background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                        display: 'flex', alignItems: 'flex-start', gap: 8,
                    }}>
                        <Info size={14} style={{ color: C.red, flexShrink: 0, marginTop: 1 }} />
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#fca5a5', lineHeight: 1.5 }}>
                            Treated stones typically carry a 15–35% price reduction vs. untreated equivalents of the same grade.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Step 4: Origin + Summary ──────────────────────────────────────────────────
const Step4Origin = ({ formData, updateField }) => {
    const gem = GEM_FAMILIES.find(g => g.name === formData.gemFamily);

    return (
        <div>
            <StepHeader step={4} label="Origin & Final Review" sub="Gem origin significantly impacts value — Ceylon sapphires and Colombian emeralds command top premiums." />

            {/* Origin grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 36 }}>
                {ORIGIN_OPTIONS.map(origin => {
                    const flags = { 'Sri Lanka': '🇱🇰', Myanmar: '🇲🇲', Colombia: '🇨🇴', Brazil: '🇧🇷', Thailand: '🇹🇭', Madagascar: '🇲🇬', Russia: '🇷🇺', Other: '🌍' };
                    const selected = formData.origin === origin;
                    return (
                        <button
                            key={origin}
                            onClick={() => updateField('origin', origin)}
                            style={{
                                padding: '14px 12px', borderRadius: 12, textAlign: 'center',
                                cursor: 'pointer', transition: 'all 0.18s',
                                border: selected ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                                background: selected ? C.goldDim : C.card,
                                color: selected ? C.gold : C.muted,
                                fontSize: '0.82rem', fontWeight: 700,
                                boxShadow: selected ? `0 4px 14px ${C.gold}22` : 'none',
                            }}
                            onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.color = C.text; }}}
                            onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}}
                        >
                            <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{flags[origin]}</div>
                            {origin}
                        </button>
                    );
                })}
            </div>

            {/* Summary review card */}
            <div style={{
                ...glassCard,
                padding: '24px 28px',
                background: 'rgba(245,158,11,0.04)',
                border: `1px solid ${C.goldBorder}`,
            }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: C.gold, textTransform: 'uppercase', marginBottom: 16 }}>
                    Appraisal Summary
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
                    {[
                        { label: 'Gem Family',  value: formData.gemFamily,    emoji: gem?.emoji || '💎' },
                        { label: 'Carat Weight', value: formData.caratWeight ? `${formData.caratWeight} ct` : '—', emoji: '⚖️' },
                        { label: 'Cut',         value: formData.cut || '—',   emoji: '✂️' },
                        { label: 'Clarity',     value: formData.clarity || '—', emoji: '🔬' },
                        { label: 'Color',       value: formData.color || '—', emoji: '🎨' },
                        { label: 'Treatment',   value: formData.treatment || '—', emoji: '⚗️' },
                        { label: 'Origin',      value: formData.origin || '—', emoji: '🌍' },
                    ].map(({ label, value, emoji }) => (
                        <div key={label}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: C.dim, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                                {emoji} {label}
                            </div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: value === '—' ? C.dim : C.text }}>
                                {value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ── Step 5: Result Screen ─────────────────────────────────────────────────────
const ResultScreen = ({ result, formData, onReset, onListGem, onShare, shareMsg, userRole }) => {
    const gem = GEM_FAMILIES.find(g => g.name === formData.gemFamily);
    const confidence = result ? Math.round(100 - ((result.confidenceHigh - result.confidenceLow) / result.predictedPrice) * 50) : 0;

    return (
        <div>
            {/* Price hero */}
            <div style={{
                ...glassCard,
                padding: '36px 32px', textAlign: 'center', marginBottom: 24,
                background: `radial-gradient(ellipse at top, rgba(245,158,11,0.08) 0%, rgba(13,17,28,0.95) 100%)`,
                border: `1px solid ${C.goldBorder}`,
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />

                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16,
                    padding: '5px 14px', borderRadius: 99,
                    background: 'rgba(245,158,11,0.12)', border: `1px solid ${C.goldBorder}`,
                    fontSize: '0.72rem', fontWeight: 700, color: C.gold, letterSpacing: '0.08em',
                }}>
                    <TrendingUp size={11} /> AI PREDICTED MARKET VALUE
                </div>

                <div style={{
                    fontSize: 'clamp(2.8rem, 8vw, 4.5rem)', fontWeight: 900,
                    color: C.gold, letterSpacing: '-0.03em',
                    textShadow: `0 0 40px rgba(245,158,11,0.35)`,
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                    marginBottom: 12,
                }}>
                    ${result?.predictedPrice?.toLocaleString()}
                </div>

                <div style={{ color: C.muted, fontSize: '0.88rem', fontWeight: 600, marginBottom: 20 }}>
                    Confidence range:&nbsp;
                    <span style={{ color: C.text, fontWeight: 700 }}>
                        ${result?.confidenceLow?.toLocaleString()} – ${result?.confidenceHigh?.toLocaleString()}
                    </span>
                </div>

                {/* Meta row */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                    {[
                        { label: 'Gem', value: `${gem?.emoji || ''} ${formData.gemFamily}` },
                        { label: 'Carat', value: `${formData.caratWeight} ct` },
                        { label: 'Confidence', value: `${confidence}%` },
                        { label: 'Currency', value: 'USD' },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.65rem', color: C.dim, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                            <div style={{ fontSize: '0.9rem', color: C.text, fontWeight: 800 }}>{value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SHAP explanation */}
            <div style={{ ...glassCard, padding: '28px 28px', marginBottom: 24 }}>
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                        🧠 AI Explanation (SHAP Values)
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: C.text }}>
                        Why this price?
                    </h3>
                    <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: C.dim, lineHeight: 1.5 }}>
                        Each factor's dollar contribution to the predicted price, from most to least impactful.
                    </p>
                </div>
                <SHAPWaterfallChart shapValues={result?.shapValues || []} maxBarWidth={280} />
            </div>

            {/* Disclaimer */}
            <div style={{
                padding: '14px 18px', borderRadius: 12,
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 28,
            }}>
                <Info size={14} style={{ color: C.dim, flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0, fontSize: '0.75rem', color: C.dim, lineHeight: 1.6 }}>
                    <strong style={{ color: C.muted }}>Model note:</strong> This prediction uses a mock model for UI demonstration.
                    The production ML model (Random Forest / XGBoost, trained on gemselect.com scraped data) will replace this when training is complete.
                    Results are for reference only and should not be used for formal appraisal.
                </p>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <button
                    onClick={onReset}
                    style={{
                        flex: 1, minWidth: 160,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '14px 24px', borderRadius: 12,
                        background: C.card, border: `1px solid ${C.border}`,
                        color: C.muted, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.18s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.borderHover; }}
                    onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
                >
                    <RotateCcw size={15} /> Predict Another
                </button>

                <button
                    onClick={onShare}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '14px 20px', borderRadius: 12,
                        background: C.card, border: `1px solid ${C.border}`,
                        color: shareMsg ? C.green : C.muted, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.18s', minWidth: 130,
                    }}
                    onMouseEnter={e => { if (!shareMsg) { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.borderHover; }}}
                    onMouseLeave={e => { if (!shareMsg) { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}}
                >
                    <Share2 size={15} /> {shareMsg || 'Share Link'}
                </button>

                {/* Seller-only: List This Gem */}
                {(userRole === 'seller' || userRole === 'admin') && (
                    <button
                        onClick={onListGem}
                        style={{
                            flex: 2, minWidth: 200,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            padding: '14px 28px', borderRadius: 12,
                            background: `linear-gradient(135deg, ${C.gold}, #d97706)`,
                            border: 'none', color: '#000',
                            fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: `0 6px 24px rgba(245,158,11,0.35)`,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 10px 30px rgba(245,158,11,0.45)`; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 24px rgba(245,158,11,0.35)`; }}
                    >
                        <Sparkles size={16} /> List This Gem
                    </button>
                )}
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const AIPredictorPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Read URL params for pre-fill (e.g. from share link)
    const initialParams = useMemo(() => {
        const p = {};
        const keys = ['gemFamily', 'caratWeight', 'cut', 'clarity', 'color', 'treatment', 'origin'];
        keys.forEach(k => { const v = searchParams.get(k); if (v) p[k] = v; });
        return p;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // TODO: Replace with real auth context when available
    // e.g.  const { user } = useAuth();  const userRole = user?.role;
    const userRole = 'seller'; // placeholder — shows "List This Gem" for demo

    const {
        step, formData, isLoading, error, result,
        TOTAL_STEPS, isStepValid,
        updateField, handleStart, handleNext, handleBack, handlePredict, handleReset,
    } = usePricePredictor(initialParams);

    const [shareMsg, setShareMsg] = useState('');

    const handleShare = () => {
        const params = new URLSearchParams();
        Object.entries(formData).forEach(([k, v]) => { if (v) params.set(k, v); });
        const url = `${window.location.origin}/ai-predictor?${params.toString()}`;
        navigator.clipboard.writeText(url).then(() => {
            setShareMsg('Link copied!');
            setTimeout(() => setShareMsg(''), 2000);
        });
    };

    const handleListGem = () => {
        // Navigate to create-listing with gem data pre-filled via state
        navigate('/seller-dashboard', {
            state: {
                prefill: {
                    gemFamily: formData.gemFamily,
                    caratWeight: formData.caratWeight,
                    cut: formData.cut,
                    clarity: formData.clarity,
                    color: formData.color,
                    treatment: formData.treatment,
                    origin: formData.origin,
                    predictedPrice: result?.predictedPrice,
                },
            },
        });
    };

    const isResultScreen = step === 5;
    const isLanding = step === 0;

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter','Segoe UI',sans-serif", color: C.text }}>
            {/* ── Ambient background orbs ── */}
            <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)' }} />
                <div style={{ position: 'absolute', bottom: '10%', left: '-8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)' }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>

                {/* ── Back navigation ── */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 36,
                        background: 'transparent', border: 'none', color: C.muted,
                        fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s',
                        padding: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                    onMouseLeave={e => e.currentTarget.style.color = C.muted}
                >
                    <ChevronLeft size={16} /> Back
                </button>

                {/* ── Progress bar (steps 1-4) ── */}
                {step >= 1 && step <= 4 && (
                    <StepProgressBar step={step} total={TOTAL_STEPS} />
                )}

                {/* ── Main card ── */}
                <div style={{
                    ...glassCard,
                    padding: isLanding ? '20px' : '40px 40px',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                }}>
                    {step === 0 && <LandingScreen onStart={handleStart} />}
                    {step === 1 && <Step1GemFamily formData={formData} updateField={updateField} />}
                    {step === 2 && <Step2Physical formData={formData} updateField={updateField} />}
                    {step === 3 && <Step3Quality formData={formData} updateField={updateField} />}
                    {step === 4 && <Step4Origin formData={formData} updateField={updateField} />}
                    {step === 5 && (
                        <ResultScreen
                            result={result}
                            formData={formData}
                            onReset={handleReset}
                            onListGem={handleListGem}
                            onShare={handleShare}
                            shareMsg={shareMsg}
                            userRole={userRole}
                        />
                    )}

                    {/* ── Error ── */}
                    {error && (
                        <div style={{
                            marginTop: 16, padding: '12px 16px', borderRadius: 10,
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                            color: '#fca5a5', fontSize: '0.85rem', fontWeight: 600,
                        }}>
                            ⚠ {error}
                        </div>
                    )}

                    {/* ── Navigation row (steps 1-4) ── */}
                    {step >= 1 && step <= 4 && (
                        <NavRow
                            onBack={handleBack}
                            onNext={handleNext}
                            onPredict={handlePredict}
                            isLoading={isLoading}
                            isValid={isStepValid()}
                            showPredict={step === 4}
                            showBack={step > 1}
                        />
                    )}
                </div>

                {/* ── Loading overlay ── */}
                {isLoading && (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 999,
                        background: 'rgba(10,13,20,0.82)', backdropFilter: 'blur(6px)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: 20,
                    }}>
                        {/* Spinning gem */}
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            border: `3px solid ${C.border}`,
                            borderTopColor: C.gold,
                            animation: 'spin 0.9s linear infinite',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem',
                        }}>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: C.text, marginBottom: 6 }}>
                                Predicting price…
                            </div>
                            <div style={{ fontSize: '0.82rem', color: C.muted }}>
                                Running Random Forest model + SHAP analysis
                            </div>
                        </div>
                        <style>{`
                            @keyframes spin { to { transform: rotate(360deg); } }
                            @keyframes pulse-glow {
                                0%, 100% { box-shadow: 0 0 40px rgba(245,158,11,0.15); }
                                50%       { box-shadow: 0 0 60px rgba(245,158,11,0.30); }
                            }
                        `}</style>
                    </div>
                )}

                {/* Global keyframes for landing */}
                {!isLoading && (
                    <style>{`
                        @keyframes pulse-glow {
                            0%, 100% { box-shadow: 0 0 40px rgba(245,158,11,0.12); }
                            50%       { box-shadow: 0 0 60px rgba(245,158,11,0.25); }
                        }
                        @keyframes spin { to { transform: rotate(360deg); } }
                    `}</style>
                )}
            </div>
        </div>
    );
};

export default AIPredictorPage;
