/**
 * AIPredictor.jsx — /ai-predictor
 * Gem price prediction wizard aligned to dataset + existing site theme.
 *
 * Theme: Vostok-inspired light elegant (matches /gems, /auctions)
 * Fonts: Cinzel (brand), Cormorant Garamond (display)
 * Colors: parchment #F0EDE8, navy #1A4D8C, gold #C4892A
 *
 * Steps:
 *   0 → Landing
 *   1 → Gem Family (8 cards)
 *   2 → Shape (10 SVG cards)
 *   3 → Carat Weight (input + slider)
 *   4 → Dimensions (x, y, z inputs)
 *   5 → Quality (clarity SVG + colors per gem type + treatment)
 *   6 → Result / SHAP
 */
import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCurrency } from '../../../context/CurrencyContext';
import { lkrToUsd } from '../../../shared/utils/currency';
import {
  ChevronLeft, ChevronRight, RotateCcw, Sparkles,
  TrendingUp, Info, ArrowRight, Share2, Gem, Scale,
  Palette, Eye, FlaskConical, ShoppingBag, Gavel,
} from 'lucide-react';
import { usePricePredictor } from '../hooks/usePricePredictor';
import SHAPWaterfallChart from '../components/SHAPWaterfallChart';
import GemShapeSVG from '../components/GemShapeSVG';
import ColorSwatch, { COLOR_HEX_MAP } from '../components/ColorSwatch';
import ClarityIllustration, { CLARITY_OPTIONS } from '../components/ClarityIllustration';

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — matches existing /gems /auctions theme
   ═══════════════════════════════════════════════════════════════ */
const C = {
  parchment: '#F0EDE8',
  white: '#FFFFFF',
  navy: '#1A4D8C',
  navyDark: '#1A2B5C',
  gold: '#C4892A',
  text: '#1A1A2E',
  muted: '#6B6B7B',
  faint: '#9A9AAB',
  border: 'rgba(26,77,140,0.12)',
  borderHover: 'rgba(26,77,140,0.25)',
  green: '#16a34a',
  red: '#b91c1c',
  cream: '#FAF8F5',
};
const BRAND = "'Cinzel', serif";
const DISPLAY = "'Cormorant Garamond', 'Georgia', serif";
const BODY = "'Inter', 'Segoe UI', sans-serif";

const cardBase = {
  background: C.white,
  border: `0.5px solid ${C.border}`,
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(26,77,140,0.04)',
  transition: 'all 0.2s ease',
};

/* ═══════════════════════════════════════════════════════════════
   GEM FAMILIES — 8 dataset types with real colors from CSV
   ═══════════════════════════════════════════════════════════════ */
const GEM_FAMILIES = [
  {
    value: 'sapphire', name: 'Sapphire', emoji: '💎',
    color: '#1A4D8C', desc: 'Corundum · Royal Blue & Fancy Colors',
    colors: ['Blue', 'Gold', 'Green', 'Multicolor', 'Orange', 'Pink', 'Purple', 'Red', 'White', 'Yellow'],
  },
  {
    value: 'ruby', name: 'Ruby', emoji: '🔴',
    color: '#9B2335', desc: 'Corundum · Pigeon Blood to Pinkish Red',
    colors: ['Pink', 'Pinkish Red', 'Purple', 'Red', 'Wine'],
  },
  {
    value: 'amethyst', name: 'Amethyst', emoji: '💜',
    color: '#6B4C9A', desc: 'Quartz · Royal Purple & Violet',
    colors: ['Iris', 'Pink', 'Violet'],
  },
  {
    value: 'citrine', name: 'Citrine', emoji: '🟡',
    color: '#D4A017', desc: 'Quartz · Warm Golden Tones',
    colors: ['Brown', 'Gold', 'Orange', 'Orange-Gold', 'Yellow'],
  },
  {
    value: 'pyrope garnet', name: 'Pyrope Garnet', emoji: '🍷',
    color: '#722F37', desc: 'Garnet · Deep Crimson Reds',
    colors: ['Blood Red', 'Red', 'Rose', 'Wine Red'],
  },
  {
    value: 'spinel', name: 'Spinel', emoji: '💖',
    color: '#C71585', desc: 'Oxide · Vivid Magenta & Lavender',
    colors: ['Black', 'Lavender', 'Magenta'],
  },
  {
    value: 'topaz', name: 'Topaz', emoji: '💠',
    color: '#0F6E9B', desc: 'Silicate · Sky Blue & White',
    colors: ['Blue', 'White'],
  },
  {
    value: 'tourmaline', name: 'Tourmaline', emoji: '🌈',
    color: '#2E8B8B', desc: 'Boron Silicate · Multi-color Marvel',
    colors: ['Black', 'Green', 'Multicolor', 'Pink', 'Red'],
  },
];

/* ═══════════════════════════════════════════════════════════════
   SHAPES — 10 dataset shapes
   ═══════════════════════════════════════════════════════════════ */
const SHAPE_OPTIONS = [
  'Cushion', 'Fancy', 'Heart', 'Marquise', 'Octagon',
  'Other', 'Oval', 'Pear', 'Round', 'Trillion',
];

/* ═══════════════════════════════════════════════════════════════
   TREATMENTS — 5 dataset treatments
   ═══════════════════════════════════════════════════════════════ */
const TREATMENT_OPTIONS = [
  { value: 'Be Heated', label: 'Be Heated', impact: 'neutral' },
  { value: 'Fracture Filled', label: 'Fracture Filled', impact: 'negative' },
  { value: 'Heated', label: 'Heated', impact: 'neutral' },
  { value: 'Irradiated', label: 'Irradiated', impact: 'negative' },
  { value: 'Untreated', label: 'Untreated', impact: 'positive' },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const formatLKR = (n) => {
  if (!n || isNaN(n)) return '—';
  return 'LKR ' + n.toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

/* ── Step progress dots ──────────────────────────────────────── */
const StepDots = ({ step, total }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
    {Array.from({ length: total }).map((_, i) => {
      const idx = i + 1;
      const done = step > idx;
      const active = step === idx;
      return (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: idx < total ? 1 : 'auto' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
            fontFamily: BRAND,
            border: done ? `2px solid ${C.gold}` : active ? `2px solid ${C.navy}` : `2px solid ${C.border}`,
            background: done ? C.gold : active ? C.navy : C.white,
            color: done || active ? C.white : C.faint,
            transition: 'all 0.3s',
          }}>
            {done ? '✓' : idx}
          </div>
          {idx < total && (
            <div style={{
              flex: 1, height: 1.5, borderRadius: 99,
              background: done ? C.gold : C.border,
              transition: 'background 0.3s',
            }} />
          )}
        </div>
      );
    })}
  </div>
);

/* ── Step header ─────────────────────────────────────────────── */
const StepHeader = ({ icon: Icon, label, sub }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 6,
        background: `rgba(26,77,140,0.08)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} color={C.navy} />
      </div>
      <h2 style={{
        margin: 0, fontSize: '1.35rem', fontWeight: 600,
        color: C.navy, fontFamily: DISPLAY, letterSpacing: '-0.01em',
      }}>{label}</h2>
    </div>
    {sub && <p style={{ margin: 0, fontSize: '0.88rem', color: C.muted, fontFamily: BODY, lineHeight: 1.6 }}>{sub}</p>}
  </div>
);

/* ── Nav buttons ─────────────────────────────────────────────── */
const NavRow = ({ onBack, onNext, onPredict, isLoading, isValid, showPredict, showBack }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, paddingTop: 24, borderTop: `0.5px solid ${C.border}` }}>
    <button
      onClick={onBack}
      disabled={!showBack}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '10px 20px', borderRadius: 6,
        background: 'transparent', border: `0.5px solid ${showBack ? C.border : 'transparent'}`,
        color: showBack ? C.muted : 'transparent', cursor: showBack ? 'pointer' : 'default',
        fontSize: '0.85rem', fontWeight: 600, fontFamily: BODY,
        transition: 'all 0.18s', pointerEvents: showBack ? 'auto' : 'none',
      }}
      onMouseEnter={e => { if (showBack) { e.currentTarget.style.color = C.navy; e.currentTarget.style.borderColor = C.navy; } }}
      onMouseLeave={e => { if (showBack) { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; } }}
    >
      <ChevronLeft size={15} /> Back
    </button>

    {showPredict ? (
      <button
        onClick={onPredict}
        disabled={!isValid || isLoading}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 28px', borderRadius: 6,
          background: isValid && !isLoading ? C.navy : '#E8E4DE',
          border: 'none',
          color: isValid && !isLoading ? C.white : C.faint,
          fontSize: '0.9rem', fontWeight: 700, fontFamily: BRAND,
          cursor: isValid && !isLoading ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          letterSpacing: '0.04em',
          boxShadow: isValid && !isLoading ? '0 4px 12px rgba(26,77,140,0.25)' : 'none',
        }}
        onMouseEnter={e => { if (isValid && !isLoading) { e.currentTarget.style.background = C.navyDark; e.currentTarget.style.boxShadow = '0 6px 18px rgba(26,77,140,0.35)'; } }}
        onMouseLeave={e => { if (isValid && !isLoading) { e.currentTarget.style.background = C.navy; e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,77,140,0.25)'; } }}
      >
        {isLoading ? (
          <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> Predicting…</>
        ) : (
          <><Sparkles size={15} /> Predict Price</>
        )}
      </button>
    ) : (
      <button
        onClick={onNext}
        disabled={!isValid}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '11px 24px', borderRadius: 6,
          background: isValid ? C.navy : '#E8E4DE',
          border: 'none',
          color: isValid ? C.white : C.faint,
          fontSize: '0.88rem', fontWeight: 700, fontFamily: BRAND,
          cursor: isValid ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          letterSpacing: '0.04em',
          boxShadow: isValid ? '0 4px 12px rgba(26,77,140,0.25)' : 'none',
        }}
        onMouseEnter={e => { if (isValid) { e.currentTarget.style.background = C.navyDark; } }}
        onMouseLeave={e => { if (isValid) { e.currentTarget.style.background = C.navy; } }}
      >
        Continue <ChevronRight size={15} />
      </button>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   STEP SCREENS
   ═══════════════════════════════════════════════════════════════ */

/* ── Step 0: Landing ─────────────────────────────────────────── */
const LandingScreen = ({ onStart }) => (
  <div style={{ textAlign: 'center', padding: '48px 20px' }}>
    <div style={{
      width: 90, height: 90, borderRadius: '50%', margin: '0 auto 24px',
      background: `linear-gradient(135deg, rgba(26,77,140,0.08), rgba(196,137,42,0.08))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '2.8rem', border: `1.5px solid ${C.gold}`,
    }}>
      💎
    </div>

    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 99,
      background: 'rgba(26,77,140,0.06)', border: `0.5px solid ${C.border}`,
      fontSize: '0.68rem', fontWeight: 700, color: C.navy,
      fontFamily: BRAND, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18,
    }}>
      <Sparkles size={10} /> AI-Powered Valuation
    </div>

    <h1 style={{
      margin: '0 0 14px 0',
      fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
      fontWeight: 600, fontFamily: DISPLAY, letterSpacing: '-0.02em', lineHeight: 1.15,
      color: C.navyDark,
    }}>
      Gem Price Predictor
    </h1>

    <p style={{ color: C.muted, fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 460, margin: '0 auto 36px', fontFamily: BODY }}>
      Get an instant market valuation powered by machine learning.
      Trained on <strong style={{ color: C.navy }}>21,998 real gem transactions</strong>.
    </p>

    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
      maxWidth: 520, margin: '0 auto 40px',
    }}>
      {[
        { step: '1', label: 'Gem Type', icon: '💎' },
        { step: '2', label: 'Shape', icon: '✂️' },
        { step: '3', label: 'Carat', icon: '⚖️' },
        { step: '4', label: 'Size', icon: '📐' },
        { step: '5', label: 'Quality', icon: '🔬' },
      ].map(({ step, label, icon }) => (
        <div key={step} style={{
          padding: '16px 8px', borderRadius: 8,
          background: C.white, border: `0.5px solid ${C.border}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        }}>
          <div style={{ fontSize: '1.3rem' }}>{icon}</div>
          <div style={{ fontSize: '0.55rem', fontWeight: 700, color: C.gold, fontFamily: BRAND, letterSpacing: '0.08em' }}>STEP {step}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: C.text, fontFamily: BODY }}>{label}</div>
        </div>
      ))}
    </div>

    <button
      onClick={onStart}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: '14px 40px', borderRadius: 6,
        background: C.navy, border: 'none', color: C.white,
        fontSize: '0.95rem', fontWeight: 700, fontFamily: BRAND,
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(26,77,140,0.25)',
        transition: 'all 0.2s', letterSpacing: '0.04em',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = C.navyDark; e.currentTarget.style.boxShadow = '0 6px 22px rgba(26,77,140,0.35)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = C.navy; e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,77,140,0.25)'; }}
    >
      Start Appraisal <ArrowRight size={17} />
    </button>

    <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 28 }}>
      {[['ML Powered', '🤖'], ['SHAP Explainable', '🧠'], ['R² = 96%', '📊']].map(([label, icon]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: C.faint, fontFamily: BODY, fontWeight: 500 }}>
          <span>{icon}</span> {label}
        </div>
      ))}
    </div>
  </div>
);

/* ── Step 1: Gem Family ──────────────────────────────────────── */
const Step1GemFamily = ({ formData, updateField }) => (
  <div>
    <StepHeader icon={Gem} label="Select Gem Family" sub="Choose the primary gemstone variety. This is the most important price factor." />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
      {GEM_FAMILIES.map(({ value, name, emoji, color, desc }) => {
        const selected = formData.gemFamily === value;
        return (
          <button
            key={value}
            onClick={() => updateField('gemFamily', value)}
            style={{
              ...cardBase,
              padding: '18px 16px', textAlign: 'left',
              border: selected ? `2px solid ${color}` : `0.5px solid ${C.border}`,
              boxShadow: selected ? `0 4px 16px ${color}22` : cardBase.boxShadow,
              transform: selected ? 'translateY(-2px)' : 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              if (!selected) { e.currentTarget.style.borderColor = color + '60'; e.currentTarget.style.boxShadow = `0 4px 14px ${color}15`; }
            }}
            onMouseLeave={e => {
              if (!selected) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = cardBase.boxShadow; }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ fontSize: '1.8rem' }}>{emoji}</div>
              <div>
                <div style={{ fontWeight: 700, color: selected ? color : C.navy, fontSize: '1rem', fontFamily: DISPLAY }}>{name}</div>
                <div style={{ fontSize: '0.72rem', color: C.faint, fontFamily: BODY }}>{desc}</div>
              </div>
            </div>
            {selected && (
              <div style={{
                marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: '0.65rem', fontWeight: 700, color, fontFamily: BRAND, letterSpacing: '0.06em',
              }}>
                ✓ SELECTED
              </div>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

/* ── Step 2: Shape ───────────────────────────────────────────── */
const Step2Shape = ({ formData, updateField }) => (
  <div>
    <StepHeader icon={Scale} label="Select Cut Shape" sub="The shape affects light performance and market desirability." />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
      {SHAPE_OPTIONS.map((shape) => {
        const selected = formData.shape === shape;
        return (
          <button
            key={shape}
            onClick={() => updateField('shape', shape)}
            style={{
              ...cardBase,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              padding: '16px 10px',
              border: selected ? `2px solid ${C.navy}` : `0.5px solid ${C.border}`,
              boxShadow: selected ? '0 4px 16px rgba(26,77,140,0.15)' : cardBase.boxShadow,
              transform: selected ? 'translateY(-2px)' : 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              if (!selected) { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,77,140,0.08)'; }
            }}
            onMouseLeave={e => {
              if (!selected) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = cardBase.boxShadow; }
            }}
          >
            <GemShapeSVG shape={shape} size={56} selected={selected} color={C.navy} />
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: selected ? C.navy : C.text, fontFamily: BODY }}>
              {shape}
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

/* ── Step 3: Carat Weight ────────────────────────────────────── */
const Step3Carat = ({ formData, updateField }) => {
  const carat = parseFloat(formData.caratWeight) || 0;

  return (
    <div>
      <StepHeader icon={Scale} label="Carat Weight" sub="Larger stones command exponentially higher prices per carat." />

      <div style={{ ...cardBase, padding: '28px 28px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 8,
            background: `rgba(26,77,140,0.06)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Scale size={24} color={C.navy} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: C.faint, fontFamily: BRAND, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              Weight
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="number"
                min="0.1"
                max="200"
                step="0.01"
                value={formData.caratWeight}
                onChange={e => updateField('caratWeight', e.target.value)}
                placeholder="0.00"
                style={{
                  width: 100, padding: '10px 14px', borderRadius: 6,
                  background: C.cream, border: `1.5px solid ${carat > 0 ? C.navy : C.border}`,
                  color: C.navy, fontSize: '1.3rem', fontWeight: 700, fontFamily: BODY,
                  outline: 'none', fontVariantNumeric: 'tabular-nums',
                }}
              />
              <span style={{ color: C.muted, fontWeight: 600, fontSize: '0.9rem', fontFamily: BODY }}>carats</span>
              {carat > 0 && (
                <span style={{
                  padding: '3px 10px', borderRadius: 99,
                  background: `rgba(196,137,42,0.12)`, border: `0.5px solid ${C.gold}40`,
                  fontSize: '0.7rem', fontWeight: 700, color: C.gold, fontFamily: BRAND,
                }}>
                  {carat < 0.5 ? 'MELEE' : carat < 1 ? 'SMALL' : carat < 3 ? 'STANDARD' : carat < 6 ? 'LARGE' : 'EXCEPTIONAL'}
                </span>
              )}
            </div>
          </div>
        </div>

        <input
          type="range" min="0.1" max="15" step="0.1"
          value={formData.caratWeight || 0}
          onChange={e => updateField('caratWeight', parseFloat(e.target.value).toFixed(2))}
          style={{ width: '100%', accentColor: C.navy, cursor: 'pointer', height: 4 }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: C.faint, fontWeight: 500, marginTop: 6, fontFamily: BODY }}>
          <span>0.1 ct</span>
          <span>7.5 ct</span>
          <span>15 ct</span>
        </div>

        {/* Visual size reference */}
        {carat > 0 && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `0.5px dashed ${C.border}` }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: C.faint, fontFamily: BRAND, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
              Visual Size Reference
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 20, height: 70 }}>
              {[
                { w: 8, label: '0.25', active: carat >= 0.1 && carat < 0.5 },
                { w: 14, label: '0.5', active: carat >= 0.5 && carat < 1 },
                { w: 20, label: '1', active: carat >= 1 && carat < 2 },
                { w: 28, label: '2', active: carat >= 2 && carat < 4 },
                { w: 38, label: '4', active: carat >= 4 && carat < 8 },
                { w: 50, label: '8+', active: carat >= 8 },
              ].map(({ w, label, active }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: w, height: w, borderRadius: '50%',
                    background: active ? C.navy : 'rgba(26,77,140,0.08)',
                    border: active ? `2px solid ${C.navy}` : `1px solid ${C.border}`,
                    boxShadow: active ? '0 0 12px rgba(26,77,140,0.3)' : 'none',
                    transition: 'all 0.3s',
                  }} />
                  <span style={{ fontSize: '0.58rem', fontWeight: 700, color: active ? C.navy : C.faint, fontFamily: BODY }}>{label}ct</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Step 4: Dimensions ──────────────────────────────────────── */
const Step4Dimensions = ({ formData, updateField }) => {
  const x = parseFloat(formData.x) || 0;
  const y = parseFloat(formData.y) || 0;
  const z = parseFloat(formData.z) || 0;
  const meanWidth = (x + y) / 2;
  const depthRatio = meanWidth > 0 ? z / meanWidth : 0;

  return (
    <div>
      <StepHeader icon={Scale} label="Gem Dimensions" sub="Physical size drives value alongside carat weight." />

      <div style={{ ...cardBase, padding: '28px 28px', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
          {[
            { key: 'x', label: 'Length (X)', icon: '📏' },
            { key: 'y', label: 'Width (Y)', icon: '↔️' },
            { key: 'z', label: 'Depth (Z)', icon: '↕️' },
          ].map(({ key, label, icon }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: C.faint, fontFamily: BRAND, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                {icon} {label}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={formData[key]}
                  onChange={e => updateField(key, e.target.value)}
                  placeholder="0.0"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 6,
                    background: C.cream, border: `1.5px solid ${formData[key] ? C.navy : C.border}`,
                    color: C.navy, fontSize: '1.1rem', fontWeight: 700, fontFamily: BODY,
                    outline: 'none', fontVariantNumeric: 'tabular-nums',
                  }}
                />
                <span style={{ color: C.muted, fontWeight: 600, fontSize: '0.85rem', fontFamily: BODY }}>mm</span>
              </div>
            </div>
          ))}
        </div>

        {x > 0 && y > 0 && z > 0 && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 16, borderTop: `0.5px dashed ${C.border}` }}>
            <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(26,77,140,0.06)', border: `0.5px solid ${C.border}` }}>
              <span style={{ fontSize: '0.65rem', color: C.faint, fontFamily: BRAND, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Mean Width</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: C.navy, fontFamily: BODY }}>{meanWidth.toFixed(2)} mm</div>
            </div>
            <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(196,137,42,0.06)', border: `0.5px solid ${C.border}` }}>
              <span style={{ fontSize: '0.65rem', color: C.faint, fontFamily: BRAND, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Depth Ratio</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: C.gold, fontFamily: BODY }}>{depthRatio.toFixed(2)}</div>
            </div>
            <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(22,163,74,0.06)', border: `0.5px solid ${C.border}` }}>
              <span style={{ fontSize: '0.65rem', color: C.faint, fontFamily: BRAND, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Volume Hint</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: C.green, fontFamily: BODY }}>≈ {(x * y * z / 1000).toFixed(2)} mm³</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Step 5: Quality ─────────────────────────────────────────── */
const Step5Quality = ({ formData, updateField }) => {
  const gem = GEM_FAMILIES.find(g => g.value === formData.gemFamily);
  const availableColors = gem?.colors || [];

  return (
    <div>
      <StepHeader icon={Eye} label="Quality Grading" sub="Clarity, color, and treatment are the biggest quality price drivers." />

      {/* Clarity */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: C.faint, fontFamily: BRAND, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          <Eye size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Clarity Grade
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {CLARITY_OPTIONS.map((clarity) => (
            <ClarityIllustration
              key={clarity}
              clarity={clarity}
              selected={formData.clarity === clarity}
              onClick={() => updateField('clarity', clarity)}
              size={80}
            />
          ))}
        </div>
      </div>

      {/* Color — filtered by gem type */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: C.faint, fontFamily: BRAND, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          <Palette size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Color
          {gem && (
            <span style={{ color: C.muted, fontWeight: 500, marginLeft: 8, fontSize: '0.65rem', textTransform: 'none', letterSpacing: 0, fontFamily: BODY }}>
              (available for {gem.name})
            </span>
          )}
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {availableColors.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              selected={formData.color === color}
              onClick={() => updateField('color', color)}
              size={58}
            />
          ))}
        </div>
        {gem && (
          <p style={{ margin: '8px 0 0', fontSize: '0.72rem', color: C.faint, fontFamily: BODY }}>
            {gem.name} naturally occurs in {availableColors.length} color{availableColors.length > 1 ? 's' : ''} in our dataset.
          </p>
        )}
      </div>

      {/* Treatment */}
      <div>
        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: C.faint, fontFamily: BRAND, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          <FlaskConical size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Treatment
          <span style={{ color: C.muted, fontWeight: 500, marginLeft: 8, fontSize: '0.65rem', textTransform: 'none', letterSpacing: 0, fontFamily: BODY }}>
            Untreated commands highest premium
          </span>
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TREATMENT_OPTIONS.map(({ value, label, impact }) => {
            const selected = formData.treatment === value;
            const impactColor = impact === 'positive' ? C.green : impact === 'negative' ? C.red : C.muted;
            return (
              <button
                key={value}
                onClick={() => updateField('treatment', value)}
                style={{
                  padding: '8px 16px', borderRadius: 6,
                  fontSize: '0.8rem', fontWeight: 600, fontFamily: BODY,
                  cursor: 'pointer', transition: 'all 0.18s',
                  border: selected ? `1.5px solid ${impactColor}` : `0.5px solid ${C.border}`,
                  background: selected
                    ? (impact === 'positive' ? 'rgba(22,163,74,0.08)' : impact === 'negative' ? 'rgba(185,28,28,0.08)' : 'rgba(26,77,140,0.06)')
                    : C.white,
                  color: selected ? impactColor : C.text,
                  boxShadow: selected ? `0 2px 8px ${impactColor}22` : 'none',
                }}
                onMouseEnter={e => {
                  if (!selected) { e.currentTarget.style.borderColor = C.borderHover; }
                }}
                onMouseLeave={e => {
                  if (!selected) { e.currentTarget.style.borderColor = C.border; }
                }}
              >
                {label}
                {selected && <span style={{ marginLeft: 6, fontSize: '0.7rem' }}>✓</span>}
              </button>
            );
          })}
        </div>
        {formData.treatment && formData.treatment !== 'Untreated' && (
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 6,
            background: 'rgba(185,28,28,0.04)', border: `0.5px solid rgba(185,28,28,0.15)`,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <Info size={13} style={{ color: C.red, flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: '0.75rem', color: C.red, lineHeight: 1.5, fontFamily: BODY }}>
              Treated stones typically carry a 15–35% price reduction vs. untreated equivalents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Step 5: Result ──────────────────────────────────────────── */
const ResultScreen = ({ result, formData, onReset, onListAsDirectSale, onListAsAuction, onShare, shareMsg, userRole }) => {
  const gem = GEM_FAMILIES.find(g => g.value === formData.gemFamily);

  return (
    <div>
      {/* Price hero */}
      <div style={{
        ...cardBase,
        padding: '32px 28px', textAlign: 'center', marginBottom: 24,
        background: `linear-gradient(180deg, ${C.white} 0%, rgba(26,77,140,0.03) 100%)`,
        border: `1.5px solid ${C.gold}40`,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14,
          padding: '4px 12px', borderRadius: 99,
          background: 'rgba(196,137,42,0.08)', border: `0.5px solid ${C.gold}50`,
          fontSize: '0.68rem', fontWeight: 700, color: C.gold, fontFamily: BRAND, letterSpacing: '0.08em',
        }}>
          <TrendingUp size={10} /> AI PREDICTED MARKET VALUE
        </div>

        <div style={{
          fontSize: 'clamp(2.4rem, 6vw, 3.8rem)', fontWeight: 600,
          color: C.navy, fontFamily: DISPLAY, letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums', lineHeight: 1, marginBottom: 10,
        }}>
          {formatLKR(result?.predictedPrice)}
        </div>

        <div style={{ color: C.muted, fontSize: '0.85rem', fontWeight: 500, marginBottom: 18, fontFamily: BODY }}>
          Expected range (±1 SD):&nbsp;
          <span style={{ color: C.navy, fontWeight: 700 }}>
            {formatLKR(result?.confidenceLow)} – {formatLKR(result?.confidenceHigh)}
          </span>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '3px 10px', borderRadius: 99,
          background: 'rgba(22,163,74,0.08)', border: '0.5px solid rgba(22,163,74,0.25)',
          fontSize: '0.68rem', fontWeight: 700, color: C.green, fontFamily: BODY,
        }}>
          ✓ Typical error: ±16% (tested on 4,400 real gems)
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginTop: 20 }}>
          {[
            { label: 'Gem', value: `${gem?.emoji || ''} ${gem?.name || formData.gemFamily}` },
            { label: 'Carat', value: `${formData.caratWeight} ct` },
            { label: 'Shape', value: formData.shape || '—' },
            { label: 'Size', value: formData.x ? `${formData.x}×${formData.y}×${formData.z}mm` : '—' },
            { label: 'Model', value: result?.modelUsed || 'ML' },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center', minWidth: 70 }}>
              <div style={{ fontSize: '0.6rem', color: C.faint, fontWeight: 700, fontFamily: BRAND, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: '0.85rem', color: C.text, fontWeight: 700, fontFamily: BODY }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SHAP explanation */}
      <div style={{ ...cardBase, padding: '24px 24px', marginBottom: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: C.faint, fontFamily: BRAND, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
            🧠 AI Explanation (SHAP Values)
          </div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: C.navy, fontFamily: DISPLAY }}>
            Why this price?
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: C.muted, lineHeight: 1.5, fontFamily: BODY }}>
            Each factor's contribution to the predicted price, ranked by impact.
          </p>
          {result?.explanation && (
            <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: C.text, lineHeight: 1.5, fontFamily: BODY, fontStyle: 'italic', padding: '10px 14px', borderRadius: 6, background: 'rgba(26,77,140,0.04)', border: `0.5px solid ${C.border}` }}>
              {result.explanation}
            </p>
          )}
        </div>
        <SHAPWaterfallChart shapValues={result?.shapValues || []} maxBarWidth={260} />
      </div>

      {/* Disclaimer */}
      <div style={{
        padding: '12px 16px', borderRadius: 6,
        background: 'rgba(26,77,140,0.03)', border: `0.5px solid ${C.border}`,
        display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 24,
      }}>
        <Info size={13} style={{ color: C.faint, flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: '0.72rem', color: C.faint, lineHeight: 1.6, fontFamily: BODY }}>
          <strong style={{ color: C.muted }}>Model note:</strong> {result?.modelUsed || 'ML'} trained on 21,998 real gem transactions.
          The expected range is ±1 standard deviation (~68% of predictions fall within this band).
          Typical error = ±{Math.round((Math.exp(0.227) - 1) * 100)}% MAPE. For reference only — not a substitute for professional appraisal.
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          onClick={onReset}
          style={{
            flex: 1, minWidth: 150,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '12px 20px', borderRadius: 6,
            background: C.white, border: `0.5px solid ${C.border}`,
            color: C.muted, fontSize: '0.85rem', fontWeight: 600, fontFamily: BODY,
            cursor: 'pointer', transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = C.navy; e.currentTarget.style.borderColor = C.navy; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
        >
          <RotateCcw size={14} /> Predict Another
        </button>

        <button
          onClick={onShare}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '12px 18px', borderRadius: 6,
            background: C.white, border: `0.5px solid ${C.border}`,
            color: shareMsg ? C.green : C.muted, fontSize: '0.85rem', fontWeight: 600, fontFamily: BODY,
            cursor: 'pointer', transition: 'all 0.18s', minWidth: 120,
          }}
          onMouseEnter={e => { if (!shareMsg) { e.currentTarget.style.color = C.navy; e.currentTarget.style.borderColor = C.navy; } }}
          onMouseLeave={e => { if (!shareMsg) { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; } }}
        >
          <Share2 size={14} /> {shareMsg || 'Share Link'}
        </button>

        {(userRole === 'seller' || userRole === 'admin') && (
          <div style={{ display: 'flex', gap: 10, flex: 2, minWidth: 180 }}>
            <button
              onClick={onListAsDirectSale}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '12px 16px', borderRadius: 6,
                background: C.navy, border: 'none', color: C.white,
                fontSize: '0.85rem', fontWeight: 700, fontFamily: BRAND,
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(26,77,140,0.25)',
                letterSpacing: '0.03em',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.navyDark; e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,77,140,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.navy; e.currentTarget.style.boxShadow = '0 4px 14px rgba(26,77,140,0.25)'; }}
            >
              <ShoppingBag size={14} /> Direct Sale
            </button>
            <button
              onClick={onListAsAuction}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '12px 16px', borderRadius: 6,
                background: C.gold, border: 'none', color: C.white,
                fontSize: '0.85rem', fontWeight: 700, fontFamily: BRAND,
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(196,137,42,0.25)',
                letterSpacing: '0.03em',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#a87220'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(196,137,42,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.gold; e.currentTarget.style.boxShadow = '0 4px 14px rgba(196,137,42,0.25)'; }}
            >
              <Gavel size={14} /> Auction
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
const AIPredictorPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialParams = useMemo(() => {
    const p = {};
    const keys = ['gemFamily', 'shape', 'caratWeight', 'x', 'y', 'z', 'clarity', 'color', 'treatment'];
    keys.forEach(k => { const v = searchParams.get(k); if (v) p[k] = v; });
    return p;
  }, []);

  const { user } = useAuth();
  const userRole = user?.role || 'buyer';

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

  const { rates } = useCurrency();

  const buildAIPrefill = (listingType) => ({
    gem_type: formData.gemFamily
      ? formData.gemFamily.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : '',
    carat_weight: formData.caratWeight ? String(formData.caratWeight) : '',
    cut: formData.shape || '',
    clarity: formData.clarity || '',
    color: formData.color || '',
    treatment: formData.treatment || '',
    x: formData.x ? String(formData.x) : '',
    y: formData.y ? String(formData.y) : '',
    z: formData.z ? String(formData.z) : '',
    listing_type: listingType,
    // predictedPrice is in LKR; buy_now_price is stored as USD in DB
    buy_now_price: listingType === 'direct_sell' && result?.predictedPrice
      ? String(Math.round(lkrToUsd(result.predictedPrice, rates)))
      : '',
    predicted_price: result?.predictedPrice ? String(Math.round(result.predictedPrice)) : '',
  });

  const handleListAsDirectSale = () => {
    navigate('/gems/new', { state: { aiPrefill: buildAIPrefill('direct_sell') } });
  };

  const handleListAsAuction = () => {
    navigate('/gems/new', { state: { aiPrefill: buildAIPrefill('auction') } });
  };

  const isLanding = step === 0;

  return (
    <div style={{ minHeight: '100vh', background: C.parchment, fontFamily: BODY, color: C.text }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28,
            background: 'transparent', border: 'none', color: C.muted,
            fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s',
            padding: 0, fontFamily: BODY,
          }}
          onMouseEnter={e => e.currentTarget.style.color = C.navy}
          onMouseLeave={e => e.currentTarget.style.color = C.muted}
        >
          <ChevronLeft size={15} /> Back
        </button>

        {/* Progress */}
        {step >= 1 && step <= 5 && (
          <StepDots step={step} total={TOTAL_STEPS} />
        )}

        {/* Main card */}
        <div style={{
          ...cardBase,
          padding: isLanding ? '12px' : '32px 32px',
          boxShadow: '0 8px 32px rgba(26,77,140,0.06)',
        }}>
          {step === 0 && <LandingScreen onStart={handleStart} />}
          {step === 1 && <Step1GemFamily formData={formData} updateField={updateField} />}
          {step === 2 && <Step2Shape formData={formData} updateField={updateField} />}
          {step === 3 && <Step3Carat formData={formData} updateField={updateField} />}
          {step === 4 && <Step4Dimensions formData={formData} updateField={updateField} />}
          {step === 5 && <Step5Quality formData={formData} updateField={updateField} />}
          {step === 6 && (
            <ResultScreen
              result={result}
              formData={formData}
              onReset={handleReset}
              onListAsDirectSale={handleListAsDirectSale}
              onListAsAuction={handleListAsAuction}
              onShare={handleShare}
              shareMsg={shareMsg}
              userRole={userRole}
            />
          )}

          {error && (
            <div style={{
              marginTop: 14, padding: '10px 14px', borderRadius: 6,
              background: 'rgba(185,28,28,0.05)', border: '0.5px solid rgba(185,28,28,0.2)',
              color: C.red, fontSize: '0.82rem', fontWeight: 500, fontFamily: BODY,
            }}>
              ⚠ {error}
            </div>
          )}

          {step >= 1 && step <= 5 && (
            <NavRow
              onBack={handleBack}
              onNext={handleNext}
              onPredict={handlePredict}
              isLoading={isLoading}
              isValid={isStepValid()}
              showPredict={step === 5}
              showBack={step > 1}
            />
          )}
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(240,237,232,0.85)', backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 16,
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: '50%',
              border: `2.5px solid ${C.border}`,
              borderTopColor: C.navy,
              animation: 'spin 0.8s linear infinite',
            }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: C.navy, fontFamily: BRAND, marginBottom: 4 }}>
                Predicting price…
              </div>
              <div style={{ fontSize: '0.78rem', color: C.muted, fontFamily: BODY }}>
                Running {result?.modelUsed || 'ML'} model + SHAP analysis
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AIPredictorPage;
