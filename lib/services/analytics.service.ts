import { getDatabase } from '@/lib/db/mongodb';

export class AnalyticsService {
  /**
   * Calculates daily volume (kg) moved over the last 7 days.
   */
  static async calculateWorkoutVolume(userId: string) {
    const db = await getDatabase();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const pipeline = [
      { $match: { userId, createdAt: { $gte: sevenDaysAgo } } },
      { $unwind: '$sets' },
      { $match: { 'sets.completed': true, 'sets.weightKg': { $gt: 0 }, 'sets.reps': { $gt: 0 } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          volume: { $sum: { $multiply: ['$sets.weightKg', '$sets.reps'] } },
        },
      },
      { $sort: { _id: 1 as const } },
    ];

    const result = await db.collection('exercise_entries').aggregate(pipeline).toArray();

    // Map to last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const match = result.find((r) => r._id === dateStr);
      data.push({
        name: days[d.getDay()],
        volume: match ? match.volume : 0,
      });
    }

    return data;
  }
  static async calculateWeeklyConsistency(userId: string): Promise<number> {
    const db = await getDatabase();

    // Get unique dates of completed workouts sorted descending
    const sessions = await db
      .collection('workout_sessions')
      .find({ userId, status: 'completed' })
      .sort({ startTime: -1 })
      .toArray();

    if (sessions.length === 0) return 0;

    let streak = 1;
    const msInDay = 1000 * 60 * 60 * 24;
    const now = new Date();

    const daysSinceLast = (now.getTime() - new Date(sessions[0].startTime).getTime()) / msInDay;
    if (daysSinceLast > 7) return 0;

    for (let i = 0; i < sessions.length - 1; i++) {
      const current = new Date(sessions[i].startTime).getTime();
      const prev = new Date(sessions[i + 1].startTime).getTime();
      const diffDays = (current - prev) / msInDay;

      if (diffDays <= 7) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Analyzes frequency of muscle group targeting over the last 30 days.
   */
  static async calculateMuscleFrequency(userId: string): Promise<Record<string, number>> {
    const db = await getDatabase();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const pipeline = [
      { $match: { userId, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$targetMuscle', count: { $sum: 1 } } },
    ];

    const result = await db.collection('exercise_entries').aggregate(pipeline).toArray();

    return result.reduce(
      (acc, curr) => {
        acc[curr._id.toLowerCase()] = curr.count;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * 7-day rolling daily calories from nutrition_logs.
   */
  static async calculateCaloriesTrend(userId: string) {
    const db = await getDatabase();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const pipeline = [
      { $match: { userId, date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          calories: { $sum: '$totals.calories' },
        },
      },
      { $sort: { _id: 1 as const } },
    ];

    const result = await db.collection('nutrition_logs').aggregate(pipeline).toArray();

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const match = result.find((r) => r._id === dateStr);
      data.push({
        name: days[d.getDay()],
        calories: match ? Math.round(match.calories) : 0,
      });
    }

    return data;
  }

  /**
   * Generates a 0-100 recovery score based on workout frequency vs sleep.
   */
  static async calculateRecoveryScore(userId: string): Promise<number> {
    const db = await getDatabase();
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const recentWorkouts = await db
      .collection('workout_sessions')
      .countDocuments({ userId, startTime: { $gte: threeDaysAgo }, status: 'completed' });

    let score = 100;
    // Penalize if working out every single day heavily
    if (recentWorkouts >= 3) {
      score -= 20;
    }

    // Base heuristic since we don't have a sleep tracker yet
    return Math.max(score, 10);
  }
}
