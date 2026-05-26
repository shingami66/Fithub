import type { OnboardingInput } from '@/lib/validations/onboarding';

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
} as const;

const WEEKLY_WEIGHT_CHANGE_ADJUSTMENTS = {
  lose_0_25: -275,
  lose_0_5: -550,
  lose_1: -1100,
  maintain: 0,
  gain_0_25: 275,
  gain_0_5: 550,
} as const;

const PROTEIN_GRAMS_PER_KG = {
  lose_fat: 2,
  maintain: 1.6,
  build_muscle: 1.8,
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

export function calculateTDEE(
  bmr: number,
  activityLevel: OnboardingInput['activityLevel'],
): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function calculateDailyCalories(
  bmr: number,
  activityLevel: OnboardingInput['activityLevel'],
  fitnessGoal: OnboardingInput['fitnessGoal'],
  weeklyWeightChange: OnboardingInput['weeklyWeightChange'] = fitnessGoal === 'build_muscle'
    ? 'gain_0_25'
    : fitnessGoal === 'lose_fat'
      ? 'lose_0_5'
      : 'maintain',
): number {
  const tdee = calculateTDEE(bmr, activityLevel);
  const adjustedCalories = tdee + WEEKLY_WEIGHT_CHANGE_ADJUSTMENTS[weeklyWeightChange];

  // Prevent dangerously low calories
  return Math.max(1200, Math.round(adjustedCalories));
}

export function calculateMacros(
  dailyCalories: number,
  fitnessGoal: OnboardingInput['fitnessGoal'],
  weightKg = 70,
): { protein: number; carbs: number; fat: number } {
  const protein = Math.round(weightKg * PROTEIN_GRAMS_PER_KG[fitnessGoal]);
  const fat = Math.round(Math.max(weightKg * 0.6, (dailyCalories * 0.25) / 9));
  const caloriesAfterProteinAndFat = dailyCalories - protein * 4 - fat * 9;
  const carbs = Math.max(0, Math.round(caloriesAfterProteinAndFat / 4));

  return {
    protein,
    carbs,
    fat,
  };
}

export function calculateNutritionPlan(data: OnboardingInput): {
  bmr: number;
  tdee: number;
  dailyCalories: number;
  macros: { protein: number; carbs: number; fat: number };
  calorieAdjustment: number;
  warning?: string;
} {
  const bmr = calculateBMR(data.gender, data.age, data.heightCm, data.weightKg);
  const tdee = calculateTDEE(bmr, data.activityLevel);
  const calorieAdjustment = WEEKLY_WEIGHT_CHANGE_ADJUSTMENTS[data.weeklyWeightChange];
  const dailyCalories = calculateDailyCalories(
    bmr,
    data.activityLevel,
    data.fitnessGoal,
    data.weeklyWeightChange,
  );
  const macros = calculateMacros(dailyCalories, data.fitnessGoal, data.weightKg);

  return {
    bmr,
    tdee,
    dailyCalories,
    macros,
    calorieAdjustment,
    warning:
      data.weeklyWeightChange === 'lose_1'
        ? 'Losing 1 kg per week can be aggressive. Consider a smaller weekly target if recovery, hunger, or training performance suffer.'
        : undefined,
  };
}
