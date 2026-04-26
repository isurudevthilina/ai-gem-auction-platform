const express = require('express');
const router = express.Router();
const { authenticate, requireRole, optionalAuth } = require('../../middleware/auth.middleware');
const { createGemSchema, updateGemSchema, aiValuationSchema, validate } = require('./gems.validation');
const ctrl = require('./gems.controller');

// ─── Public ──────────────────────────────────────────────────────────────────
router.get('/',           optionalAuth, ctrl.listGems);
router.get('/categories', ctrl.getCategories);
router.get('/search',     ctrl.searchGems);

// ─── Authenticated ───────────────────────────────────────────────────────────
router.post('/ai-valuate', authenticate, validate(aiValuationSchema), ctrl.aiValuate);

// ─── Authenticated seller / admin ────────────────────────────────────────────
router.post('/upload-url', authenticate, requireRole('seller', 'admin'), ctrl.getUploadUrl);
router.get('/my/listings', authenticate, requireRole('seller', 'admin'), ctrl.getMyGems);

// ─── Parameterised (must come AFTER literal paths) ───────────────────────────
router.get('/:id',        optionalAuth, ctrl.getGem);
router.post('/',           authenticate, requireRole('seller', 'admin'), validate(createGemSchema), ctrl.createGem);
router.patch('/:id',       authenticate, requireRole('seller', 'admin'), validate(updateGemSchema), ctrl.updateGem);
router.patch('/:id/publish', authenticate, requireRole('seller', 'admin'), ctrl.publishGem);
router.delete('/:id',     authenticate, requireRole('seller', 'admin'), ctrl.deleteGem);

module.exports = router;
