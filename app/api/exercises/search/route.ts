import { NextResponse } from 'next/server';
import { ExerciseService } from '@/lib/services/exercise.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const muscle = searchParams.get('muscle');

    if (muscle) {
      // Map generic tabs to bodyParts or target muscles
      const bodyPartMapping: Record<string, string> = {
        chest: 'chest',
        back: 'back',
        legs: 'upper legs',
        shoulders: 'shoulders',
        arms: 'upper arms',
      };

      const mappedPart = bodyPartMapping[muscle.toLowerCase()];
      if (mappedPart) {
        const results = await ExerciseService.getExercisesByBodyPart(mappedPart);
        return NextResponse.json(results);
      } else {
        const results = await ExerciseService.getExercisesByMuscle(muscle);
        return NextResponse.json(results);
      }
    }

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
