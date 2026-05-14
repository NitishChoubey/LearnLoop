const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

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

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice Johnson",
      email: "alice@example.com",
      password,
      institutionEmail: "alice@university.edu",
      isVerified: true,
      knowledgeCredits: 85,
      reputationScore: 4.8,
      teachingStreak: 7,
      totalSessionsTaught: 24,
      totalSessionsLearned: 5,
      bio: "CS senior passionate about algorithms and data structures.",
      languagesSpoken: ["English", "Spanish"],
      subjectExpertise: {
        create: [
          { subject: "Data Structures", level: "Expert" },
          { subject: "Algorithms", level: "Advanced" },
          { subject: "Python", level: "Expert" },
        ],
      },
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Bob Smith",
      email: "bob@example.com",
      password,
      institutionEmail: "bob@university.edu",
      isVerified: true,
      knowledgeCredits: 40,
      reputationScore: 4.2,
      teachingStreak: 2,
      totalSessionsTaught: 8,
      totalSessionsLearned: 12,
      bio: "Sophomore studying Mathematics and Computer Science.",
      languagesSpoken: ["English"],
      subjectExpertise: {
        create: [
          { subject: "Calculus", level: "Advanced" },
          { subject: "Linear Algebra", level: "Intermediate" },
        ],
      },
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: "carol@example.com" },
    update: {},
    create: {
      name: "Carol Davis",
      email: "carol@example.com",
      password,
      institutionEmail: "carol@university.edu",
      isVerified: true,
      knowledgeCredits: 120,
      reputationScore: 4.9,
      teachingStreak: 15,
      totalSessionsTaught: 45,
      totalSessionsLearned: 3,
      bio: "Graduate student in ML. Love explaining complex topics simply.",
      languagesSpoken: ["English", "French"],
      subjectExpertise: {
        create: [
          { subject: "Machine Learning", level: "Expert" },
          { subject: "Statistics", level: "Expert" },
          { subject: "Python", level: "Expert" },
        ],
      },
    },
  });

  await prisma.helpRequest.createMany({
    skipDuplicates: true,
    data: [
      {
        subject: "Data Structures",
        topic: "Binary Search Trees",
        description: "Need help understanding BST insertion and deletion with real examples.",
        preferredLanguage: "English",
        urgencyLevel: "HIGH",
        sessionDuration: 60,
        creditCost: 8,
        status: "OPEN",
        postedById: bob.id,
      },
      {
        subject: "Machine Learning",
        topic: "Gradient Descent",
        description: "Confused about learning rate tuning and when to use momentum.",
        preferredLanguage: "English",
        urgencyLevel: "MEDIUM",
        sessionDuration: 90,
        creditCost: 9,
        status: "OPEN",
        postedById: bob.id,
      },
      {
        subject: "Calculus",
        topic: "Integration by Parts",
        description: "Struggling with integration by parts for complex expressions.",
        preferredLanguage: "English",
        urgencyLevel: "LOW",
        sessionDuration: 45,
        creditCost: 3,
        status: "OPEN",
        postedById: carol.id,
      },
    ],
  });

  console.log("✅ Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
