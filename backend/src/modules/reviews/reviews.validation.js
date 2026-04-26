const { z } = require('zod');

const mediaUrlSchema = z.string().url().max(2000).refine(
  (url) => {
    const lower = url.toLowerCase();
    return lower.endsWith('.jpg')
      || lower.endsWith('.jpeg')
      || lower.endsWith('.png')
      || lower.endsWith('.webp')
      || lower.endsWith('.gif')
      || lower.endsWith('.mp4')
      || lower.endsWith('.webm')
      || lower.endsWith('.mov');
  },
  { message: 'Unsupported media URL format' }
);

const createReviewSchema = z.object({
  transaction_id: z.string().uuid('Invalid transaction ID'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000).trim().optional(),
  media_urls: z.array(mediaUrlSchema).max(6).optional(),
});

const updateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().min(10).max(1000).trim().optional(),
    media_urls: z.array(mediaUrlSchema).max(6).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.rating === undefined && data.comment === undefined && data.media_urls === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one of rating, comment or media_urls is required',
      });
    }
  });

const getReviewMediaUploadUrlSchema = z.object({
  ext: z.string().trim().min(1).max(10),
  media_type: z.enum(['image', 'video']),
});

const reportReviewSchema = z.object({
  reason: z.string().trim().min(10).max(1000),
});

const resolveReviewReportSchema = z.object({
  action: z.enum(['removed_and_warned', 'dismissed']),
  admin_note: z.string().trim().max(1000).optional(),
  warning_message: z.string().trim().min(10).max(1000).optional(),
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
  getReviewMediaUploadUrlSchema,
  reportReviewSchema,
  resolveReviewReportSchema,
};
