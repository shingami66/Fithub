import { Exercise } from '@/types/exercise';
import { exerciseArraySchema } from '@/lib/validations/exercise';
import { env } from '@/lib/config/env';

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
    try {
      if (!query.trim()) return [];

      const cacheKey = `search:${query.toLowerCase()}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const res = await fetch(
        `${API_BASE_URL}/exercises/name/${encodeURIComponent(query)}?limit=20`,
        {
          headers: this.getHeaders(),
          // Fallback timeout since fetch doesn't have a default short timeout
          signal: AbortSignal.timeout(8000),
        },
      );

      if (!res.ok) {
        if (res.status === 404) return []; // Just no results
        throw new Error(`Exercise API error: ${res.status}`);
      }

      const data = await res.json();
      const normalized = this.normalizeExercises(data);
      this.setCache(cacheKey, normalized);
      return normalized;
    } catch (error) {
      console.error('Failed to search exercises:', error);
      return []; // Safe fallback
    }
  }

  static async getExercisesByMuscle(targetMuscle: string): Promise<Exercise[]> {
    try {
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
    } catch (error) {
      console.error('Failed to get exercises by muscle:', error);
      return [];
    }
  }

  static async getExercisesByBodyPart(bodyPart: string): Promise<Exercise[]> {
    try {
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
    } catch (error) {
      console.error('Failed to get exercises by body part:', error);
      return [];
    }
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
      console.error('Failed to get exercise by id:', error);
      return null;
    }
  }

  private static normalizeExercises(rawArray: Record<string, unknown>[]): Exercise[] {
    if (!Array.isArray(rawArray)) return [];

    const mapped = rawArray.map((raw) => ({
      id: String(raw.id || ''),
      name: String(raw.name || ''),
      bodyPart: String(raw.bodyPart || ''),
      targetMuscle: String(raw.target || ''),
      equipment: String(raw.equipment || ''),
      gifUrl: String(raw.gifUrl || ''),
      instructions: Array.isArray(raw.instructions) ? raw.instructions.map(String) : [],
    }));

    // Validate through Zod to ensure we don't bleed bad data into the system
    const result = exerciseArraySchema.safeParse(mapped);
    if (!result.success) {
      console.error('Exercise data validation failed:', result.error);
      return [];
    }

    return result.data;
  }
}
