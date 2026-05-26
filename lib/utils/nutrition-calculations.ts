import { getServingUnitOption } from './serving-units';
import type { ServingUnit } from '../../types/nutrition';

export type FoodServingUnit = ServingUnit;

export interface NutritionMacroSource {
  name: string;
  nutrientsPer100g?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sodium?: number;
  };
}

export interface MacroResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | undefined;
  sodium: number | undefined;
}

function roundMacro(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function gramsForUnit(food: NutritionMacroSource, quantity: number, unit: FoodServingUnit) {
  if (unit === 'g') return quantity;

  const serving = getServingUnitOption(food, unit);
  if (!serving?.grams) return undefined;
  return quantity * serving.grams;
}

export function calculateMacros(
  food: NutritionMacroSource,
  quantity: number,
  unit: FoodServingUnit,
): MacroResult {
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
  const grams = gramsForUnit(food, safeQuantity, unit);
  const per100g = food.nutrientsPer100g;

  if (!grams || !per100g) {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: undefined,
      sodium: undefined,
    };
  }

  const scale = grams / 100;

  return {
    calories: Math.round(per100g.calories * scale),
    protein: roundMacro(per100g.protein * scale),
    carbs: roundMacro(per100g.carbs * scale),
    fat: roundMacro(per100g.fat * scale),
    fiber: typeof per100g.fiber === 'number' ? roundMacro(per100g.fiber * scale) : undefined,
    sodium: typeof per100g.sodium === 'number' ? Math.round(per100g.sodium * scale) : undefined,
  };
}

export function getServingGrams(
  food: NutritionMacroSource,
  quantity: number,
  unit: FoodServingUnit,
) {
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
  return gramsForUnit(food, safeQuantity, unit);
}
