import { MongoClient, type Db } from 'mongodb';

/**
 * MongoDB connection singleton for Next.js.
 *
 * WHY A SINGLETON?
 * ────────────────
 * In development, Next.js hot-reloads modules on every file change. Without
 * a singleton, each reload would create a NEW MongoClient, rapidly exhausting
 * the connection pool (MongoDB Atlas defaults to 100 connections max).
 *
 * The pattern stores the client promise on `globalThis` — a reference that
 * survives hot-module-replacement. In production, `globalThis` caching is a
 * no-op since modules are only loaded once.
 *
 * USAGE
 * ─────
 *   import { getDatabase } from '@/lib/db/mongodb';
 *   const db = await getDatabase();
 *   const users = await db.collection('users').find({}).toArray();
 */

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    '❌ MONGODB_URI is not defined.\n' +
      '   Copy .env.example to .env.local and set your MongoDB Atlas connection string.',
  );
}

/** Database name extracted from the connection string, or fallback. */
const DB_NAME =
  new URL(MONGODB_URI.replace('mongodb+srv://', 'https://')).pathname.slice(1) || 'project-pulse';

/** MongoClient options for production readiness. */
const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 60_000,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
};

/**
 * Extend `globalThis` to hold the cached connection promise.
 * This survives Next.js hot-module-replacement in development.
 */
const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

/** The MongoClient instance. */
const client = new MongoClient(MONGODB_URI, options);

/**
 * Cached client connection promise.
 *
 * - Development: stored on `globalThis` to survive hot reloads
 * - Production: module-level variable (modules load once)
 */
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development, reuse the global promise so hot-reload doesn't
  // create new connections on every file change.
  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalForMongo._mongoClientPromise;
} else {
  // In production, a single module-level promise is sufficient.
  clientPromise = client.connect();
}

/**
 * Returns a connected MongoClient instance.
 *
 * @example
 * const client = await getClient();
 * const session = client.startSession();
 */
export async function getClient(): Promise<MongoClient> {
  return clientPromise;
}

/**
 * Returns the default database connection.
 *
 * @example
 * const db = await getDatabase();
 * const users = await db.collection('users').find({}).toArray();
 */
export async function getDatabase(): Promise<Db> {
  const mongoClient = await clientPromise;
  return mongoClient.db(DB_NAME);
}

/**
 * Export the raw client promise for libraries that need it
 * (e.g., NextAuth.js MongoDB adapter).
 */
export { clientPromise };
