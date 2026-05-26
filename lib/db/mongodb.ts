import { MongoClient, type Db, type MongoClientOptions } from 'mongodb';
import { logger } from '@/lib/utils/logger';

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
const options: MongoClientOptions = {
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

function shouldUseSrvFallback(uri: string, error: unknown) {
  if (!uri.startsWith('mongodb+srv://')) return false;
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('queryTxt') || message.includes('ETIMEOUT');
}

async function resolveDnsJson(name: string, type: 'SRV' | 'TXT') {
  const response = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
    { headers: { accept: 'application/dns-json' } },
  );

  if (!response.ok) {
    throw new Error(`DNS ${type} lookup failed`);
  }

  const data = (await response.json()) as {
    Status?: number;
    Answer?: { type: number; data: string }[];
  };

  if (data.Status !== 0 || !Array.isArray(data.Answer)) {
    throw new Error(`DNS ${type} lookup unavailable`);
  }

  return data.Answer;
}

async function buildStandardUriFromSrv(srvUri: string) {
  const parsed = new URL(srvUri.replace('mongodb+srv://', 'https://'));
  const clusterHost = parsed.hostname;
  const databaseName = parsed.pathname.slice(1) || DB_NAME;
  const [srvAnswers, txtAnswers] = await Promise.all([
    resolveDnsJson(`_mongodb._tcp.${clusterHost}`, 'SRV'),
    resolveDnsJson(clusterHost, 'TXT').catch(() => []),
  ]);

  const hosts = srvAnswers
    .filter((answer) => answer.type === 33)
    .map((answer) => {
      const [, , port, host] = answer.data.trim().split(/\s+/);
      return `${host.replace(/\.$/, '')}:${port}`;
    });

  if (hosts.length === 0) {
    throw new Error('MongoDB SRV hosts unavailable');
  }

  const params = new URLSearchParams(parsed.search);
  const txtRecord = txtAnswers.find((answer) => answer.type === 16)?.data?.replace(/^"|"$/g, '');
  if (txtRecord) {
    for (const pair of txtRecord.split('&')) {
      const [key, value] = pair.split('=');
      if (key && value && !params.has(key)) params.set(key, value);
    }
  }
  params.set('tls', 'true');

  return `mongodb://${parsed.username}:${parsed.password}@${hosts.join(',')}/${databaseName}?${params.toString()}`;
}

async function connectMongoClient(uri: string) {
  const client = new MongoClient(uri, options);

  try {
    return await client.connect();
  } catch (error) {
    if (!shouldUseSrvFallback(uri, error)) {
      throw error;
    }

    logger.warn('MongoDB SRV TXT lookup failed; retrying with DNS-over-HTTPS fallback.');
    await client.close().catch(() => undefined);
    const fallbackUri = await buildStandardUriFromSrv(uri);
    return new MongoClient(fallbackUri, options).connect();
  }
}

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
    globalForMongo._mongoClientPromise = connectMongoClient(MONGODB_URI);
  }
  clientPromise = globalForMongo._mongoClientPromise;
} else {
  // In production, a single module-level promise is sufficient.
  clientPromise = connectMongoClient(MONGODB_URI);
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
