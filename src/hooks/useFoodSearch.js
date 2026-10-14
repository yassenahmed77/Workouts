'use client';
import { useState, useMemo } from 'react';
import { VERIFIED_FOOD_DATABASE, calculateMacrosForGrams, searchFoodDatabase } from '@/lib/foodDatabase';
import { useToast } from '@/context/ToastContext';
import { dietService } from '@/services/dietService';

/**
 * useFoodSearch - هوك مخصص لإدارة منطق البحث عن الأغذية وحساب الماكروز
 *
 * يوفر هذا الهوك:
 * 1. فلترة وتصفية قائمة الأطعمة المعتمدة والمخصصة بالاسم والقسم وحالة الطبخ.
 * 2. إدارة الأغذية المخصصة (Custom Foods) والأغذية الممسوحة بالباركود (Barcode Scanning).
 * 3. حساب السعرات والماكروز في الوقت الفعلي (Real-time Macro Calculations) حسب الجرامات.
 * 4. إدارة أوضاع إدخال الوزن (يدوي Manual مع أزرار تسريع + و -، أو جاهز Presets).
 *
 * @param {Object} params
 * @param {Array} params.customFoods - قائمة الأغذية المخصصة المحفوظة مسبقاً
 * @param {Function} [params.onSelectFood] - دالة الاستدعاء عند اختيار الطعام وتأكيد إضافته
 * @param {Function} [params.onAddCustomFood] - دالة الاستدعاء عند حفظ طعام مخصص جديد
 * @param {Function} [params.onClose] - دالة إغلاق النافذة
 */
export function useFoodSearch({
    customFoods = [],
    onSelectFood,
    onAddCustomFood,
    onClose,
    excludeFoodIds = []
}) {
    const { showToast } = useToast();

    // نصوص وفلاتر البحث
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPrep, setSelectedPrep] = useState('all');

    // نوافذ الباركود والوجبة المخصصة
    const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
    const [isCustomFoodOpen, setIsCustomFoodOpen] = useState(false);

    // أطعمة مضافة خلال جلسة العمل الحالية
    const [sessionCustomFoods, setSessionCustomFoods] = useState([]);
    const [activeIsolatedFood, setActiveIsolatedFood] = useState(null);

    // الطعام المختار وتفاصيل الوزن
    const [selectedFood, setSelectedFood] = useState(null);
    const [portionGrams, setPortionGrams] = useState(100);
    const [portionMode, setPortionMode] = useState('manual');
    const [manualGramsInput, setManualGramsInput] = useState('100');

    // حقول نموذج الطعام المخصص
    const [customForm, setCustomForm] = useState({
        nameEn: '',
        brand: '',
        category: 'protein',
        prep: 'cooked',
        portionType: 'grams',
        weightGrams: '',
        servingName: '',
        servingGramsWeight: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: ''
    });

    const updateCustomForm = (key, value) => {
        setCustomForm(prev => ({ ...prev, [key]: value }));
    };

    // دمج قاعدة البيانات المعتمدة مع الأطعمة المخصصة
    const allFoods = useMemo(() => {
        const combined = [...sessionCustomFoods, ...customFoods, ...VERIFIED_FOOD_DATABASE];
        const seen = new Set();
        return combined.filter((f) => {
            if (seen.has(f.id)) return false;
            seen.add(f.id);
            return true;
        });
    }, [sessionCustomFoods, customFoods]);

    // تصفية الأطعمة حسب البحث والفلتر واستبعاد الأطعمة المستهدفة (Exclude Target / Existing Alts)
    const displayedFoods = useMemo(() => {
        let list;
        if (activeIsolatedFood) {
            list = [activeIsolatedFood];
        } else if (selectedCategory === 'my_foods' || selectedCategory === 'custom') {
            const userOnly = allFoods.filter(f => f.isCustom || f.isUserCustom || customFoods.some(c => c.id === f.id));
            if (!searchQuery.trim()) {
                list = userOnly;
            } else {
                list = searchFoodDatabase(userOnly, searchQuery, 'all', selectedPrep);
            }
        } else {
            list = searchFoodDatabase(allFoods, searchQuery, selectedCategory, selectedPrep);
        }

        // استبعاد أي طعام مستهدف كبديل أو مضاف مسبقاً للبدائل
        if (Array.isArray(excludeFoodIds) && excludeFoodIds.length > 0) {
            const excludeSet = new Set(excludeFoodIds.map(id => String(id).toLowerCase().trim()));
            list = list.filter(f => {
                const idStr = String(f.id).toLowerCase().trim();
                const nameEnStr = String(f.nameEn || '').toLowerCase().trim();
                const nameArStr = String(f.nameAr || '').toLowerCase().trim();
                return !excludeSet.has(idStr) && !excludeSet.has(nameEnStr) && !excludeSet.has(nameArStr);
            });
        }

        return list;
    }, [activeIsolatedFood, allFoods, searchQuery, selectedCategory, selectedPrep, customFoods, excludeFoodIds]);

    // العنصر النشط حالياً في المعاينة
    const activeFood = selectedFood || displayedFoods[0] || null;

    // ذاكرة آخر حصص مستخدمة لكل طعام (Last-Used Portion Presets)
    const [lastUsedPortions, setLastUsedPortions] = useState({});

    // دالة استرجاع آخر حصة مستخدمة أو الحصة الافتراضية للطعام
    const getFoodPortion = (food) => {
        if (!food) return 100;
        const savedInMemory = lastUsedPortions[food.id];
        if (typeof savedInMemory === 'number' && savedInMemory > 0) {
            return savedInMemory;
        }
        const savedInStorage = dietService.getLastUsedPortion(food.id);
        if (typeof savedInStorage === 'number' && savedInStorage > 0) {
            return savedInStorage;
        }
        return food.defaultServingGrams || food.servingSizeGrams || 100;
    };

    // اختيار طعام من القائمة وتعيين حجم الحصة الافتراضي بناءً على آخر استخدام
    const handleSelectFoodItem = (food) => {
        setSelectedFood(food);
        const targetGrams = getFoodPortion(food);
        setPortionGrams(targetGrams);
        setManualGramsInput(String(targetGrams));
    };

    // إضافة سريعة مباشرة بلمسة واحدة (+) باستخدام آخر حجم حصة تم استخدامه
    const handleDirectQuickAdd = (food) => {
        if (!food) return;
        const targetGrams = getFoodPortion(food);
        const macros = calculateMacrosForGrams(food, targetGrams);

        // حفظ الحصة كآخر استخدام
        dietService.saveLastUsedPortion(food.id, targetGrams);
        setLastUsedPortions(prev => ({ ...prev, [food.id]: targetGrams }));

        if (onSelectFood) {
            onSelectFood(food, targetGrams, macros);
        }
        showToast(`Added ${targetGrams}g ${food.nameEn || food.nameAr || 'Food'}`, 'success');
        if (onClose) {
            onClose();
        }
    };

    // حساب الماكروز في الوقت الحقيقي للطعام النشط
    const calculatedMacros = useMemo(() => {
        if (!activeFood) {
            return { grams: 0, calories: 0, proteinG: 0, carbsG: 0, fatsG: 0 };
        }
        return calculateMacrosForGrams(activeFood, portionGrams);
    }, [activeFood, portionGrams]);

    // تغيير الجرامات يدوياً
    const handleManualGramsChange = (val) => {
        setManualGramsInput(val);
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed) && parsed > 0) {
            setPortionGrams(parsed);
        } else if (val === '') {
            setPortionGrams(0);
        }
    };

    // تعديل الجرامات بخطوات سريعة (+5, -10, +50...)
    const handleAdjustManualGrams = (delta) => {
        const current = Number(portionGrams) || 100;
        const next = Math.max(1, current + delta);
        setPortionGrams(next);
        setManualGramsInput(String(next));
    };

    // اختيار حصة جاهزة (Preset)
    const handleSelectPortionPreset = (grams) => {
        setPortionGrams(grams);
        setManualGramsInput(String(grams));
    };

    // تأكيد إضافة الطعام بالماكروز المحسوبة وحفظ الجرامات كآخر حصة مستخدمة
    const handleConfirmAdd = () => {
        if (!activeFood) return;
        const finalGrams = Math.max(1, portionGrams || activeFood.defaultServingGrams || 100);
        const finalMacros = calculateMacrosForGrams(activeFood, finalGrams);

        // حفظ الحصة الجديدة في الذاكرة والتخزين المحلي لتكون الافتراضية في المرات القادمة
        dietService.saveLastUsedPortion(activeFood.id, finalGrams);
        setLastUsedPortions(prev => ({ ...prev, [activeFood.id]: finalGrams }));

        if (onSelectFood) {
            onSelectFood(activeFood, finalGrams, finalMacros);
        }
        if (onClose) {
            onClose();
        }
    };

    // حفظ طعام مخصص جديد مع التحقق وحساب القيم لكل 100 جرام
    const handleSaveCustomFood = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!customForm.nameEn.trim()) return;

        const enteredCalories = Math.max(0, Number(customForm.calories) || 0);
        const enteredProtein = Math.max(0, Number(customForm.protein) || 0);
        const enteredCarbs = Math.max(0, Number(customForm.carbs) || 0);
        const enteredFats = Math.max(0, Number(customForm.fats) || 0);

        let defaultGrams = 100;
        let unitLabel = '100g';
        let baseCalories = enteredCalories;
        let baseProtein = enteredProtein;
        let baseCarbs = enteredCarbs;
        let baseFats = enteredFats;

        if (customForm.portionType === 'grams') {
            const g = Math.max(1, Number(customForm.weightGrams) || 100);
            defaultGrams = g;
            unitLabel = `${g}g`;
            if (g !== 100) {
                const factor = 100 / g;
                baseCalories = Math.round(enteredCalories * factor);
                baseProtein = Math.round(enteredProtein * factor * 10) / 10;
                baseCarbs = Math.round(enteredCarbs * factor * 10) / 10;
                baseFats = Math.round(enteredFats * factor * 10) / 10;
            }
        } else {
            const sName = customForm.servingName.trim() || '1 Serving';
            const sWeight = Number(customForm.servingGramsWeight);
            if (sWeight && sWeight > 0) {
                defaultGrams = sWeight;
                unitLabel = `${sName} (${sWeight}g)`;
                const factor = 100 / sWeight;
                baseCalories = Math.round(enteredCalories * factor);
                baseProtein = Math.round(enteredProtein * factor * 10) / 10;
                baseCarbs = Math.round(enteredCarbs * factor * 10) / 10;
                baseFats = Math.round(enteredFats * factor * 10) / 10;
            } else {
                defaultGrams = 100;
                unitLabel = sName;
                baseCalories = enteredCalories;
                baseProtein = enteredProtein;
                baseCarbs = enteredCarbs;
                baseFats = enteredFats;
            }
        }

        const newFood = {
            id: `custom-food-${Date.now()}`,
            nameEn: customForm.nameEn.trim(),
            nameAr: customForm.nameEn.trim(),
            brand: customForm.brand.trim() || undefined,
            category: customForm.category,
            preparation: customForm.prep,
            servingUnit: unitLabel,
            servingSizeGrams: 100,
            defaultServingGrams: defaultGrams,
            calories: baseCalories,
            proteinG: baseProtein,
            carbsG: baseCarbs,
            fatsG: baseFats,
            isVerified: false,
            isCustom: true
        };

        const validation = dietService.validateCustomFood(newFood);
        if (!validation.success) {
            showToast(validation.errors[0] || 'Please check custom food input values', 'error');
            return;
        }

        setSessionCustomFoods((prev) => [newFood, ...prev]);
        if (onAddCustomFood) {
            onAddCustomFood(newFood);
        }
        setSelectedFood(newFood);
        setPortionGrams(defaultGrams);
        setManualGramsInput(String(defaultGrams));
        setActiveIsolatedFood(newFood);
        setSearchQuery('');

        // تصفير حقول النموذج
        setCustomForm({
            nameEn: '',
            brand: '',
            category: 'protein',
            prep: 'cooked',
            portionType: 'grams',
            weightGrams: '',
            servingName: '',
            servingGramsWeight: '',
            calories: '',
            protein: '',
            carbs: '',
            fats: ''
        });
        setIsCustomFoodOpen(false);
    };

    // معالجة قراءة الباركود بنجاح
    const handleBarcodeFoodFound = (food) => {
        setSessionCustomFoods((prev) => [food, ...prev.filter((f) => f.id !== food.id)]);
        if (onAddCustomFood) {
            onAddCustomFood(food);
        }
        setSelectedFood(food);
        const servingGrams = food.defaultServingGrams || food.servingSizeGrams || 100;
        setPortionGrams(servingGrams);
        setManualGramsInput(String(servingGrams));
        setActiveIsolatedFood(food);
        setSearchQuery('');
    };

    return {
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedPrep,
        setSelectedPrep,
        isBarcodeModalOpen,
        setIsBarcodeModalOpen,
        isCustomFoodOpen,
        setIsCustomFoodOpen,
        activeIsolatedFood,
        setActiveIsolatedFood,
        displayedFoods,
        selectedFood,
        setSelectedFood,
        activeFood,
        portionGrams,
        portionMode,
        setPortionMode,
        manualGramsInput,
        customForm,
        updateCustomForm,
        calculatedMacros,
        handleSelectFoodItem,
        handleDirectQuickAdd,
        getFoodPortion,
        handleManualGramsChange,
        handleAdjustManualGrams,
        handleSelectPortionPreset,
        handleConfirmAdd,
        handleSaveCustomFood,
        handleBarcodeFoodFound
    };
}
