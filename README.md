# LearnLoop — Learn. Teach. Grow Together.

A peer-to-peer knowledge exchange platform where students help each other using a **Knowledge Credit System** instead of money.

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database running locally
- A Gmail account with App Password (for OTP emails)

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Copy and fill in your environment variables:
```bash
copy .env.example .env
```

Edit `.env` with your values:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/learnloop"
JWT_SECRET="any-long-random-string"
MAIL_USER=your-gmail@gmail.com
MAIL_PASS=your-gmail-app-password
```

> **Gmail App Password**: Google Account → Security → 2-Step Verification → App Passwords

Run the Prisma migration and seed:
```bash
npm run db:migrate     # creates tables
npm run db:generate    # generates Prisma client
npm run db:seed        # seeds demo users and data
```

Start the backend:
```bash
npm run dev            # starts on http://localhost:5000
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Copy env file (default proxies to localhost:5000 — no changes needed for local dev):
```bash
copy .env.example .env
```

Start the frontend:
```bash
npm run dev            # starts on http://localhost:5173
```

---

## Demo Accounts (after seeding)

| Email | Password | Role |
|-------|----------|------|
| alice@example.com | password123 | Expert Tutor (CS/Python) |
| bob@example.com | password123 | Student + Math Tutor |
| carol@example.com | password123 | Top Tutor (ML/Stats) |

---

## Project Structure

```
LearnLoop/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.js             # Demo data seeder
│   └── src/
│       ├── lib/
│       │   ├── prisma.js       # Prisma client singleton
│       │   └── mailer.js       # Nodemailer OTP sender
│       ├── middleware/
│       │   └── auth.js         # JWT protect + requireVerified
│       ├── routes/
│       │   ├── auth.js         # Register, Login, OTP, Me
│       │   ├── users.js        # Profiles, Leaderboard
│       │   ├── requests.js     # Help requests + matching
│       │   ├── sessions.js     # Session lifecycle + ratings
│       │   ├── credits.js      # Balance + history
│       │   └── notifications.js
│       └── server.js           # Express + Socket.io
│
└── frontend/
    └── src/
        ├── lib/
        │   ├── api.js          # Axios instance
        │   └── socket.js       # Socket.io client
        ├── store/
        │   ├── useAuthStore.js
        │   └── useNotificationStore.js
        ├── components/
        │   ├── Layout.jsx      # Sidebar + nav
        │   ├── RequestCard.jsx
        │   ├── TutorCard.jsx
        │   ├── CreditBadge.jsx
        │   ├── BadgeDisplay.jsx
        │   ├── SessionTimer.jsx
        │   └── LeaderboardRow.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── VerifyOtpPage.jsx
            ├── DashboardPage.jsx
            ├── RequestBoardPage.jsx
            ├── PostRequestPage.jsx
            ├── MyRequestsPage.jsx
            ├── SessionRoomPage.jsx
            ├── TutorProfilePage.jsx
            ├── MyProfilePage.jsx
            ├── LeaderboardPage.jsx
            ├── NotificationsPage.jsx
            └── CreditWalletPage.jsx
```

---

## Key Features

- **Knowledge Credit System** — Escrow-based credit deduction + `Prisma.$transaction` atomicity
- **Smart Tutor Matching** — Rule-based scoring: subject expertise (40%) + reputation (30%) + language (30%)
- **Live Session Room** — Socket.io real-time chat + shared whiteboard + session timer
- **Gamification** — Badges, teaching streaks, leaderboard
- **OTP Verification** — Institution email verified via 6-digit OTP (Nodemailer)
- **Full Auth** — JWT with `protect` + `requireVerified` middleware

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| State | Zustand |
| Routing | React Router v6 |
| Backend | Node.js + Express.js |
| Database | PostgreSQL + Prisma ORM |
| Real-time | Socket.io |
| Auth | JWT + bcryptjs |
| Email | Nodemailer |
