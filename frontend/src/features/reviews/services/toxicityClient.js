import * as toxicity from '@tensorflow-models/toxicity';
import * as tf from '@tensorflow/tfjs';

export const TOXICITY_THRESHOLD = 0.85;
const MODEL_LOAD_TIMEOUT_MS = 10000;
const CLASSIFY_TIMEOUT_MS = 4000;

let modelPromise = null;

// Fast lexical check so obvious abusive words are flagged immediately while typing.
const TOXIC_WORD_PATTERN = /\b(fuck\w*|idiot\w*|moron\w*|bitch\w*|bastard\w*|asshole\w*|dickhead\w*|slut\w*|whore\w*|cunt\w*)\b/i;

export const detectImmediateToxicWord = (text) => {
  const content = String(text || '').trim();
  if (!content) return null;

  const match = content.match(TOXIC_WORD_PATTERN);
  return match?.[0] || null;
};

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

const getToxicityModel = async () => {
  // Load once and cache; repeated loads would make typing laggy.
  if (!modelPromise) {
    modelPromise = withTimeout(
      () => toxicity.load(TOXICITY_THRESHOLD),
      MODEL_LOAD_TIMEOUT_MS,
      `Toxicity model load timed out after ${MODEL_LOAD_TIMEOUT_MS}ms.`,
      'TOXICITY_MODEL_LOAD_TIMEOUT'
    ).catch((error) => {
      // Allow retry on next keystroke if model load fails.
      modelPromise = null;
      throw error;
    });
  }
  return modelPromise;
};

export const analyzeReviewTextToxicity = async (text) => {
  const content = String(text || '').trim();

  if (!content) {
    return {
      flagged: false,
      maxProbability: 0,
      threshold: TOXICITY_THRESHOLD,
      flaggedLabels: [],
    };
  }

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
    threshold: TOXICITY_THRESHOLD,
    flaggedLabels,
  };
};
