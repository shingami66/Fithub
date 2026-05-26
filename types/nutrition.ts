export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutrientsPer100g {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
}

export type ServingUnit = 'g' | 'cup' | 'piece' | 'tbsp' | 'slice';

export interface ServingUnitOption {
  unit: ServingUnit;
  label: string;
  grams: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  servingSize: number;
  servingUnit: ServingUnit;
  servingDescription?: string;
  quantity?: number;
  grams?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
  nutrientsPer100g?: NutrientsPer100g;
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
