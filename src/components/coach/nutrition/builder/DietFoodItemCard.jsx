'use client';
import React, { useState } from 'react';
import { ChevronDown, Trash2, Plus } from 'lucide-react';

/**
 * Helper to compute macro calories and percentage of total macro energy
 */
const computeMacroPercentages = (proteinG, carbsG, fatsG, calories) => {
  const pCal = (Number(proteinG) || 0) * 4;
  const cCal = (Number(carbsG) || 0) * 4;
  const fCal = (Number(fatsG) || 0) * 9;
  const totalCal = pCal + cCal + fCal || Number(calories) || 1;
  const pPct = Math.round((pCal / totalCal) * 100);
  const cPct = Math.round((cCal / totalCal) * 100);
  const fPct = Math.max(0, 100 - pPct - cPct);
  return { pPct, cPct, fPct };
};

/**
 * Reusable Macro Metric Bar that toggles between Grams (g) and Percentages (%) on click
 */
const MacroMetricsRow = ({
  calories,
  proteinG,
  carbsG,
  fatsG,
  showPercentage,
  onToggle
}) => {
  const { pPct, cPct, fPct } = computeMacroPercentages(proteinG, carbsG, fatsG, calories);

  return (
    <div
      onClick={onToggle}
      className="flex-1 min-w-0 flex items-center justify-between px-2 sm:px-3.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-black/30 hover:bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all cursor-pointer group select-none shadow-xs"
      title="Click to toggle between Grams (g) and Percentage (%)"
    >
      {/* 1. Calories */}
      <div className="flex items-center gap-0.5 font-numeric whitespace-nowrap">
        <strong className="text-white font-bold text-[10.5px] sm:text-xs tracking-tight">
          {calories}
        </strong>
        <span className="text-[8.5px] sm:text-[9.5px] font-normal text-slate-400 font-mono">
          kcal
        </span>
      </div>

      <span className="text-slate-600 text-[8.5px] sm:text-[9px]">&bull;</span>

      {/* 2. Protein */}
      <div className="flex items-center gap-0.5 font-mono text-[9.5px] sm:text-[11px] whitespace-nowrap">
        <strong className="text-white font-semibold">
          {showPercentage ? `${pPct}%` : `${proteinG}g`}
        </strong>
        <span className="text-slate-400 text-[8.5px] sm:text-[9px] ml-0.5">P</span>
      </div>

      <span className="text-slate-600 text-[8.5px] sm:text-[9px]">&bull;</span>

      {/* 3. Carbs */}
      <div className="flex items-center gap-0.5 font-mono text-[9.5px] sm:text-[11px] whitespace-nowrap">
        <strong className="text-white font-semibold">
          {showPercentage ? `${cPct}%` : `${carbsG}g`}
        </strong>
        <span className="text-slate-400 text-[8.5px] sm:text-[9px] ml-0.5">C</span>
      </div>

      <span className="text-slate-600 text-[8.5px] sm:text-[9px]">&bull;</span>

      {/* 4. Fats */}
      <div className="flex items-center gap-0.5 font-mono text-[9.5px] sm:text-[11px] whitespace-nowrap">
        <strong className="text-white font-semibold">
          {showPercentage ? `${fPct}%` : `${fatsG}g`}
        </strong>
        <span className="text-slate-400 text-[8.5px] sm:text-[9px] ml-0.5">F</span>
      </div>

      {/* 5. Unit Badge */}
      <span className={`text-[8px] sm:text-[8.5px] px-1 py-0.2 rounded font-mono font-bold shrink-0 transition-colors ${
        showPercentage
          ? 'bg-[var(--main-color)]/20 border border-[var(--main-color)]/30 text-[var(--main-color)]'
          : 'bg-white/[0.08] border border-white/10 text-slate-300'
      }`}>
        {showPercentage ? '%' : 'g'}
      </span>
    </div>
  );
};

/**
 * Alternative Food Item Card - matches the exact parent card design
 */
const AlternativeItemCard = ({
  alt,
  onUpdateGrams,
  onRemove
}) => {
  const [showPercentage, setShowPercentage] = useState(false);
  // Strip duplicate grams prefix if present in name (e.g. "100g Chicken")
  const displayName = (alt.name || '').replace(/^\d+g\s+/, '') || 'Alternative Food';

  return (
    <div className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-slate-700/80 transition-all space-y-1">
      {/* Header: Full Name & Remove */}
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[11px] sm:text-xs font-semibold text-slate-200 leading-snug break-words flex-1 min-w-0 pr-1">
          {displayName}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="p-0.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer flex-shrink-0"
          title="Remove alternative"
        >
          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>

      {/* Second Row: Grams Input + Clickable Macros (Side-by-side even at 320px) */}
      <div className="flex items-center gap-1 sm:gap-1.5 w-full min-w-0 pt-0.5 flex-nowrap">
        <div className="flex items-center gap-0.5 bg-[var(--input-bg)] px-1 sm:px-1.5 py-0.5 rounded-md border border-[var(--input-border)] focus-within:border-[var(--main-color)] transition-colors flex-shrink-0">
          <input
            type="number"
            min="1"
            step="5"
            value={alt.grams || 100}
            onChange={(e) => onUpdateGrams?.(Math.max(1, Number(e.target.value) || 0))}
            className="w-8 sm:w-10 text-center text-[10px] sm:text-xs font-numeric font-bold text-white bg-transparent focus:outline-none"
          />
          <span className="text-[8.5px] sm:text-[9.5px] font-mono text-slate-400 font-medium pr-0.5">g</span>
        </div>

        <MacroMetricsRow
          calories={alt.calories}
          proteinG={alt.proteinG}
          carbsG={alt.carbsG}
          fatsG={alt.fatsG}
          showPercentage={showPercentage}
          onToggle={() => setShowPercentage(prev => !prev)}
        />
      </div>
    </div>
  );
};

export const DietFoodItemCard = ({
  item,
  isExpanded,
  onToggleExpand,
  onUpdateGrams,
  onRemoveItem,
  onOpenAltSearch,
  onUpdateAltGrams,
  onRemoveAlt
}) => {
  const [showPercentage, setShowPercentage] = useState(false);
  const altsCount = item.badeel?.length || 0;

  return (
    <div
      data-food-card="true"
      className="py-2.5 px-1 sm:px-1.5 space-y-1.5 border-b border-white/[0.08] last:border-b-0"
    >
      {/* 1. Header Row: Food Name + Compact Badeel Badge & Trash */}
      <div className="flex items-center justify-between gap-1.5 min-w-0">
        <span className="text-[11.5px] sm:text-[12.5px] font-semibold text-white leading-tight min-w-0 flex-1 truncate sm:break-words pr-0.5" title={item.name}>
          {item.name}
        </span>

        {/* Right Actions: Compact Badeel Toggle + Delete Button */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={onToggleExpand}
            className={`px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-mono border transition-all cursor-pointer flex items-center gap-0.5 ${
              isExpanded
                ? 'bg-[var(--main-color)]/15 border-[var(--main-color)]/35 text-[var(--main-color)] font-bold shadow-xs'
                : altsCount > 0
                  ? 'bg-white/[0.05] border-white/10 text-slate-200 hover:text-white hover:bg-white/[0.08]'
                  : 'bg-[var(--card-bg)] border-[var(--card-border)] text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
            title="View and configure food alternatives"
          >
            <span>Badeel ({altsCount})</span>
            <ChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onRemoveItem}
            className="p-0.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Remove food item"
          >
            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Second Row: Grams Input + Interactive Macros Bar (Side-by-side even at 320px) */}
      <div className="flex items-center gap-1 sm:gap-1.5 w-full min-w-0 pt-0.5 flex-nowrap">
        {/* Grams Input */}
        <div className="flex items-center gap-0.5 bg-[var(--input-bg)] px-1 sm:px-1.5 py-0.5 rounded-md border border-[var(--input-border)] focus-within:border-[var(--main-color)] transition-colors flex-shrink-0">
          <input
            type="number"
            min="1"
            step="5"
            value={item.grams || 100}
            onChange={(e) => onUpdateGrams(Math.max(1, Number(e.target.value) || 0))}
            className="w-8 sm:w-10 text-center text-[10px] sm:text-xs font-numeric font-bold text-white bg-transparent focus:outline-none"
          />
          <span className="text-[8.5px] sm:text-[9.5px] font-mono text-slate-400 font-medium pr-0.5">g</span>
        </div>

        {/* Clickable Macros Bar */}
        <MacroMetricsRow
          calories={item.calories}
          proteinG={item.proteinG}
          carbsG={item.carbsG}
          fatsG={item.fatsG}
          showPercentage={showPercentage}
          onToggle={() => setShowPercentage(prev => !prev)}
        />
      </div>

      {/* 3. Expanded Alternatives Section */}
      {isExpanded && (
        <div className="pt-2.5 border-t border-[var(--card-border)] space-y-2 pl-1 sm:pl-2">
          {/* Alternatives Header (Clean header without "Approved") */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10.5px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                Alternatives
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-semibold">
                ({altsCount})
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenAltSearch}
              className="text-[10.5px] font-mono text-[var(--main-color)] hover:brightness-125 font-bold transition-all cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--main-color)]/10 hover:bg-[var(--main-color)]/20 active:scale-98"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>Add Alternative</span>
            </button>
          </div>

          {/* Alternatives List matching parent card design */}
          {item.badeel && item.badeel.length > 0 ? (
            <div className="space-y-1.5">
              {item.badeel.map((alt) => (
                <AlternativeItemCard
                  key={alt.id}
                  alt={alt}
                  onUpdateGrams={(grams) => onUpdateAltGrams?.(alt.id, grams)}
                  onRemove={() => onRemoveAlt(alt.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 font-mono italic py-1 px-1">
              No alternative swaps added yet. Click &quot;Add Alternative&quot; to provide equivalent options.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
