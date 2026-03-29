const { z } = require('zod');

const createReviewSchema = z.object({
  transaction_id: z.string().uuid('Invalid transaction ID'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000).trim().optional(),
});

const updateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().min(10).max(1000).trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.rating === undefined && data.comment === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one of rating or comment is required',
      });
    }
  });

module.exports = { createReviewSchema, updateReviewSchema };
