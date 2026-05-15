const express = require("express");
const { protect } = require("../middleware/auth");
const { matchTutors } = require("../ai/matchingService");

const router = express.Router();

// POST /api/ai/match
router.post("/match", protect, async (req, res) => {
  try {
    const { requestId } = req.body || {};
    if (!requestId) {
      return res.status(400).json({ success: false, message: "requestId is required" });
    }

    const matches = await matchTutors(requestId, req.user.id);
    return res.json({ success: true, matches });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || "AI match failed" });
  }
});

module.exports = router;
