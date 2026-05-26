import { readFileSync, writeFileSync, mkdirSync } from 'fs';
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

const isApply = process.argv.includes('--apply');

async function runMigration() {
  console.log('=========================================');
  console.log(' NUTRITION MIGRATION APPLY');
  console.log('=========================================');
  console.log('Database:', DB_NAME);
  console.log('Mode:', isApply ? 'APPLY (Writes enabled)' : 'DRY RUN (No writes)');
  console.log('-----------------------------------------');

  const client = new MongoClient(MONGODB_URI as string);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const logsCollection = db.collection('nutrition_logs');

    const logs = await logsCollection.find({}).toArray();

    let totalLogsScanned = 0;
    let totalEntriesScanned = 0;
    let alreadyMigrated = 0;
    let entriesMigrated = 0;
    let entriesSkipped = 0;
    let suspiciousSkipped = 0;

    const backupData: Record<string, unknown>[] = [];

    // Filter logs that need update
    const logsToUpdate = [];

    for (const log of logs) {
      totalLogsScanned++;
      if (!Array.isArray(log.entries)) continue;

      let logNeedsUpdate = false;
      const updatedEntries = [];
      const originalEntriesBackup = [];

      for (const entry of log.entries) {
        totalEntriesScanned++;

        if (entry.nutrientsPer100g) {
          alreadyMigrated++;
          updatedEntries.push(entry);
          originalEntriesBackup.push(entry);
          continue;
        }

        let isReconstructable = true;

        if (!entry.id || !entry.name) {
          isReconstructable = false;
        } else if (
          typeof entry.grams !== 'number' ||
          entry.grams <= 0 ||
          !Number.isFinite(entry.grams)
        ) {
          isReconstructable = false;
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
        } else {
          // Calculate macros
          const calcPer100 = (macro: number) => (macro / entry.grams) * 100;
          const cal100 = calcPer100(entry.calories);

          if (cal100 > 900 || cal100 < 1) {
            isReconstructable = false;
            suspiciousSkipped++;
          }
        }

        if (isReconstructable) {
          const calcPer100 = (macro: number) => (macro / entry.grams) * 100;
          const newNutrientsPer100g: Record<string, number> = {
            calories: Number(calcPer100(entry.calories).toFixed(1)),
            protein: Number(calcPer100(entry.protein).toFixed(1)),
            carbs: Number(calcPer100(entry.carbs).toFixed(1)),
            fat: Number(calcPer100(entry.fat).toFixed(1)),
          };

          if (typeof entry.fiber === 'number' && entry.fiber >= 0) {
            newNutrientsPer100g.fiber = Number(calcPer100(entry.fiber).toFixed(1));
          }
          if (typeof entry.sodium === 'number' && entry.sodium >= 0) {
            newNutrientsPer100g.sodium = Number(calcPer100(entry.sodium).toFixed(1));
          }

          updatedEntries.push({
            ...entry,
            nutrientsPer100g: newNutrientsPer100g,
          });
          originalEntriesBackup.push(entry);

          logNeedsUpdate = true;
          entriesMigrated++;
        } else {
          updatedEntries.push(entry);
          originalEntriesBackup.push(entry);
          entriesSkipped++;
        }
      }

      if (logNeedsUpdate) {
        logsToUpdate.push({
          logId: log._id,
          updatedEntries,
        });

        // Add to backup payload
        backupData.push({
          logId: log._id,
          // Mask user ID
          userId: '***',
          date: log.date,
          mealType: log.mealType,
          originalEntries: originalEntriesBackup,
        });
      }
    }

    let backupPath = 'None';

    if (logsToUpdate.length > 0) {
      // Create backup directory
      const backupDir = join(process.cwd(), 'scripts', 'migration-backups');
      try {
        mkdirSync(backupDir, { recursive: true });
      } catch {}

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      backupPath = join(backupDir, `backup-${timestamp}.json`);
      writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');
      console.log(`Backup saved to: ${backupPath}`);
    }

    if (isApply && logsToUpdate.length > 0) {
      console.log(`Applying updates to ${logsToUpdate.length} logs...`);
      for (const update of logsToUpdate) {
        await logsCollection.updateOne(
          { _id: update.logId },
          { $set: { entries: update.updatedEntries } },
        );
      }
      console.log('Updates completed successfully.');
    }

    console.log(`\n--- SUMMARY ---`);
    console.log(`Logs scanned:                 ${totalLogsScanned}`);
    console.log(`Entries scanned:              ${totalEntriesScanned}`);
    console.log(`Entries already migrated:     ${alreadyMigrated}`);
    console.log(`Entries migrated:             ${entriesMigrated}`);
    console.log(`Entries skipped:              ${entriesSkipped}`);
    console.log(`Suspicious entries skipped:   ${suspiciousSkipped}`);
    console.log(`Backup file path:             ${backupPath}`);

    if (isApply) {
      console.log(`\nCONFIRMATION: DB WRITES OCCURRED.`);
    } else {
      console.log(`\nCONFIRMATION: NO DB WRITES OCCURRED (Missing --apply flag).`);
    }
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    await client.close();
  }
}

runMigration();
