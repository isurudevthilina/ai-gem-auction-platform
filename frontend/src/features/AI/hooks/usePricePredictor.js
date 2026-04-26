/**
 * usePricePredictor.js
 * Manages the full state of the AI gem price prediction wizard.
 *
 * Steps:
 *   0 → Landing / entry screen
 *   1 → Gem Family selection
 *   2 → Physical properties (carat, cut)
 *   3 → Quality grading (clarity, color, treatment)
 *   4 → Origin + review summary
 *   5 → Result / SHAP output
 */
import { useState, useCallback } from 'react';
import { predictGemPrice } from '../services/aiPredictorService';

const TOTAL_STEPS = 4; // steps 1-4 (step 0 is the landing)

const INITIAL_FORM = {
    gemFamily: '',
    caratWeight: '',
    cut: '',
    clarity: '',
    color: '',
    treatment: '',
    origin: '',
};

export const usePricePredictor = (initialParams = {}) => {
    const hasInit = Object.values(initialParams).some(Boolean);
    const initForm = hasInit ? { ...INITIAL_FORM, ...initialParams } : INITIAL_FORM;
    const [step, setStep] = useState(hasInit ? 1 : 0);
    const [formData, setFormData] = useState(initForm);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    // ─── Field updater ───────────────────────────────────────────────────────
    const updateField = useCallback((field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // When gem family changes, reset color selection (options are family-specific)
        if (field === 'gemFamily') {
            setFormData((prev) => ({ ...prev, gemFamily: value, color: '' }));
        }
    }, []);

    // ─── Navigation ──────────────────────────────────────────────────────────
    const handleStart = useCallback(() => setStep(1), []);

    const handleNext = useCallback(() => {
        setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }, []);

    const handleBack = useCallback(() => {
        setStep((s) => Math.max(s - 1, 1));
    }, []);

    // ─── Prediction call ─────────────────────────────────────────────────────
    const handlePredict = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const prediction = await predictGemPrice(formData);
            setResult(prediction);
            setStep(5); // move to result screen
        } catch (err) {
            setError('Prediction failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [formData]);

    // ─── Reset ───────────────────────────────────────────────────────────────
    const handleReset = useCallback(() => {
        setFormData(INITIAL_FORM);
        setResult(null);
        setError(null);
        setStep(1); // go back to Step 1, not the landing
    }, []);

    // ─── Step validation (are all required fields for this step filled?) ─────
    const isStepValid = useCallback(() => {
        switch (step) {
            case 1: return !!formData.gemFamily;
            case 2: return !!formData.caratWeight && parseFloat(formData.caratWeight) > 0 && !!formData.cut;
            case 3: return !!formData.clarity && !!formData.color && !!formData.treatment;
            case 4: return !!formData.origin;
            default: return true;
        }
    }, [step, formData]);

    const progress = step >= 1 && step <= 4 ? (step / TOTAL_STEPS) * 100 : 0;

    return {
        step,
        formData,
        isLoading,
        error,
        result,
        TOTAL_STEPS,
        progress,
        isStepValid,
        updateField,
        handleStart,
        handleNext,
        handleBack,
        handlePredict,
        handleReset,
    };
};
