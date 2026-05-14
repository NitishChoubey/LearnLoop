const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { sendOTPEmail } = require("../lib/mailer");
const { protect } = require("../middleware/auth");

const router = express.Router();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, institutionEmail } = req.body;

    if (!name || !email || !password || !institutionEmail) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { institutionEmail }] },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ message: "Email already registered" });
      }
      return res.status(409).json({ message: "Institution email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        institutionEmail,
        otpCode: otp,
        otpExpiry,
        knowledgeCredits: 20,
      },
    });

    await sendOTPEmail(institutionEmail, otp);

    const token = signToken(user.id);

    res.status(201).json({
      message: "Registration successful. Check your institution email for the OTP.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        institutionEmail: user.institutionEmail,
        isVerified: user.isVerified,
        knowledgeCredits: user.knowledgeCredits,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", protect, async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (!user.otpCode || !user.otpExpiry) {
      return res.status(400).json({ message: "No pending OTP. Please request a new one." });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, otpCode: null, otpExpiry: null },
    });

    res.json({ message: "Email verified successfully! You now have full access." });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
});

// POST /api/auth/resend-otp
router.post("/resend-otp", protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: otp, otpExpiry },
    });

    await sendOTPEmail(user.institutionEmail, otp);

    res.json({ message: "New OTP sent to your institution email." });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { subjectExpertise: true, badges: { include: { badge: true } } },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user.id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        institutionEmail: user.institutionEmail,
        isVerified: user.isVerified,
        knowledgeCredits: user.knowledgeCredits,
        reputationScore: user.reputationScore,
        teachingStreak: user.teachingStreak,
        totalSessionsTaught: user.totalSessionsTaught,
        totalSessionsLearned: user.totalSessionsLearned,
        profilePicture: user.profilePicture,
        bio: user.bio,
        languagesSpoken: user.languagesSpoken,
        subjectExpertise: user.subjectExpertise,
        badges: user.badges,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        subjectExpertise: true,
        badges: { include: { badge: true } },
        _count: {
          select: {
            helpRequestsPosted: true,
            sessionsAsTutor: true,
            sessionsAsLearner: true,
          },
        },
      },
    });

    const { password, otpCode, otpExpiry, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
