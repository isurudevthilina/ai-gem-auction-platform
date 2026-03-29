const { z } = require('zod');

const createAuctionSchema = z.object({
    gem_id:            z.string().uuid(),
    starting_price:    z.number().positive().max(9_999_999),
    reserve_price:     z.number().positive().max(9_999_999).optional(),
    min_bid_increment: z.number().positive().max(100_000).default(10),
    start_time:        z.string().datetime().optional(),
    end_time:          z.string().datetime(),
});

const updateAuctionSchema = z.object({
    end_time:          z.string().datetime().optional(),
    min_bid_increment: z.number().positive().optional(),
    status:            z.enum(['cancelled']).optional(),
});

const placeBidSchema = z.object({
    amount: z.number().positive(),
});

const validate = (schema) => (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const messages = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        const ApiError = require('../../utils/apiError');
        return next(new ApiError(400, messages.join('; ')));
    }
    req.validated = result.data;
    next();
};

module.exports = {
    createAuctionSchema,
    updateAuctionSchema,
    placeBidSchema,
    validate,
};
