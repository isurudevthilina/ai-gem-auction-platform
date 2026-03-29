/**
 * StepStoneDetails.jsx — Step 1: gemstone physical characteristics
 */
import { Controller } from 'react-hook-form';
import { T, SERIF, DISPLAY, BODY, inputBase, labelStyle, focusRing } from '../formTokens';
import Select from '../Select';
import FieldError from '../FieldError';

const GEM_TYPES = [
    'Blue Sapphire','Pink Sapphire','Yellow Sapphire','White Sapphire','Padparadscha Sapphire',
    'Ruby','Alexandrite','Spinel (Red)','Spinel (Blue)','Spinel (Pink)',
    'Emerald','Aquamarine',
    'Tourmaline (Rubellite)','Tourmaline (Paraiba)','Tourmaline (Green)','Tourmaline (Watermelon)',
    'Chrysoberyl','Tsavorite Garnet','Rhodolite Garnet','Hessonite Garnet','Demantoid Garnet','Alexandrite Garnet',
    'Tanzanite','Amethyst','Citrine','Peridot','Topaz (Imperial)','Topaz (Blue)',
    'Moonstone','Labradorite','Andalusite','Kornerupine','Zircon','Iolite','Sphene (Titanite)',
    'Star Sapphire','Star Ruby','Cats Eye Chrysoberyl',
];
const CLARITY_OPTIONS = ['Eye Clean','Slightly Included (SI)','Moderately Included (MI)','Heavily Included (HI)','Opaque'];
const CUT_OPTIONS = ['Round','Oval','Cushion','Pear','Emerald Cut','Marquise','Princess','Radiant','Cabochon','Heart','Trillion','Baguette','Asscher','Mixed Cut'];
const TREATMENT_OPTIONS = ['Unheated (No Treatment)','Heat Treated','Beryllium Treated','Fracture Filled','Oiled','Irradiated','Diffusion','Coated'];
const ORIGIN_OPTIONS = ['Sri Lanka (Ceylon)','Burma (Myanmar)','Madagascar','Thailand','Colombia','Brazil','Zambia','Tanzania','India','Afghanistan','Australia','Other'];

const StepStoneDetails = ({ register, control, errors, watch, autoTitle, categories = [] }) => {
    // Build category options from nested data
    const categoryOptions = categories.flatMap(cat => {
        if (cat.children?.length) {
            return cat.children.map(c => ({ value: c.name, label: c.name }));
        }
        return [{ value: cat.name, label: cat.name }];
    });
    // Fall back to GEM_TYPES if categories not loaded
    const gemOptions = categoryOptions.length > 0 ? categoryOptions : GEM_TYPES.map(g => ({ value: g, label: g }));

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
                    <Select value={field.value} onChange={(v) => { field.onChange(v); setTimeout(autoTitle, 0); }}
                        options={gemOptions} placeholder="Select gem type" error={errors.gem_type}
                        onFocus={field.onBlur} onBlur={field.onBlur} />
                )} />
                <FieldError message={errors.gem_type?.message} />
            </div>

            {/* Title */}
            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Title *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input {...register('title')} placeholder="e.g. 2.5ct Vivid Royal Blue Sapphire from Sri Lanka"
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

                {/* Color */}
                <div>
                    <label style={labelStyle}>Color</label>
                    <input {...register('color')} placeholder="e.g. Vivid Royal Blue"
                        onChange={(e) => { register('color').onChange(e); setTimeout(autoTitle, 0); }}
                        style={{ ...inputBase }}
                        onFocus={e => { e.target.style.borderColor = T.borderFocus; Object.assign(e.target.style, focusRing); }}
                        onBlur={e => { register('color').onBlur(e); e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
                    />
                    {watch('color') && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                            <div style={{ width: 14, height: 14, borderRadius: 4, border: `1px solid ${T.border}`, background: T.sapphire }} />
                            <span style={{ fontSize: '0.75rem', color: T.muted, fontFamily: BODY }}>{watch('color')}</span>
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

                {/* Origin */}
                <div>
                    <label style={labelStyle}>Origin / Source</label>
                    <Controller name="origin" control={control} render={({ field }) => (
                        <Select value={field.value} onChange={(v) => { field.onChange(v); setTimeout(autoTitle, 0); }}
                            options={ORIGIN_OPTIONS} placeholder="Select origin" />
                    )} />
                </div>
            </div>
        </div>
    );
};

export default StepStoneDetails;
