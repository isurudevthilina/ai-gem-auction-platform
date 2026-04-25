const ApiError = require('../utils/apiError');

const errorHandler = (err, req, res, _next) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            details: err.details,
        });
    }

    // Supabase/Postgres invalid UUID cast errors should be client 400 responses.
    if (err?.code === '22P02') {
        return res.status(400).json({
            success: false,
            message: 'Invalid request identifier format.',
        });
    }

    // Network/DNS issues to upstream services should not be exposed as generic 500.
    if (err instanceof TypeError && err.message === 'fetch failed') {
        const causeCode = err?.cause?.code;
        const isDnsFailure = causeCode === 'ENOTFOUND' || causeCode === 'EAI_AGAIN';
        if (isDnsFailure) {
            return res.status(503).json({
                success: false,
                message: 'Service temporarily unavailable. Please try again shortly.',
            });
        }
    }

    // Unknown / unexpected error
    console.error('Unhandled error:', err);

    res.status(500).json({
        success: false,
        message: 'Internal server error.',
    });
};

module.exports = errorHandler;
