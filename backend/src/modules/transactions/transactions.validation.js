const { z } = require('zod');

const buyNowSchema = z.object({
  gem_id: z.string().uuid('Invalid gem ID'),
});

const confirmPaymentSchema = z.object({
  payment_reference: z.string().max(100).optional(),
});

const updateTransactionStatusSchema = z.object({
  status: z.enum(['completed', 'disputed', 'refunded']),
  notes: z.string().max(500).optional(),
});

module.exports = { buyNowSchema, confirmPaymentSchema, updateTransactionStatusSchema };
