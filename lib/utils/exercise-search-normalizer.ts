import { normalizeExerciseQuery } from '@/lib/utils/search-normalizers';

export function normalizeExerciseSearchQuery(query: string): string {
  return normalizeExerciseQuery(query);
}
