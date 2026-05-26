import type { ServingUnit } from '@/types/nutrition';

export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
  servingSize: string;
  servingDescription: string;
  servingGrams: number;
  selectedQuantity?: number;
  selectedServingUnit?: ServingUnit;
  servingUnits?: {
    unit: string;
    label: string;
    grams: number;
  }[];
  nutrientsPer100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sodium?: number;
  };
  visualCategory?: 'egg' | 'fruit' | 'meat' | 'rice' | 'dairy' | 'fish' | 'generic';
}

interface USDAFoodNutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName: string;
}

interface USDAFood {
  fdcId: number;
  description: string;
  dataType?: string;
  foodCategory?: string;
  foodNutrients: USDAFoodNutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
}

interface USDASearchResponse {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  foods: USDAFood[];
}

import { env } from '@/lib/config/env';

const USDA_API_KEY = env.USDA_API_KEY;
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

function parseNutrients(nutrients: USDAFoodNutrient[]): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
} {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let fiber: number | undefined;
  let sodium: number | undefined;

  for (const n of nutrients) {
    const name = n.nutrientName.toLowerCase();
    if (name.includes('energy') && n.unitName.toLowerCase() === 'kcal') {
      calories = n.value;
    } else if (name.includes('protein')) {
      protein = n.value;
    } else if (name.includes('carbohydrate')) {
      carbs = n.value;
    } else if (name.includes('lipid') || name.includes('fat')) {
      fat = n.value;
    } else if (name.includes('fiber')) {
      fiber = n.value;
    } else if (name.includes('sodium')) {
      sodium = n.value;
    }
  }

  return { calories, protein, carbs, fat, fiber, sodium };
}

function getDefaultServing(food: USDAFood): { description: string; grams: number } {
  const description = food.description.toLowerCase();
  const category = food.foodCategory?.toLowerCase() ?? '';
  const isCandy = category.includes('candy');
  const isEggFood = category.includes('egg') || category.includes('dairy and egg');

  if (description.includes('egg') && isEggFood && !isCandy) {
    return { description: '1 large egg (50g)', grams: 50 };
  }
  if (description.includes('apple')) {
    return { description: '1 medium apple (182g)', grams: 182 };
  }
  if (description.includes('banana')) {
    return { description: '1 medium banana (118g)', grams: 118 };
  }

  return { description: 'per 100g', grams: 100 };
}

function inferFoodVisualCategory(food: USDAFood): Food['visualCategory'] {
  const description = food.description.toLowerCase();
  const category = food.foodCategory?.toLowerCase() ?? '';
  const text = `${description} ${category}`;

  if (text.includes('egg')) return 'egg';
  if (
    text.includes('fruit') ||
    text.includes('apple') ||
    text.includes('banana') ||
    text.includes('berry')
  ) {
    return 'fruit';
  }
  if (
    text.includes('chicken') ||
    text.includes('beef') ||
    text.includes('meat') ||
    text.includes('poultry')
  ) {
    return 'meat';
  }
  if (text.includes('rice') || text.includes('grain')) return 'rice';
  if (
    text.includes('milk') ||
    text.includes('yogurt') ||
    text.includes('cheese') ||
    text.includes('dairy')
  ) {
    return 'dairy';
  }
  if (text.includes('fish') || text.includes('tuna') || text.includes('salmon')) return 'fish';
  return 'generic';
}

function scoreFoodResult(food: USDAFood, query: string): number {
  const normalizedQuery = query.trim().toLowerCase();
  const description = food.description.toLowerCase();
  const category = food.foodCategory?.toLowerCase() ?? '';
  const dataType = food.dataType?.toLowerCase() ?? '';
  let score = 0;

  if (dataType === 'foundation') score += 100;
  if (dataType === 'sr legacy' || dataType === 'survey (fndds)') score += 70;
  if (dataType === 'branded') score -= 20;
  if (description === normalizedQuery) score += 10;

  if (normalizedQuery.includes('egg')) {
    if (category.includes('egg') || category.includes('dairy and egg')) score += 80;
    if (category.includes('candy')) score -= 150;
    if (description.includes('egg whole')) score += 30;
  }

  if (normalizedQuery.includes('apple')) {
    if (category.includes('fruit')) score += 80;
    if (description.includes('raw')) score += 20;
  }

  if (normalizedQuery.includes('banana')) {
    if (category.includes('fruit')) score += 80;
    if (description.includes('raw')) score += 20;
  }

  return score;
}

function mapUSDAFoodToFood(food: USDAFood): Food {
  const nutrientsPer100g = parseNutrients(food.foodNutrients || []);
  const serving = getDefaultServing(food);
  const scale = serving.grams / 100;
  const calories = nutrientsPer100g.calories * scale;
  const protein = nutrientsPer100g.protein * scale;
  const carbs = nutrientsPer100g.carbs * scale;
  const fat = nutrientsPer100g.fat * scale;
  const fiber =
    typeof nutrientsPer100g.fiber === 'number' ? nutrientsPer100g.fiber * scale : undefined;
  const sodium =
    typeof nutrientsPer100g.sodium === 'number' ? nutrientsPer100g.sodium * scale : undefined;

  const normalizedFood: Food = {
    id: food.fdcId.toString(),
    name: food.description,
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    ...(typeof fiber === 'number' ? { fiber: Math.round(fiber * 10) / 10 } : {}),
    ...(typeof sodium === 'number' ? { sodium: Math.round(sodium) } : {}),
    servingSize: serving.description,
    servingDescription: serving.description,
    servingGrams: serving.grams,
    nutrientsPer100g: {
      calories: Math.round(nutrientsPer100g.calories),
      protein: Math.round(nutrientsPer100g.protein * 10) / 10,
      carbs: Math.round(nutrientsPer100g.carbs * 10) / 10,
      fat: Math.round(nutrientsPer100g.fat * 10) / 10,
      ...(typeof nutrientsPer100g.fiber === 'number'
        ? { fiber: Math.round(nutrientsPer100g.fiber * 10) / 10 }
        : {}),
      ...(typeof nutrientsPer100g.sodium === 'number'
        ? { sodium: Math.round(nutrientsPer100g.sodium) }
        : {}),
    },
    visualCategory: inferFoodVisualCategory(food),
  };

  if (process.env.NODE_ENV === 'development') {
    console.debug('[nutrition] normalized food result', {
      id: normalizedFood.id,
      name: normalizedFood.name,
      servingGrams: normalizedFood.servingGrams,
      servingSize: normalizedFood.servingSize,
      servingDescription: normalizedFood.servingDescription,
      householdServingFullText: food.householdServingFullText,
      servingUnits: normalizedFood.servingUnits,
      nutrientsPer100g: normalizedFood.nutrientsPer100g,
    });
  }

  return normalizedFood;
}

export async function searchFoods(query: string): Promise<Food[]> {
  if (!query.trim()) {
    return [];
  }
  const url = `${BASE_URL}/foods/search?query=${encodeURIComponent(query)}&api_key=${USDA_API_KEY}&pageSize=20`;
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) {
    throw new Error('Failed to fetch from USDA API');
  }
  const data = (await response.json()) as Partial<USDASearchResponse>;
  if (!Array.isArray(data.foods)) {
    throw new Error('Invalid USDA API response');
  }
  return [...(data.foods || [])]
    .sort((a, b) => scoreFoodResult(b, query) - scoreFoodResult(a, query))
    .map(mapUSDAFoodToFood);
}

export async function getFoodById(id: string): Promise<Food> {
  const url = `${BASE_URL}/food/${encodeURIComponent(id)}?api_key=${USDA_API_KEY}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) {
    throw new Error('Failed to fetch food details from USDA API');
  }
  const food = (await response.json()) as USDAFood;
  return mapUSDAFoodToFood(food);
}
