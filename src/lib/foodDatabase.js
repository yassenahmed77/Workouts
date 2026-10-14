/**
 * @file foodDatabase.js
 * @description قاعدة بيانات الأغذية المعتمدة وحاسبة الماكروز بالجرام
 */

/**
  * Official USDA FoodData Central & Certified Athletic Database
  * All values are strictly calibrated per 100 grams for absolute precision.
  */
export const VERIFIED_FOOD_DATABASE = [
  // ==========================================
  // PROTEINS (POULTRY, MEAT, SEAFOOD, EGGS)
  // ==========================================
  {
    id: 'food-chicken-breast-cooked',
    nameEn: 'Chicken Breast (Grilled / Boiled)',
    nameAr: 'ØµØ¯ÙˆØ± Ø¯Ø¬Ø§Ø¬ Ù…Ø´ÙˆÙŠØ© / Ù…Ø³Ù„ÙˆÙ‚Ø©',
    category: 'protein',
    preparation: 'cooked',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 165,
    proteinG: 31.0,
    carbsG: 0.0,
    fatsG: 3.6,
    fiberG: 0.0,
    isVerified: true
  },
  {
    id: 'food-chicken-breast-raw',
    nameEn: 'Chicken Breast (Raw / Skinless)',
    nameAr: 'ØµØ¯ÙˆØ± Ø¯Ø¬Ø§Ø¬ Ù†ÙŠØ© (Ø¨Ø¯ÙˆÙ† Ø¬Ù„Ø¯)',
    category: 'protein',
    preparation: 'raw',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 120,
    proteinG: 22.5,
    carbsG: 0.0,
    fatsG: 2.6,
    fiberG: 0.0,
    isVerified: true
  },
  {
    id: 'food-chicken-thigh-cooked',
    nameEn: 'Chicken Thigh (Skinless, Cooked)',
    nameAr: 'Ø£ÙˆØ±Ø§Ùƒ Ø¯Ø¬Ø§Ø¬ Ù…Ø´ÙˆÙŠØ© Ø¨Ø¯ÙˆÙ† Ø¬Ù„Ø¯',
    category: 'protein',
    preparation: 'cooked',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 209,
    proteinG: 26.0,
    carbsG: 0.0,
    fatsG: 10.9,
    fiberG: 0.0,
    isVerified: true
  },
  {
    id: 'food-beef-mince-95',
    nameEn: 'Lean Ground Beef 95/5 (Cooked)',
    nameAr: 'Ù„Ø­Ù…Ø© Ù…ÙØ±ÙˆÙ…Ø© Ø®Ø§Ù„ÙŠØ© Ø§Ù„Ø¯Ù‡Ù† 95/5 (Ù…Ø³ØªÙˆÙŠØ©)',
    category: 'protein',
    preparation: 'cooked',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 171,
    proteinG: 26.1,
    carbsG: 0.0,
    fatsG: 6.5,
    fiberG: 0.0,
    isVerified: true
  },
  {
    id: 'food-beef-mince-90',
    nameEn: 'Lean Ground Beef 90/10 (Cooked)',
    nameAr: 'Ù„Ø­Ù…Ø© Ù…ÙØ±ÙˆÙ…Ø© Ø­Ù…Ø±Ø§Ø¡ 90/10 (Ù…Ø³ØªÙˆÙŠØ©)',
    category: 'protein',
    preparation: 'cooked',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 217,
    proteinG: 26.1,
    carbsG: 0.0,
    fatsG: 11.8,
    fiberG: 0.0,
    isVerified: true
  },
  {
    id: 'food-beef-tenderloin-cooked',
    nameEn: 'Beef Tenderloin / Fillet (Cooked)',
    nameAr: 'ÙÙŠÙ„ÙŠÙ‡ Ø¨Ù‚Ø±ÙŠ Ù…Ø´ÙˆÙŠ (ØªÙ†Ø¯Ø±Ù„ÙˆÙŠÙ†)',
    category: 'protein',
    preparation: 'cooked',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 192,
    proteinG: 28.0,
    carbsG: 0.0,
    fatsG: 8.1,
    fiberG: 0.0,
    isVerified: true
  },
  {
    id: 'food-tuna-water-canned',
    nameEn: 'Canned Tuna in Water (Drained)',
    nameAr: 'ØªÙˆÙ†Ø© Ù‚Ø·Ø¹ ÙÙŠ Ù…Ø§Ø¡ Ù…ØµÙØ§Ø©',
    category: 'protein',
    preparation: 'packaged',
    servingUnit: '100g (1 can ~140g)',
    servingSizeGrams: 100,
    calories: 116,
    proteinG: 25.5,
    carbsG: 0.0,
    fatsG: 0.8,
    fiberG: 0.0,
    barcode: '8004030012015',
    isVerified: true
  },
  {
    id: 'food-white-fish-cooked',
    nameEn: 'Tilapia / White Fish Fillet (Cooked)',
    nameAr: 'Ø³Ù…Ùƒ Ø¨Ù„Ø·ÙŠ Ù…Ø´ÙˆÙŠ / ÙÙŠÙ„ÙŠÙ‡ Ù‚Ø´Ø± Ø¨ÙŠØ§Ø¶',
    category: 'protein',
    preparation: 'cooked',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 128,
    proteinG: 26.2,
    carbsG: 0.0,
    fatsG: 2.7,
    fiberG: 0.0,
    isVerified: true
  },
  {
    id: 'food-salmon-cooked',
    nameEn: 'Atlantic Salmon (Cooked)',
    nameAr: 'Ø³Ù„Ù…ÙˆÙ† Ù†Ø±ÙˆÙŠØ¬ÙŠ Ù…Ø´ÙˆÙŠ',
    category: 'protein',
    preparation: 'cooked',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 208,
    proteinG: 22.1,
    carbsG: 0.0,
    fatsG: 12.4,
    fiberG: 0.0,
    isVerified: true
  },
  {
    id: 'food-shrimp-cooked',
    nameEn: 'Shrimp / Prawns (Steamed / Grilled)',
    nameAr: 'Ø¬Ù…Ø¨Ø±ÙŠ Ù…Ø´ÙˆÙŠ / Ù…Ø³Ù„ÙˆÙ‚',
    category: 'protein',
    preparation: 'cooked',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 99,
    proteinG: 24.0,
    carbsG: 0.2,
    fatsG: 0.3,
    fiberG: 0.0,
    isVerified: true
  },
  {
    id: 'food-egg-whole-cooked',
    nameEn: 'Whole Egg (Boiled / Cooked)',
    nameAr: 'Ø¨ÙŠØ¶ ÙƒØ§Ù…Ù„ Ù…Ø³Ù„ÙˆÙ‚ (Ø§Ù„ÙˆØ§Ø­Ø¯Ø© ~50g)',
    category: 'protein',
    preparation: 'cooked',
    servingUnit: '100g (~2 large eggs)',
    servingSizeGrams: 100,
    calories: 143,
    proteinG: 12.6,
    carbsG: 0.7,
    fatsG: 9.5,
    fiberG: 0.0,
    isVerified: true
  },
  {
    id: 'food-egg-whites',
    nameEn: 'Liquid Egg Whites (Cooked / Raw)',
    nameAr: 'Ø¨ÙŠØ§Ø¶ Ø¨ÙŠØ¶ Ù…Ø³Ù„ÙˆÙ‚ / Ø³Ø§Ø¦Ù„',
    category: 'protein',
    preparation: 'liquid',
    servingUnit: '100g (~3 large egg whites)',
    servingSizeGrams: 100,
    calories: 52,
    proteinG: 10.9,
    carbsG: 0.7,
    fatsG: 0.2,
    fiberG: 0.0,
    isVerified: true
  },
  {
    id: 'food-turkey-breast-deli',
    nameEn: 'Smoked Turkey Breast (Deli Slices)',
    nameAr: 'ØµØ¯ÙˆØ± Ø±ÙˆÙ…ÙŠ Ù…Ø¯Ø®Ù†',
    category: 'protein',
    preparation: 'packaged',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 104,
    proteinG: 24.0,
    carbsG: 1.2,
    fatsG: 0.5,
    fiberG: 0.0,
    isVerified: true
  },

  // ==========================================
  // DAIRY & CHEESE
  // ==========================================
  {
    id: 'food-cottage-cheese-areesh',
    nameEn: 'Egyptian Cottage Cheese (Gebna Areesh)',
    nameAr: 'Ø¬Ø¨Ù†Ø© Ù‚Ø±ÙŠØ´ ÙÙ„Ø§Ø­ÙŠ Ù…ØµØ±ÙŠ',
    category: 'dairy',
    preparation: 'cooked',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 81,
    proteinG: 11.8,
    carbsG: 4.3,
    fatsG: 1.6,
    fiberG: 0.0,
    isVerified: true
  },
  {
    id: 'food-greek-yogurt-0',
    nameEn: 'Greek Yogurt 0% Fat (Plain)',
    nameAr: 'Ø²Ø¨Ø§Ø¯ÙŠ ÙŠÙˆÙ†Ø§Ù†ÙŠ Ø³Ø§Ø¯Ø© 0% Ø¯Ø³Ù…',
    brand: 'Almarai / Juhayna / Fage',
    category: 'dairy',
    preparation: 'packaged',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 59,
    proteinG: 10.3,
    carbsG: 3.6,
    fatsG: 0.4,
    fiberG: 0.0,
    barcode: '6281007010412',
    isVerified: true
  },
  {
    id: 'food-milk-skimmed',
    nameEn: 'Skimmed Milk (0% Fat)',
    nameAr: 'Ø­Ù„ÙŠØ¨ Ø®Ø§Ù„ÙŠ Ø§Ù„Ø¯Ø³Ù…',
    category: 'dairy',
    preparation: 'liquid',
    servingUnit: '100ml',
    servingSizeGrams: 100,
    calories: 35,
    proteinG: 3.4,
    carbsG: 4.9,
    fatsG: 0.1,
    fiberG: 0.0,
    isVerified: true
  },
  {
    id: 'food-milk-whole',
    nameEn: 'Whole Milk (Full Cream)',
    nameAr: 'Ø­Ù„ÙŠØ¨ ÙƒØ§Ù…Ù„ Ø§Ù„Ø¯Ø³Ù…',
    category: 'dairy',
    preparation: 'liquid',
    servingUnit: '100ml',
    servingSizeGrams: 100,
    calories: 61,
    proteinG: 3.2,
    carbsG: 4.8,
    fatsG: 3.3,
    fiberG: 0.0,
    isVerified: true
  },
  {
    id: 'food-cheese-mozzarella-light',
    nameEn: 'Light Mozzarella Cheese',
    nameAr: 'Ø¬Ø¨Ù†Ø© Ù…ÙˆØ²Ø§Ø±ÙŠÙ„Ø§ Ù„Ø§ÙŠØª',
    category: 'dairy',
    preparation: 'packaged',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 240,
    proteinG: 28.0,
    carbsG: 2.0,
    fatsG: 13.0,
    fiberG: 0.0,
    isVerified: true
  },

  // ==========================================
  // CARBOHYDRATES (GRAINS, POTATOES, PASTA)
  // ==========================================
  {
    id: 'food-white-rice-cooked',
    nameEn: 'White Rice (Cooked, No Oil)',
    nameAr: 'Ø£Ø±Ø² Ø£Ø¨ÙŠØ¶ Ù…ØµØ±ÙŠ Ù…Ø³Ù„ÙˆÙ‚ Ø¨Ø¯ÙˆÙ† Ø²ÙŠØª',
    category: 'carbs',
    preparation: 'cooked',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 130,
    proteinG: 2.7,
    carbsG: 28.2,
    fatsG: 0.3,
    fiberG: 0.4,
    isVerified: true
  },
  {
    id: 'food-basmati-rice-cooked',
    nameEn: 'Basmati Rice (Cooked, Steamed)',
    nameAr: 'Ø£Ø±Ø² Ø¨Ø³Ù…ØªÙŠ Ù…Ø³Ù„ÙˆÙ‚ / Ø¹Ù„Ù‰ Ø§Ù„Ø¨Ø®Ø§Ø±',
    category: 'carbs',
    preparation: 'cooked',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 121,
    proteinG: 3.5,
    carbsG: 25.2,
    fatsG: 0.4,
    fiberG: 0.4,
    isVerified: true
  },
  {
    id: 'food-white-rice-raw',
    nameEn: 'White / Jasmine Rice (Raw, Dry Grain)',
    nameAr: 'Ø£Ø±Ø² Ø£Ø¨ÙŠØ¶ ØºÙŠØ± Ù…Ø·Ø¨ÙˆØ® (Ø­Ø¨ÙˆØ¨ Ø¬Ø§ÙØ©)',
    category: 'carbs',
    preparation: 'raw',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 365,
    proteinG: 7.1,
    carbsG: 80.0,
    fatsG: 0.7,
    fiberG: 1.3,
    isVerified: true
  },
  {
    id: 'food-rolled-oats-dry',
    nameEn: 'Rolled Oats (Dry Flakes)',
    nameAr: 'Ø´ÙˆÙØ§Ù† Ø­Ø¨Ø© ÙƒØ§Ù…Ù„Ø© (Ø¬Ø§Ù)',
    brand: 'Quaker / Linas',
    category: 'carbs',
    preparation: 'raw',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 379,
    proteinG: 13.2,
    carbsG: 67.7,
    fatsG: 6.5,
    fiberG: 10.1,
    barcode: '030000010402',
    isVerified: true
  },
  {
    id: 'food-cooked-oatmeal',
    nameEn: 'Cooked Oatmeal (Made with Water)',
    nameAr: 'Ø´ÙˆÙØ§Ù† Ù…Ø·Ø¨ÙˆØ® Ø¨Ø§Ù„Ù…Ø§Ø¡',
    category: 'carbs',
    preparation: 'cooked',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 71,
    proteinG: 2.5,
    carbsG: 12.0,
    fatsG: 1.5,
    fiberG: 1.7,
    isVerified: true
  },
  {
    id: 'food-sweet-potato-cooked',
    nameEn: 'Sweet Potato (Baked / Boiled)',
    nameAr: 'Ø¨Ø·Ø§Ø·Ø§ Ø­Ù„ÙˆØ© Ù…Ø³Ù„ÙˆÙ‚Ø© / Ù…Ø´ÙˆÙŠØ©',
    category: 'carbs',
    preparation: 'cooked',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 90,
    proteinG: 2.0,
    carbsG: 20.7,
    fatsG: 0.2,
    fiberG: 3.3,
    isVerified: true
  },
  {
    id: 'food-potato-cooked',
    nameEn: 'Potato (Boiled / Baked, No Skin)',
    nameAr: 'Ø¨Ø·Ø§Ø·Ø³ Ù…Ø³Ù„ÙˆÙ‚Ø© / Ù…Ø´ÙˆÙŠØ© Ø¨Ø¯ÙˆÙ† Ø²ÙŠØª',
    category: 'carbs',
    preparation: 'cooked',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 87,
    proteinG: 1.9,
    carbsG: 20.1,
    fatsG: 0.1,
    fiberG: 1.8,
    isVerified: true
  },
  {
    id: 'food-pasta-cooked',
    nameEn: 'Pasta (Cooked, Durum Semolina)',
    nameAr: 'Ù…ÙƒØ±ÙˆÙ†Ø© Ù…Ø³Ù„ÙˆÙ‚Ø© Ø¨Ø¯ÙˆÙ† ØµÙˆØµ',
    category: 'carbs',
    preparation: 'cooked',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 158,
    proteinG: 5.8,
    carbsG: 30.9,
    fatsG: 0.9,
    fiberG: 1.8,
    isVerified: true
  },
  {
    id: 'food-pasta-raw',
    nameEn: 'Pasta (Dry, Uncooked)',
    nameAr: 'Ù…ÙƒØ±ÙˆÙ†Ø© Ø¬Ø§ÙØ© ØºÙŠØ± Ù…Ø·Ø¨ÙˆØ®Ø©',
    category: 'carbs',
    preparation: 'raw',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 371,
    proteinG: 13.0,
    carbsG: 74.0,
    fatsG: 1.5,
    fiberG: 3.2,
    isVerified: true
  },
  {
    id: 'food-cream-of-rice',
    nameEn: 'Cream of Rice (Dry Powder)',
    nameAr: 'Ø¨ÙˆØ¯Ø±Ø© ÙƒØ±ÙŠÙ…Ø© Ø§Ù„Ø£Ø±Ø² (Ø³Ø±ÙŠØ¹Ø© Ø§Ù„ØªØ­Ø¶ÙŠØ±)',
    category: 'carbs',
    preparation: 'raw',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 360,
    proteinG: 7.0,
    carbsG: 80.0,
    fatsG: 0.5,
    fiberG: 1.0,
    isVerified: true
  },
  {
    id: 'food-rice-cakes',
    nameEn: 'Rice Cakes (Plain, Unsalted)',
    nameAr: 'Ø±Ø§ÙŠØ³ ÙƒÙŠÙƒ Ø³Ø§Ø¯Ø© (Ø§Ù„Ù‚Ø±Øµ ~9g)',
    category: 'carbs',
    preparation: 'packaged',
    servingUnit: '100g (~11 cakes)',
    servingSizeGrams: 100,
    calories: 387,
    proteinG: 8.2,
    carbsG: 81.5,
    fatsG: 2.8,
    fiberG: 4.1,
    isVerified: true
  },
  {
    id: 'food-toast-wheat',
    nameEn: 'Whole Wheat Toast / Bread',
    nameAr: 'ØªÙˆØ³Øª Ø¨Ù†ÙŠ Ù‚Ù…Ø­ ÙƒØ§Ù…Ù„ (Ø§Ù„Ø´Ø±ÙŠØ­Ø© ~30g)',
    category: 'carbs',
    preparation: 'packaged',
    servingUnit: '100g (~3 slices)',
    servingSizeGrams: 100,
    calories: 247,
    proteinG: 13.0,
    carbsG: 41.0,
    fatsG: 3.4,
    fiberG: 7.0,
    isVerified: true
  },

  // ==========================================
  // EGYPTIAN SPECIALTIES
  // ==========================================
  {
    id: 'food-baladi-bread',
    nameEn: 'Egyptian Baladi Bread (Aish Baladi)',
    nameAr: 'Ø¹ÙŠØ´ Ø¨Ù„Ø¯ÙŠ Ù…ØµØ±ÙŠ Ø¨Ø±Ø¯Ø© (Ø§Ù„Ø±ØºÙŠÙ ~100-110g)',
    category: 'egyptian_staples',
    preparation: 'cooked',
    servingUnit: '100g (1 medium loaf)',
    servingSizeGrams: 100,
    calories: 260,
    proteinG: 9.0,
    carbsG: 52.0,
    fatsG: 1.5,
    fiberG: 4.5,
    isVerified: true
  },
  {
    id: 'food-foul-medames-no-oil',
    nameEn: 'Foul Medames (Cooked Fava Beans, No Oil)',
    nameAr: 'ÙÙˆÙ„ Ù…Ø¯Ù…Ø³ Ù…Ø³Ù„ÙˆÙ‚ Ø¨Ø¯ÙˆÙ† Ø²ÙŠØª ÙˆØ·Ø­ÙŠÙ†Ø©',
    category: 'egyptian_staples',
    preparation: 'cooked',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 110,
    proteinG: 7.6,
    carbsG: 19.8,
    fatsG: 0.4,
    fiberG: 5.5,
    isVerified: true
  },
  {
    id: 'food-rice-with-vermicelli',
    nameEn: 'Egyptian Rice with Vermicelli (Rozz b Sheraya)',
    nameAr: 'Ø£Ø±Ø² Ù…ØµØ±ÙŠ Ø¨Ø§Ù„Ø´Ø¹Ø±ÙŠØ© Ø®ÙÙŠÙ Ø§Ù„Ø¯Ù‡Ù†',
    category: 'egyptian_staples',
    preparation: 'cooked',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 145,
    proteinG: 2.8,
    carbsG: 27.5,
    fatsG: 2.6,
    fiberG: 0.8,
    isVerified: true
  },
  {
    id: 'food-tahini',
    nameEn: 'Pure Sesame Tahini Paste',
    nameAr: 'Ø·Ø­ÙŠÙ†Ø© Ø³Ù…Ø³Ù… Ø®Ø§Ù… Ù†Ù‚ÙŠØ© (Ø§Ù„Ù…Ù„Ø¹Ù‚Ø© ~15g)',
    category: 'egyptian_staples',
    preparation: 'packaged',
    servingUnit: '100g (~6.5 tbsp)',
    servingSizeGrams: 100,
    calories: 595,
    proteinG: 17.0,
    carbsG: 21.2,
    fatsG: 53.8,
    fiberG: 9.3,
    isVerified: true
  },

  // ==========================================
  // HEALTHY FATS & OILS
  // ==========================================
  {
    id: 'food-olive-oil',
    nameEn: 'Extra Virgin Olive Oil',
    nameAr: 'Ø²ÙŠØª Ø²ÙŠØªÙˆÙ† Ø¨ÙƒØ± Ù…Ù…ØªØ§Ø² (Ø§Ù„Ù…Ù„Ø¹Ù‚Ø© ~14g)',
    category: 'fats',
    preparation: 'liquid',
    servingUnit: '100ml (~7 tbsp)',
    servingSizeGrams: 100,
    calories: 884,
    proteinG: 0.0,
    carbsG: 0.0,
    fatsG: 100.0,
    fiberG: 0.0,
    isVerified: true
  },
  {
    id: 'food-peanut-butter-pure',
    nameEn: 'Natural Peanut Butter (100% Peanuts)',
    nameAr: 'Ø²Ø¨Ø¯Ø© ÙÙˆÙ„ Ø³ÙˆØ¯Ø§Ù†ÙŠ Ø·Ø¨ÙŠØ¹ÙŠØ© 100% Ø¨Ø¯ÙˆÙ† Ø³ÙƒØ±',
    brand: 'Abu Auf / Healthy Spread',
    category: 'fats',
    preparation: 'packaged',
    servingUnit: '100g (~3 tbsp)',
    servingSizeGrams: 100,
    calories: 588,
    proteinG: 25.1,
    carbsG: 20.0,
    fatsG: 50.4,
    fiberG: 8.0,
    barcode: '6224008129031',
    isVerified: true
  },
  {
    id: 'food-almonds-raw',
    nameEn: 'Raw Almonds (Unsalted)',
    nameAr: 'Ù„ÙˆØ² Ù†ÙŠ ØºÙŠØ± Ù…Ø­Ù…Øµ Ø¨Ø¯ÙˆÙ† Ù…Ù„Ø­',
    category: 'fats',
    preparation: 'raw',
    servingUnit: '100g (~23-28 nuts is ~30g)',
    servingSizeGrams: 100,
    calories: 579,
    proteinG: 21.2,
    carbsG: 21.6,
    fatsG: 49.9,
    fiberG: 12.5,
    isVerified: true
  },
  {
    id: 'food-walnuts-raw',
    nameEn: 'Raw Walnuts',
    nameAr: 'Ø¹ÙŠÙ† Ø¬Ù…Ù„ Ù†ÙŠ (Ø¬ÙˆØ²)',
    category: 'fats',
    preparation: 'raw',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 654,
    proteinG: 15.2,
    carbsG: 13.7,
    fatsG: 65.2,
    fiberG: 6.7,
    isVerified: true
  },
  {
    id: 'food-avocado-fresh',
    nameEn: 'Hass Avocado (Fresh Flesh)',
    nameAr: 'Ø£ÙÙˆÙƒØ§Ø¯Ùˆ Ø·Ø§Ø²Ø¬',
    category: 'fats',
    preparation: 'raw',
    servingUnit: '100g (~0.5 medium avocado)',
    servingSizeGrams: 100,
    calories: 160,
    proteinG: 2.0,
    carbsG: 8.5,
    fatsG: 14.7,
    fiberG: 6.7,
    isVerified: true
  },
  {
    id: 'food-chia-seeds',
    nameEn: 'Chia Seeds (Raw)',
    nameAr: 'Ø¨Ø°ÙˆØ± Ø§Ù„Ø´ÙŠØ§ Ø§Ù„Ø®Ø§Ù…',
    category: 'fats',
    preparation: 'raw',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 486,
    proteinG: 16.5,
    carbsG: 42.1,
    fatsG: 30.7,
    fiberG: 34.4,
    isVerified: true
  },

  // ==========================================
  // FRUITS & BERRIES
  // ==========================================
  {
    id: 'food-banana-fresh',
    nameEn: 'Banana (Peeled Flesh)',
    nameAr: 'Ù…ÙˆØ² Ø·Ø§Ø²Ø¬ Ù…Ù‚Ø´Ø± (Ø§Ù„Ù…ØªÙˆØ³Ø·Ø© ~118g)',
    category: 'fruits',
    preparation: 'raw',
    servingUnit: '100g (~1 medium banana)',
    servingSizeGrams: 100,
    calories: 89,
    proteinG: 1.1,
    carbsG: 22.8,
    fatsG: 0.3,
    fiberG: 2.6,
    isVerified: true
  },
  {
    id: 'food-apple-fresh',
    nameEn: 'Apple (With Skin)',
    nameAr: 'ØªÙØ§Ø­ Ø·Ø§Ø²Ø¬ Ø¨Ù‚Ø´Ø±Ù‡ (Ø§Ù„Ù…ØªÙˆØ³Ø·Ø© ~150-180g)',
    category: 'fruits',
    preparation: 'raw',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 52,
    proteinG: 0.3,
    carbsG: 13.8,
    fatsG: 0.2,
    fiberG: 2.4,
    isVerified: true
  },
  {
    id: 'food-strawberries-fresh',
    nameEn: 'Strawberries (Fresh)',
    nameAr: 'ÙØ±Ø§ÙˆÙ„Ø© Ø·Ø§Ø²Ø¬Ø©',
    category: 'fruits',
    preparation: 'raw',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 32,
    proteinG: 0.7,
    carbsG: 7.7,
    fatsG: 0.3,
    fiberG: 2.0,
    isVerified: true
  },
  {
    id: 'food-blueberries-fresh',
    nameEn: 'Blueberries (Fresh)',
    nameAr: 'ØªÙˆØª Ø£Ø²Ø±Ù‚ Ø·Ø§Ø²Ø¬',
    category: 'fruits',
    preparation: 'raw',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 57,
    proteinG: 0.7,
    carbsG: 14.5,
    fatsG: 0.3,
    fiberG: 2.4,
    isVerified: true
  },
  {
    id: 'food-dates-medjool',
    nameEn: 'Dates (Medjool / Siwi, Pitted)',
    nameAr: 'ØªÙ…Ø± Ù…Ø¬Ù‡ÙˆÙ„ / Ø³ÙŠÙˆÙŠ Ù…Ù†Ø²ÙˆØ¹ Ø§Ù„Ù†ÙˆÙ‰ (Ø§Ù„Ø­Ø¨Ø© ~24g)',
    category: 'fruits',
    preparation: 'raw',
    servingUnit: '100g (~4 dates)',
    servingSizeGrams: 100,
    calories: 277,
    proteinG: 1.8,
    carbsG: 75.0,
    fatsG: 0.2,
    fiberG: 6.7,
    isVerified: true
  },
  {
    id: 'food-honey-raw',
    nameEn: 'Pure Natural Honey',
    nameAr: 'Ø¹Ø³Ù„ Ù†Ø­Ù„ Ø·Ø¨ÙŠØ¹ÙŠ Ù†Ù‚ÙŠ (Ø§Ù„Ù…Ù„Ø¹Ù‚Ø© ~21g)',
    category: 'fruits',
    preparation: 'packaged',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 304,
    proteinG: 0.3,
    carbsG: 82.4,
    fatsG: 0.0,
    fiberG: 0.2,
    isVerified: true
  },

  // ==========================================
  // VEGETABLES & GREENS
  // ==========================================
  {
    id: 'food-mixed-salad',
    nameEn: 'Mixed Green Salad (No Dressing)',
    nameAr: 'Ø³Ù„Ø·Ø© Ø®Ø¶Ø±Ø§Ø¡ Ù…Ø´ÙƒÙ„Ø© (Ø¨Ø¯ÙˆÙ† Ø¯Ø±ÙŠØ³Ù†Ø¬)',
    category: 'vegetables',
    preparation: 'raw',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 17,
    proteinG: 1.2,
    carbsG: 3.2,
    fatsG: 0.2,
    fiberG: 1.6,
    isVerified: true
  },
  {
    id: 'food-broccoli-cooked',
    nameEn: 'Broccoli (Steamed / Boiled)',
    nameAr: 'Ø¨Ø±ÙˆÙƒÙ„ÙŠ Ù…Ø·Ø¨ÙˆØ® Ø¹Ù„Ù‰ Ø§Ù„Ø¨Ø®Ø§Ø±',
    category: 'vegetables',
    preparation: 'cooked',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 35,
    proteinG: 2.4,
    carbsG: 7.2,
    fatsG: 0.4,
    fiberG: 3.3,
    isVerified: true
  },
  {
    id: 'food-cucumber-fresh',
    nameEn: 'Cucumber (Fresh with Peel)',
    nameAr: 'Ø®ÙŠØ§Ø± Ø·Ø§Ø²Ø¬ Ø¨Ù‚Ø´Ø±Ù‡',
    category: 'vegetables',
    preparation: 'raw',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 15,
    proteinG: 0.7,
    carbsG: 3.6,
    fatsG: 0.1,
    fiberG: 0.5,
    isVerified: true
  },
  {
    id: 'food-spinach-raw',
    nameEn: 'Baby Spinach (Raw)',
    nameAr: 'Ø³Ø¨Ø§Ù†Ø® Ø·Ø§Ø²Ø¬Ø©',
    category: 'vegetables',
    preparation: 'raw',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 23,
    proteinG: 2.9,
    carbsG: 3.6,
    fatsG: 0.4,
    fiberG: 2.2,
    isVerified: true
  },
  {
    id: 'food-tomato-fresh',
    nameEn: 'Tomato (Red, Ripe)',
    nameAr: 'Ø·Ù…Ø§Ø·Ù… Ø­Ù…Ø±Ø§Ø¡ Ø·Ø§Ø²Ø¬Ø©',
    category: 'vegetables',
    preparation: 'raw',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 18,
    proteinG: 0.9,
    carbsG: 3.9,
    fatsG: 0.2,
    fiberG: 1.2,
    isVerified: true
  },

  // ==========================================
  // SUPPLEMENTS & FITNESS POWDERS
  // ==========================================
  {
    id: 'food-whey-isolate',
    nameEn: 'Whey Protein Isolate (100% WPI)',
    nameAr: 'ÙˆØ§ÙŠ Ø¨Ø±ÙˆØªÙŠÙ† Ø£ÙŠØ²ÙˆÙ„ÙŠØª Ø¨ÙˆØ¯Ø±Ø© (Ø³ÙƒÙˆØ¨ 30g = 26.4g P)',
    brand: 'Optimum Nutrition / Dymatize ISO 100',
    category: 'supplements',
    preparation: 'packaged',
    servingUnit: '100g (~3.3 scoops)',
    servingSizeGrams: 100,
    calories: 370,
    proteinG: 88.0,
    carbsG: 2.0,
    fatsG: 1.0,
    fiberG: 0.0,
    barcode: '748927028669',
    isVerified: true
  },
  {
    id: 'food-whey-concentrate',
    nameEn: 'Whey Protein Concentrate (80% WPC)',
    nameAr: 'ÙˆØ§ÙŠ Ø¨Ø±ÙˆØªÙŠÙ† Ø¬ÙˆÙ„Ø¯ Ø³ØªØ§Ù†Ø¯Ø±Ø¯ (Ø³ÙƒÙˆØ¨ 30g = 24g P)',
    brand: 'Optimum Nutrition Gold Standard',
    category: 'supplements',
    preparation: 'packaged',
    servingUnit: '100g (~3.3 scoops)',
    servingSizeGrams: 100,
    calories: 390,
    proteinG: 78.0,
    carbsG: 8.0,
    fatsG: 5.0,
    fiberG: 0.0,
    barcode: '748927024104',
    isVerified: true
  },
  {
    id: 'food-casein-powder',
    nameEn: 'Micellar Casein Protein Powder',
    nameAr: 'Ù…ÙŠØ³ÙŠÙ„Ø§Ø± ÙƒØ§Ø²ÙŠÙ† Ø¨ÙˆØ¯Ø±Ø© (Ø¨Ø·ÙŠØ¡ Ø§Ù„Ø§Ù…ØªØµØ§Øµ)',
    brand: 'Optimum Nutrition',
    category: 'supplements',
    preparation: 'packaged',
    servingUnit: '100g',
    servingSizeGrams: 100,
    calories: 360,
    proteinG: 78.0,
    carbsG: 4.0,
    fatsG: 1.5,
    fiberG: 0.0,
    isVerified: true
  },
  {
    id: 'food-creatine-monohydrate',
    nameEn: 'Creatine Monohydrate (Creapure)',
    nameAr: 'ÙƒØ±ÙŠØ§ØªÙŠÙ† Ù…ÙˆÙ†ÙˆÙ‡ÙŠØ¯Ø±Ø§Øª Ù†Ù‚ÙŠ (5g Ø³ÙƒÙˆØ¨ = 0 Ø³Ø¹Ø±Ø©)',
    brand: 'Universal / ON',
    category: 'supplements',
    preparation: 'packaged',
    servingUnit: '5g scoop',
    servingSizeGrams: 100,
    calories: 0,
    proteinG: 0.0,
    carbsG: 0.0,
    fatsG: 0.0,
    fiberG: 0.0,
    isVerified: true
  }
];

/**
  * Calculate macros dynamically for any exact gram weight.
  * Formula: (grams / 100) * baseMacro
  */
export function calculateMacrosForGrams(food, grams) {
  const g = Math.max(0, Number(grams) || 0);
  const ratio = g / (food.servingSizeGrams || 100);

  return {
    grams: g,
    calories: Math.round(food.calories * ratio),
    proteinG: Math.round(food.proteinG * ratio * 10) / 10,
    carbsG: Math.round(food.carbsG * ratio * 10) / 10,
    fatsG: Math.round(food.fatsG * ratio * 10) / 10,
    fiberG: food.fiberG !== undefined ? Math.round(food.fiberG * ratio * 10) / 10 : 0
  };
}

/**
 * High-performance search with bilingual support (English + Arabic + Brand + Barcode)
 */
export function searchFoodDatabase(items, query, category, prep) {
  const q = query.trim().toLowerCase();

  return items.filter((item) => {
    // Category filter
    if (category && category !== 'all' && item.category !== category) {
      return false;
    }

    // Preparation filter (Cooked vs Raw vs Packaged)
    if (prep && prep !== 'all' && item.preparation !== prep) {
      return false;
    }

    // Query text match
    if (!q) return true;

    return (
      item.nameEn.toLowerCase().includes(q) ||
      item.nameAr.toLowerCase().includes(q) ||
      (item.brand && item.brand.toLowerCase().includes(q)) ||
      (item.barcode && item.barcode.includes(q))
    );
  });
}

