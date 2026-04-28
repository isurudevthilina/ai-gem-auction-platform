const rateLimit = require('express-rate-limit');

// General API rate limit — 500 requests per 15 min per IP
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.',
        });
    },
});

// Auth endpoints — 50 requests per 15 min per IP (generous for dev, OTP + resend)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many login attempts. Please try again after 15 minutes.',
        });
    },
});

// Bid placement limit — 30 bids per minute per IP
const bidLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many bids placed. Please slow down.',
        });
    },
});

module.exports = { generalLimiter, authLimiter, bidLimiter };
