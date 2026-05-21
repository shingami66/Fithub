import { getDatabase } from '@/lib/db/mongodb';
import type { OnboardingInput, UserProfile } from '@/lib/validations/onboarding';
import { calculateBMR, calculateDailyCalories, calculateMacros } from '@/lib/utils/calculations';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const db = await getDatabase();
  const profile = await db.collection<UserProfile>('userProfiles').findOne({ userId });
  return profile;
}

export async function saveUserProfile(userId: string, data: OnboardingInput): Promise<UserProfile> {
  const db = await getDatabase();

  const bmr = calculateBMR(data.gender, data.age, data.heightCm, data.weightKg);
  const dailyCalories = calculateDailyCalories(bmr, data.activityLevel, data.fitnessGoal);
  const macros = calculateMacros(dailyCalories, data.fitnessGoal);

  const now = new Date();

  const profileData: Partial<UserProfile> = {
    ...data,
    bmr,
    dailyCalories,
    macros,
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
