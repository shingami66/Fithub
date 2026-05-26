import { NextRequest, NextResponse } from 'next/server';
import { searchFoods } from '@/lib/services/nutrition.service';
import { logger } from '@/lib/utils/logger';
import { normalizeFoodQuery } from '@/lib/utils/search-normalizers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') ?? searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const foods = await searchFoods(normalizeFoodQuery(query));
    return NextResponse.json(foods);
  } catch (error) {
    logger.errorFingerprint('USDA_API_UNAVAILABLE', 'Error in food search route', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'USDA FoodData Central is unavailable' }, { status: 502 });
  }
}
