import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });

    return NextResponse.json({
      ok: true,
      database: db.databaseName,
    });
  } catch (error) {
    logger.error('Database health check failed', error);
    return NextResponse.json({ ok: false, error: 'Database unavailable' }, { status: 503 });
  }
}
