import { NextResponse } from 'next/server';
import { ExerciseService } from '@/lib/services/exercise.service';
import { normalizeExerciseQuery } from '@/lib/utils/search-normalizers';
import { logger } from '@/lib/utils/logger';
import { MUSCLE_TAB_MAPPING, TARGETS, BODY_PARTS } from '@/lib/utils/exercise-muscle-map';
import type { Exercise } from '@/types/exercise';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const muscle = searchParams.get('muscle');

    // Handle generic tab requests (like chest, back, legs, arms, shoulders)
    if (muscle) {
      const normalizedMuscle = muscle.toLowerCase();
      const mappedParts = MUSCLE_TAB_MAPPING[normalizedMuscle];

      if (mappedParts) {
        // Fetch all mapped parts safely
        const promises = mappedParts.map((part) =>
          ExerciseService.getExercisesByBodyPart(part).catch((err) => {
            logger.warn(`Failed to fetch body part ${part}:`, {
              message: err instanceof Error ? err.message : String(err),
            });
            return [] as Exercise[];
          }),
        );

        const resultsArray = await Promise.all(promises);
        let merged = resultsArray.flat();

        // Deduplicate
        const seen = new Set();
        merged = merged.filter((ex) => {
          if (seen.has(ex.id)) return false;
          seen.add(ex.id);
          return true;
        });

        // Limit to 20
        merged = merged.slice(0, 20);

        return NextResponse.json({
          ok: true,
          data: merged,
          source: 'ExerciseDB',
          count: merged.length,
        });
      } else {
        // Fallback for direct valid body part or target muscle queries
        let results: Exercise[] = [];
        try {
          if ((BODY_PARTS as readonly string[]).includes(normalizedMuscle)) {
            results = await ExerciseService.getExercisesByBodyPart(normalizedMuscle);
          } else if ((TARGETS as readonly string[]).includes(normalizedMuscle)) {
            results = await ExerciseService.getExercisesByMuscle(normalizedMuscle);
          } else {
            return NextResponse.json(
              {
                ok: false,
                errorCode: 'INVALID_MUSCLE_FILTER',
                message: `Invalid muscle filter: ${muscle}`,
              },
              { status: 400 },
            );
          }
        } catch (err) {
          logger.warn(`Failed to fetch specific muscle ${muscle}:`, {
            message: err instanceof Error ? err.message : String(err),
          });
          // Return partial/empty on error instead of throwing to 502 below if we can
        }

        return NextResponse.json({
          ok: true,
          data: results,
          source: 'ExerciseDB',
          count: results.length,
        });
      }
    }

    if (!query || query.length < 2) {
      return NextResponse.json({ ok: true, data: [], source: 'ExerciseDB', count: 0 });
    }

    const normalizedQuery = normalizeExerciseQuery(query);
    const results = await ExerciseService.searchExercises(normalizedQuery);

    return NextResponse.json({
      ok: true,
      data: results,
      source: 'ExerciseDB',
      count: results.length,
    });
  } catch (error) {
    logger.errorFingerprint('EXERCISE_API_UNAVAILABLE', 'API Error searching exercises', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'EXERCISE_API_UNAVAILABLE',
        message: 'ExerciseDB is unavailable. Try again shortly.',
      },
      { status: 502 },
    );
  }
}
