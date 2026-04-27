/**
 * aiPredictorService.js
 * Calls the Node.js → FastAPI ML microservice to get a real gem price prediction.
 *
 * Endpoint: POST /api/ml/predict
 * Payload:  { gemFamily, shape, caratWeight, clarity, color, treatment }
 * Response: { predictedPrice, confidenceLow, confidenceHigh, currency, shapValues }
 */

/**
 * predictGemPrice
 * Sends wizard form data to the ML microservice via the Node.js proxy.
 *
 * @param {Object} formData - { gemFamily, shape, caratWeight, clarity, color, treatment }
 * @returns {Promise<{ predictedPrice, confidenceLow, confidenceHigh, currency, shapValues }>}
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const predictGemPrice = async (formData) => {
    const { gemFamily, shape, caratWeight, clarity, color, treatment } = formData;

    const response = await fetch(`${API_BASE}/api/ml/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gemFamily, shape, caratWeight, clarity, color, treatment }),
    });

    if (!response.ok) {
        let message = `Prediction failed (${response.status})`;
        try {
            const body = await response.json();
            if (body?.message) message = body.message;
        } catch (_) { /* ignore parse error */ }
        throw new Error(message);
    }

    const json = await response.json();
    // Node proxy wraps in ApiResponse: { status, message, data }
    return json.data ?? json;
};

