/**
 * StepStoneDetails.jsx — Step 1: gemstone physical characteristics
 * Supports readOnly mode for AI quick-list flow
 */
import { Controller } from 'react-hook-form';
import { T, SERIF, DISPLAY, BODY, inputBase, labelStyle, focusRing } from '../formTokens';
import Select from '../Select';
import FieldError from '../FieldError';
import { COLOR_HEX_MAP } from '../../../AI/components/ColorSwatch';

const GEM_TYPES = [
    'Amethyst', 'Citrine', 'Pyrope Garnet',
    'Ruby', 'Sapphire', 'Spinel', 'Topaz', 'Tourmaline',
];

// Colors per gem type — aligned to ML dataset / AI predictor
const GEM_TYPE_COLORS = {
    'Amethyst':      ['Iris', 'Pink', 'Violet'],
    'Citrine':       ['Brown', 'Gold', 'Orange', 'Orange-Gold', 'Yellow'],
    'Pyrope Garnet': ['Blood Red', 'Red', 'Rose', 'Wine Red'],
    'Ruby':          ['Pink', 'Pinkish Red', 'Purple', 'Red', 'Wine'],
    'Sapphire':      ['Blue', 'Gold', 'Green', 'Multicolor', 'Orange', 'Pink', 'Purple', 'Red', 'White', 'Yellow'],
    'Spinel':        ['Black', 'Lavender', 'Magenta'],
    'Topaz':         ['Blue', 'White'],
    'Tourmaline':    ['Black', 'Green', 'Multicolor', 'Pink', 'Red'],
};

const CLARITY_OPTIONS = [
    'I1 (Included 1)',
    'SI1 (Slightly Included 1)',
    'SI2 (Slightly Included 2)',
    'VS (Eye Clean 2)',
    'VVS (Eye Clean 1)',
];
const CUT_OPTIONS = [
    'Cushion', 'Fancy', 'Heart', 'Marquise', 'Octagon',
    'Other', 'Oval', 'Pear', 'Round', 'Trillion',
];
const TREATMENT_OPTIONS = [
    'Be Heated', 'Fracture Filled', 'Heated', 'Irradiated', 'Untreated',
];

/* ════════════════════════════════════════════════════════════════════════════
   READ-ONLY SUMMARY CARD (for AI quick-list mode)
════════════════════════════════════════════════════════════════════════════ */
const StoneSummaryCard = ({ watch, onEdit }) => {
    const gemType = watch('gem_type');
    const carat = watch('carat_weight');
    const color = watch('color');
    const cut = watch('cut');
    const clarity = watch('clarity');
    const treatment = watch('treatment');

    const specs = [
        gemType && { label: 'Gem', value: gemType, icon: '💎' },
        carat && { label: 'Carat', value: `${carat} ct`, icon: '⚖️' },
        color && { label: 'Color', value: color, icon: '🎨' },
        cut && { label: 'Cut', value: cut, icon: '💠' },
        clarity && { label: 'Clarity', value: clarity, icon: '👁️' },
        treatment && { label: 'Treatment', value: treatment, icon: '🔬' },
    ].filter(Boolean);

    return (
        <div style={{
            background: 'rgba(26,77,140,0.04)',
            border: `0.5px solid ${T.border}`,
            borderRadius: 12,
            padding: '20px 24px',
            marginBottom: 28,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.1rem' }}>💎</span>
                    <span style={{
                        fontFamily: DISPLAY, fontSize: '0.72rem', fontWeight: 700,
                        letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted,
                    }}>
                        Stone Details (from AI Prediction)
                    </span>
                </div>
                {onEdit && (
                    <button
                        type="button"
                        onClick={onEdit}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontFamily: BODY, fontSize: '0.75rem', color: T.sapphire,
                            fontWeight: 600, textDecoration: 'underline',
                        }}
                    >
                        Edit
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
                {specs.map((s) => (
                    <div key={s.label} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', borderRadius: 8,
                        background: T.white, border: `0.5px solid ${T.border}`,
                    }}>
                        <span style={{ fontSize: '0.85rem' }}>{s.icon}</span>
                        <span style={{
                            fontFamily: BODY, fontSize: '0.8rem', fontWeight: 600, color: T.text,
                        }}>
                            {s.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════════════════════════════════════
   EDITABLE FORM
════════════════════════════════════════════════════════════════════════════ */
const StepStoneDetails = ({ register, control, errors, watch, setValue, autoTitle, categories = [], readOnly = false, onEdit }) => {
    const gemType = watch('gem_type');
    const selectedColor = watch('color');

    // Build category options from nested data
    const categoryOptions = categories.flatMap(cat => {
        if (cat.children?.length) {
            return cat.children.map(c => ({ value: c.name, label: c.name }));
        }
        return [{ value: cat.name, label: cat.name }];
    });
    // Fall back to GEM_TYPES if categories not loaded
    const gemOptions = categoryOptions.length > 0 ? categoryOptions : GEM_TYPES.map(g => ({ value: g, label: g }));

    // Get available colors for selected gem type
    const colorOptions = gemType && GEM_TYPE_COLORS[gemType]
        ? GEM_TYPE_COLORS[gemType].map(c => ({ value: c, label: c }))
        : [];

    // Reset color if current color is not valid for new gem type
    const handleGemTypeChange = (value) => {
        setValue('gem_type', value);
        const validColors = GEM_TYPE_COLORS[value] || [];
        if (selectedColor && !validColors.includes(selectedColor)) {
            setValue('color', '');
        }
        setTimeout(autoTitle, 0);
    };

    // Read-only mode: just show summary card
    if (readOnly) {
        return (
            <div>
                <div style={{ borderLeft: `3px solid ${T.sapphire}`, paddingLeft: 24, marginBottom: 32 }}>
                    <h2 style={{ margin: '0 0 4px', fontFamily: SERIF, fontSize: '1.6rem', fontWeight: 700, color: T.text }}>Listing Details</h2>
                    <p style={{ margin: 0, fontFamily: BODY, fontSize: '0.85rem', color: T.muted }}>Add photos, certification, and description. Stone specs are locked from AI prediction.</p>
                </div>
                <StoneSummaryCard watch={watch} onEdit={onEdit} />
            </div>
        );
    }

    return (
        <div>
            <div style={{ borderLeft: `3px solid ${T.sapphire}`, paddingLeft: 24, marginBottom: 32 }}>
                <h2 style={{ margin: '0 0 4px', fontFamily: SERIF, fontSize: '1.6rem', fontWeight: 700, color: T.text }}>Stone Details</h2>
                <p style={{ margin: 0, fontFamily: BODY, fontSize: '0.85rem', color: T.muted }}>Describe the gemstone&apos;s physical characteristics.</p>
            </div>

            {/* Gem Type */}
            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Gem Type *</label>
                <Controller name="gem_type" control={control} render={({ field }) => (
                    <Select value={field.value} onChange={(v) => { handleGemTypeChange(v); field.onBlur(); }}
                        options={gemOptions} placeholder="Select gem type" error={errors.gem_type}
                        onFocus={field.onBlur} onBlur={field.onBlur} />
                )} />
                <FieldError message={errors.gem_type?.message} />
            </div>

            {/* Title */}
            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Title *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input {...register('title')} placeholder="e.g. 2.5ct Vivid Royal Blue Sapphire"
                        style={{ ...inputBase, flex: 1, borderColor: errors.title ? T.error : T.border }}
                        onFocus={e => { e.target.style.borderColor = T.borderFocus; Object.assign(e.target.style, focusRing); }}
                        onBlur={e => { e.target.style.borderColor = errors.title ? T.error : T.border; e.target.style.boxShadow = 'none'; }}
                    />
                    <button type="button" onClick={autoTitle} title="Auto-generate title"
                        style={{ padding: '8px 14px', background: T.sapphireBg, border: `0.5px solid ${T.border}`, borderRadius: 8, cursor: 'pointer', color: T.sapphire, fontFamily: BODY, fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        Auto
                    </button>
                </div>
                <FieldError message={errors.title?.message} />
            </div>

            {/* Two-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Carat Weight */}
                <div>
                    <label style={labelStyle}>Carat Weight *</label>
                    <input {...register('carat_weight')} type="number" step="0.01" min="0.01" max="999.99"
                        placeholder="e.g. 2.50"
                        onChange={(e) => { register('carat_weight').onChange(e); setTimeout(autoTitle, 0); }}
                        style={{ ...inputBase, borderColor: errors.carat_weight ? T.error : T.border }}
                        onFocus={e => { e.target.style.borderColor = T.borderFocus; Object.assign(e.target.style, focusRing); }}
                        onBlur={e => { register('carat_weight').onBlur(e); e.target.style.borderColor = errors.carat_weight ? T.error : T.border; e.target.style.boxShadow = 'none'; }}
                    />
                    <FieldError message={errors.carat_weight?.message} />
                </div>

                {/* Color — dropdown based on gem type */}
                <div>
                    <label style={labelStyle}>Color</label>
                    <Controller name="color" control={control} render={({ field }) => (
                        <Select
                            value={field.value}
                            onChange={(v) => { field.onChange(v); setTimeout(autoTitle, 0); }}
                            options={colorOptions}
                            placeholder={gemType ? 'Select color' : 'Choose gem type first'}
                            disabled={!gemType}
                        />
                    )} />
                    {selectedColor && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                            <div style={{
                                width: 14, height: 14, borderRadius: 4,
                                border: `1px solid ${T.border}`,
                                background: COLOR_HEX_MAP[selectedColor] || T.sapphire,
                            }} />
                            <span style={{ fontSize: '0.75rem', color: T.muted, fontFamily: BODY }}>{selectedColor}</span>
                        </div>
                    )}
                </div>

                {/* Clarity */}
                <div>
                    <label style={labelStyle}>Clarity Grade</label>
                    <Controller name="clarity" control={control} render={({ field }) => (
                        <Select value={field.value} onChange={field.onChange} options={CLARITY_OPTIONS} placeholder="Select clarity" />
                    )} />
                </div>

                {/* Cut */}
                <div>
                    <label style={labelStyle}>Cut / Shape</label>
                    <Controller name="cut" control={control} render={({ field }) => (
                        <Select value={field.value} onChange={field.onChange} options={CUT_OPTIONS} placeholder="Select cut" />
                    )} />
                </div>

                {/* Treatment */}
                <div>
                    <label style={labelStyle}>Treatment</label>
                    <Controller name="treatment" control={control} render={({ field }) => (
                        <Select value={field.value} onChange={field.onChange} options={TREATMENT_OPTIONS} placeholder="Select treatment" />
                    )} />
                </div>
            </div>
        </div>
    );
};

export default StepStoneDetails;
