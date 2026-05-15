require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./lib/swagger");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const requestRoutes = require("./routes/requests");
const sessionRoutes = require("./routes/sessions");
const creditRoutes = require("./routes/credits");
const notificationRoutes = require("./routes/notifications");
const aiRoutes = require("./routes/ai");

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const allowedOrigins = process.env.NODE_ENV === "production"
  ? true
  : [process.env.FRONTEND_URL || "http://localhost:5173", "http://localhost:5173", "http://localhost:3000"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/credits", creditRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "LearnLoop API Docs",
  customCss: `.swagger-ui .topbar { background: #1a5276; } .swagger-ui .topbar-wrapper img { content: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 30%22><text y=%2222%22 font-size=%2220%22 font-weight=%22bold%22 fill=%22white%22 font-family=%22sans-serif%22>LearnLoop</text></svg>'); width: 120px; }`,
  swaggerOptions: { persistAuthorization: true, displayRequestDuration: true, docExpansion: "list", filter: true },
}));

app.get("/api/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "learnloop-api" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

// ---------- Socket.io — Session Room ----------
const sessionRooms = new Map();

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join_session", ({ sessionId, userId, userName }) => {
    socket.join(sessionId);

    if (!sessionRooms.has(sessionId)) {
      sessionRooms.set(sessionId, { participants: [] });
    }
    const room = sessionRooms.get(sessionId);
    const existing = room.participants.find((p) => p.userId === userId);
    if (!existing) {
      room.participants.push({ userId, userName, socketId: socket.id });
    }

    socket.to(sessionId).emit("user_joined", { userId, userName });
    io.to(sessionId).emit("room_participants", room.participants);

    console.log(`${userName} joined session ${sessionId}`);
  });

  socket.on("chat_message", ({ sessionId, userId, userName, message, timestamp }) => {
    io.to(sessionId).emit("chat_message", { userId, userName, message, timestamp });
  });

  socket.on("whiteboard_update", ({ sessionId, content }) => {
    socket.to(sessionId).emit("whiteboard_update", { content });
  });

  socket.on("session_started", ({ sessionId }) => {
    io.to(sessionId).emit("session_started", { startTime: new Date().toISOString() });
  });

  socket.on("session_ended", ({ sessionId }) => {
    io.to(sessionId).emit("session_ended", { endTime: new Date().toISOString() });
  });

  socket.on("typing", ({ sessionId, userId, userName }) => {
    socket.to(sessionId).emit("typing", { userId, userName });
  });

  socket.on("stop_typing", ({ sessionId, userId }) => {
    socket.to(sessionId).emit("stop_typing", { userId });
  });

  socket.on("disconnect", () => {
    sessionRooms.forEach((room, sessionId) => {
      const idx = room.participants.findIndex((p) => p.socketId === socket.id);
      if (idx !== -1) {
        const [removed] = room.participants.splice(idx, 1);
        socket.to(sessionId).emit("user_left", { userId: removed.userId, userName: removed.userName });
        io.to(sessionId).emit("room_participants", room.participants);
      }
    });
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 LearnLoop server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📖 Swagger docs: http://localhost:${PORT}/api/docs\n`);
});
