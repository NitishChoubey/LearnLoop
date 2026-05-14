const express = require("express");
const prisma = require("../lib/prisma");
const { protect } = require("../middleware/auth");

const router = express.Router();

const checkAndAwardBadges = async (tutorId) => {
  const tutor = await prisma.user.findUnique({
    where: { id: tutorId },
    include: { badges: { include: { badge: true } } },
  });

  const existingBadgeNames = tutor.badges.map((b) => b.badge.name);
  const badgesToAward = [];

  if (tutor.totalSessionsTaught >= 1 && !existingBadgeNames.includes("First Teach")) {
    badgesToAward.push("First Teach");
  }
  if (tutor.totalSessionsTaught >= 5 && !existingBadgeNames.includes("Knowledge Sharer")) {
    badgesToAward.push("Knowledge Sharer");
  }

  for (const badgeName of badgesToAward) {
    const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
    if (badge) {
      await prisma.userBadge.create({ data: { userId: tutorId, badgeId: badge.id } });
      await prisma.notification.create({
        data: {
          userId: tutorId,
          type: "BADGE_UNLOCKED",
          message: `You earned the "${badgeName}" badge! 🎉`,
        },
      });
    }
  }
};

// GET /api/sessions/my — all sessions for current user
router.get("/my", protect, async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        OR: [{ tutorId: req.user.id }, { learnerId: req.user.id }],
      },
      include: {
        helpRequest: { select: { subject: true, topic: true, creditCost: true } },
        tutor: { select: { id: true, name: true, profilePicture: true } },
        learner: { select: { id: true, name: true, profilePicture: true } },
        feedbackFromLearner: true,
        feedbackFromTutor: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ sessions });
  } catch (error) {
    console.error("My sessions error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/sessions/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: {
        helpRequest: true,
        tutor: { select: { id: true, name: true, profilePicture: true, reputationScore: true, subjectExpertise: true } },
        learner: { select: { id: true, name: true, profilePicture: true } },
        feedbackFromLearner: true,
        feedbackFromTutor: true,
      },
    });

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.tutorId !== req.user.id && session.learnerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ session });
  } catch (error) {
    console.error("Get session error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/sessions/:id/start
router.put("/:id/start", protect, async (req, res) => {
  try {
    const session = await prisma.session.findUnique({ where: { id: req.params.id } });
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.tutorId !== req.user.id) return res.status(403).json({ message: "Only the tutor can start the session" });

    const updated = await prisma.session.update({
      where: { id: req.params.id },
      data: { status: "ACTIVE", startTime: new Date() },
    });

    await prisma.helpRequest.update({
      where: { id: session.helpRequestId },
      data: { status: "IN_PROGRESS" },
    });

    res.json({ session: updated });
  } catch (error) {
    console.error("Start session error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/sessions/:id/end
router.put("/:id/end", protect, async (req, res) => {
  try {
    const { sessionNotes } = req.body;
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: { helpRequest: true },
    });

    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.tutorId !== req.user.id && session.learnerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (session.status !== "ACTIVE") {
      return res.status(400).json({ message: "Session is not active" });
    }

    const creditsEarned = Math.floor(session.helpRequest.creditCost * 0.9);

    await prisma.$transaction([
      prisma.session.update({
        where: { id: req.params.id },
        data: {
          status: "COMPLETED",
          endTime: new Date(),
          creditsTransferred: creditsEarned,
          ...(sessionNotes && { sessionNotes }),
        },
      }),
      prisma.helpRequest.update({
        where: { id: session.helpRequestId },
        data: { status: "COMPLETED" },
      }),
      prisma.user.update({
        where: { id: session.tutorId },
        data: {
          knowledgeCredits: { increment: creditsEarned },
          totalSessionsTaught: { increment: 1 },
        },
      }),
      prisma.user.update({
        where: { id: session.learnerId },
        data: { totalSessionsLearned: { increment: 1 } },
      }),
      prisma.creditTransaction.create({
        data: {
          type: "EARNED",
          amount: creditsEarned,
          reason: `Credits earned for tutoring: ${session.helpRequest.topic}`,
          userId: session.tutorId,
          relatedSessionId: session.id,
        },
      }),
      prisma.notification.create({
        data: {
          userId: session.tutorId,
          type: "CREDITS_EARNED",
          message: `You earned ${creditsEarned} credits for your tutoring session!`,
        },
      }),
    ]);

    await checkAndAwardBadges(session.tutorId);

    res.json({ message: "Session ended. Credits transferred.", creditsEarned });
  } catch (error) {
    console.error("End session error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/sessions/:id/rate
router.post("/:id/rate", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: { feedbackFromLearner: true, feedbackFromTutor: true },
    });

    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.status !== "COMPLETED") {
      return res.status(400).json({ message: "Can only rate completed sessions" });
    }

    const isLearner = session.learnerId === req.user.id;
    const isTutor = session.tutorId === req.user.id;

    if (!isLearner && !isTutor) return res.status(403).json({ message: "Access denied" });

    if (isLearner && session.feedbackFromLearner) {
      return res.status(400).json({ message: "You have already rated this session" });
    }
    if (isTutor && session.feedbackFromTutor) {
      return res.status(400).json({ message: "You have already rated this session" });
    }

    if (isLearner) {
      await prisma.feedback.create({ data: { rating, comment, learnerSessionId: session.id } });
    } else {
      await prisma.feedback.create({ data: { rating, comment, tutorSessionId: session.id } });
    }

    const allFeedback = await prisma.feedback.findMany({
      where: { OR: [{ learnerSessionId: { not: null } }, { tutorSessionId: { not: null } }] },
      select: { rating: true, learnerSessionId: true },
    });

    const tutorFeedback = await prisma.feedback.findMany({
      where: { learnerSession: { tutorId: session.tutorId } },
      select: { rating: true },
    });

    if (tutorFeedback.length > 0) {
      const avgRating = tutorFeedback.reduce((sum, f) => sum + f.rating, 0) / tutorFeedback.length;
      await prisma.user.update({
        where: { id: session.tutorId },
        data: { reputationScore: parseFloat(avgRating.toFixed(2)) },
      });
    }

    res.json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Rate session error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/sessions/:id/notes
router.post("/:id/notes", protect, async (req, res) => {
  try {
    const { sessionNotes } = req.body;
    const session = await prisma.session.findUnique({ where: { id: req.params.id } });
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.tutorId !== req.user.id && session.learnerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updated = await prisma.session.update({
      where: { id: req.params.id },
      data: { sessionNotes },
    });

    res.json({ session: updated });
  } catch (error) {
    console.error("Save notes error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
