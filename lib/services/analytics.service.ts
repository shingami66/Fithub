import { getDatabase } from '@/lib/db/mongodb';

export interface DashboardNutritionSummary {
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  entryCount: number;
}

export interface WorkoutActivityItem {
  id: string;
  name: string;
  duration: string;
  volumeKg: number;
  setCount: number;
  status: 'idle' | 'active' | 'paused' | 'completed' | 'cancelled';
  time: string;
}

export interface WeeklyActivityPoint {
  day: string;
  active: boolean;
  score: number;
}

export interface WeeklyPerformanceSummary {
  streak: number;
  volumeKg: number;
  volumeTrend: number | null;
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function formatDuration(durationMs?: number, startedAt?: Date, status?: string) {
  const duration =
    typeof durationMs === 'number' && durationMs > 0
      ? durationMs
      : status === 'active' && startedAt
        ? Date.now() - startedAt.getTime()
        : 0;
  const minutes = Math.max(Math.round(duration / 60_000), 0);
  return minutes > 0 ? `${minutes}m` : '0m';
}

function formatRelativeTime(date?: Date) {
  if (!date) return 'No timestamp';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(Math.round(diffMs / 60_000), 0);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
}

function lastSevenDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
}

export class AnalyticsService {
  /**
   * Calculates daily completed set volume (kg) over the last 7 days.
   */
  static async calculateWorkoutVolume(userId: string) {
    const db = await getDatabase();
    const sevenDaysAgo = startOfDay(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));

    const pipeline = [
      {
        $match: {
          userId,
          createdAt: { $gte: sevenDaysAgo },
          completed: true,
          weightKg: { $gt: 0 },
          reps: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          volume: { $sum: { $multiply: ['$weightKg', '$reps'] } },
        },
      },
      { $sort: { _id: 1 as const } },
    ];

    const result = await db.collection('exercise_sets').aggregate(pipeline).toArray();

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return lastSevenDays().map((date) => {
      const dateStr = date.toISOString().split('T')[0];
      const match = result.find((row) => row._id === dateStr);
      return {
        name: days[date.getDay()],
        volume: match ? Math.round(match.volume) : 0,
      };
    });
  }

  static async calculateWeeklyConsistency(userId: string): Promise<number> {
    const db = await getDatabase();

    const sessions = await db
      .collection('workout_sessions')
      .find({ userId, status: 'completed' })
      .sort({ startedAt: -1 })
      .toArray();

    if (sessions.length === 0) return 0;

    let streak = 1;
    const msInDay = 1000 * 60 * 60 * 24;
    const now = new Date();
    const firstStartedAt = sessions[0].startedAt;

    if (!firstStartedAt) return 0;

    const daysSinceLast = (now.getTime() - firstStartedAt.getTime()) / msInDay;
    if (daysSinceLast > 7) return 0;

    for (let i = 0; i < sessions.length - 1; i++) {
      const current = sessions[i].startedAt?.getTime();
      const previous = sessions[i + 1].startedAt?.getTime();
      if (!current || !previous) break;

      const diffDays = (current - previous) / msInDay;
      if (diffDays <= 7) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Analyzes frequency of real saved exercise entries over the last 30 days.
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
        if (typeof curr._id === 'string' && curr._id.trim()) {
          acc[curr._id.toLowerCase()] = curr.count;
        }
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * 7-day rolling daily calories from saved nutrition logs.
   */
  static async calculateCaloriesTrend(userId: string) {
    const db = await getDatabase();
    const sevenDaysAgo = startOfDay(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));

    const pipeline = [
      { $match: { userId, date: { $gte: sevenDaysAgo } } },
      {
        $project: {
          date: 1,
          calories: { $sum: '$entries.calories' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          calories: { $sum: '$calories' },
        },
      },
      { $sort: { _id: 1 as const } },
    ];

    const result = await db.collection('nutrition_logs').aggregate(pipeline).toArray();

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return lastSevenDays().map((date) => {
      const dateStr = date.toISOString().split('T')[0];
      const match = result.find((row) => row._id === dateStr);
      return {
        name: days[date.getDay()],
        calories: match ? Math.round(match.calories) : 0,
      };
    });
  }

  /**
   * Generates a nullable recovery score from recent completed workouts.
   */
  static async calculateRecoveryScore(userId: string): Promise<number | null> {
    const db = await getDatabase();
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const recentCompleted = await db.collection('workout_sessions').countDocuments({
      userId,
      startedAt: { $gte: fourteenDaysAgo },
      status: 'completed',
    });

    if (recentCompleted === 0) return null;

    const recentWorkouts = await db.collection('workout_sessions').countDocuments({
      userId,
      startedAt: { $gte: threeDaysAgo },
      status: 'completed',
    });

    let score = 100;
    if (recentWorkouts >= 3) score -= 20;
    if (recentWorkouts === 0) score -= 10;

    return Math.max(score, 10);
  }

  static async getTodayNutrition(userId: string): Promise<DashboardNutritionSummary> {
    const db = await getDatabase();
    const today = startOfDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logs = await db
      .collection('nutrition_logs')
      .find({ userId, date: { $gte: today, $lt: tomorrow } })
      .toArray();

    return logs.reduce(
      (summary, log) => {
        const entries = Array.isArray(log.entries) ? log.entries : [];
        summary.entryCount += entries.length;
        for (const entry of entries) {
          summary.totals.calories += Number(entry.calories ?? 0);
          summary.totals.protein += Number(entry.protein ?? 0);
          summary.totals.carbs += Number(entry.carbs ?? 0);
          summary.totals.fat += Number(entry.fat ?? 0);
        }
        return summary;
      },
      {
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        entryCount: 0,
      },
    );
  }

  static async getRecentWorkoutActivity(userId: string, limit = 3): Promise<WorkoutActivityItem[]> {
    const db = await getDatabase();
    const sessions = await db
      .collection('workout_sessions')
      .find({ userId })
      .sort({ lastInteractionAt: -1, startedAt: -1 })
      .limit(limit)
      .toArray();

    if (sessions.length === 0) return [];

    const sessionIds = sessions.map((session) => session._id.toString());
    const setRows = await db
      .collection('exercise_sets')
      .find({
        userId,
        $or: [{ workoutSessionId: { $in: sessionIds } }, { sessionId: { $in: sessionIds } }],
      })
      .toArray();

    const setsBySession = setRows.reduce((acc, set) => {
      const sessionId = String(set.workoutSessionId ?? set.sessionId ?? '');
      if (!sessionId) return acc;
      const weight = Number(set.weightKg ?? 0);
      const reps = Number(set.reps ?? 0);
      const volume = weight > 0 && reps > 0 ? weight * reps : 0;
      const current = acc.get(sessionId) ?? { volumeKg: 0, setCount: 0 };
      current.volumeKg += volume;
      current.setCount += 1;
      acc.set(sessionId, current);
      return acc;
    }, new Map<string, { volumeKg: number; setCount: number }>());

    return sessions.map((session) => {
      const sessionId = session._id.toString();
      const setSummary = setsBySession.get(sessionId);
      const volumeKg =
        session.totalVolumeKg && session.totalVolumeKg > 0
          ? session.totalVolumeKg
          : (setSummary?.volumeKg ?? 0);

      return {
        id: sessionId,
        name: session.name ?? 'Workout',
        duration: formatDuration(session.durationMs, session.startedAt, session.status),
        volumeKg: Math.round(volumeKg),
        setCount: setSummary?.setCount ?? 0,
        status: session.status ?? 'active',
        time: formatRelativeTime(session.lastInteractionAt ?? session.startedAt),
      };
    });
  }

  static async getWeeklyActivity(userId: string): Promise<WeeklyActivityPoint[]> {
    const db = await getDatabase();
    const days = lastSevenDays();
    const firstDay = startOfDay(days[0]);

    const sessions = await db
      .collection('workout_sessions')
      .find({ userId, startedAt: { $gte: firstDay } })
      .toArray();

    return days.map((date) => {
      const nextDate = new Date(startOfDay(date));
      nextDate.setDate(nextDate.getDate() + 1);
      const daySessions = sessions.filter((session) => {
        if (!session.startedAt) return false;
        return session.startedAt >= startOfDay(date) && session.startedAt < nextDate;
      });

      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1),
        active: daySessions.length > 0,
        score: Math.min(daySessions.length * 50, 100),
      };
    });
  }

  static async getWeeklyPerformance(userId: string): Promise<WeeklyPerformanceSummary> {
    const db = await getDatabase();
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 6);
    thisWeekStart.setHours(0, 0, 0, 0);
    const previousWeekStart = new Date(thisWeekStart);
    previousWeekStart.setDate(thisWeekStart.getDate() - 7);

    const aggregateVolume = async (start: Date, end: Date) => {
      const result = await db
        .collection('exercise_sets')
        .aggregate([
          {
            $match: {
              userId,
              createdAt: { $gte: start, $lt: end },
              completed: true,
              weightKg: { $gt: 0 },
              reps: { $gt: 0 },
            },
          },
          {
            $group: {
              _id: null,
              volume: { $sum: { $multiply: ['$weightKg', '$reps'] } },
            },
          },
        ])
        .toArray();

      return Math.round(Number(result[0]?.volume ?? 0));
    };

    const [streak, currentVolume, previousVolume] = await Promise.all([
      this.calculateWeeklyConsistency(userId),
      aggregateVolume(thisWeekStart, now),
      aggregateVolume(previousWeekStart, thisWeekStart),
    ]);

    const volumeTrend =
      previousVolume > 0
        ? Math.round(((currentVolume - previousVolume) / previousVolume) * 100)
        : currentVolume > 0
          ? 100
          : null;

    return {
      streak,
      volumeKg: currentVolume,
      volumeTrend,
    };
  }
}
