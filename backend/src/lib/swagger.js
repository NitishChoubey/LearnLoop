const swaggerJsdoc = require("swagger-jsdoc");

const publicUrl = process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LearnLoop API",
      version: "1.0.0",
      description:
        "Peer-to-peer knowledge exchange platform. All protected routes require a Bearer JWT token obtained from `/api/auth/login` or `/api/auth/register`.",
      contact: { name: "LearnLoop Team" },
    },
    servers: [
      { url: publicUrl, description: process.env.NODE_ENV === "production" ? "Production" : "Local Development" },
      ...(process.env.NODE_ENV === "production" ? [{ url: "http://localhost:5000", description: "Local Development" }] : []),
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste the JWT token from login/register response",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: { message: { type: "string", example: "Something went wrong" } },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", example: "Alice Johnson" },
            email: { type: "string", example: "alice@example.com" },
            institutionEmail: { type: "string", example: "alice@university.edu" },
            isVerified: { type: "boolean" },
            knowledgeCredits: { type: "integer", example: 20 },
            reputationScore: { type: "number", example: 4.5 },
            teachingStreak: { type: "integer", example: 3 },
            totalSessionsTaught: { type: "integer", example: 12 },
            totalSessionsLearned: { type: "integer", example: 7 },
            bio: { type: "string", nullable: true },
            languagesSpoken: { type: "array", items: { type: "string" }, example: ["English", "Hindi"] },
            profilePicture: { type: "string", nullable: true },
          },
        },
        HelpRequest: {
          type: "object",
          properties: {
            id: { type: "string" },
            subject: { type: "string", example: "Computer Science" },
            topic: { type: "string", example: "Binary Search Tree insertion" },
            description: { type: "string" },
            preferredLanguage: { type: "string", example: "English" },
            urgencyLevel: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
            sessionDuration: { type: "integer", example: 60 },
            creditCost: { type: "integer", example: 3 },
            status: { type: "string", enum: ["OPEN", "MATCHED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Session: {
          type: "object",
          properties: {
            id: { type: "string" },
            status: { type: "string", enum: ["SCHEDULED", "ACTIVE", "COMPLETED", "CANCELLED"] },
            startTime: { type: "string", format: "date-time", nullable: true },
            endTime: { type: "string", format: "date-time", nullable: true },
            creditsTransferred: { type: "integer", nullable: true },
            sessionNotes: { type: "string", nullable: true },
          },
        },
        CreditTransaction: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string", enum: ["EARNED", "SPENT", "BONUS"] },
            amount: { type: "integer", example: 5 },
            reason: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        Notification: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string", enum: ["MATCH_FOUND", "SESSION_STARTING", "CREDITS_EARNED", "BADGE_UNLOCKED"] },
            message: { type: "string" },
            isRead: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Registration, login, OTP verification" },
      { name: "Users", description: "Profiles and leaderboard" },
      { name: "Requests", description: "Help request board operations" },
      { name: "Sessions", description: "Session lifecycle management" },
      { name: "Credits", description: "Credit balance and transaction history" },
      { name: "Notifications", description: "User notification management" },
      { name: "Health", description: "Server health check" },
    ],
    paths: {
      // ---------- HEALTH ----------
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Server health check",
          security: [],
          responses: {
            200: { description: "Server is running", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "ok" }, timestamp: { type: "string" } } } } } },
          },
        },
      },

      // ---------- AUTH ----------
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          description: "Creates account, deducts 0 credits (grants 20), sends OTP to institution email.",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password", "institutionEmail"],
                  properties: {
                    name: { type: "string", example: "Alice Johnson" },
                    email: { type: "string", example: "alice@example.com" },
                    password: { type: "string", minLength: 8, example: "password123" },
                    institutionEmail: { type: "string", example: "alice@university.edu" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Registered successfully — OTP sent to institution email", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, token: { type: "string" }, user: { $ref: "#/components/schemas/User" } } } } } },
            400: { description: "Missing fields or weak password", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            409: { description: "Email already registered", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login with email & password",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", example: "alice@example.com" },
                    password: { type: "string", example: "password123" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, token: { type: "string", description: "Use this in Authorization: Bearer <token>" }, user: { $ref: "#/components/schemas/User" } } } } } },
            401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/auth/verify-otp": {
        post: {
          tags: ["Auth"],
          summary: "Verify institution email with 6-digit OTP",
          description: "Requires Bearer token from register/login.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", required: ["otp"], properties: { otp: { type: "string", example: "123456", minLength: 6, maxLength: 6 } } },
              },
            },
          },
          responses: {
            200: { description: "Email verified successfully" },
            400: { description: "Invalid or expired OTP" },
          },
        },
      },
      "/api/auth/resend-otp": {
        post: {
          tags: ["Auth"],
          summary: "Resend OTP to institution email",
          responses: {
            200: { description: "New OTP sent" },
            400: { description: "Email already verified" },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current authenticated user",
          responses: {
            200: { description: "Current user profile", content: { "application/json": { schema: { type: "object", properties: { user: { $ref: "#/components/schemas/User" } } } } } },
            401: { description: "Unauthorized" },
          },
        },
      },

      // ---------- USERS ----------
      "/api/users/leaderboard": {
        get: {
          tags: ["Users"],
          summary: "Get tutor leaderboard",
          security: [],
          parameters: [
            { name: "subject", in: "query", schema: { type: "string" }, description: "Filter by subject", example: "Computer Science" },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 }, description: "Max results" },
          ],
          responses: {
            200: { description: "Ranked list of tutors", content: { "application/json": { schema: { type: "object", properties: { users: { type: "array", items: { $ref: "#/components/schemas/User" } } } } } } },
          },
        },
      },
      "/api/users/profile": {
        put: {
          tags: ["Users"],
          summary: "Update own profile",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Alice Johnson" },
                    bio: { type: "string", example: "CS student passionate about algorithms." },
                    languagesSpoken: { type: "array", items: { type: "string" }, example: ["English", "Hindi"] },
                    profilePicture: { type: "string", example: "https://example.com/avatar.jpg" },
                    subjectExpertise: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          subject: { type: "string", example: "Algorithms" },
                          level: { type: "string", enum: ["Beginner", "Intermediate", "Advanced", "Expert"] },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Updated user profile" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/users/{id}": {
        get: {
          tags: ["Users"],
          summary: "Get public profile of any user",
          security: [],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" }],
          responses: {
            200: { description: "Public user profile with sessions and badges" },
            404: { description: "User not found" },
          },
        },
      },

      // ---------- REQUESTS ----------
      "/api/requests": {
        get: {
          tags: ["Requests"],
          summary: "Get all help requests (board)",
          parameters: [
            { name: "status", in: "query", schema: { type: "string", enum: ["OPEN", "MATCHED", "IN_PROGRESS", "COMPLETED", "CANCELLED"], default: "OPEN" } },
            { name: "subject", in: "query", schema: { type: "string" }, example: "Mathematics" },
            { name: "urgency", in: "query", schema: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] } },
            { name: "language", in: "query", schema: { type: "string" }, example: "English" },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 12 } },
          ],
          responses: {
            200: {
              description: "Paginated help requests",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      requests: { type: "array", items: { $ref: "#/components/schemas/HelpRequest" } },
                      total: { type: "integer" },
                      page: { type: "integer" },
                      pages: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Requests"],
          summary: "Post a new help request",
          description: "Requires verified account. Credits are deducted immediately into escrow.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["subject", "topic", "description", "preferredLanguage", "urgencyLevel", "sessionDuration"],
                  properties: {
                    subject: { type: "string", example: "Computer Science" },
                    topic: { type: "string", example: "Binary Search Tree insertion" },
                    description: { type: "string", example: "I'm confused about how BST deletion works with two children." },
                    preferredLanguage: { type: "string", example: "English" },
                    urgencyLevel: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], example: "MEDIUM" },
                    sessionDuration: { type: "integer", enum: [30, 60, 90], example: 60 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Request created and credits deducted", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, request: { $ref: "#/components/schemas/HelpRequest" } } } } } },
            400: { description: "Missing fields or insufficient credits" },
            403: { description: "Email not verified" },
          },
        },
      },
      "/api/requests/my": {
        get: {
          tags: ["Requests"],
          summary: "Get all requests posted by the current user",
          responses: {
            200: { description: "User's own requests with session info" },
          },
        },
      },
      "/api/requests/{id}": {
        get: {
          tags: ["Requests"],
          summary: "Get a single help request by ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Help request detail" },
            404: { description: "Not found" },
          },
        },
        delete: {
          tags: ["Requests"],
          summary: "Cancel a help request (full credit refund)",
          description: "Only owner can cancel. Only OPEN or MATCHED requests can be cancelled.",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Cancelled and credits refunded" },
            400: { description: "Cannot cancel in-progress or completed request" },
            403: { description: "Not your request" },
          },
        },
      },
      "/api/requests/{id}/assign": {
        put: {
          tags: ["Requests"],
          summary: "Accept a request as tutor",
          description: "Requires verified account. Creates a session automatically.",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Request accepted and session created", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, session: { $ref: "#/components/schemas/Session" } } } } } },
            400: { description: "Request no longer available or own request" },
            403: { description: "Email not verified" },
          },
        },
      },
      "/api/requests/{id}/matches": {
        get: {
          tags: ["Requests"],
          summary: "Get AI-matched tutors for a request",
          description: "Returns top 3 matched tutors scored by subject expertise (40%), reputation (30%), language match (30%).",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Scored and ranked tutor matches", content: { "application/json": { schema: { type: "object", properties: { tutors: { type: "array", items: { allOf: [{ $ref: "#/components/schemas/User" }, { type: "object", properties: { matchScore: { type: "integer", example: 87 }, subjectSessionCount: { type: "integer", example: 5 } } }] } } } } } } },
            404: { description: "Request not found" },
          },
        },
      },

      // ---------- SESSIONS ----------
      "/api/sessions/my": {
        get: {
          tags: ["Sessions"],
          summary: "Get all sessions for the current user (as tutor or learner)",
          responses: {
            200: { description: "Sessions list", content: { "application/json": { schema: { type: "object", properties: { sessions: { type: "array", items: { $ref: "#/components/schemas/Session" } } } } } } },
          },
        },
      },
      "/api/sessions/{id}": {
        get: {
          tags: ["Sessions"],
          summary: "Get session details by ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Full session with participants and feedback" },
            403: { description: "Access denied — not a participant" },
            404: { description: "Session not found" },
          },
        },
      },
      "/api/sessions/{id}/start": {
        put: {
          tags: ["Sessions"],
          summary: "Start a session (tutor only)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Session started, status set to ACTIVE" },
            403: { description: "Only the tutor can start the session" },
          },
        },
      },
      "/api/sessions/{id}/end": {
        put: {
          tags: ["Sessions"],
          summary: "End a session and transfer credits to tutor",
          description: "Tutor earns 90% of the request's credit cost. Both users' stats are updated.",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: { type: "object", properties: { sessionNotes: { type: "string", example: "Covered BST insertion, deletion, and traversal." } } },
              },
            },
          },
          responses: {
            200: { description: "Session ended, credits transferred", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, creditsEarned: { type: "integer", example: 4 } } } } } },
            400: { description: "Session is not active" },
          },
        },
      },
      "/api/sessions/{id}/rate": {
        post: {
          tags: ["Sessions"],
          summary: "Rate a completed session",
          description: "Both tutor and learner can rate. Each can only rate once.",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["rating"],
                  properties: {
                    rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
                    comment: { type: "string", example: "Excellent explanation, very patient!" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Feedback submitted and tutor reputation updated" },
            400: { description: "Session not completed or already rated" },
          },
        },
      },
      "/api/sessions/{id}/notes": {
        post: {
          tags: ["Sessions"],
          summary: "Save shared whiteboard/session notes",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", required: ["sessionNotes"], properties: { sessionNotes: { type: "string", example: "Key formula: T(n) = 2T(n/2) + O(n)" } } },
              },
            },
          },
          responses: {
            200: { description: "Notes saved" },
            403: { description: "Access denied" },
          },
        },
      },

      // ---------- CREDITS ----------
      "/api/credits/balance": {
        get: {
          tags: ["Credits"],
          summary: "Get current credit balance",
          responses: {
            200: { description: "Current balance", content: { "application/json": { schema: { type: "object", properties: { balance: { type: "integer", example: 17 } } } } } },
          },
        },
      },
      "/api/credits/history": {
        get: {
          tags: ["Credits"],
          summary: "Get full credit transaction history",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          ],
          responses: {
            200: {
              description: "Paginated transaction history with stats",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      transactions: { type: "array", items: { $ref: "#/components/schemas/CreditTransaction" } },
                      total: { type: "integer" },
                      stats: { type: "array", description: "Grouped totals by type (EARNED/SPENT/BONUS)" },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ---------- NOTIFICATIONS ----------
      "/api/notifications": {
        get: {
          tags: ["Notifications"],
          summary: "Get all notifications for current user",
          responses: {
            200: { description: "Notifications list with unread count", content: { "application/json": { schema: { type: "object", properties: { notifications: { type: "array", items: { $ref: "#/components/schemas/Notification" } }, unreadCount: { type: "integer", example: 3 } } } } } },
          },
        },
      },
      "/api/notifications/read": {
        put: {
          tags: ["Notifications"],
          summary: "Mark all notifications as read",
          responses: {
            200: { description: "All marked as read" },
          },
        },
      },
      "/api/notifications/{id}/read": {
        put: {
          tags: ["Notifications"],
          summary: "Mark a single notification as read",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Notification marked as read" },
            404: { description: "Notification not found" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
