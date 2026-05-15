const prisma = require("../lib/prisma");
const { cosineSimilarity, clamp01 } = require("./similarity");
const { computeScores } = require("./scoring");
const { getOrCreateRequestEmbedding, getOrCreateTutorEmbedding } = require("./embeddingService");
const { MAX_TUTORS_TO_SCORE, MIN_TOPIC_SIMILARITY } = require("./aiConfig");

const normalize = (value) => (value || "").toLowerCase();

const computeSubjectScore = (subject, tutor, tutorProfile) => {
  const target = normalize(subject);
  const subjects = [
    ...(tutor.subjectExpertise || []).map((s) => s.subject),
    ...(tutorProfile?.expertiseSubjects || []),
  ].map(normalize);

  if (!target) return 0;
  if (subjects.some((s) => s.includes(target) || target.includes(s))) return 1;
  return 0;
};

const computeLanguageScore = (preferredLanguage, tutor, tutorProfile) => {
  const target = normalize(preferredLanguage);
  if (!target) return 0.5;
  const langs = [
    ...(tutor.languagesSpoken || []),
    ...(tutorProfile?.languages || []),
  ].map(normalize);
  return langs.includes(target) ? 1 : 0;
};

const computeAvailabilityScore = (tutorProfile) => {
  if (!tutorProfile) return 0.5;
  if ((tutorProfile.availabilityDays || []).length > 0) return 0.8;
  return 0.5;
};

const computeLearningStyleScore = (request, tutorProfile) => {
  if (!tutorProfile?.learningStyle) return 0.5;
  const pref = normalize(request.learningStyle || "");
  if (!pref) return 0.5;
  return normalize(tutorProfile.learningStyle) === pref ? 1 : 0.6;
};

const buildMatchReasons = ({
  subjectScore,
  topicScore,
  languageScore,
  ratingScore,
  completionScore,
  responseScore,
  experienceScore,
  tutor,
  tutorProfile,
}) => {
  const reasons = [];

  if (subjectScore >= 0.9) reasons.push("Strong subject expertise match");
  if (topicScore >= 0.7) reasons.push("High topic similarity based on semantic match");
  if (languageScore >= 0.9) reasons.push("Matches preferred language");
  if ((tutor.reputationScore || 0) >= 4.5) reasons.push("Excellent tutor rating");
  if (completionScore >= 0.9) reasons.push("Very high completion rate");
  if (responseScore >= 0.8) reasons.push("Fast response time");
  if ((tutor.totalSessionsTaught || 0) >= 10) reasons.push("Experienced tutor with many sessions");
  if (tutorProfile?.learningStyle) reasons.push(`Learning style: ${tutorProfile.learningStyle}`);

  return reasons;
};

const buildStrengths = (tutor, tutorProfile) => {
  const strengths = [];
  if (tutor.subjectExpertise?.length) strengths.push("Subject expertise");
  if (tutor.reputationScore >= 4) strengths.push("High rating");
  if (tutor.totalSessionsTaught >= 5) strengths.push("Experienced tutor");
  if (tutorProfile?.completionRate && tutorProfile.completionRate >= 0.9) strengths.push("Reliable completion");
  if (tutorProfile?.responseTime && tutorProfile.responseTime <= 30) strengths.push("Quick responder");
  return strengths;
};

const matchTutors = async (requestId, currentUserId) => {
  const request = await prisma.helpRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    const err = new Error("Help request not found");
    err.status = 404;
    throw err;
  }

  if (request.postedById !== currentUserId) {
    const err = new Error("Not authorized to match this request");
    err.status = 403;
    throw err;
  }

  const candidateTutors = await prisma.user.findMany({
    where: {
      isVerified: true,
      id: { not: request.postedById },
      OR: [
        { subjectExpertise: { some: { subject: { contains: request.subject, mode: "insensitive" } } } },
        { languagesSpoken: { has: request.preferredLanguage } },
      ],
    },
    include: {
      subjectExpertise: true,
      badges: { include: { badge: true } },
    },
    take: MAX_TUTORS_TO_SCORE,
  });

  const tutorProfiles = await prisma.tutorProfile.findMany({
    where: { userId: { in: candidateTutors.map((t) => t.id) } },
  });
  const profileByUser = new Map(tutorProfiles.map((p) => [p.userId, p]));

  const requestVector = await getOrCreateRequestEmbedding(request);

  const scored = [];

  for (const tutor of candidateTutors) {
    const tutorProfile = profileByUser.get(tutor.id);
    const tutorVector = await getOrCreateTutorEmbedding(tutor, tutorProfile);
    const topicScore = clamp01(cosineSimilarity(requestVector, tutorVector));

    if (topicScore < MIN_TOPIC_SIMILARITY) continue;

    const subjectScore = computeSubjectScore(request.subject, tutor, tutorProfile);
    const languageScore = computeLanguageScore(request.preferredLanguage, tutor, tutorProfile);

    const { finalScore, breakdown } = computeScores({
      subjectScore,
      topicScore,
      ratingScore: tutor.reputationScore,
      languageScore,
      experienceScore: tutor.totalSessionsTaught || tutorProfile?.totalSessions || 0,
      completionScore: tutorProfile?.completionRate,
      availabilityScore: computeAvailabilityScore(tutorProfile),
      responseScore: tutorProfile?.responseTime,
      learningStyleScore: computeLearningStyleScore(request, tutorProfile),
    });

    const confidence = clamp01(finalScore * 0.7 + topicScore * 0.3);

    scored.push({
      tutor,
      tutorProfile,
      finalScore,
      confidence,
      breakdown,
      matchReasons: buildMatchReasons({
        subjectScore,
        topicScore,
        languageScore,
        ratingScore: tutor.reputationScore,
        completionScore: tutorProfile?.completionRate,
        responseScore: tutorProfile?.responseTime ? 1 - Math.min(tutorProfile.responseTime / 180, 1) : 0.5,
        experienceScore: tutor.totalSessionsTaught || tutorProfile?.totalSessions || 0,
        tutor,
        tutorProfile,
      }),
      strengths: buildStrengths(tutor, tutorProfile),
    });
  }

  scored.sort((a, b) => b.finalScore - a.finalScore);

  return scored.slice(0, 10).map((match) => ({
    tutorId: match.tutor.id,
    compatibilityScore: match.finalScore,
    confidence: match.confidence,
    strengths: match.strengths,
    matchReasons: match.matchReasons,
    breakdown: match.breakdown,
    tutor: {
      id: match.tutor.id,
      name: match.tutor.name,
      profilePicture: match.tutor.profilePicture,
      reputationScore: match.tutor.reputationScore,
      totalSessionsTaught: match.tutor.totalSessionsTaught,
      languagesSpoken: match.tutor.languagesSpoken,
      subjectExpertise: match.tutor.subjectExpertise,
    },
  }));
};

module.exports = { matchTutors };
