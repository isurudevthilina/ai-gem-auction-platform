const { z } = require('zod');
const ApiError = require('../../utils/apiError');

const createCertificateSchema = z.object({
    gem_id:             z.string().uuid(),
    document_url:       z.string().url(),
    issued_by:          z.enum(['GIA', 'AGS', 'IGI', 'GRS', 'GIT', 'GGTL', 'Gübelin', 'Other']),
    certificate_number: z.string().max(80).optional(),
});

const verifyCertificateSchema = z.object({
    notes: z.string().max(500).trim().optional(),
});

const rejectCertificateSchema = z.object({
    notes: z.string().min(10).max(500).trim(),
});

const validate = (schema) => (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const messages = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        return next(new ApiError(400, messages.join('; ')));
    }
    req.validated = result.data;
    next();
};

module.exports = {
    createCertificateSchema,
    verifyCertificateSchema,
    rejectCertificateSchema,
    validate,
};
