export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
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

const USDA_API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY';
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

function parseNutrients(nutrients: USDAFoodNutrient[]): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

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
    }
  }

  return { calories, protein, carbs, fat };
}

function getServingSize(food: USDAFood): string {
  if (food.householdServingFullText) {
    return food.householdServingFullText;
  }
  if (food.servingSize && food.servingSizeUnit) {
    return `${food.servingSize} ${food.servingSizeUnit}`;
  }
  return '100g';
}

function mapUSDAFoodToFood(food: USDAFood): Food {
  const { calories, protein, carbs, fat } = parseNutrients(food.foodNutrients || []);
  return {
    id: food.fdcId.toString(),
    name: food.description,
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    servingSize: getServingSize(food),
  };
}

export async function searchFoods(query: string): Promise<Food[]> {
  if (!query.trim()) {
    return [];
  }
  const url = `${BASE_URL}/foods/search?query=${encodeURIComponent(query)}&api_key=${USDA_API_KEY}&pageSize=20`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch from USDA API');
  }
  const data = (await response.json()) as USDASearchResponse;
  return (data.foods || []).map(mapUSDAFoodToFood);
}

export async function getFoodById(id: string): Promise<Food> {
  const url = `${BASE_URL}/food/${encodeURIComponent(id)}?api_key=${USDA_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch food details from USDA API');
  }
  const food = (await response.json()) as USDAFood;
  return mapUSDAFoodToFood(food);
}
