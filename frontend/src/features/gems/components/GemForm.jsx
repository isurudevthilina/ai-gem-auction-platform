/**
 * GemForm.jsx — 3-step gem creation wizard
 * Step 1: Stone Details
 * Step 2: Listing Details (description, certification, images, listing type)
 * Step 3: Review & Submit
 */
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { T, DISPLAY, BODY } from './formTokens';
import StepStoneDetails from './steps/StepStoneDetails';
import StepListingDetails from './steps/StepListingDetails';
import StepReview from './steps/StepReview';

const DRAFT_KEY = 'gembid_gem_draft';

/* ─── Zod schemas ─── */
const step1Schema = z.object({
    gem_type:     z.string().min(1, 'Gem type is required.'),
    title:        z.string().min(3, 'Title must be at least 3 characters.').max(200),
    carat_weight: z.string().refine(v => { const n = parseFloat(v); return !isNaN(n) && n >= 0.01 && n <= 999.99; }, 'Enter a valid carat weight (0.01–999.99).'),
    color:        z.string().optional(),
    clarity:      z.string().optional(),
    cut:          z.string().optional(),
    treatment:    z.string().optional(),
    origin:       z.string().optional(),
});
const step2Base = z.object({
    description:   z.string().min(50, 'Description must be at least 50 characters.').max(5000).optional().or(z.literal('')),
    certification: z.string().max(60).optional(),
    listing_type:  z.enum(['direct_sell', 'auction']),
    buy_now_price: z.string().optional(),
});
const buyNowRefine = (d) => {
    if (d.listing_type === 'direct_sell') {
        const n = parseFloat(d.buy_now_price);
        return !isNaN(n) && n >= 1;
    }
    return true;
};
const buyNowRefineOpts = { message: 'Buy Now price is required for direct sale (min $1).', path: ['buy_now_price'] };
const step2Schema = step2Base.refine(buyNowRefine, buyNowRefineOpts);
const fullSchema = step1Schema.merge(step2Base).refine(buyNowRefine, buyNowRefineOpts);

/* ─── Step Indicator ─── */
const STEPS = ['Stone Details', 'Listing Details', 'Review & Submit'];
const StepIndicator = ({ current }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
        {STEPS.map((label, i) => {
            const step = i + 1;
            const done = current > step;
            const active = current === step;
            return (
                <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: DISPLAY, fontSize: '0.78rem', fontWeight: 700,
                            background: done ? T.gold : active ? T.sapphire : 'transparent',
                            color: done || active ? '#fff' : T.faint,
                            border: done ? `2px solid ${T.gold}` : active ? `2px solid ${T.sapphire}` : `2px solid ${T.border}`,
                            transition: 'all 0.3s',
                        }}>
                            {done ? <Check size={16} /> : step}
                        </div>
                        <span style={{
                            fontFamily: BODY, fontSize: '0.72rem', fontWeight: 600,
                            color: active ? T.sapphire : done ? T.gold : T.faint,
                            letterSpacing: '0.02em', whiteSpace: 'nowrap',
                        }}>{label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div style={{
                            width: 80, height: 2, margin: '0 12px',
                            marginBottom: 24,
                            background: current > step + 1 || done ? T.gold : current > step ? T.sapphire : T.border,
                            borderRadius: 99, transition: 'background 0.3s',
                        }} />
                    )}
                </div>
            );
        })}
    </div>
);

/* ════════════════════════════════════════════════════════════════════════════
   GEM FORM COMPONENT
════════════════════════════════════════════════════════════════════════════ */
const GemForm = ({ categories = [], onSubmit, isSubmitting = false, initialValues = null, isEditing = false }) => {
    const [step, setStep] = useState(1);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState(() => {
        // For editing, pre-fill previews from existing images
        if (initialValues?.images?.length) {
            return initialValues.images.filter(u => typeof u === 'string' && !u.startsWith('model:'));
        }
        return [];
    });

    // Load draft from localStorage (skip when editing)
    const savedDraft = (() => {
        if (isEditing) return {};
        try { return JSON.parse(localStorage.getItem(DRAFT_KEY)) || {}; } catch { return {}; }
    })();

    const defaults = {
        gem_type: '', title: '', carat_weight: '', color: '', clarity: '',
        cut: '', treatment: '', origin: '', description: '',
        certification: '', listing_type: 'direct_sell',
        buy_now_price: '', ...savedDraft,
    };

    // When editing, override defaults with initialValues
    if (initialValues) {
        Object.entries(initialValues).forEach(([k, v]) => {
            if (v !== null && v !== undefined && k in defaults) defaults[k] = String(v);
        });
    }

    const { register, handleSubmit, control, watch, setValue, trigger, formState: { errors }, getValues } = useForm({
        resolver: zodResolver(fullSchema),
        defaultValues: defaults,
        mode: 'onTouched',
    });

    const listingType = watch('listing_type');

    // Auto-save draft on step change (skip when editing)
    useEffect(() => {
        if (!isEditing) localStorage.setItem(DRAFT_KEY, JSON.stringify(getValues()));
    }, [step]);

    // Auto-suggest title
    const autoTitle = useCallback(() => {
        const v = getValues();
        if (v.carat_weight && v.gem_type) {
            const parts = [v.carat_weight ? `${v.carat_weight}ct` : '', v.color, v.gem_type, v.origin ? `from ${v.origin}` : ''].filter(Boolean);
            setValue('title', parts.join(' '), { shouldValidate: true });
        }
    }, [getValues, setValue]);

    // Step navigation with validation
    const goNext = async () => {
        let fields;
        if (step === 1) fields = ['gem_type', 'title', 'carat_weight', 'color', 'clarity', 'cut', 'treatment', 'origin'];
        else if (step === 2) fields = ['description', 'certification', 'listing_type', 'buy_now_price'];
        const valid = await trigger(fields);
        if (valid) setStep(s => Math.min(s + 1, 3));
    };

    const goBack = () => setStep(s => Math.max(s - 1, 1));

    const handleFinalSubmit = (mode = 'draft') => {
        const values = getValues();
        const cat = categories.find(c => c.name === values.gem_type)
            || categories.flatMap(c => c.children || []).find(c => c.name === values.gem_type);
        onSubmit({
            ...values,
            category_id: cat?.id || null,
            imageFiles,
            existingImages: isEditing ? initialValues?.images || [] : [],
            status: isEditing ? undefined : (mode === 'auction_create' ? 'draft' : 'listed'),
        }, mode);
    };

    return (
        <div>
            <StepIndicator current={step} />

            <div style={{ background: T.white, border: `0.5px solid ${T.border}`, borderRadius: 16, padding: '36px 40px' }}>
                {step === 1 && (
                    <StepStoneDetails
                        register={register} control={control} errors={errors}
                        watch={watch} autoTitle={autoTitle} categories={categories}
                    />
                )}
                {step === 2 && (
                    <StepListingDetails
                        register={register} control={control} errors={errors}
                        watch={watch}
                        imageFiles={imageFiles} setImageFiles={setImageFiles}
                        imagePreviews={imagePreviews} setImagePreviews={setImagePreviews}
                    />
                )}
                {step === 3 && (
                    <StepReview getValues={getValues} imageFiles={imageFiles} imagePreviews={imagePreviews} />
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 36, paddingTop: 24, borderTop: `0.5px solid ${T.border}` }}>
                    {step > 1 ? (
                        <button type="button" onClick={goBack}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'transparent', border: `0.5px solid ${T.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, color: T.muted, transition: 'all 0.2s' }}>
                            <ChevronLeft size={16} /> Back
                        </button>
                    ) : <div />}

                    <div style={{ display: 'flex', gap: 12 }}>
                        {step < 3 ? (
                            <button type="button" onClick={goNext}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: T.sapphire, border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: BODY, fontSize: '0.88rem', fontWeight: 700, color: '#fff', transition: 'all 0.2s' }}>
                                Continue <ChevronRight size={16} />
                            </button>
                        ) : (
                            <>
                                <button type="button" onClick={() => handleFinalSubmit(isEditing ? 'update' : 'draft')} disabled={isSubmitting}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '12px 28px', background: T.sapphire, border: 'none', borderRadius: 8,
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        fontFamily: BODY, fontSize: '0.88rem', fontWeight: 700, color: '#fff',
                                        opacity: isSubmitting ? 0.7 : 1, transition: 'all 0.2s',
                                    }}>
                                    {isSubmitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {isEditing ? 'Updating...' : 'Saving gem...'}</> : (isEditing ? 'Update Gem' : 'Save as Draft')}
                                </button>

                                {!isEditing && listingType === 'auction' && !isSubmitting && (
                                    <button type="button" onClick={() => handleFinalSubmit('auction_create')}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            padding: '12px 28px', background: T.gold, border: 'none', borderRadius: 8,
                                            cursor: 'pointer', fontFamily: BODY, fontSize: '0.88rem', fontWeight: 700, color: '#fff',
                                            transition: 'all 0.2s',
                                        }}>
                                        Save & Create Auction <ChevronRight size={16} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GemForm;
