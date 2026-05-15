const crypto = require("crypto");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const prisma = require("../lib/prisma");
const { EMBEDDING_MODEL } = require("./aiConfig");

let geminiClient = null;

const getGeminiClient = () => {
  if (!geminiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return geminiClient;
};

const hashText = (text) => crypto.createHash("sha256").update(text).digest("hex");

const buildRequestText = (request) => {
  return [
    `Subject: ${request.subject}`,
    `Topic: ${request.topic}`,
    `Description: ${request.description || ""}`,
    `Preferred language: ${request.preferredLanguage}`,
    `Urgency: ${request.urgencyLevel}`,
    `Duration: ${request.sessionDuration} minutes`,
  ].join("\n");
};

const buildTutorText = (tutor, tutorProfile) => {
  const subjects = tutor.subjectExpertise?.map((s) => s.subject).join(", ") || "";
  const topics = tutorProfile?.expertiseTopics?.join(", ") || "";
  const badges = tutor.badges?.map((b) => b.badge?.name).filter(Boolean).join(", ") || "";
  const languages = tutor.languagesSpoken?.join(", ") || tutorProfile?.languages?.join(", ") || "";
  const bio = tutor.bio || "";
  const style = tutorProfile?.learningStyle || "";

  return [
    `Subjects: ${subjects}`,
    `Topics: ${topics}`,
    `Badges: ${badges}`,
    `Languages: ${languages}`,
    `Learning style: ${style}`,
    `Bio: ${bio}`,
  ].join("\n");
};

const createEmbedding = async (text) => {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: EMBEDDING_MODEL });
  const response = await model.embedContent(text);
  return response.embedding.values;
};

const getOrCreateRequestEmbedding = async (request) => {
  const text = buildRequestText(request);
  const textHash = hashText(text);

  const existing = await prisma.requestEmbedding.findUnique({
    where: { requestId: request.id },
  });

  if (existing && existing.textHash === textHash && existing.model === EMBEDDING_MODEL) {
    return existing.vector;
  }

  const vector = await createEmbedding(text);

  await prisma.requestEmbedding.upsert({
    where: { requestId: request.id },
    create: { requestId: request.id, model: EMBEDDING_MODEL, textHash, vector },
    update: { model: EMBEDDING_MODEL, textHash, vector },
  });

  return vector;
};

const getOrCreateTutorEmbedding = async (tutor, tutorProfile) => {
  const text = buildTutorText(tutor, tutorProfile);
  const textHash = hashText(text);

  const existing = await prisma.tutorEmbedding.findUnique({
    where: { userId: tutor.id },
  });

  if (existing && existing.textHash === textHash && existing.model === EMBEDDING_MODEL) {
    return existing.vector;
  }

  const vector = await createEmbedding(text);

  await prisma.tutorEmbedding.upsert({
    where: { userId: tutor.id },
    create: { userId: tutor.id, model: EMBEDDING_MODEL, textHash, vector },
    update: { model: EMBEDDING_MODEL, textHash, vector },
  });

  return vector;
};

module.exports = {
  buildRequestText,
  buildTutorText,
  getOrCreateRequestEmbedding,
  getOrCreateTutorEmbedding,
  hashText,
};
