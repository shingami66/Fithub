import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { MongoClient } from 'mongodb';

const CONFIRM_FLAG = '--confirm-demo-reset';
const DEMO_COLLECTIONS = [
  'userProfiles',
  'nutrition_logs',
  'workout_sessions',
  'exercise_entries',
  'exercise_sets',
  'food_entries',
];

if (!process.argv.includes(CONFIRM_FLAG)) {
  console.error(`Refusing to reset demo data. Re-run with ${CONFIRM_FLAG}.`);
  process.exit(1);
}

if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
  console.error('Refusing to reset demo data in a production environment.');
  process.exit(1);
}

loadLocalEnv();

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGODB_URI is missing.');
  process.exit(1);
}

async function main(uri: string) {
  const dbName =
    new URL(uri.replace('mongodb+srv://', 'https://')).pathname.slice(1) || 'project-pulse';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    for (const collectionName of DEMO_COLLECTIONS) {
      const result = await db.collection(collectionName).deleteMany({});
      console.log(`${collectionName}: deleted ${result.deletedCount} document(s)`);
    }
  } finally {
    await client.close();
  }
}

function loadLocalEnv() {
  const envPath = join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
    if (!match) continue;

    const key = match[1].trim();
    const value = match[2].trim().replace(/^"|"$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

main(mongoUri).catch((error) => {
  console.error(error instanceof Error ? error.message : 'Demo reset failed.');
  process.exitCode = 1;
});
