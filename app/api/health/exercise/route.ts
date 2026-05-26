import { NextResponse } from 'next/server';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // We use a lightweight endpoint (e.g. fetching body parts list)
    // to verify the RapidAPI ExerciseDB connection without heavy payload.
    const url = `https://${env.RAPIDAPI_HOST}/exercises/bodyPartList`;

    const res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': env.RAPIDAPI_HOST,
      },
      // Short timeout for health checks
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      logger.errorFingerprint('EXERCISE_API_UNAVAILABLE', 'ExerciseDB API health check failed', {
        status: res.status,
        statusText: res.statusText,
      });
      return NextResponse.json(
        { ok: false, error: 'ExerciseDB connection failed' },
        { status: 502 },
      );
    }

    // Attempt to parse just to be absolutely sure the response is valid JSON
    await res.json();

    return NextResponse.json({ ok: true, provider: 'ExerciseDB' });
  } catch (error) {
    logger.errorFingerprint('EXERCISE_API_UNAVAILABLE', 'ExerciseDB health check failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: false, error: 'ExerciseDB connection failed' }, { status: 503 });
  }
}
