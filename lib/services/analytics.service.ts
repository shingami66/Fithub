import { ExerciseSet, ExerciseEntry } from '@/types/workout';

export class AnalyticsService {
  /**
   * Calculates total volume (kg) moved during a workout session.
   * Volume = Sets * Reps * Weight.
   * Ignores sets marked as failure or incomplete if strict mode is desired,
   * but typically volume includes all completed reps.
   */
  static calculateWorkoutVolume(sets: ExerciseSet[]): number {
    return sets.reduce((total, set) => {
      if (!set.completed || !set.weightKg || !set.reps) return total;
      return total + set.weightKg * set.reps;
    }, 0);
  }

  /**
   * Calculates the weekly streak of completed workouts.
   * Requires an array of completed workout dates sorted chronologically.
   * A streak is broken if more than 7 days pass between workouts.
   */
  static calculateWeeklyStreak(completedWorkoutDates: Date[]): number {
    if (completedWorkoutDates.length === 0) return 0;

    // Sort descending (newest first)
    const sorted = [...completedWorkoutDates].sort((a, b) => b.getTime() - a.getTime());

    const now = new Date();
    // If the last workout was more than 7 days ago, current streak is 0
    const msInDay = 1000 * 60 * 60 * 24;
    const daysSinceLast = (now.getTime() - sorted[0].getTime()) / msInDay;

    if (daysSinceLast > 7) return 0;

    let streak = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      const diff = (sorted[i].getTime() - sorted[i + 1].getTime()) / msInDay;
      if (diff <= 7) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Analyzes an array of exercise entries to determine frequency of muscle group targeting.
   * Returns a map of Muscle -> Frequency Count.
   */
  static calculateMuscleFrequency(entries: ExerciseEntry[]): Record<string, number> {
    return entries.reduce(
      (freq, entry) => {
        const target = entry.targetMuscle.toLowerCase();
        freq[target] = (freq[target] || 0) + 1;
        return freq;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * Given an array of macro totals per day, returns the 7-day average.
   * Useful for calories trend charts.
   */
  static calculateCaloriesTrend(dailyTotals: { date: Date; calories: number }[]): number {
    if (dailyTotals.length === 0) return 0;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentTotals = dailyTotals.filter((dt) => dt.date >= sevenDaysAgo);
    if (recentTotals.length === 0) return 0;

    const sum = recentTotals.reduce((acc, dt) => acc + dt.calories, 0);
    return Math.round(sum / recentTotals.length);
  }

  /**
   * Generates a 0-100 recovery score based on recent workout volume, frequency, and sleep/nutrition if available.
   * Mock deterministic logic for Sprint 8.
   */
  static generateRecoveryScore(
    consecutiveDaysWorkedOut: number,
    avgSleepHours: number = 7,
  ): number {
    let score = 100;
    score -= consecutiveDaysWorkedOut * 10;
    if (avgSleepHours < 7) score -= (7 - avgSleepHours) * 15;
    return Math.max(score, 10);
  }

  static detectVolumeIncrease(lastWeekVolume: number, thisWeekVolume: number): number {
    if (lastWeekVolume === 0) return 0;
    return ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100;
  }

  static detectMissedMuscleGroups(recentWorkouts: Record<string, number>): string[] {
    const allGroups = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
    return allGroups.filter((g) => !recentWorkouts[g] || recentWorkouts[g] === 0);
  }

  static calculateConsistencyScore(workoutsLast30Days: number): number {
    // Assuming optimal is 16 workouts / month (4x week)
    return Math.min(Math.round((workoutsLast30Days / 16) * 100), 100);
  }
}
