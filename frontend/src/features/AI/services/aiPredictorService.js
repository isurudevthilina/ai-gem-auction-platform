/**
 * aiPredictorService.js
 * Mock AI price prediction service.
 *
 * TODO: Replace mock with real FastAPI call when ML model is trained.
 *   Endpoint: POST /api/ml/predict
 *   Payload:  { gemFamily, caratWeight, cut, clarity, color, origin, treatment }
 *   Response: { predictedPrice, confidenceLow, confidenceHigh, currency, shapValues }
 */

// ─── Base price-per-carat reference by gem family (USD, approximate market avg) ───
const BASE_PRICE_PER_CARAT = {
    Sapphire: 4800,
    Ruby: 7200,
    Emerald: 5500,
    Alexandrite: 9000,
    Garnet: 1200,
    Spinel: 2800,
    Tourmaline: 1800,
    Aquamarine: 900,
};

// ─── Feature multipliers ─────────────────────────────────────────────────────
const CLARITY_MULTIPLIER = {
    IF: 1.55,
    VVS1: 1.40,
    VVS2: 1.28,
    VS1: 1.15,
    VS2: 1.05,
    SI1: 0.90,
    SI2: 0.78,
    I1: 0.62,
};

const CUT_MULTIPLIER = {
    Round: 1.20,
    Oval: 1.12,
    Cushion: 1.10,
    Pear: 1.08,
    Emerald_Cut: 1.05,
    Marquise: 1.03,
    Heart: 1.02,
};

const ORIGIN_MULTIPLIER = {
    'Sri Lanka': 1.25,
    Myanmar: 1.35,
    Colombia: 1.30,
    Brazil: 1.05,
    Thailand: 0.95,
    Madagascar: 0.90,
    Russia: 1.15,
    Other: 0.85,
};

const TREATMENT_MULTIPLIER = {
    None: 1.30,
    'Heat Treated': 0.85,
    'Fracture Filled': 0.65,
    Irradiation: 0.70,
};

// Color premium by gem family (maps color option to % premium)
const COLOR_PREMIUM = {
    Sapphire: { 'Royal Blue': 0.40, 'Cornflower Blue': 0.30, 'Vivid Blue': 0.35, 'Light Blue': 0.10, 'Padparadscha': 0.60, 'Yellow': 0.15, 'Pink': 0.25 },
    Ruby: { 'Pigeon Blood': 0.55, 'Vivid Red': 0.40, 'Deep Red': 0.30, 'Pinkish Red': 0.20, 'Dark Red': 0.15 },
    Emerald: { 'Vivid Green': 0.45, 'Muzo Green': 0.50, 'Medium Green': 0.25, 'Yellowish Green': 0.10, 'Bluish Green': 0.30 },
    Alexandrite: { 'Green to Red': 0.60, 'Teal to Purple': 0.45, 'Green to Purple': 0.40 },
    Garnet: { 'Deep Red': 0.20, 'Orangy Red': 0.25, 'Raspberry Red': 0.30, 'Brownish Red': 0.05 },
    Spinel: { 'Red': 0.40, 'Hot Pink': 0.35, 'Cobalt Blue': 0.50, 'Lavender': 0.20, 'Orange': 0.25 },
    Tourmaline: { 'Paraiba Blue': 0.70, 'Rubellite Pink': 0.35, 'Chrome Green': 0.40, 'Bi-Color': 0.20, 'Indicolite': 0.25 },
    Aquamarine: { 'Santa Maria Blue': 0.45, 'Vivid Blue': 0.35, 'Medium Blue': 0.20, 'Light Blue': 0.05 },
};

/**
 * Builds a realistic SHAP breakdown from the form inputs.
 * Each feature gets a dollar contribution relative to a neutral baseline.
 */
const buildSHAPValues = (formData, basePrice, finalPrice) => {
    const { gemFamily, caratWeight, cut, clarity, color, origin, treatment } = formData;

    const clarityMult = CLARITY_MULTIPLIER[clarity] ?? 1.0;
    const cutMult = CUT_MULTIPLIER[cut] ?? 1.0;
    const originMult = ORIGIN_MULTIPLIER[origin] ?? 1.0;
    const treatmentMult = TREATMENT_MULTIPLIER[treatment] ?? 1.0;
    const colorPrem = COLOR_PREMIUM[gemFamily]?.[color] ?? 0.15;

    // Represent each feature's dollar delta vs neutral (all multipliers = 1.0)
    const neutralPrice = basePrice * parseFloat(caratWeight);

    return [
        {
            feature: 'Gem Family',
            value: gemFamily,
            contribution: Math.round(neutralPrice * 0.45),
            direction: 'positive',
        },
        {
            feature: 'Carat Weight',
            value: `${caratWeight} ct`,
            contribution: Math.round(neutralPrice * (parseFloat(caratWeight) > 1 ? 0.30 : 0.12)),
            direction: 'positive',
        },
        {
            feature: 'Origin',
            value: origin,
            contribution: Math.round(neutralPrice * (originMult - 1.0) * 1.2),
            direction: originMult >= 1.0 ? 'positive' : 'negative',
        },
        {
            feature: 'Clarity',
            value: clarity,
            contribution: Math.round(neutralPrice * (clarityMult - 1.0) * 0.9),
            direction: clarityMult >= 1.0 ? 'positive' : 'negative',
        },
        {
            feature: 'Color',
            value: color,
            contribution: Math.round(neutralPrice * colorPrem * 0.8),
            direction: 'positive',
        },
        {
            feature: 'Treatment',
            value: treatment,
            contribution: Math.round(neutralPrice * (treatmentMult - 1.0) * 0.7),
            direction: treatmentMult >= 1.0 ? 'positive' : 'negative',
        },
        {
            feature: 'Cut',
            value: cut,
            contribution: Math.round(neutralPrice * (cutMult - 1.0) * 0.6),
            direction: cutMult >= 1.0 ? 'positive' : 'negative',
        },
    ].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
};

/**
 * predictGemPrice
 * Simulates calling the FastAPI ML microservice.
 * Delay mimics real network + inference latency.
 *
 * @param {Object} formData - Collected wizard data
 * @returns {Promise<{predictedPrice, confidenceLow, confidenceHigh, currency, shapValues}>}
 */
export const predictGemPrice = async (formData) => {
    // Simulate inference latency
    await new Promise((resolve) => setTimeout(resolve, 1900));

    const { gemFamily, caratWeight, cut, clarity, color, origin, treatment } = formData;

    const basePPC = BASE_PRICE_PER_CARAT[gemFamily] ?? 1500;
    const carat = parseFloat(caratWeight) || 1.0;

    // Carat premium: large stones command exponential premium
    const caratFactor = carat <= 1 ? carat : carat * (1 + (carat - 1) * 0.18);

    const rawPrice =
        basePPC *
        caratFactor *
        (CLARITY_MULTIPLIER[clarity] ?? 1.0) *
        (CUT_MULTIPLIER[cut] ?? 1.0) *
        (ORIGIN_MULTIPLIER[origin] ?? 1.0) *
        (TREATMENT_MULTIPLIER[treatment] ?? 1.0) *
        (1 + (COLOR_PREMIUM[gemFamily]?.[color] ?? 0.15));

    // Add tiny deterministic jitter so it doesn't look like a hard formula
    const seed = (gemFamily.charCodeAt(0) + carat * 7) % 97;
    const jitter = 1 + (seed - 48) / 1000;
    const predictedPrice = Math.round(rawPrice * jitter);

    // Confidence interval ±8–14%
    const variancePct = 0.08 + (seed % 7) / 100;
    const confidenceLow = Math.round(predictedPrice * (1 - variancePct));
    const confidenceHigh = Math.round(predictedPrice * (1 + variancePct));

    const shapValues = buildSHAPValues(formData, basePPC, predictedPrice);

    return {
        predictedPrice,
        confidenceLow,
        confidenceHigh,
        currency: 'USD',
        shapValues,
    };
};
