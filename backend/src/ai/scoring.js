const { DEFAULT_WEIGHTS } = require("./aiConfig");
const { clamp01 } = require("./similarity");

const normalizeExperience = (sessions = 0) => {
  if (!sessions || sessions <= 0) return 0;
  const capped = Math.min(sessions, 100);
  return clamp01(Math.log10(1 + capped) / Math.log10(101));
};

const normalizeResponseTime = (minutes) => {
  if (!minutes || minutes <= 0) return 0.5;
  const capped = Math.min(minutes, 180);
  return clamp01(1 - capped / 180);
};

const normalizeCompletionRate = (rate) => {
  if (rate === null || rate === undefined) return 0.6;
  return clamp01(rate > 1 ? rate / 100 : rate);
};

const normalizeRating = (rating) => {
  if (rating === null || rating === undefined) return 0.5;
  return clamp01(rating / 5);
};

const computeScores = (input) => {
  const weights = input.weights || DEFAULT_WEIGHTS;
  const breakdown = {
    subjectScore: clamp01(input.subjectScore),
    topicScore: clamp01(input.topicScore),
    ratingScore: normalizeRating(input.ratingScore),
    languageScore: clamp01(input.languageScore),
    experienceScore: normalizeExperience(input.experienceScore),
    completionScore: normalizeCompletionRate(input.completionScore),
    availabilityScore: clamp01(input.availabilityScore),
    responseScore: normalizeResponseTime(input.responseScore),
    learningStyleScore: clamp01(input.learningStyleScore),
  };

  const finalScore = Object.keys(weights).reduce((acc, key) => {
    const weight = weights[key] || 0;
    return acc + breakdown[key] * weight;
  }, 0);

  return { finalScore: clamp01(finalScore), breakdown };
};

module.exports = {
  computeScores,
  normalizeExperience,
  normalizeResponseTime,
  normalizeCompletionRate,
  normalizeRating,
};
