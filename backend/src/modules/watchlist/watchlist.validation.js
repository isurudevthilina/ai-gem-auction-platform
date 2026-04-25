const { z } = require('zod');

const createFolderSchema = z.object({
    name: z.string().trim().min(1, 'Folder name is required').max(60, 'Maximum 60 characters'),
});

const renameFolderSchema = z.object({
    name: z.string().trim().min(1, 'Folder name is required').max(60, 'Maximum 60 characters'),
});

const addToWatchlistSchema = z.object({
    gem_id: z.string().uuid().optional(),
    auction_id: z.string().uuid().optional(),
    folder_id: z.string().uuid().optional().nullable(),
}).superRefine((data, ctx) => {
    if (!data.gem_id && !data.auction_id) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Provide at least gem_id or auction_id',
        });
    }
});

const moveToFolderSchema = z.object({
    folder_id: z.string().uuid().optional().nullable(),
});

const cleanupWatchlistSchema = z.object({
    days: z.coerce.number().int().min(1, 'Time period must be at least 1 day').max(365, 'Maximum 365 days').default(30),
});

module.exports = {
    createFolderSchema,
    renameFolderSchema,
    addToWatchlistSchema,
    moveToFolderSchema,
    cleanupWatchlistSchema,
};
