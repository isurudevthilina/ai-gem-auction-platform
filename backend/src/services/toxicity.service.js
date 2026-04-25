const toxicity = require('@tensorflow-models/toxicity');
const tf = require('@tensorflow/tfjs');

// Shared threshold used by both backend middleware and frontend UX.
const TOXICITY_THRESHOLD = 0.85;
const MODEL_LOAD_TIMEOUT_MS = Number(process.env.TOXICITY_MODEL_LOAD_TIMEOUT_MS || 30000);
const CLASSIFY_TIMEOUT_MS = Number(process.env.TOXICITY_CLASSIFY_TIMEOUT_MS || 10000);

// Fast lexical fallback used only when model inference is unavailable.
const TOXIC_WORD_PATTERN = /\b(fuck\w*|idiot\w*|moron\w*|bitch\w*|bastard\w*|asshole\w*|dickhead\w*|slut\w*|whore\w*|cunt\w*)\b/i;

let modelPromise = null;

const withTimeout = async (promiseFactory, timeoutMs, errorMessage, code) => {
  let timeoutId;
  try {
    return await Promise.race([
      Promise.resolve().then(promiseFactory),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          const error = new Error(errorMessage);
          error.code = code;
          reject(error);
        }, timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
};

const asServiceUnavailable = (error, fallbackMessage) => {
  const wrapped = new Error(error?.message || fallbackMessage);
  wrapped.code = 'TOXICITY_UNAVAILABLE';
  wrapped.cause = error;
  return wrapped;
};

const getToxicityModel = async () => {
  // Load once and reuse; model loading is expensive and should not happen per request.
  if (!modelPromise) {
    modelPromise = withTimeout(
      () => toxicity.load(TOXICITY_THRESHOLD),
      MODEL_LOAD_TIMEOUT_MS,
      `Toxicity model load timed out after ${MODEL_LOAD_TIMEOUT_MS}ms.`,
      'TOXICITY_MODEL_LOAD_TIMEOUT'
    ).catch((error) => {
      // Allow the next request to retry model load after a failed attempt.
      modelPromise = null;
      throw asServiceUnavailable(error, 'Failed to load toxicity model.');
    });
  }
  return modelPromise;
};

const analyzeTextToxicity = async (text) => {
  const content = String(text || '').trim();

  if (!content) {
    return {
      flagged: false,
      maxProbability: 0,
      flaggedLabels: [],
      threshold: TOXICITY_THRESHOLD,
    };
  }

  try {
    // Ensure TensorFlow backend is ready before inference.
    await withTimeout(
      () => tf.ready(),
      MODEL_LOAD_TIMEOUT_MS,
      `TensorFlow backend initialization timed out after ${MODEL_LOAD_TIMEOUT_MS}ms.`,
      'TOXICITY_TF_READY_TIMEOUT'
    );

    const model = await getToxicityModel();
    const predictions = await withTimeout(
      () => model.classify([content]),
      CLASSIFY_TIMEOUT_MS,
      `Toxicity classification timed out after ${CLASSIFY_TIMEOUT_MS}ms.`,
      'TOXICITY_CLASSIFY_TIMEOUT'
    );

    let maxProbability = 0;
    const flaggedLabels = [];

    for (const prediction of predictions) {
      const result = prediction.results?.[0];
      const toxicProbability = Number(result?.probabilities?.[1] || 0);

      if (toxicProbability > maxProbability) {
        maxProbability = toxicProbability;
      }

      if (toxicProbability >= TOXICITY_THRESHOLD) {
        flaggedLabels.push({
          label: prediction.label,
          probability: toxicProbability,
        });
      }
    }

    return {
      flagged: flaggedLabels.length > 0,
      maxProbability,
      flaggedLabels,
      threshold: TOXICITY_THRESHOLD,
    };
  } catch (error) {
    throw asServiceUnavailable(error, 'Toxicity classification failed.');
  }
};

const findToxicLexicalMatch = (text) => {
  const content = String(text || '').trim();
  if (!content) return null;
  return content.match(TOXIC_WORD_PATTERN)?.[0] || null;
};

module.exports = {
  TOXICITY_THRESHOLD,
  analyzeTextToxicity,
  findToxicLexicalMatch,
  getToxicityModel,
};
