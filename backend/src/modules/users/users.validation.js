const { z } = require('zod');

const slPhoneRegex = /^(\+94|0)[0-9]{9}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

const updateProfileSchema = z.object({
    full_name:     z.string().trim().min(2).max(60).optional(),
    phone_number:  z.string().regex(slPhoneRegex, 'Invalid Sri Lankan phone number').optional().or(z.literal('')),
    district:      z.string().max(60).optional().or(z.literal('')),
    province:      z.string().max(60).optional().or(z.literal('')),
    city:          z.string().max(60).optional().or(z.literal('')),
    address_line1: z.string().max(120).optional().or(z.literal('')),
    address_line2: z.string().max(120).optional().or(z.literal('')),
    postal_code:   z.string().max(10).optional().or(z.literal('')),
});

const changeEmailSchema = z.object({
    new_email:        z.string().email().toLowerCase().trim(),
    current_password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password:     z.string().min(8, 'Must be at least 8 characters')
                        .regex(passwordRegex, 'Must include uppercase, lowercase, number, and special character'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
});

const deleteAccountSchema = z.object({
    current_password: z.string().min(1, 'Password is required'),
});

const adminUpdateUserSchema = z.object({
    role: z.enum(['buyer', 'seller', 'admin']).optional(),
    is_verified: z.boolean().optional(),
}).superRefine((data, ctx) => {
    if (data.role === undefined && data.is_verified === undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'At least one field (role or is_verified) must be provided',
        });
    }
});

const adminSearchSchema = z.object({
    query: z.string().max(100).trim().optional(),
    role: z.enum(['all', 'buyer', 'seller', 'admin']).optional(),
    is_verified: z.preprocess(
        (val) => (val === 'true' ? true : val === 'false' ? false : undefined),
        z.boolean().optional(),
    ),
    sort: z.enum(['newest', 'oldest', 'last_active', 'name_asc', 'name_desc']).optional(),
    page: z.coerce.number().int().min(0).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
});

module.exports = {
    updateProfileSchema,
    changeEmailSchema,
    changePasswordSchema,
    deleteAccountSchema,
    adminUpdateUserSchema,
    adminSearchSchema,
};
