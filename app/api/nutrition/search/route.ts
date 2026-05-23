import { NextRequest, NextResponse } from 'next/server';
import { searchFoods } from '@/lib/services/nutrition.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const foods = await searchFoods(query);
    return NextResponse.json(foods);
  } catch (error) {
    console.error('Error in food search route:', error);
    return NextResponse.json({ error: 'Failed to search foods' }, { status: 500 });
  }
}
