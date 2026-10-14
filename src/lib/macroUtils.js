/**
 * @file macroUtils.js
 * @description موديول موحد لحساب الماكروز والسعرات الحرارية للوجبات والأصناف الغذائية.
 * يحل مشكلة تكرار دوال reduce لحساب البروتين والكارب والدهون والسعرات عبر 6 مكونات مختلفة.
 */

/**
 * حساب مجموع الماكروز والسعرات لقائمة من الأصناف الغذائية (Items)
 * @param {Array<{ calories?: number, proteinG?: number, carbsG?: number, fatsG?: number }>} items - أصناف الوجبة
 * @returns {{ calories: number, proteinG: number, carbsG: number, fatsG: number }} المجموع الكلي
 */
export function calculateItemsMacros(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { calories: 0, proteinG: 0, carbsG: 0, fatsG: 0 };
  }

  let calories = 0;
  let proteinG = 0;
  let carbsG = 0;
  let fatsG = 0;

  for (const item of items) {
    if (!item) continue;
    calories += Number(item.calories) || 0;
    proteinG += Number(item.proteinG) || 0;
    carbsG += Number(item.carbsG) || 0;
    fatsG += Number(item.fatsG) || 0;
  }

  return {
    calories: Math.round(calories),
    proteinG: Math.round(proteinG * 10) / 10,
    carbsG: Math.round(carbsG * 10) / 10,
    fatsG: Math.round(fatsG * 10) / 10
  };
}

/**
 * حساب إجمالي اليوم لكل الوجبات (Meals Daily Totals)
 * @param {Array<{ items?: Array<any> }>} meals - قائمة وجبات اليوم
 * @returns {{ calories: number, proteinG: number, carbsG: number, fatsG: number }} الإجمالي اليومي
 */
export function calculateDailyMealTotals(meals) {
  if (!Array.isArray(meals) || meals.length === 0) {
    return { calories: 0, proteinG: 0, carbsG: 0, fatsG: 0 };
  }

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  for (const meal of meals) {
    if (!meal || !Array.isArray(meal.items)) continue;
    const mealTotals = calculateItemsMacros(meal.items);
    totalCalories += mealTotals.calories;
    totalProtein += mealTotals.proteinG;
    totalCarbs += mealTotals.carbsG;
    totalFats += mealTotals.fatsG;
  }

  return {
    calories: Math.round(totalCalories),
    proteinG: Math.round(totalProtein * 10) / 10,
    carbsG: Math.round(totalCarbs * 10) / 10,
    fatsG: Math.round(totalFats * 10) / 10
  };
}

/**
 * حساب الماكروز لوزن معين بالجرام بناءً على القيمة لكل 100 جرام
 * @param {{ calories: number, proteinG: number, carbsG: number, fatsG: number }} basePer100g - القيم الغذائية لـ 100 جرام
 * @param {number} grams - الوزن الفعلي بالجرام
 * @returns {{ calories: number, proteinG: number, carbsG: number, fatsG: number }} القيم الغذائية المحسوبة للوزن
 */
export function calculateMacrosForGrams(basePer100g, grams) {
  const safeGrams = Math.max(0, Number(grams) || 0);
  const factor = safeGrams / 100;

  return {
    calories: Math.round((Number(basePer100g.calories) || 0) * factor),
    proteinG: Math.round((Number(basePer100g.proteinG) || 0) * factor * 10) / 10,
    carbsG: Math.round((Number(basePer100g.carbsG) || 0) * factor * 10) / 10,
    fatsG: Math.round((Number(basePer100g.fatsG) || 0) * factor * 10) / 10
  };
}
