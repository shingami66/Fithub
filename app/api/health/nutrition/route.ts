import { NextResponse } from 'next/server';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // We use a lightweight endpoint (e.g. searching for a single food item "apple")
    // to verify the USDA FoodData Central connection.
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=apple&api_key=${env.USDA_API_KEY}&pageSize=1`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000), // Short timeout for health checks
    });

    if (!res.ok) {
      logger.errorFingerprint('USDA_API_UNAVAILABLE', 'USDA API health check failed', {
        status: res.status,
        statusText: res.statusText,
      });
      return NextResponse.json(
        { ok: false, error: 'USDA FoodData Central connection failed' },
        { status: 502 },
      );
    }

    await res.json();

    return NextResponse.json({ ok: true, provider: 'USDA FoodData Central' });
  } catch (error) {
    logger.errorFingerprint('USDA_API_UNAVAILABLE', 'USDA health check failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { ok: false, error: 'USDA FoodData Central connection failed' },
      { status: 503 },
    );
  }
}
