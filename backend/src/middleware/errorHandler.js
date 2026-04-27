const ApiError = require('../utils/apiError');

const isDev = process.env.NODE_ENV === 'development';

const errorHandler = (err, req, res, _next) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(isDev && err.details ? { details: err.details } : {}),
        });
    }

    // Unknown / unexpected error — always log full details server-side
    console.error('Unhandled error:', err);

    res.status(500).json({
        success: false,
        message: isDev ? err.message : 'Internal server error.',
        ...(isDev ? { stack: err.stack } : {}),
    });
};

module.exports = errorHandler;
