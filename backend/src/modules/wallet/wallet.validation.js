const { z } = require('zod');
const MAX_TOP_UP_USD = 4000;

const topUpSchema = z.object({
    amount: z.coerce.number().positive('Top-up amount must be greater than zero').max(MAX_TOP_UP_USD, `Top-up amount is too high. Maximum is USD ${MAX_TOP_UP_USD}.`),
    currency_mode: z.enum(['auto', 'manual']).default('auto'),
    currency_code: z.enum(['USD', 'LKR', 'EUR', 'GBP', 'INR', 'AUD', 'JPY', 'SGD', 'AED', 'THB']).default('USD'),
    card_number: z.string().min(12).max(19).optional(),
    expiry: z.string().min(4).max(7).optional(),
    cvv: z.string().min(3).max(4).optional(),
    holder_name: z.string().min(2).max(120).optional(),
});

const buyGemsSchema = z.object({
    usd_amount: z.coerce.number().positive('USD amount must be greater than zero').max(100000, 'Amount is too high'),
});

const withdrawSchema = z.object({
    bank_name: z.string().min(2, 'Bank name is required').max(120, 'Bank name is too long'),
    account_number: z.string().min(6, 'Account number is too short').max(40, 'Account number is too long'),
    amount: z.coerce.number().positive('Withdrawal amount must be greater than zero').max(100000, 'Amount is too high'),
});

module.exports = { topUpSchema, buyGemsSchema, withdrawSchema };
