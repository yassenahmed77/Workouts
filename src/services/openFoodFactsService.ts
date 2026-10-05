import { FoodItem, FoodCategory } from '@/types';

/**
 * Open Food Facts Live Global Nutrition API Integration
 * Enables instant lookups for international & local commercial barcodes.
 */

interface OpenFoodFactsProduct {
  code?: string;
  product_name?: string;
  product_name_ar?: string;
  product_name_en?: string;
  brands?: string;
  serving_size?: string;
  serving_quantity?: number | string;
  product_quantity?: number | string;
  quantity?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'energy-kcal'?: number;
    'energy-kcal_serving'?: number;
    proteins_100g?: number;
    proteins?: number;
    proteins_serving?: number;
    carbohydrates_100g?: number;
    carbohydrates?: number;
    carbohydrates_serving?: number;
    fat_100g?: number;
    fat?: number;
    fat_serving?: number;
    fiber_100g?: number;
    fiber?: number;
    fiber_serving?: number;
  };
}

function extractServingInfo(p: OpenFoodFactsProduct): { defaultServingGrams: number; servingUnit: string } {
  // 1. Direct serving_quantity
  if (p.serving_quantity) {
    const num = parseFloat(String(p.serving_quantity));
    if (!isNaN(num) && num > 0 && num <= 1000) {
      const unit = p.serving_size ? p.serving_size.trim() : `${Math.round(num)}g`;
      return { defaultServingGrams: Math.round(num), servingUnit: unit };
    }
  }

  // 2. Parse serving_size string (e.g. "40 g", "40g", "1 piece (40 g)", "30.4 g")
  if (p.serving_size && typeof p.serving_size === 'string') {
    const match = p.serving_size.match(/(\d+(?:\.\d+)?)\s*(?:g|gram|grams|ml)/i);
    if (match) {
      const num = parseFloat(match[1]);
      if (!isNaN(num) && num > 0 && num <= 1000) {
        return { defaultServingGrams: Math.round(num), servingUnit: p.serving_size.trim() };
      }
    }
  }

  // 3. Single packaged item quantity (e.g. "40 g", "45g", "330 ml")
  if (p.quantity && typeof p.quantity === 'string') {
    const match = p.quantity.match(/^(\d+(?:\.\d+)?)\s*(?:g|gram|grams|ml)$/i);
    if (match) {
      const num = parseFloat(match[1]);
      if (!isNaN(num) && num > 0 && num <= 500) {
        return { defaultServingGrams: Math.round(num), servingUnit: p.quantity.trim() };
      }
    }
  }

  // 4. Product quantity under 500g
  if (p.product_quantity) {
    const num = parseFloat(String(p.product_quantity));
    if (!isNaN(num) && num > 0 && num <= 500) {
      return { defaultServingGrams: Math.round(num), servingUnit: `${Math.round(num)}g` };
    }
  }

  return { defaultServingGrams: 100, servingUnit: '100g' };
}

export const openFoodFactsService = {
  /**
   * Fetch a verified product by its exact barcode (UPC / EAN)
   */
  async fetchByBarcode(barcode: string): Promise<FoodItem | null> {
    const cleanCode = barcode.trim().replace(/[^0-9]/g, '');
    if (!cleanCode) return null;

    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${cleanCode}.json`, {
        headers: { 'User-Agent': 'WorkoutsPRO - Coach OS' },
        signal: AbortSignal.timeout(6000)
      });

      if (!res.ok) return null;
      const data = await res.json();

      if (data.status !== 1 || !data.product) return null;

      const p: OpenFoodFactsProduct = data.product;
      const nutriments = p.nutriments || {};

      const calories = Math.round(nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'] ?? 0);
      const proteinG = Math.round((nutriments.proteins_100g ?? nutriments.proteins ?? 0) * 10) / 10;
      const carbsG = Math.round((nutriments.carbohydrates_100g ?? nutriments.carbohydrates ?? 0) * 10) / 10;
      const fatsG = Math.round((nutriments.fat_100g ?? nutriments.fat ?? 0) * 10) / 10;
      const fiberG = Math.round((nutriments.fiber_100g ?? nutriments.fiber ?? 0) * 10) / 10;

      const name = p.product_name_en || p.product_name || `Scanned Product (${cleanCode})`;
      const nameAr = p.product_name_ar || name;

      // Guess category based on dominant macro
      let category: FoodCategory = 'snacks';
      if (proteinG >= 15) category = 'protein';
      else if (carbsG >= 30) category = 'carbs';
      else if (fatsG >= 20) category = 'fats';

      const { defaultServingGrams, servingUnit } = extractServingInfo(p);

      const item: FoodItem = {
        id: `off-${cleanCode}`,
        nameEn: name,
        nameAr: nameAr,
        brand: p.brands,
        category,
        preparation: 'packaged',
        servingUnit,
        servingSizeGrams: 100,
        defaultServingGrams,
        calories,
        proteinG,
        carbsG,
        fatsG,
        fiberG,
        barcode: cleanCode,
        isVerified: true
      };

      return item;
    } catch (err) {
      console.warn('Open Food Facts API lookup failed, falling back:', err);
      return null;
    }
  },

  /**
   * Search Open Food Facts live database for packaged grocery foods
   */
  async searchOnline(query: string): Promise<FoodItem[]> {
    if (!query || query.length < 3) return [];

    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query
      )}&search_simple=1&action=process&json=1&page_size=10`;

      const res = await fetch(url, {
        headers: { 'User-Agent': 'WorkoutsPRO - Coach OS' },
        signal: AbortSignal.timeout(6000)
      });

      if (!res.ok) return [];
      const data = await res.json();

      if (!data.products || !Array.isArray(data.products)) return [];

      return data.products
        .filter((p: OpenFoodFactsProduct) => p.nutriments && p.product_name)
        .map((p: OpenFoodFactsProduct) => {
          const nutriments = p.nutriments || {};
          const calories = Math.round(nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'] ?? 0);
          const proteinG = Math.round((nutriments.proteins_100g ?? nutriments.proteins ?? 0) * 10) / 10;
          const carbsG = Math.round((nutriments.carbohydrates_100g ?? nutriments.carbohydrates ?? 0) * 10) / 10;
          const fatsG = Math.round((nutriments.fat_100g ?? nutriments.fat ?? 0) * 10) / 10;
          const fiberG = Math.round((nutriments.fiber_100g ?? nutriments.fiber ?? 0) * 10) / 10;

          const name = p.product_name_en || p.product_name || 'Grocery Item';
          const nameAr = p.product_name_ar || name;
          const { defaultServingGrams, servingUnit } = extractServingInfo(p);

          return {
            id: `off-${p.code || Math.random().toString(36).substring(2, 8)}`,
            nameEn: name,
            nameAr: nameAr,
            brand: p.brands,
            category: 'snacks' as FoodCategory,
            preparation: 'packaged' as const,
            servingUnit,
            servingSizeGrams: 100,
            defaultServingGrams,
            calories,
            proteinG,
            carbsG,
            fatsG,
            fiberG,
            barcode: p.code,
            isVerified: true
          };
        });
    } catch {
      return [];
    }
  }
};
