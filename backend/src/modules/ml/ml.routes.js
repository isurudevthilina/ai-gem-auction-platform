const express = require('express');
const router  = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { predict } = require('./ml.controller');

// POST /api/ml/predict — requires authentication to prevent abuse
router.post('/predict', authenticate, predict);

module.exports = router;
