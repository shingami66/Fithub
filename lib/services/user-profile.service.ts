import { getDatabase } from '@/lib/db/mongodb';
import { safeMongoOperation, type SafeResult } from '@/lib/db/safe-db';
import type { OnboardingInput, UserProfile } from '@/lib/validations/onboarding';
import { calculateNutritionPlan } from '@/lib/utils/calculations';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const db = await getDatabase();
  const profile = await db.collection<UserProfile>('userProfiles').findOne({ userId });
  return profile;
}

export async function getUserProfileSafe(
  userId: string,
  options: { timeoutMs?: number } = {},
): Promise<SafeResult<UserProfile | null>> {
  return safeMongoOperation(
    async () => {
      const db = await getDatabase();
      return db.collection<UserProfile>('userProfiles').findOne({ userId });
    },
    {
      timeoutMs: options.timeoutMs,
      operationName: 'getUserProfileSafe',
      meta: { userId },
    },
  );
}

export async function saveUserProfile(userId: string, data: OnboardingInput): Promise<UserProfile> {
  const db = await getDatabase();

  const plan = calculateNutritionPlan(data);

  const now = new Date();

  const profileData: Partial<UserProfile> = {
    ...data,
    bmr: plan.bmr,
    tdee: plan.tdee,
    dailyCalories: plan.dailyCalories,
    macros: plan.macros,
    onboardingCompleted: true,
    updatedAt: now,
  };

  const result = await db.collection<UserProfile>('userProfiles').findOneAndUpdate(
    { userId },
    {
      $set: profileData,
      $setOnInsert: { createdAt: now, userId },
    },
    { upsert: true, returnDocument: 'after' },
  );

  return result as unknown as UserProfile;
}

export async function isOnboardingComplete(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return !!profile?.onboardingCompleted;
}

export async function isOnboardingCompleteSafe(
  userId: string,
  options: { timeoutMs?: number } = {},
): Promise<SafeResult<boolean>> {
  const profileResult = await getUserProfileSafe(userId, options);

  if (!profileResult.ok) {
    return profileResult;
  }

  return { ok: true, data: !!profileResult.data?.onboardingCompleted };
}
