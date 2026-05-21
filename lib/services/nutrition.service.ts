import { FoodEntity } from '@/types/food';

/**
 * NutritionService
 * Abstraction layer for future food API integration (e.g. Edamam, OpenFoodFacts, or USDA).
 */
export class NutritionService {
  /**
   * Search for foods by query string.
   * Currently mocked, ready for real API integration.
   */
  static async searchFoods(query: string): Promise<FoodEntity[]> {
    if (!query.trim()) return [];

    // MOCK DATA for Sprint 8
    // In the future, this will call `fetch('https://api.edamam.com/...', { ... })`
    const mockResults: FoodEntity[] = [
      {
        id: '1',
        name: 'Chicken Breast',
        brand: 'Generic',
        servingSize: 100,
        servingUnit: 'g',
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
      },
      {
        id: '2',
        name: 'Brown Rice',
        brand: 'Generic',
        servingSize: 100,
        servingUnit: 'g',
        calories: 111,
        protein: 2.6,
        carbs: 23,
        fat: 0.9,
      },
      {
        id: '3',
        name: 'Avocado',
        brand: 'Generic',
        servingSize: 100,
        servingUnit: 'g',
        calories: 160,
        protein: 2,
        carbs: 8.5,
        fat: 14.7,
      },
    ].filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockResults;
  }

  /**
   * Calculate macros when the user changes the serving size.
   */
  static calculateMacros(food: FoodEntity, targetServingSize: number): FoodEntity {
    const ratio = targetServingSize / food.servingSize;
    return {
      ...food,
      servingSize: targetServingSize,
      calories: Math.round(food.calories * ratio),
      protein: Math.round(food.protein * ratio * 10) / 10,
      carbs: Math.round(food.carbs * ratio * 10) / 10,
      fat: Math.round(food.fat * ratio * 10) / 10,
    };
  }

  /**
   * Normalizes raw API data into our internal FoodEntity schema.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static normalizeFoodData(raw: any): FoodEntity {
    return {
      id: String(raw.id || raw.fdcId || ''),
      name: String(raw.name || raw.description || ''),
      brand: raw.brand || raw.brandOwner,
      servingSize: Number(raw.servingSize || 100),
      servingUnit: String(raw.servingUnit || 'g'),
      calories: Number(raw.calories || 0),
      protein: Number(raw.protein || 0),
      carbs: Number(raw.carbs || 0),
      fat: Number(raw.fat || 0),
      barcode: raw.barcode || raw.gtinUpc,
    };
  }
}
