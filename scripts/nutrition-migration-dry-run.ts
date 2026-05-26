import { readFileSync } from 'fs';
import { join } from 'path';
import { MongoClient } from 'mongodb';

// Load .env.local manually
try {
  const envPath = join(process.cwd(), '.env.local');
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = process.env[key] || value;
    }
  });
} catch {
  // Ignore missing .env.local
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is missing. Set it or provide .env.local');
  process.exit(1);
}

const DB_NAME =
  new URL(MONGODB_URI.replace('mongodb+srv://', 'https://')).pathname.slice(1) || 'project-pulse';

async function runDryRun() {
  console.log('=========================================');
  console.log(' NUTRITION MIGRATION DRY-RUN');
  console.log('=========================================');
  console.log('Database:', DB_NAME);

  const client = new MongoClient(MONGODB_URI as string);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const logsCollection = db.collection('nutrition_logs');

    const logs = await logsCollection.find({}).toArray();

    let totalLogsScanned = 0;
    let totalEntriesScanned = 0;
    let alreadyMigrated = 0;
    let missingNutrients = 0;
    let reconstructableCount = 0;
    let notReconstructableCount = 0;
    let suspiciousCalorieCount = 0;

    const sampleReconstructable = [];
    const sampleNotReconstructable = [];
    const reasonsMap = new Map<string, number>();

    for (const log of logs) {
      totalLogsScanned++;
      if (!Array.isArray(log.entries)) continue;

      for (const entry of log.entries) {
        totalEntriesScanned++;

        if (entry.nutrientsPer100g) {
          alreadyMigrated++;
          continue;
        }

        missingNutrients++;

        let isReconstructable = true;
        let reason = '';

        // Rules
        if (!entry.id || !entry.name) {
          isReconstructable = false;
          reason = 'Missing id or name';
        } else if (
          typeof entry.grams !== 'number' ||
          entry.grams <= 0 ||
          !Number.isFinite(entry.grams)
        ) {
          isReconstructable = false;
          reason = 'Invalid or missing grams';
        } else if (
          typeof entry.calories !== 'number' ||
          entry.calories < 0 ||
          !Number.isFinite(entry.calories) ||
          typeof entry.protein !== 'number' ||
          entry.protein < 0 ||
          !Number.isFinite(entry.protein) ||
          typeof entry.carbs !== 'number' ||
          entry.carbs < 0 ||
          !Number.isFinite(entry.carbs) ||
          typeof entry.fat !== 'number' ||
          entry.fat < 0 ||
          !Number.isFinite(entry.fat)
        ) {
          isReconstructable = false;
          reason = 'Missing or invalid macros';
        } else {
          // Calculate macros
          const calcPer100 = (macro: number) => (macro / entry.grams) * 100;
          const cal100 = calcPer100(entry.calories);

          if (cal100 > 900 || cal100 < 1) {
            isReconstructable = false;
            reason = 'Suspicious caloriesPer100g (' + cal100.toFixed(1) + ')';
            suspiciousCalorieCount++;
          }
        }

        if (isReconstructable) {
          reconstructableCount++;
          if (sampleReconstructable.length < 10) {
            sampleReconstructable.push({
              name: entry.name,
              grams: entry.grams,
              calories: entry.calories,
              reconstructedCaloriesPer100g: Number(
                ((entry.calories / entry.grams) * 100).toFixed(1),
              ),
            });
          }
        } else {
          notReconstructableCount++;
          reasonsMap.set(reason, (reasonsMap.get(reason) || 0) + 1);
          if (sampleNotReconstructable.length < 10) {
            sampleNotReconstructable.push({
              name: entry.name,
              reason,
              grams: entry.grams,
              calories: entry.calories,
            });
          }
        }
      }
    }

    console.log(`\n--- SUMMARY ---`);
    console.log(`Total logs scanned:             ${totalLogsScanned}`);
    console.log(`Total entries scanned:          ${totalEntriesScanned}`);
    console.log(`Already migrated (has nut/100g):${alreadyMigrated}`);
    console.log(`Missing nutrientsPer100g:       ${missingNutrients}`);
    console.log(`  - Reconstructable:            ${reconstructableCount}`);
    console.log(`  - Not reconstructable:        ${notReconstructableCount}`);
    console.log(`    (Suspicious calorie count:  ${suspiciousCalorieCount})`);

    console.log(`\n--- REASONS FOR NOT RECONSTRUCTABLE ---`);
    for (const [r, count] of Array.from(reasonsMap.entries())) {
      console.log(`- ${r}: ${count}`);
    }

    console.log(`\n--- SAMPLE RECONSTRUCTABLE (Max 10) ---`);
    console.log(sampleReconstructable.length > 0 ? sampleReconstructable : 'None');

    console.log(`\n--- SAMPLE NOT RECONSTRUCTABLE (Max 10) ---`);
    console.log(sampleNotReconstructable.length > 0 ? sampleNotReconstructable : 'None');

    console.log('\nNOTE: This was a dry-run. No database writes occurred.');
  } catch (err) {
    console.error('Error during dry run:', err);
  } finally {
    await client.close();
  }
}

runDryRun();
