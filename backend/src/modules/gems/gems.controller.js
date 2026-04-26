const service = require('./gems.service');

// Helper: wrap async handlers
const catchAsync = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// ─── GET /api/gems ───────────────────────────────────────────────────────────
const listGems = catchAsync(async (req, res) => {
    const result = await service.listGems(req.query);
    res.json({ success: true, ...result });
});

// ─── GET /api/gems/search — typeahead ────────────────────────────────────────
const searchGems = catchAsync(async (req, res) => {
    const { q, limit } = req.query;
    const data = await service.quickSearch(q, limit);
    res.json({ success: true, data });
});

// ─── POST /api/gems/ai-valuate — AI valuation proxy ─────────────────────────
const aiValuate = catchAsync(async (req, res) => {
    const d = req.validated;

    // Attempt ML service call
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    let predicted_price, shap_values, confidence, is_mock;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const mlRes = await fetch(`${mlUrl}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(d),
            signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!mlRes.ok) throw new Error('ML service error');
        const mlData = await mlRes.json();
        predicted_price = mlData.predicted_price;
        shap_values = mlData.shap_values;
        confidence = mlData.confidence;
        is_mock = false;
    } catch {
        // Fallback mock prediction
        const BASE = { Sapphire: 400, Ruby: 600, Emerald: 500, Alexandrite: 900, Garnet: 100, Spinel: 200, Tourmaline: 250, Aquamarine: 150 };
        const base = BASE[d.gem_type] || 300;
        const carat = d.carat_weight || 1;
        predicted_price = Math.round(base * carat * (1 + Math.random() * 0.3));
        shap_values = { gem_type: base * 0.3, carat_weight: carat * 50, color: 30, clarity: 20, cut: 15, origin: 25, treatment: -10 };
        confidence = 0.72;
        is_mock = true;
    }

    res.json({ success: true, data: { predicted_price, shap_values, confidence, is_mock } });
});

// ─── GET /api/gems/categories ────────────────────────────────────────────────
const getCategories = catchAsync(async (_req, res) => {
    const data = await service.getCategories();
    res.json({ success: true, data });
});

// ─── POST /api/gems/upload-url ───────────────────────────────────────────────
const getUploadUrl = catchAsync(async (req, res) => {
    const { ext = 'jpg', bucket = 'gem-images' } = req.body;
    const allowedBuckets = ['gem-images', 'gem-models'];
    const safeBucket = allowedBuckets.includes(bucket) ? bucket : 'gem-images';
    const data = await service.getSignedUploadUrl(safeBucket, ext, req.user.id);
    res.json({ success: true, data });
});

// ─── GET /api/gems/my ────────────────────────────────────────────────────────
const getMyGems = catchAsync(async (req, res) => {
    const data = await service.getSellerGems(req.user.id);
    res.json({ success: true, data });
});

// ─── GET /api/gems/:id ──────────────────────────────────────────────────────
const getGem = catchAsync(async (req, res) => {
    const gem = await service.getGemById(req.params.id, req.user || null);
    if (!gem) return res.status(404).json({ success: false, message: 'Gem not found.' });
    res.json({ success: true, data: gem });
});

// ─── POST /api/gems ──────────────────────────────────────────────────────────
const createGem = catchAsync(async (req, res) => {
    const gem = await service.createGem(req.validated, req.user.id);
    res.status(201).json({ success: true, message: 'Gem created.', data: gem });
});

// ─── PATCH /api/gems/:id ─────────────────────────────────────────────────────
const updateGem = catchAsync(async (req, res) => {
    const result = await service.updateGem(req.params.id, req.validated, req.user);
    if (result.error === 'not_found') return res.status(404).json({ success: false, message: 'Gem not found.' });
    if (result.error === 'forbidden') return res.status(403).json({ success: false, message: 'You can only edit your own gems.' });
    if (result.error === 'sold')      return res.status(400).json({ success: false, message: 'Cannot edit a sold gem.' });
    res.json({ success: true, message: 'Gem updated.', data: result.data });
});

// ─── PATCH /api/gems/:id/publish ─────────────────────────────────────────────
const publishGem = catchAsync(async (req, res) => {
    const result = await service.publishGem(req.params.id, req.user);
    if (result.error === 'not_found')       return res.status(404).json({ success: false, message: 'Gem not found.' });
    if (result.error === 'forbidden')       return res.status(403).json({ success: false, message: 'Forbidden.' });
    if (result.error === 'invalid_status')  return res.status(400).json({ success: false, message: result.message });
    res.json({ success: true, message: 'Gem published.', data: result.data });
});

// ─── DELETE /api/gems/:id ────────────────────────────────────────────────────
const deleteGem = catchAsync(async (req, res) => {
    const result = await service.deleteGem(req.params.id, req.user);
    if (result.error === 'not_found')       return res.status(404).json({ success: false, message: 'Gem not found.' });
    if (result.error === 'forbidden')       return res.status(403).json({ success: false, message: 'You can only delete your own gems.' });
    if (result.error === 'sold')            return res.status(400).json({ success: false, message: 'Cannot delete a sold gem.' });
    if (result.error === 'active_auction')  return res.status(409).json({ success: false, message: 'Cannot delete — gem has an active auction.' });
    res.json({ success: true, message: 'Gem deleted.' });
});

module.exports = {
    listGems,
    searchGems,
    aiValuate,
    getCategories,
    getUploadUrl,
    getMyGems,
    getGem,
    createGem,
    updateGem,
    publishGem,
    deleteGem,
};
