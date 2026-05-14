const express = require("express");
const prisma = require("../lib/prisma");
const { protect } = require("../middleware/auth");

const router = express.Router();

// GET /api/credits/balance
router.get("/balance", protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { knowledgeCredits: true },
    });

    res.json({ balance: user.knowledgeCredits });
  } catch (error) {
    console.error("Balance error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/credits/history
router.get("/history", protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where: { userId: req.user.id },
        include: {
          relatedSession: {
            include: { helpRequest: { select: { subject: true, topic: true } } },
          },
        },
        orderBy: { timestamp: "desc" },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.creditTransaction.count({ where: { userId: req.user.id } }),
    ]);

    const stats = await prisma.creditTransaction.groupBy({
      by: ["type"],
      where: { userId: req.user.id },
      _sum: { amount: true },
    });

    res.json({ transactions, total, stats });
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
