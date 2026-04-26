const ApiError = require('../utils/apiError');

const errorHandler = (err, req, res, _next) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            details: err.details,
        });
    }

    // Unknown / unexpected error
    console.error('Unhandled error:', err);

    res.status(500).json({
        success: false,
        message: 'Internal server error.',
    });
};

module.exports = errorHandler;
