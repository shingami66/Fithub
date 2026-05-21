import { NextResponse } from 'next/server';
import { ExerciseService } from '@/lib/services/exercise.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const results = await ExerciseService.searchExercises(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('API Error searching exercises:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
