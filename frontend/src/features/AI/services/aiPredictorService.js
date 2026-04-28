/**
 * aiPredictorService.js
 * Calls the Node.js → FastAPI ML microservice to get a real gem price prediction.
 *
 * Endpoint: POST /api/ml/predict
 * Payload:  { gemFamily, shape, caratWeight, clarity, color, treatment }
 * Response: { predictedPrice, confidenceLow, confidenceHigh, currency, shapValues }
 */

import api from '../../../api/client';

/**
 * predictGemPrice
 * Sends wizard form data to the ML microservice via the Node.js proxy.
 *
 * @param {Object} formData - { gemFamily, shape, caratWeight, clarity, color, treatment }
 * @returns {Promise<{ predictedPrice, confidenceLow, confidenceHigh, currency, shapValues }>}
 */
export const predictGemPrice = async (formData) => {
    const { gemFamily, shape, caratWeight, clarity, color, treatment } = formData;

    const { data } = await api.post('/ml/predict', {
        gemFamily, shape, caratWeight, clarity, color, treatment
    });

    // Node proxy wraps in ApiResponse: { status, message, data }
    return data.data ?? data;
};
