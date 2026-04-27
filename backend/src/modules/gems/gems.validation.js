const { z } = require('zod');

// ─────────────────────────────────────────────────────────────────────────────
// Allowed enum values (shared across layers)
// ─────────────────────────────────────────────────────────────────────────────

const LISTING_TYPES = ['direct_sell', 'auction'];
const STATUSES      = ['draft', 'listed', 'in_auction', 'sold', 'unlisted'];

const CLARITY_GRADES = [
    'I1 (Included 1)',
    'SI1 (Slightly Included 1)',
    'SI2 (Slightly Included 2)',
    'VS (Eye Clean 2)',
    'VVS (Eye Clean 1)',
];

const CUT_SHAPES = [
    'Cushion', 'Fancy', 'Heart', 'Marquise', 'Octagon',
    'Other', 'Oval', 'Pear', 'Round', 'Trillion',
];

const TREATMENTS = [
    'Be Heated', 'Fracture Filled', 'Heated', 'Irradiated', 'Untreated',
];

const ORIGINS = [
    'Sri Lanka (Ceylon)', 'Burma (Myanmar)', 'Madagascar', 'Thailand',
    'Colombia', 'Brazil', 'Zambia', 'Tanzania', 'India', 'Afghanistan',
    'Australia', 'Other',
];

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/gems — create gem schema
// ─────────────────────────────────────────────────────────────────────────────
const createGemSchema = z.object({
    title: z
        .string({ required_error: 'Title is required.' })
        .trim()
        .min(3, 'Title must be at least 3 characters.')
        .max(200, 'Title must be 200 characters or less.'),

    category_id: z
        .string({ required_error: 'Gem type is required.' })
        .uuid('Invalid category ID.'),

    carat_weight: z
        .number({ required_error: 'Carat weight is required.' })
        .min(0.01, 'Carat weight must be at least 0.01.')
        .max(999.99, 'Carat weight must be 999.99 or less.'),

    color: z
        .string()
        .trim()
        .max(100, 'Color must be 100 characters or less.')
        .optional()
        .default(''),

    clarity: z.enum(CLARITY_GRADES, {
        errorMap: () => ({ message: `Clarity must be one of: ${CLARITY_GRADES.join(', ')}` }),
    }).optional(),

    cut: z.enum(CUT_SHAPES, {
        errorMap: () => ({ message: `Cut must be one of: ${CUT_SHAPES.join(', ')}` }),
    }).optional(),

    treatment: z.enum(TREATMENTS, {
        errorMap: () => ({ message: `Treatment must be one of: ${TREATMENTS.join(', ')}` }),
    }).optional(),

    origin: z.enum(ORIGINS, {
        errorMap: () => ({ message: `Origin must be one of: ${ORIGINS.join(', ')}` }),
    }).optional(),

    description: z
        .string()
        .trim()
        .max(5000, 'Description must be 5000 characters or less.')
        .optional()
        .default(''),

    certification: z
        .string()
        .trim()
        .max(60, 'Certification must be 60 characters or less.')
        .optional()
        .default(''),

    images: z
        .array(z.string().url('Each entry must be a valid URL.'))
        .max(10, 'Maximum 10 media items allowed.')
        .optional()
        .default([]),

    listing_type: z.enum(LISTING_TYPES, {
        errorMap: () => ({ message: 'Listing type must be direct_sell or auction.' }),
    }).default('direct_sell'),

    buy_now_price: z
        .number()
        .min(1, 'Buy Now price must be at least $1.')
        .max(99_999_999, 'Buy Now price is too high.')
        .nullable()
        .optional()
        .default(null),

    status: z.enum(['draft', 'listed'], {
        errorMap: () => ({ message: 'Status must be draft or listed.' }),
    }).default('draft'),
}).refine(
    (data) => {
        if (data.listing_type === 'direct_sell') {
            return data.buy_now_price !== null && data.buy_now_price !== undefined;
        }
        return true;
    },
    { message: 'Buy Now price is required for direct sell listings.', path: ['buy_now_price'] },
);

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/gems/:id — update gem schema (partial, all optional)
// ─────────────────────────────────────────────────────────────────────────────
const updateGemSchema = z.object({
    title:        z.string().trim().min(3).max(200).optional(),
    category_id:  z.string().uuid().optional(),
    carat_weight: z.number().min(0.01).max(999.99).optional(),
    color:        z.string().trim().max(100).optional(),
    clarity:      z.enum(CLARITY_GRADES).optional(),
    cut:          z.enum(CUT_SHAPES).optional(),
    treatment:    z.enum(TREATMENTS).optional(),
    origin:       z.enum(ORIGINS).optional(),
    description:  z.string().trim().max(5000).optional(),
    certification:z.string().trim().max(60).optional(),
    images:       z.array(z.string().url()).max(10).optional(),
    listing_type: z.enum(LISTING_TYPES).optional(),
    buy_now_price:z.number().min(1).max(99_999_999).nullable().optional(),
    status:       z.enum(STATUSES).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/gems/ai-valuate — AI valuation schema
// ─────────────────────────────────────────────────────────────────────────────
const aiValuationSchema = z.object({
    gem_type:     z.string().min(1, 'Gem type is required.'),
    carat_weight: z.number().min(0.01, 'Carat weight must be at least 0.01.'),
    color:        z.string().min(1, 'Color is required.'),
    clarity:      z.string().min(1, 'Clarity is required.'),
    cut:          z.string().min(1, 'Cut is required.'),
    origin:       z.string().min(1, 'Origin is required.'),
    treatment:    z.string().min(1, 'Treatment is required.'),
});

// ─────────────────────────────────────────────────────────────────────────────
// Middleware factory: validate(schema) — parses req.body, returns 400 on error
// ─────────────────────────────────────────────────────────────────────────────
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        const firstMessage = Object.values(errors).flat()[0] || 'Validation failed.';
        return res.status(400).json({
            success: false,
            message: firstMessage,
            errors,
        });
    }
    req.validated = result.data;
    next();
};

module.exports = {
    createGemSchema,
    updateGemSchema,
    aiValuationSchema,
    validate,
    LISTING_TYPES,
    STATUSES,
    CLARITY_GRADES,
    CUT_SHAPES,
    TREATMENTS,
    ORIGINS,
};
