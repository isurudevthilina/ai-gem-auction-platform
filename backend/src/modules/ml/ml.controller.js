const catchAsync = require('../../utils/catchAsync');
const ApiError   = require('../../utils/apiError');
// ApiResponse is a function, not a class — other controllers use res.json() directly

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * POST /api/ml/predict
 * Forwards the gem prediction request to the FastAPI ML service and
 * returns the response to the frontend.
 */
const predict = catchAsync(async (req, res) => {
    const { gemFamily, shape, color, clarity, treatment, caratWeight, x, y, z } = req.body;

    if (!gemFamily || !shape || !color || !clarity || !treatment || caratWeight === undefined) {
        throw new ApiError(400, 'Missing required fields: gemFamily, shape, color, clarity, treatment, caratWeight');
    }

    const caratNum = parseFloat(caratWeight);
    if (isNaN(caratNum) || caratNum <= 0) {
        throw new ApiError(400, 'caratWeight must be a positive number');
    }

    const xNum = parseFloat(x);
    const yNum = parseFloat(y);
    const zNum = parseFloat(z);

    if (isNaN(xNum) || xNum <= 0 || isNaN(yNum) || yNum <= 0 || isNaN(zNum) || zNum <= 0) {
        throw new ApiError(400, 'x, y, z must be positive numbers representing gem dimensions in mm');
    }

    const mlResponse = await fetch(`${ML_SERVICE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            gemFamily,
            shape,
            color,
            clarity,
            treatment,
            caratWeight: caratNum,
            x: xNum,
            y: yNum,
            z: zNum,
        }),
    });

    if (!mlResponse.ok) {
        const errBody = await mlResponse.json().catch(() => ({}));
        const detail = errBody?.detail || 'ML service error';
        if (mlResponse.status === 503) {
            throw new ApiError(503, 'ML model not ready. Train the model first: cd ml && python train.py');
        }
        if (mlResponse.status === 422) {
            throw new ApiError(422, detail);
        }
        throw new ApiError(502, `ML service returned ${mlResponse.status}: ${detail}`);
    }

    const prediction = await mlResponse.json();
    return res.status(200).json({
        success: true,
        message: 'Prediction successful',
        data: prediction,
    });
});

module.exports = { predict };
