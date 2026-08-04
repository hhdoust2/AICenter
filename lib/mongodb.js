import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "groq_bot";

if (!uri) {
  console.warn("MONGODB_URI تنظیم نشده است - ربات تلگرام کار نخواهد کرد.");
}

// در محیط سرورلس (Vercel) اتصال باید بین اجراهای مختلف کش شود
// تا هر بار یک اتصال جدید به Mongo باز نشود.
let cachedClient = global._mongoClient;
let cachedPromise = global._mongoClientPromise;

function getClientPromise() {
  if (cachedPromise) return cachedPromise;
  const client = new MongoClient(uri);
  cachedPromise = client.connect();
  global._mongoClientPromise = cachedPromise;
  return cachedPromise;
}

export async function getDb() {
  const client = await getClientPromise();
  return client.db(dbName);
}

export async function getUsersCollection() {
  const db = await getDb();
  return db.collection("users");
}
