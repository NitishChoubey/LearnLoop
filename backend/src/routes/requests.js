const express = require("express");
const prisma = require("../lib/prisma");
const { protect, requireVerified } = require("../middleware/auth");
const { matchTutors } = require("../ai/matchingService");

const router = express.Router();

const URGENCY_MULTIPLIERS = { LOW: 1, MEDIUM: 1.5, HIGH: 2, URGENT: 3 };

const calculateCreditCost = (sessionDuration, urgencyLevel) => {
  const multiplier = URGENCY_MULTIPLIERS[urgencyLevel] || 1;
  return Math.ceil((sessionDuration / 30) * multiplier);
};

// GET /api/requests — all open requests with filters
router.get("/", protect, async (req, res) => {
  try {
    const { subject, urgency, language, status = "OPEN", page = 1, limit = 12 } = req.query;

    const where = {
      ...(status && { status }),
      ...(subject && { subject: { contains: subject, mode: "insensitive" } }),
      ...(urgency && { urgencyLevel: urgency }),
      ...(language && { preferredLanguage: { contains: language, mode: "insensitive" } }),
    };

    const [requests, total] = await Promise.all([
      prisma.helpRequest.findMany({
        where,
        include: {
          postedBy: {
            select: { id: true, name: true, profilePicture: true, reputationScore: true },
          },
        },
        orderBy: [{ urgencyLevel: "desc" }, { createdAt: "desc" }],
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.helpRequest.count({ where }),
    ]);

    res.json({ requests, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/requests/my — current user's requests
router.get("/my", protect, async (req, res) => {
  try {
    const requests = await prisma.helpRequest.findMany({
      where: { postedById: req.user.id },
      include: {
        session: {
          include: {
            tutor: { select: { id: true, name: true, profilePicture: true, reputationScore: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ requests });
  } catch (error) {
    console.error("My requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/requests/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const request = await prisma.helpRequest.findUnique({
      where: { id: req.params.id },
      include: {
        postedBy: {
          select: { id: true, name: true, profilePicture: true, reputationScore: true, languagesSpoken: true },
        },
        session: {
          include: {
            tutor: { select: { id: true, name: true, profilePicture: true, reputationScore: true } },
          },
        },
      },
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({ request });
  } catch (error) {
    console.error("Get request error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/requests — create a new help request
router.post("/", protect, requireVerified, async (req, res) => {
  try {
    const { subject, topic, description, preferredLanguage, urgencyLevel, sessionDuration } = req.body;

    if (!subject || !topic || !description || !preferredLanguage || !urgencyLevel || !sessionDuration) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const creditCost = calculateCreditCost(parseInt(sessionDuration), urgencyLevel);

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user.knowledgeCredits < creditCost) {
      return res.status(400).json({
        message: `Insufficient credits. You need ${creditCost} credits but have ${user.knowledgeCredits}.`,
      });
    }

    const [request] = await prisma.$transaction([
      prisma.helpRequest.create({
        data: {
          subject,
          topic,
          description,
          preferredLanguage,
          urgencyLevel,
          sessionDuration: parseInt(sessionDuration),
          creditCost,
          postedById: req.user.id,
          status: "OPEN",
        },
        include: {
          postedBy: { select: { id: true, name: true, profilePicture: true } },
        },
      }),
      prisma.user.update({
        where: { id: req.user.id },
        data: { knowledgeCredits: { decrement: creditCost } },
      }),
      prisma.creditTransaction.create({
        data: {
          type: "SPENT",
          amount: creditCost,
          reason: `Credits held in escrow for help request: ${topic}`,
          userId: req.user.id,
        },
      }),
    ]);

    let matches = [];
    let matchError = null;
    try {
      matches = await matchTutors(request.id, req.user.id);
    } catch (err) {
      matchError = err.message || "AI match failed";
    }

    res.status(201).json({
      message: "Help request posted successfully",
      request,
      matches,
      matchError,
    });
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/requests/:id/assign — tutor accepts request
router.put("/:id/assign", protect, requireVerified, async (req, res) => {
  try {
    const request = await prisma.helpRequest.findUnique({
      where: { id: req.params.id },
      include: { postedBy: true },
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (request.status !== "OPEN") {
      return res.status(400).json({ message: "This request is no longer available" });
    }
    if (request.postedById === req.user.id) {
      return res.status(400).json({ message: "You cannot accept your own request" });
    }

    const [updatedRequest, session] = await prisma.$transaction([
      prisma.helpRequest.update({
        where: { id: req.params.id },
        data: { status: "MATCHED", assignedTutorId: req.user.id },
      }),
      prisma.session.create({
        data: {
          helpRequestId: req.params.id,
          tutorId: req.user.id,
          learnerId: request.postedById,
          status: "SCHEDULED",
        },
      }),
      prisma.notification.create({
        data: {
          userId: request.postedById,
          type: "MATCH_FOUND",
          message: `A tutor has accepted your request: "${request.topic}"`,
        },
      }),
    ]);

    res.json({
      message: "Request accepted! Session created.",
      request: updatedRequest,
      session,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Assign request error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/requests/:id — cancel request
router.delete("/:id", protect, async (req, res) => {
  try {
    const request = await prisma.helpRequest.findUnique({ where: { id: req.params.id } });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (request.postedById !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this request" });
    }
    if (!["OPEN", "MATCHED"].includes(request.status)) {
      return res.status(400).json({ message: "Cannot cancel a request that is in progress or completed" });
    }

    const linkedSession = await prisma.session.findUnique({
      where: { helpRequestId: req.params.id },
    });

    const ops = [
      prisma.helpRequest.update({
        where: { id: req.params.id },
        data: { status: "CANCELLED" },
      }),
      prisma.user.update({
        where: { id: req.user.id },
        data: { knowledgeCredits: { increment: request.creditCost } },
      }),
      prisma.creditTransaction.create({
        data: {
          type: "BONUS",
          amount: request.creditCost,
          reason: `Refund: cancelled request "${request.topic}"`,
          userId: req.user.id,
        },
      }),
    ];

    if (linkedSession && ["SCHEDULED", "ACTIVE"].includes(linkedSession.status)) {
      ops.unshift(
        prisma.session.update({
          where: { id: linkedSession.id },
          data: { status: "CANCELLED" },
        })
      );
    }

    await prisma.$transaction(ops);

    res.json({ message: "Request cancelled. Credits refunded." });
  } catch (error) {
    console.error("Cancel request error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/requests/:id/matches — get matched tutors
router.get("/:id/matches", protect, async (req, res) => {
  try {
    const request = await prisma.helpRequest.findUnique({ where: { id: req.params.id } });
    if (!request) return res.status(404).json({ message: "Request not found" });

    const tutors = await prisma.user.findMany({
      where: {
        isVerified: true,
        id: { not: request.postedById },
        subjectExpertise: { some: { subject: { contains: request.subject, mode: "insensitive" } } },
      },
      select: {
        id: true,
        name: true,
        profilePicture: true,
        reputationScore: true,
        totalSessionsTaught: true,
        languagesSpoken: true,
        subjectExpertise: true,
        badges: { include: { badge: true } },
        sessionsAsTutor: {
          where: { status: "COMPLETED", helpRequest: { subject: { contains: request.subject, mode: "insensitive" } } },
          select: { id: true },
        },
      },
    });

    const scoredTutors = tutors
      .map((tutor) => {
        const subjectSessions = tutor.sessionsAsTutor.length;
        const languageMatch = tutor.languagesSpoken.some(
          (l) => l.toLowerCase() === request.preferredLanguage.toLowerCase()
        )
          ? 1
          : 0;
        const reputationScore = (tutor.reputationScore / 5) * 0.3;
        const subjectScore = Math.min(subjectSessions / 10, 1) * 0.4;
        const langScore = languageMatch * 0.3;
        const matchScore = Math.round((reputationScore + subjectScore + langScore) * 100);

        return { ...tutor, matchScore, subjectSessionCount: subjectSessions };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    res.json({ tutors: scoredTutors });
  } catch (error) {
    console.error("Match tutors error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
