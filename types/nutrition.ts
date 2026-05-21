export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionLog {
  id: string;
  userId: string;
  date: Date;
  mealType: MealType;
  entries: FoodEntry[];
  totals: MacroTotals;
  consumedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
