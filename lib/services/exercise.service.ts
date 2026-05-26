import { Exercise } from '@/types/exercise';
import { exerciseArraySchema } from '@/lib/validations/exercise';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';
import { normalizeOptionalUrl } from '@/lib/utils/url';

const API_BASE_URL = `https://${env.RAPIDAPI_HOST}`;

// Lightweight in-memory cache to prevent redundant API calls
const cache = new Map<string, { data: Exercise[]; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

export class ExerciseService {
  private static getHeaders() {
    return {
      'X-RapidAPI-Key': env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': env.RAPIDAPI_HOST,
    };
  }

  private static getFromCache(key: string): Exercise[] | null {
    const cached = cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      cache.delete(key);
      return null;
    }
    return cached.data;
  }

  private static setCache(key: string, data: Exercise[]) {
    // Prevent memory leaks by limiting cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }
    cache.set(key, { data, timestamp: Date.now() });
  }

  static async searchExercises(query: string): Promise<Exercise[]> {
    if (!query.trim()) return [];

    const cacheKey = `search:${query.toLowerCase()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const res = await fetch(
      `${API_BASE_URL}/exercises/name/${encodeURIComponent(query)}?limit=20`,
      {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`Exercise API error: ${res.status}`);
    }

    const data = await res.json();
    const normalized = this.normalizeExercises(data);
    this.setCache(cacheKey, normalized);
    return normalized;
  }

  static async getExercisesByMuscle(targetMuscle: string): Promise<Exercise[]> {
    if (!targetMuscle.trim()) return [];

    const cacheKey = `muscle:${targetMuscle.toLowerCase()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const res = await fetch(
      `${API_BASE_URL}/exercises/target/${encodeURIComponent(targetMuscle)}?limit=20`,
      {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`Exercise API error: ${res.status}`);
    }

    const data = await res.json();
    const normalized = this.normalizeExercises(data);
    this.setCache(cacheKey, normalized);
    return normalized;
  }

  static async getExercisesByBodyPart(bodyPart: string): Promise<Exercise[]> {
    if (!bodyPart.trim()) return [];

    const cacheKey = `bodyPart:${bodyPart.toLowerCase()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const res = await fetch(
      `${API_BASE_URL}/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=20`,
      {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`Exercise API error: ${res.status}`);
    }

    const data = await res.json();
    const normalized = this.normalizeExercises(data);
    this.setCache(cacheKey, normalized);
    return normalized;
  }

  static async getExerciseById(id: string): Promise<Exercise | null> {
    try {
      if (!id.trim()) return null;

      const cacheKey = `id:${id}`;
      const cached = this.getFromCache(cacheKey);
      if (cached && cached.length > 0) return cached[0];

      const res = await fetch(`${API_BASE_URL}/exercises/exercise/${encodeURIComponent(id)}`, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`Exercise API error: ${res.status}`);
      }

      const raw = await res.json();
      const normalized = this.normalizeExercises([raw]);
      if (normalized.length > 0) {
        this.setCache(cacheKey, normalized);
        return normalized[0];
      }
      return null;
    } catch (error) {
      logger.errorFingerprint('EXERCISE_API_UNAVAILABLE', 'Failed to get exercise by id', {
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private static normalizeExercises(rawArray: Record<string, unknown>[]): Exercise[] {
    if (!Array.isArray(rawArray)) {
      throw new Error('Invalid ExerciseDB response');
    }

    const mapped = rawArray.map((raw) => {
      return {
        id: String(raw.id || ''),
        name: String(raw.name || ''),
        bodyPart: String(raw.bodyPart || ''),
        targetMuscle: String(raw.target || ''),
        equipment: String(raw.equipment || ''),
        gifUrl: normalizeOptionalUrl(raw.gifUrl),
        imageUrl: normalizeOptionalUrl(raw.imageUrl) ?? normalizeOptionalUrl(raw.image),
        thumbnailUrl: normalizeOptionalUrl(raw.thumbnailUrl) ?? normalizeOptionalUrl(raw.thumbnail),
        instructions: Array.isArray(raw.instructions) ? raw.instructions.map(String) : [],
      };
    });

    // Safe dev-only logging for debugging ExerciseDB response
    if (process.env.NODE_ENV === 'development' && mapped.length > 0) {
      const first = mapped[0];
      if (first.name.includes('chest') || first.name.includes('صدر')) {
        logger.debug('ExerciseDB Sample Response (normalized):', {
          id: first.id,
          name: first.name,
          gifUrl: first.gifUrl,
          bodyPart: first.bodyPart,
          targetMuscle: first.targetMuscle,
          equipment: first.equipment,
        });
      }
    }

    // Validate through Zod to ensure we don't bleed bad data into the system
    const result = exerciseArraySchema.safeParse(mapped);
    if (!result.success) {
      logger.errorFingerprint('EXERCISE_API_UNAVAILABLE', 'Exercise data validation failed');
      throw new Error('Invalid ExerciseDB response');
    }

    return result.data;
  }
}
