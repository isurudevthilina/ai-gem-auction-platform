const ApiError = require('../utils/apiError');

const authorize = (...roles) => (req, _res, next) => {
    if (!req.user) {
        throw new ApiError(401, 'Unauthorized.');
    }
    if (!roles.includes(req.user.role)) {
        throw new ApiError(403, 'Access denied. Insufficient permissions.');
    }
    next();
};

module.exports = authorize;
