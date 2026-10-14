'use client';
import React, { useRef, useState } from 'react';
import { 
    X, 
    ArrowLeft, 
    Search, 
    ScanBarcode, 
    Camera, 
    Plus, 
    ChevronDown, 
    SlidersHorizontal,
    Zap,
    Check
} from 'lucide-react';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { useFoodSearch } from '@/hooks/useFoodSearch';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useToast } from '@/context/ToastContext';
import { CustomFoodDrawer } from './food-search/CustomFoodDrawer';
import { FoodItemCard } from './food-search/FoodItemCard';
import { FoodPortionPanel } from './food-search/FoodPortionPanel';
import { QuickAddDrawer } from './food-search/QuickAddDrawer';

const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'protein', label: 'Proteins' },
    { id: 'carbs', label: 'Carbs' },
    { id: 'fats', label: 'Fats' },
    { id: 'my_foods', label: 'My Foods' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'egyptian_staples', label: 'Staples' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'supplements', label: 'Supplements' }
];

/**
 * FoodSearchModal - نافذة إضافة وبحث الأغذية (Mobile-First Inspiration)
 * - تصميم مستوحى بالكامل من شاشة الموبايل الحديثة (MyFitnessPal / MacroFactor style):
 *   1. شريط علوي مع زر الرجوع وقائمة الوجبة المستهدفة التفاعلية (Meal Switcher Dropdown).
 *   2. حقل بحث كامل العرض مع أيقونة وزر مسح سريع.
 *   3. تبويبات تصنيف أفقية مع مؤشر نشط أزرق أسفل العنصر.
 *   4. بطاقات أفعال سريعة قابلة للتمرير أفقياً (Scan a Meal, Scan a Barcode, Custom Food, Quick Add).
 *   5. إضافة سريعة Quick Add للسعرات والماكروز مباشرة دون الحاجة لمعرفة اسم الطعام.
 *   6. قائمة أطعمة واضحة ومنظمة مع أزرار (+) دائرية سريعة.
 *   7. نافذة سفلية منبثقة (Bottom Sheet Drawer) على الموبايل لضبط الجرامات وتأكيد الإضافة.
 */
export const FoodSearchModal = ({
    isOpen,
    onClose,
    targetMealName = 'Meal',
    meals = [],
    activeMealId = null,
    onSwitchMeal = null,
    onSelectFood,
    customFoods = [],
    onAddCustomFood,
    excludeFoodIds = []
}) => {
    const customFoodBtnRef = useRef(null);
    const { showToast } = useToast();

    // حالات فتح القوائم المنبثقة
    const [isMealMenuOpen, setIsMealMenuOpen] = useState(false);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

    const {
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
    } = useFoodSearch({
        customFoods,
        excludeFoodIds,
        onSelectFood: (item, grams, macros) => {
            if (onSelectFood) onSelectFood(item, grams, macros);
            setSelectedFood(null);
            if (onClose) onClose();
        },
        onAddCustomFood,
        onClose
    });

    // إغلاق النافذة أو النوافذ الفرعية عند ضغط زر Escape
    useEscapeKey(isOpen, () => {
        if (isBarcodeModalOpen) {
            setIsBarcodeModalOpen(false);
            return;
        }
        if (isCustomFoodOpen) {
            setIsCustomFoodOpen(false);
            return;
        }
        if (isQuickAddOpen) {
            setIsQuickAddOpen(false);
            return;
        }
        if (isMealMenuOpen) {
            setIsMealMenuOpen(false);
            return;
        }
        if (selectedFood) {
            setSelectedFood(null);
            return;
        }
        onClose();
    });

    if (!isOpen) return null;

    // تدوير فلاتر الطبخ (All -> Cooked -> Raw)
    const handleCyclePrep = () => {
        if (selectedPrep === 'all') setSelectedPrep('cooked');
        else if (selectedPrep === 'cooked') setSelectedPrep('raw');
        else setSelectedPrep('all');
    };

    const prepLabel = selectedPrep === 'all' ? 'Most Recent' : selectedPrep === 'cooked' ? 'Cooked' : 'Raw';

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center md:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-sans text-slate-100"
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        onClose();
                    }
                }}
            >
                <div
                    className={`w-full h-full md:h-[90vh] md:max-h-[840px] ${
                        isCustomFoodOpen || isQuickAddOpen ? 'md:max-w-2xl' : 'md:max-w-5xl'
                    } bg-[var(--card-bg)] md:border md:border-[var(--card-border)] md:rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {isCustomFoodOpen ? (
                        /* شاشة إنشاء طعام مخصص */
                        <CustomFoodDrawer
                            onClose={() => setIsCustomFoodOpen(false)}
                            customForm={customForm}
                            updateCustomForm={updateCustomForm}
                            onSave={handleSaveCustomFood}
                        />
                    ) : isQuickAddOpen ? (
                        /* شاشة الإضافة السريعة للماكروز مباشرة */
                        <QuickAddDrawer
                            onClose={() => setIsQuickAddOpen(false)}
                            targetMealName={targetMealName}
                            onConfirm={(quickItem) => {
                                if (onSelectFood) {
                                    onSelectFood(quickItem, 100, {
                                        calories: quickItem.calories,
                                        proteinG: quickItem.proteinG,
                                        carbsG: quickItem.carbsG,
                                        fatsG: quickItem.fatsG
                                    });
                                }
                                setIsQuickAddOpen(false);
                                showToast(`Added ${quickItem.calories} kcal to ${targetMealName}`, 'success');
                            }}
                        />
                    ) : (
                        /* الشاشة الرئيسية للبحث والأغذية المستوحاة من الموبايل */
                        <div className="flex flex-col h-full min-h-0">
                            {/* 1. الشريط العلوي (Top Header with Interactive Meal Dropdown) */}
                            <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 border-b border-[var(--card-border)] bg-[var(--card-subtle-bg)] flex-shrink-0 z-20">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1.5 -ml-1 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                        title="Back"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>

                                    {/* Interactive Meal Switcher Dropdown */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => meals && meals.length > 1 && setIsMealMenuOpen(!isMealMenuOpen)}
                                            className={`flex items-center gap-1.5 px-2 py-1 -ml-1 rounded-xl transition-all ${
                                                meals && meals.length > 1 
                                                    ? 'hover:bg-white/[0.06] cursor-pointer' 
                                                    : 'cursor-default'
                                            }`}
                                            title={meals && meals.length > 1 ? 'Switch target meal' : undefined}
                                        >
                                            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none hover:text-[var(--main-color)] transition-colors">
                                                {targetMealName}
                                            </h3>
                                            {meals && meals.length > 1 && (
                                                <ChevronDown className={`w-4 h-4 text-[var(--main-color)] stroke-[2.5] transition-transform duration-200 ${
                                                    isMealMenuOpen ? 'rotate-180' : ''
                                                }`} />
                                            )}
                                        </button>

                                        {/* Dropdown Menu of Available Meals */}
                                        {isMealMenuOpen && meals && meals.length > 0 && (
                                             <>
                                                <div 
                                                    className="fixed inset-0 z-30" 
                                                    onClick={() => setIsMealMenuOpen(false)} 
                                                />
                                                <div className="absolute left-0 top-full mt-1.5 z-40 min-w-[220px] bg-[var(--card-bg-elevated)] border border-[var(--card-border)] rounded-2xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
                                                    <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-slate-400 font-semibold border-b border-white/[0.06] flex items-center justify-between">
                                                        <span>Switch Target Meal</span>
                                                        <span className="text-[9px] text-[var(--main-color)] font-bold">{meals.length} Meals</span>
                                                    </div>
                                                    <div className="py-1 space-y-0.5 max-h-60 overflow-y-auto custom-scrollbar">
                                                        {meals.map((m, idx) => {
                                                            const isCurrent = (activeMealId && m.id === activeMealId) || m.name === targetMealName;
                                                            return (
                                                                <button
                                                                    key={m.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (onSwitchMeal) onSwitchMeal(m.id);
                                                                        setIsMealMenuOpen(false);
                                                                    }}
                                                                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                                                                        isCurrent
                                                                            ? 'bg-[var(--main-color)] text-white shadow-xs'
                                                                            : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-2 truncate">
                                                                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                                                                            isCurrent ? 'bg-black/25 text-white' : 'bg-white/[0.06] text-slate-400'
                                                                        }`}>
                                                                            {String(idx + 1).padStart(2, '0')}
                                                                        </span>
                                                                        <span className="truncate">{m.name}</span>
                                                                    </div>
                                                                    {isCurrent && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="hidden md:flex w-8 h-8 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-400 hover:text-white items-center justify-center transition-colors cursor-pointer hover:border-white/20"
                                        title="Close"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* 2. حقل البحث (Search Bar) */}
                            <div className="px-3.5 sm:px-5 pt-3 pb-2 bg-[var(--card-subtle-bg)] flex-shrink-0">
                                <div className="relative flex items-center bg-[var(--input-bg)] border border-[var(--input-border)] focus-within:border-[var(--main-color)] rounded-2xl px-3.5 py-2.5 transition-all shadow-inner">
                                    <Search className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Search for a food"
                                        value={searchQuery}
                                        onChange={(e) => {
                                             setSearchQuery(e.target.value);
                                            if (activeIsolatedFood) setActiveIsolatedFood(null);
                                        }}
                                        autoFocus
                                        className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* 3. تبويبات التصنيف الأفقية (Horizontal on Mobile, Centered from Tablet to Desktop) */}
                            <div className="flex items-center md:justify-center gap-4 sm:gap-6 px-4 sm:px-5 border-b border-[var(--card-border)] overflow-x-auto no-scrollbar flex-nowrap bg-[var(--card-subtle-bg)] flex-shrink-0">
                                {CATEGORIES.map((cat) => {
                                    const isActive = selectedCategory === cat.id && !activeIsolatedFood;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => {
                                                setActiveIsolatedFood(null);
                                                setSelectedCategory(cat.id);
                                            }}
                                            className={`pb-2.5 text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer font-medium relative ${
                                                isActive
                                                    ? 'text-white font-bold border-b-2 border-[var(--main-color)]'
                                                    : 'text-slate-400 hover:text-slate-200 border-b-2 border-transparent'
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* 4. بطاقات الأفعال السريعة: أصلية على الموبايل والتابلت (< lg)، وحبوب نصية مدمجة على اللابتوب والديسكتوب (lg+) */}
                            {/* Mobile & Tablet (< lg): Original Cards with Icons */}
                            <div className="lg:hidden px-3.5 sm:px-5 py-3 flex md:grid md:grid-cols-4 items-center gap-2.5 sm:gap-3 overflow-x-auto md:overflow-x-visible no-scrollbar flex-nowrap md:flex-wrap bg-[var(--card-subtle-bg)] flex-shrink-0">
                                {/* Card 1: Scan a Meal */}
                                <div
                                    onClick={() => showToast('AI Camera Meal Scan is in active development', 'info')}
                                    className="flex-shrink-0 w-32 sm:w-36 md:w-auto h-24 sm:h-26 rounded-2xl bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] border border-[var(--card-border)] hover:border-[var(--main-color)]/40 p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 group"
                                >
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--main-color)]/10 border border-[var(--main-color)]/30 text-[var(--main-color)] flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <span className="text-[11px] sm:text-xs font-semibold text-slate-200 group-hover:text-white text-center leading-tight">
                                        Scan a Meal
                                    </span>
                                </div>

                                {/* Card 2: Scan a Barcode */}
                                <div
                                    onClick={() => setIsBarcodeModalOpen(true)}
                                    className="flex-shrink-0 w-32 sm:w-36 md:w-auto h-24 sm:h-26 rounded-2xl bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] border border-[var(--card-border)] hover:border-[var(--main-color)]/40 p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 group"
                                >
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--main-color)]/10 border border-[var(--main-color)]/30 text-[var(--main-color)] flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <ScanBarcode className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <span className="text-[11px] sm:text-xs font-semibold text-slate-200 group-hover:text-white text-center leading-tight">
                                        Scan a Barcode
                                    </span>
                                </div>

                                {/* Card 3: Custom Food */}
                                <div
                                    ref={customFoodBtnRef}
                                    onClick={() => setIsCustomFoodOpen(true)}
                                    className="flex-shrink-0 w-32 sm:w-36 md:w-auto h-24 sm:h-26 rounded-2xl bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] border border-[var(--card-border)] hover:border-[var(--main-color)]/40 p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 group"
                                >
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--main-color)]/10 border border-[var(--main-color)]/30 text-[var(--main-color)] flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <span className="text-[11px] sm:text-xs font-semibold text-slate-200 group-hover:text-white text-center leading-tight">
                                        Custom Food
                                    </span>
                                </div>

                                {/* Card 4: Quick Add */}
                                <div
                                    onClick={() => setIsQuickAddOpen(true)}
                                    className="flex-shrink-0 w-32 sm:w-36 md:w-auto h-24 sm:h-26 rounded-2xl bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] border border-[var(--card-border)] hover:border-[var(--main-color)]/40 p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 group"
                                >
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--main-color)]/10 border border-[var(--main-color)]/30 text-[var(--main-color)] flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <span className="text-[11px] sm:text-xs font-semibold text-slate-200 group-hover:text-white text-center leading-tight">
                                        Quick Add
                                    </span>
                                </div>
                            </div>

                            {/* Laptop & Desktop (lg+): Sleek Action Pills with NO Icons */}
                            <div className="hidden lg:grid grid-cols-4 gap-2.5 px-5 py-2.5 bg-[var(--card-subtle-bg)] border-b border-[var(--card-border)]/60 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => showToast('AI Camera Meal Scan is in active development', 'info')}
                                    className="h-8.5 px-3 rounded-xl bg-[var(--card-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] hover:border-[var(--main-color)]/40 flex items-center justify-center text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer active:scale-98 shadow-xs"
                                >
                                    Scan a Meal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsBarcodeModalOpen(true)}
                                    className="h-8.5 px-3 rounded-xl bg-[var(--card-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] hover:border-[var(--main-color)]/40 flex items-center justify-center text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer active:scale-98 shadow-xs"
                                >
                                    Scan a Barcode
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCustomFoodOpen(true)}
                                    className="h-8.5 px-3 rounded-xl bg-[var(--card-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] hover:border-[var(--main-color)]/40 flex items-center justify-center text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer active:scale-98 shadow-xs"
                                >
                                    Custom Food
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsQuickAddOpen(true)}
                                    className="h-8.5 px-3 rounded-xl bg-[var(--card-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] hover:border-[var(--main-color)]/40 flex items-center justify-center text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer active:scale-98 shadow-xs"
                                >
                                    Quick Add
                                </button>
                            </div>

                            {/* 5. شاشة العرض: قائمة الأطعمة (مع اللوحة الجانبية على الديسكتوب واللوحة السفلية على الموبايل) */}
                            <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-[var(--card-bg)]">
                                {/* العمود الرئيسي: قائمة الأطعمة */}
                                <div className="flex-1 min-h-0 flex flex-col overflow-hidden border-r border-[var(--card-border)]/50">
                                    {/* عنوان القسم والفلتر (History / Results) */}
                                    <div className="flex items-center justify-between px-3.5 sm:px-5 py-2 border-b border-[var(--card-border)]/50 bg-[var(--card-subtle-bg)] flex-shrink-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                                                {searchQuery ? 'Search Results' : 'History'}
                                            </span>
                                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/[0.05] text-slate-400">
                                                {displayedFoods.length}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleCyclePrep}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[11px] font-medium text-slate-300 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                                            title="Click to toggle prep state"
                                        >
                                            <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                                            <span>{prepLabel}</span>
                                        </button>
                                    </div>

                                    {/* قائمة نتائج الأغذية */}
                                    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-2">
                                        {activeIsolatedFood && (
                                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.05] border border-white/15 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-[var(--main-color)] animate-pulse" />
                                                    <span className="text-xs font-semibold text-slate-200">
                                                        {activeIsolatedFood.barcode
                                                            ? `Scanned Product (${activeIsolatedFood.barcode})`
                                                            : 'Isolated Food Item'}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveIsolatedFood(null);
                                                        setSearchQuery('');
                                                    }}
                                                    className="text-[11px] font-medium text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] hover:border-white/20 transition-all cursor-pointer"
                                                >
                                                    View All Foods
                                                </button>
                                            </div>
                                        )}

                                        {displayedFoods.length === 0 ? (
                                            <div className="p-12 text-center space-y-2">
                                                <p className="text-xs text-slate-400">
                                                    No foods found matching &quot;{searchQuery}&quot;.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCustomFoodOpen(true)}
                                                    className="px-3.5 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-200 text-xs font-medium hover:border-white/20 cursor-pointer"
                                                >
                                                    Add as Custom Food
                                                </button>
                                            </div>
                                        ) : (
                                            displayedFoods.map((food) => (
                                                <FoodItemCard
                                                    key={food.id}
                                                    food={food}
                                                    isSelected={selectedFood?.id === food.id}
                                                    portionGrams={getFoodPortion(food)}
                                                    onSelect={(f) => handleSelectFoodItem(f)}
                                                    onQuickAdd={(f) => handleDirectQuickAdd(f)}
                                                />
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* لوحة ضبط الماكروز والحصة على الديسكتوب (Side Panel) */}
                                <div className="hidden md:flex flex-col flex-shrink-0 h-full min-h-0 self-stretch">
                                    <FoodPortionPanel
                                        activeFood={activeFood}
                                        targetMealName={targetMealName}
                                        portionGrams={portionGrams}
                                        portionMode={portionMode}
                                        setPortionMode={setPortionMode}
                                        manualGramsInput={manualGramsInput}
                                        handleManualGramsChange={handleManualGramsChange}
                                        handleAdjustManualGrams={handleAdjustManualGrams}
                                        handleSelectPortionPreset={handleSelectPortionPreset}
                                        calculatedMacros={calculatedMacros}
                                        handleConfirmAdd={handleConfirmAdd}
                                    />
                                </div>
                            </div>

                            {/* 6. نافذة سفلية (Mobile Bottom Sheet) لضبط الحصة وإضافتها عند الضغط على أي صنف في الموبايل */}
                            {selectedFood && (
                                <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
                                    {/* Backdrop */}
                                    <div 
                                        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
                                        onClick={() => setSelectedFood(null)}
                                    />

                                    {/* Drawer Content */}
                                    <div className="relative z-10 w-full bg-[var(--card-bg-elevated)] border-t border-[var(--card-border)] rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
                                        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-2.5 flex-shrink-0" />
                                        
                                        <FoodPortionPanel
                                            activeFood={selectedFood}
                                            targetMealName={targetMealName}
                                            portionGrams={portionGrams}
                                            portionMode={portionMode}
                                            setPortionMode={setPortionMode}
                                            manualGramsInput={manualGramsInput}
                                            handleManualGramsChange={handleManualGramsChange}
                                            handleAdjustManualGrams={handleAdjustManualGrams}
                                            handleSelectPortionPreset={handleSelectPortionPreset}
                                            calculatedMacros={calculatedMacros}
                                            handleConfirmAdd={() => {
                                                handleConfirmAdd();
                                                setSelectedFood(null);
                                            }}
                                            onClose={() => setSelectedFood(null)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* نافذة ماسح الباركود للكاميرا */}
            <BarcodeScannerModal
                isOpen={isBarcodeModalOpen}
                onClose={() => setIsBarcodeModalOpen(false)}
                onFoodFound={handleBarcodeFoodFound}
            />
        </>
    );
};
