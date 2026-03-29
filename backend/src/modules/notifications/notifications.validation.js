const { z } = require('zod');

const markReadSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

module.exports = { markReadSchema };
