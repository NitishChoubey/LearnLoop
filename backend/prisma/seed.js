const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const SEED_TOPIC_PREFIX = "[Seed] ";

async function main() {
  const badges = [
    { name: "First Teach", description: "Completed your first tutoring session", icon: "🎓" },
    { name: "Knowledge Sharer", description: "Taught 5 sessions as a tutor", icon: "📚" },
    { name: "Top Contributor", description: "Reached top 10 on the leaderboard", icon: "🏆" },
    { name: "Speed Helper", description: "Accepted an URGENT request within 5 minutes", icon: "⚡" },
    { name: "Subject Expert", description: "Taught 10 sessions in the same subject", icon: "🌟" },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
  }

  const password = await bcrypt.hash("password123", 10);

  const demoPeople = [
    { name: "Alice Johnson", email: "alice@example.com", institutionEmail: "alice@university.edu", bio: "CS senior — algorithms, Python, and interview prep.", languages: ["English", "Spanish"], expertise: [{ subject: "Computer Science", level: "Expert" }, { subject: "Algorithms", level: "Expert" }, { subject: "Python", level: "Expert" }], credits: 120, rep: 4.85, taught: 28, learned: 6, streak: 9 },
    { name: "Bob Smith", email: "bob@example.com", institutionEmail: "bob@university.edu", bio: "Math & stats — love breaking down proofs.", languages: ["English"], expertise: [{ subject: "Mathematics", level: "Advanced" }, { subject: "Statistics", level: "Advanced" }], credits: 55, rep: 4.35, taught: 12, learned: 15, streak: 3 },
    { name: "Carol Davis", email: "carol@example.com", institutionEmail: "carol@university.edu", bio: "ML grad student. I explain like you are five (sometimes).", languages: ["English", "French"], expertise: [{ subject: "Machine Learning", level: "Expert" }, { subject: "Statistics", level: "Expert" }], credits: 140, rep: 4.92, taught: 52, learned: 4, streak: 18 },
    { name: "Dev Patel", email: "dev@example.com", institutionEmail: "dev@campus.edu", bio: "Physics major, robotics club.", languages: ["English", "Hindi"], expertise: [{ subject: "Physics", level: "Advanced" }, { subject: "Mathematics", level: "Intermediate" }], credits: 72, rep: 4.5, taught: 19, learned: 8, streak: 5 },
    { name: "Elena Rossi", email: "elena@example.com", institutionEmail: "elena@campus.edu", bio: "Chemistry TA — orgo and thermo.", languages: ["English", "Italian"], expertise: [{ subject: "Chemistry", level: "Expert" }, { subject: "Biology", level: "Intermediate" }], credits: 95, rep: 4.7, taught: 31, learned: 5, streak: 11 },
    { name: "Marcus Webb", email: "marcus@example.com", institutionEmail: "marcus@campus.edu", bio: "Full-stack web and databases.", languages: ["English"], expertise: [{ subject: "Computer Science", level: "Advanced" }, { subject: "Data Science", level: "Advanced" }], credits: 68, rep: 4.4, taught: 16, learned: 11, streak: 2 },
    { name: "Priya Nair", email: "priya@example.com", institutionEmail: "priya@campus.edu", bio: "Econometrics + game theory nerd.", languages: ["English", "Hindi"], expertise: [{ subject: "Economics", level: "Advanced" }, { subject: "Statistics", level: "Expert" }], credits: 88, rep: 4.6, taught: 22, learned: 7, streak: 6 },
    { name: "Jordan Lee", email: "jordan@example.com", institutionEmail: "jordan@campus.edu", bio: "Literature & writing coach.", languages: ["English", "Mandarin"], expertise: [{ subject: "Literature", level: "Expert" }, { subject: "History", level: "Intermediate" }], credits: 61, rep: 4.55, taught: 14, learned: 9, streak: 4 },
    { name: "Sam Okonkwo", email: "sam@example.com", institutionEmail: "sam@campus.edu", bio: "Biology + MCAT study strategies.", languages: ["English"], expertise: [{ subject: "Biology", level: "Expert" }, { subject: "Chemistry", level: "Advanced" }], credits: 102, rep: 4.78, taught: 35, learned: 3, streak: 14 },
    { name: "Taylor Kim", email: "taylor@example.com", institutionEmail: "taylor@campus.edu", bio: "Calculus workshops every weekend.", languages: ["English", "Korean"], expertise: [{ subject: "Mathematics", level: "Expert" }, { subject: "Physics", level: "Intermediate" }], credits: 77, rep: 4.62, taught: 24, learned: 6, streak: 8 },
    { name: "Riley Chen", email: "riley@example.com", institutionEmail: "riley@campus.edu", bio: "React, TypeScript, system design basics.", languages: ["English", "Mandarin"], expertise: [{ subject: "Computer Science", level: "Advanced" }, { subject: "Machine Learning", level: "Intermediate" }], credits: 54, rep: 4.25, taught: 10, learned: 14, streak: 1 },
    { name: "Avery Brooks", email: "avery@example.com", institutionEmail: "avery@campus.edu", bio: "History essays + research methods.", languages: ["English"], expertise: [{ subject: "History", level: "Expert" }, { subject: "Literature", level: "Advanced" }], credits: 49, rep: 4.2, taught: 9, learned: 12, streak: 0 },
  ];

  const users = [];
  for (const p of demoPeople) {
    const u = await prisma.user.upsert({
      where: { email: p.email },
      update: {
        name: p.name,
        knowledgeCredits: p.credits,
        reputationScore: p.rep,
        totalSessionsTaught: p.taught,
        totalSessionsLearned: p.learned,
        teachingStreak: p.streak,
        bio: p.bio,
        languagesSpoken: p.languages,
        isVerified: true,
      },
      create: {
        name: p.name,
        email: p.email,
        password,
        institutionEmail: p.institutionEmail,
        isVerified: true,
        knowledgeCredits: p.credits,
        reputationScore: p.rep,
        totalSessionsTaught: p.taught,
        totalSessionsLearned: p.learned,
        teachingStreak: p.streak,
        bio: p.bio,
        languagesSpoken: p.languages,
        subjectExpertise: { create: p.expertise },
      },
      include: { subjectExpertise: true },
    });
    if (!u.subjectExpertise?.length && p.expertise?.length) {
      await prisma.subjectExpertise.createMany({
        data: p.expertise.map((e) => ({ ...e, userId: u.id })),
      });
    }
    users.push(
      u.subjectExpertise?.length
        ? u
        : await prisma.user.findUnique({ where: { id: u.id }, include: { subjectExpertise: true } })
    );
  }

  const byEmail = (e) => users.find((u) => u.email === e);
  const alice = byEmail("alice@example.com");
  const bob = byEmail("bob@example.com");

  const existingSeed = await prisma.helpRequest.findMany({
    where: { topic: { startsWith: SEED_TOPIC_PREFIX } },
    select: { id: true },
  });
  if (existingSeed.length) {
    const ids = existingSeed.map((r) => r.id);
    await prisma.session.deleteMany({ where: { helpRequestId: { in: ids } } });
    await prisma.helpRequest.deleteMany({ where: { id: { in: ids } } });
  }

  const posterIds = users.map((u) => u.id);
  const urgencies = ["LOW", "MEDIUM", "HIGH", "URGENT"];
  const langs = ["English", "Hindi", "Spanish", "French"];

  const requestBlueprints = [
    { subject: "Computer Science", topic: "Recursion vs iteration in C++", desc: "Need someone to walk through classic recursion problems and when to prefer stacks.", dur: 45, cost: 4 },
    { subject: "Mathematics", topic: "Integration by parts — tabular method", desc: "Struggling with repeated integration by parts for trig products.", dur: 60, cost: 5 },
    { subject: "Physics", topic: "Rotational kinematics", desc: "Angular acceleration and moment of inertia intuition.", dur: 50, cost: 5 },
    { subject: "Machine Learning", topic: "Bias–variance tradeoff", desc: "Want a clean explanation with a small example dataset.", dur: 40, cost: 4 },
    { subject: "Chemistry", topic: "Resonance structures in orgo", desc: "How to pick major contributors for resonance hybrids.", dur: 55, cost: 6 },
    { subject: "Statistics", topic: "Hypothesis testing p-values", desc: "Common misconceptions and how to explain results in a report.", dur: 35, cost: 3 },
    { subject: "Economics", topic: "Nash equilibrium basics", desc: "2×2 games and dominant strategies — exam in two days.", dur: 45, cost: 5 },
    { subject: "Literature", topic: "Thesis statements for comparative essays", desc: "AP Lit — comparing two poems under time pressure.", dur: 40, cost: 3 },
    { subject: "Biology", topic: "Central dogma & transcription factors", desc: "Connecting ChIP-seq idea without heavy math.", dur: 50, cost: 5 },
    { subject: "Data Science", topic: "SQL window functions", desc: "ROW_NUMBER vs RANK vs DENSE_RANK with examples.", dur: 40, cost: 4 },
    { subject: "Algorithms", topic: "Dijkstra vs Bellman–Ford", desc: "When negative edges break Dijkstra — need step-by-step.", dur: 55, cost: 6 },
    { subject: "Mathematics", topic: "Class 10 trigonometry identities", desc: "Proofs of sin(A+B) and practice applying them.", dur: 30, cost: 2 },
    { subject: "Computer Science", topic: "Git rebase vs merge", desc: "Team workflow — scared of losing commits with rebase.", dur: 25, cost: 2 },
    { subject: "Physics", topic: "Lens maker formula", desc: "Sign conventions and quick numerical drills.", dur: 35, cost: 3 },
    { subject: "Machine Learning", topic: "Cross-validation strategies", desc: "K-fold vs stratified for imbalanced labels.", dur: 45, cost: 5 },
    { subject: "Chemistry", topic: "Titration curves weak acid–strong base", desc: "Half-equivalence and buffer regions.", dur: 50, cost: 5 },
    { subject: "History", topic: "Cold War timelines for essay", desc: "Need a coherent narrative arc for a 1500-word paper.", dur: 60, cost: 5 },
    { subject: "Computer Science", topic: "Big-O for nested loops", desc: "How to count loops with early breaks and log factors.", dur: 40, cost: 4 },
    { subject: "Mathematics", topic: "Eigenvalues 2×2 matrices", desc: "Characteristic polynomial shortcut and geometric meaning.", dur: 45, cost: 4 },
    { subject: "Statistics", topic: "Confidence intervals vs credible intervals", desc: "Bayesian vs frequentist — high level for a stats seminar.", dur: 50, cost: 5 },
    { subject: "Biology", topic: "Photosynthesis light reactions", desc: "Z-scheme simplified with analogies.", dur: 40, cost: 4 },
    { subject: "Data Science", topic: "Pandas merge vs join", desc: "Left join duplicates confusing me on real CSVs.", dur: 35, cost: 3 },
    { subject: "Algorithms", topic: "Dynamic programming on grids", desc: "Unique paths and minimal path sum — template thinking.", dur: 55, cost: 6 },
    { subject: "Economics", topic: "Price elasticity of demand", desc: "Midpoint formula and interpretation on graphs.", dur: 30, cost: 2 },
  ];

  const helpRows = requestBlueprints.map((b, i) => ({
    subject: b.subject,
    topic: `${SEED_TOPIC_PREFIX}${b.topic}`,
    description: b.desc,
    preferredLanguage: langs[i % langs.length],
    urgencyLevel: urgencies[i % urgencies.length],
    sessionDuration: b.dur,
    creditCost: b.cost,
    status: "OPEN",
    postedById: posterIds[i % posterIds.length],
  }));

  await prisma.helpRequest.createMany({ data: helpRows });

  await prisma.notification.deleteMany({
    where: {
      userId: alice.id,
      message: { contains: "Demo notification" },
    },
  });

  await prisma.notification.createMany({
    data: [
      { userId: alice.id, type: "MATCH_FOUND", message: "Demo notification: A tutor accepted your request on \"[Seed] Recursion vs iteration in C++\"." },
      { userId: alice.id, type: "CREDITS_EARNED", message: "Demo notification: You earned 8 credits for a completed tutoring session." },
      { userId: alice.id, type: "BADGE_UNLOCKED", message: "Demo notification: You earned the \"Knowledge Sharer\" badge." },
      { userId: bob.id, type: "SESSION_STARTING", message: "Demo notification: Your session on statistics starts soon." },
      { userId: bob.id, type: "CREDITS_EARNED", message: "Demo notification: +5 credits added after a learner rated your session." },
    ],
  });

  const txUsers = [alice.id, bob.id, byEmail("carol@example.com").id].filter(Boolean);
  for (const uid of txUsers) {
    await prisma.creditTransaction.deleteMany({
      where: { userId: uid, reason: { contains: "[Seed]" } },
    });
  }

  await prisma.creditTransaction.createMany({
    data: [
      { userId: alice.id, type: "EARNED", amount: 8, reason: "[Seed] Credits earned — tutoring: Dynamic programming intro" },
      { userId: alice.id, type: "SPENT", amount: 5, reason: "[Seed] Credits held — help request: ML cross-validation" },
      { userId: alice.id, type: "BONUS", amount: 10, reason: "[Seed] Welcome bonus — campus pilot program" },
      { userId: bob.id, type: "EARNED", amount: 6, reason: "[Seed] Credits earned — tutoring: Integration workshop" },
      { userId: bob.id, type: "SPENT", amount: 4, reason: "[Seed] Credits held — help request: Physics rotation" },
      { userId: byEmail("carol@example.com").id, type: "EARNED", amount: 12, reason: "[Seed] Credits earned — tutoring: Stats seminar prep" },
    ],
  });

  console.log(`✅ Database seeded: ${users.length} demo users, ${helpRows.length} open [Seed] requests, demo notifications & credit lines.`);
  console.log("   Log in: alice@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
