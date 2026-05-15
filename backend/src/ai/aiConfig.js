const DEFAULT_WEIGHTS = {
  subjectScore: 0.30,
  topicScore: 0.25,
  ratingScore: 0.15,
  languageScore: 0.10,
  experienceScore: 0.08,
  completionScore: 0.05,
  availabilityScore: 0.04,
  responseScore: 0.02,
  learningStyleScore: 0.01,
};

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004";

const MAX_TUTORS_TO_SCORE = parseInt(process.env.AI_MATCH_MAX_TUTORS || "300", 10);

const MIN_TOPIC_SIMILARITY = parseFloat(process.env.AI_MATCH_MIN_TOPIC_SIMILARITY || "0.35");

module.exports = {
  DEFAULT_WEIGHTS,
  EMBEDDING_MODEL,
  MAX_TUTORS_TO_SCORE,
  MIN_TOPIC_SIMILARITY,
};
