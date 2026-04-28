const { z } = require('zod');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
const slPhoneRegex = /^(\+94|0)[0-9]{9}$/;
const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;

const registerSchema = z.object({
    full_name: z.string().trim().min(2, 'Full name must be at least 2 characters.').max(60, 'Full name must be at most 60 characters.'),
    email: z.string().trim().toLowerCase().email('Invalid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.')
        .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).'),
    role: z.enum(['buyer', 'seller'], { required_error: 'Role is required.', invalid_type_error: 'Role must be buyer or seller.' }),
    phone_number: z.string().regex(slPhoneRegex, 'Invalid Sri Lanka phone number format.').optional().or(z.literal('')),
    district: z.string().max(60).optional().or(z.literal('')),
    province: z.string().max(60).optional().or(z.literal('')),
    nic_number: z.string().regex(nicRegex, 'Invalid NIC format. Use old (9 digits + V/X) or new (12 digits) format.').optional().or(z.literal('')),
    business_name: z.string().min(1, 'Business name is required for sellers.').optional().or(z.literal('')),
    business_registration_number: z.string().optional().or(z.literal('')),
    business_address: z.string().optional().or(z.literal('')),
}).refine(
    (d) => d.role !== 'seller' || (d.nic_number && nicRegex.test(d.nic_number)),
    { message: 'NIC number is required for sellers.', path: ['nic_number'] }
).refine(
    (d) => d.role !== 'seller' || (d.business_name && d.business_name.trim().length > 0),
    { message: 'Business name is required for sellers.', path: ['business_name'] }
);

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address.'),
    password: z.string().min(1, 'Password is required.'),
});

const resendVerificationSchema = z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address.'),
});

const refreshSchema = z.object({
    refresh_token: z.string().min(1, 'Refresh token is required.'),
});

const forgotPasswordSchema = z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address.'),
});

const verifyOTPSchema = z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address.'),
    otp: z.string().length(6, 'OTP must be 6 digits.').regex(/^\d{6}$/, 'OTP must contain only numbers.'),
});

const resetPasswordSchema = z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address.'),
    otp: z.string().length(6, 'OTP must be 6 digits.').regex(/^\d{6}$/, 'OTP must contain only numbers.'),
    new_password: z.string().min(8, 'Password must be at least 8 characters.')
        .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).'),
});

const verifyEmailSchema = z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address.'),
    otp: z.string().length(6, 'OTP must be exactly 6 digits.').regex(/^\d{6}$/, 'OTP must contain only numbers.'),
});

module.exports = { registerSchema, loginSchema, resendVerificationSchema, refreshSchema, forgotPasswordSchema, verifyOTPSchema, resetPasswordSchema, verifyEmailSchema };
