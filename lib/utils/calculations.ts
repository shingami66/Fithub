import type { OnboardingInput } from '@/lib/validations/onboarding';

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
} as const;

const GOAL_CALORIE_ADJUSTMENTS = {
  lose_fat: -500,
  maintain: 0,
  build_muscle: 300,
} as const;

const GOAL_MACRO_SPLITS = {
  lose_fat: { protein: 0.4, carbs: 0.3, fat: 0.3 },
  maintain: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  build_muscle: { protein: 0.35, carbs: 0.45, fat: 0.2 },
} as const;

export function calculateBMR(
  gender: OnboardingInput['gender'],
  age: number,
  heightCm: number,
  weightKg: number,
): number {
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  return Math.round(bmr);
}

export function calculateDailyCalories(
  bmr: number,
  activityLevel: OnboardingInput['activityLevel'],
  fitnessGoal: OnboardingInput['fitnessGoal'],
): number {
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];
  const adjustedCalories = tdee + GOAL_CALORIE_ADJUSTMENTS[fitnessGoal];

  // Prevent dangerously low calories
  return Math.max(1200, Math.round(adjustedCalories));
}

export function calculateMacros(
  dailyCalories: number,
  fitnessGoal: OnboardingInput['fitnessGoal'],
): { protein: number; carbs: number; fat: number } {
  const split = GOAL_MACRO_SPLITS[fitnessGoal];

  // Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
  const protein = (dailyCalories * split.protein) / 4;
  const carbs = (dailyCalories * split.carbs) / 4;
  const fat = (dailyCalories * split.fat) / 9;

  return {
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
  };
}
