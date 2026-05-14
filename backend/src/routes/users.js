const express = require("express");
const prisma = require("../lib/prisma");
const { protect } = require("../middleware/auth");

const router = express.Router();

// GET /api/users/leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const { subject, limit = 20 } = req.query;

    const where = subject
      ? { subjectExpertise: { some: { subject: { contains: subject, mode: "insensitive" } } } }
      : {};

    const users = await prisma.user.findMany({
      where: { isVerified: true, totalSessionsTaught: { gt: 0 }, ...where },
      select: {
        id: true,
        name: true,
        profilePicture: true,
        reputationScore: true,
        totalSessionsTaught: true,
        knowledgeCredits: true,
        teachingStreak: true,
        subjectExpertise: true,
        badges: { include: { badge: true } },
      },
      orderBy: [{ reputationScore: "desc" }, { totalSessionsTaught: "desc" }],
      take: parseInt(limit),
    });

    res.json({ users });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/users/:id — public profile
router.get("/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        bio: true,
        profilePicture: true,
        reputationScore: true,
        teachingStreak: true,
        totalSessionsTaught: true,
        totalSessionsLearned: true,
        languagesSpoken: true,
        createdAt: true,
        subjectExpertise: true,
        badges: { include: { badge: true } },
        sessionsAsTutor: {
          where: { status: "COMPLETED" },
          select: {
            id: true,
            createdAt: true,
            helpRequest: { select: { subject: true, topic: true } },
            feedbackFromLearner: { select: { rating: true, comment: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/users/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, bio, languagesSpoken, profilePicture, subjectExpertise } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(languagesSpoken && { languagesSpoken }),
        ...(profilePicture && { profilePicture }),
      },
    });

    if (subjectExpertise && Array.isArray(subjectExpertise)) {
      await prisma.subjectExpertise.deleteMany({ where: { userId: req.user.id } });
      await prisma.subjectExpertise.createMany({
        data: subjectExpertise.map((s) => ({ ...s, userId: req.user.id })),
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { subjectExpertise: true, badges: { include: { badge: true } } },
    });

    const { password, otpCode, otpExpiry, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
