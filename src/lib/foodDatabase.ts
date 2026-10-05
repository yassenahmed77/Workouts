import { FoodItem, FoodCategory, FoodPreparationState } from '@/types';

/**
  * Official USDA FoodData Central & Certified Athletic Database
  * All values are strictly calibrated per 100 grams for absolute precision.
  */
export const VERIFIED_FOOD_DATABASE: FoodItem[] = [
  // ==========================================
  // PROTEINS (POULTRY, MEAT, SEAFOOD, EGGS)
  // ==========================================
  {
    id: 'food-chicken-breast-cooked',
    nameEn: 'Chicken Breast (Grilled / Boiled)',
    nameAr: 'صدور دجاج مشوية / مسلوقة',
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
    nameAr: 'صدور دجاج نية (بدون جلد)',
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
    nameAr: 'أوراك دجاج مشوية بدون جلد',
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
    nameAr: 'لحمة مفرومة خالية الدهن 95/5 (مستوية)',
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
    nameAr: 'لحمة مفرومة حمراء 90/10 (مستوية)',
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
    nameAr: 'فيليه بقري مشوي (تندرلوين)',
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
    nameAr: 'تونة قطع في ماء مصفاة',
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
    nameAr: 'سمك بلطي مشوي / فيليه قشر بياض',
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
    nameAr: 'سلمون نرويجي مشوي',
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
    nameAr: 'جمبري مشوي / مسلوق',
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
    nameAr: 'بيض كامل مسلوق (الواحدة ~50g)',
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
    nameAr: 'بياض بيض مسلوق / سائل',
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
    nameAr: 'صدور رومي مدخن',
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
    nameAr: 'جبنة قريش فلاحي مصري',
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
    nameAr: 'زبادي يوناني سادة 0% دسم',
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
    nameAr: 'حليب خالي الدسم',
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
    nameAr: 'حليب كامل الدسم',
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
    nameAr: 'جبنة موزاريلا لايت',
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
    nameAr: 'أرز أبيض مصري مسلوق بدون زيت',
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
    nameAr: 'أرز بسمتي مسلوق / على البخار',
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
    nameAr: 'أرز أبيض غير مطبوخ (حبوب جافة)',
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
    nameAr: 'شوفان حبة كاملة (جاف)',
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
    nameAr: 'شوفان مطبوخ بالماء',
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
    nameAr: 'بطاطا حلوة مسلوقة / مشوية',
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
    nameAr: 'بطاطس مسلوقة / مشوية بدون زيت',
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
    nameAr: 'مكرونة مسلوقة بدون صوص',
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
    nameAr: 'مكرونة جافة غير مطبوخة',
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
    nameAr: 'بودرة كريمة الأرز (سريعة التحضير)',
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
    nameAr: 'رايس كيك سادة (القرص ~9g)',
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
    nameAr: 'توست بني قمح كامل (الشريحة ~30g)',
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
    nameAr: 'عيش بلدي مصري بردة (الرغيف ~100-110g)',
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
    nameAr: 'فول مدمس مسلوق بدون زيت وطحينة',
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
    nameAr: 'أرز مصري بالشعرية خفيف الدهن',
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
    nameAr: 'طحينة سمسم خام نقية (الملعقة ~15g)',
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
    nameAr: 'زيت زيتون بكر ممتاز (الملعقة ~14g)',
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
    nameAr: 'زبدة فول سوداني طبيعية 100% بدون سكر',
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
    nameAr: 'لوز ني غير محمص بدون ملح',
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
    nameAr: 'عين جمل ني (جوز)',
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
    nameAr: 'أفوكادو طازج',
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
    nameAr: 'بذور الشيا الخام',
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
    nameAr: 'موز طازج مقشر (المتوسطة ~118g)',
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
    nameAr: 'تفاح طازج بقشره (المتوسطة ~150-180g)',
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
    nameAr: 'فراولة طازجة',
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
    nameAr: 'توت أزرق طازج',
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
    nameAr: 'تمر مجهول / سيوي منزوع النوى (الحبة ~24g)',
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
    nameAr: 'عسل نحل طبيعي نقي (الملعقة ~21g)',
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
    nameAr: 'سلطة خضراء مشكلة (بدون دريسنج)',
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
    nameAr: 'بروكلي مطبوخ على البخار',
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
    nameAr: 'خيار طازج بقشره',
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
    nameAr: 'سبانخ طازجة',
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
    nameAr: 'طماطم حمراء طازجة',
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
    nameAr: 'واي بروتين أيزوليت بودرة (سكوب 30g = 26.4g P)',
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
    nameAr: 'واي بروتين جولد ستاندرد (سكوب 30g = 24g P)',
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
    nameAr: 'ميسيلار كازين بودرة (بطيء الامتصاص)',
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
    nameAr: 'كرياتين مونوهيدرات نقي (5g سكوب = 0 سعرة)',
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
export function calculateMacrosForGrams(food: FoodItem, grams: number) {
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
export function searchFoodDatabase(
  items: FoodItem[],
  query: string,
  category?: FoodCategory | 'all',
  prep?: FoodPreparationState | 'all'
): FoodItem[] {
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
