const ApiError = require('../utils/apiError');
const { analyzeTextToxicity, TOXICITY_THRESHOLD, findToxicLexicalMatch } = require('../services/toxicity.service');

// Middleware factory so we can reuse this for different payload fields later if needed.
const blockToxicText = ({ field = 'comment' } = {}) => async (req, _res, next) => {
  const input = req.body?.[field];

  try {
    // Skip analysis when the field is absent or empty (comment is optional in this API).
    if (!input || !String(input).trim()) {
      return next();
    }

    const analysis = await analyzeTextToxicity(input);

    if (analysis.flagged) {
      throw new ApiError(400, 'Review text was flagged as toxic. Please keep your language professional.', {
        field,
        threshold: TOXICITY_THRESHOLD,
        maxProbability: analysis.maxProbability,
        labels: analysis.flaggedLabels,
      });
    }

    return next();
  } catch (error) {
    // Fail-open for benign text when AI moderation is temporarily unavailable,
    // but still block obvious abusive language via lexical fallback.
    if (error?.code === 'TOXICITY_UNAVAILABLE') {
      const fallbackMatch = findToxicLexicalMatch(input);
      if (fallbackMatch) {
        return next(new ApiError(400, 'Review text was flagged as toxic. Please keep your language professional.', {
          field,
          threshold: TOXICITY_THRESHOLD,
          source: 'lexical-fallback',
        }));
      }

      return next();
    }

    return next(error);
  }
};

module.exports = {
  blockToxicText,
};
