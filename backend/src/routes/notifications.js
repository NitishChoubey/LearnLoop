const express = require("express");
const prisma = require("../lib/prisma");
const { protect } = require("../middleware/auth");

const router = express.Router();

// GET /api/notifications
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Notifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/notifications/read — mark all as read
router.put("/read", protect, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/notifications/:id/read — mark single as read
router.put("/:id/read", protect, async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id, userId: req.user.id },
      data: { isRead: true },
    });

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark single read error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
