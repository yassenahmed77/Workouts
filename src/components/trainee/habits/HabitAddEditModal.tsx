'use client';

import React, { useEffect } from 'react';
import { 
  UserHabit, 
  QuitHabitConfig, 
  QUIT_HABIT_PRESETS, 
  HABIT_ICON_OPTIONS 
} from '@/lib/habitsEngine';
import { 
  X, 
  CigaretteOff, 
  Zap, 
  Wallet 
} from 'lucide-react';
import { RenderHabitIcon } from './RenderHabitIcon';

interface HabitAddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingHabit: UserHabit | null;
  modeType: 'quit' | 'daily';
  setModeType: (mode: 'quit' | 'daily') => void;
  title: string;
  setTitle: (val: string) => void;
  category: UserHabit['category'];
  setCategory: (val: UserHabit['category']) => void;
  type: UserHabit['type'];
  setType: (val: UserHabit['type']) => void;
  targetValue: number;
  setTargetValue: (val: number) => void;
  unit: string;
  setUnit: (val: string) => void;
  iconKey: string;
  setIconKey: (val: string) => void;
  color: string;
  setColor: (val: string) => void;
  quitCategory: QuitHabitConfig['quitCategory'];
  setQuitCategory: (val: QuitHabitConfig['quitCategory']) => void;
  targetDays: number;
  setTargetDays: (val: number) => void;
  startedAt: string;
  setStartedAt: (val: string) => void;
  cigarettesPerDay: number;
  setCigarettesPerDay: (val: number) => void;
  pricePerPack: number;
  setPricePerPack: (val: number) => void;
  cigarettesPerPack: number;
  setCigarettesPerPack: (val: number) => void;
  savingsPerDay: number;
  setSavingsPerDay: (val: number) => void;
  currency: string;
  setCurrency: (val: string) => void;
  avoidedUnitsPerDay: number;
  setAvoidedUnitsPerDay: (val: number) => void;
  avoidedUnitLabel: string;
  setAvoidedUnitLabel: (val: string) => void;
  motivationReason: string;
  setMotivationReason: (val: string) => void;
  calculatedDailySmokingCost: number;
  onSelectPreset: (preset: typeof QUIT_HABIT_PRESETS[0]) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const HabitAddEditModal: React.FC<HabitAddEditModalProps> = ({
  isOpen,
  onClose,
  editingHabit,
  modeType,
  setModeType,
  title,
  setTitle,
  category,
  setCategory,
  type,
  setType,
  targetValue,
  setTargetValue,
  unit,
  setUnit,
  iconKey,
  setIconKey,
  color,
  setColor,
  quitCategory,
  setQuitCategory,
  targetDays,
  setTargetDays,
  startedAt,
  setStartedAt,
  cigarettesPerDay,
  setCigarettesPerDay,
  pricePerPack,
  setPricePerPack,
  cigarettesPerPack,
  setCigarettesPerPack,
  savingsPerDay,
  setSavingsPerDay,
  currency,
  setCurrency,
  avoidedUnitsPerDay,
  setAvoidedUnitsPerDay,
  avoidedUnitLabel,
  setAvoidedUnitLabel,
  motivationReason,
  setMotivationReason,
  calculatedDailySmokingCost,
  onSelectPreset,
  onSubmit
}) => {
  // Modal Resilience Standard (Rule 6.3): Escape key dismissal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-lg bg-[#18191e] border border-[#24262e] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150 scrollbar-thin space-y-3.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#24262e]">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              {editingHabit ? 'Edit Protocol' : 'New Habit Protocol'}
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
              Configure live quitting trackers or daily routine targets.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors cursor-pointer flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        {!editingHabit && (
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#141519] border border-[#24262e]">
            <button
              type="button"
              onClick={() => {
                setModeType('quit');
                onSelectPreset(QUIT_HABIT_PRESETS[0]);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                modeType === 'quit'
                  ? 'bg-[#18191e] text-[#2f80ed] border border-[#2f80ed]/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <CigaretteOff className="w-4 h-4 flex-shrink-0" />
              <span>Quit Bad Habit</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setModeType('daily');
                setType('boolean');
                setTitle('');
                setCategory('Supplement');
                setIconKey('zap');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                modeType === 'daily'
                  ? 'bg-[#18191e] text-white border border-[#24262e] shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span>Daily Routine</span>
            </button>
          </div>
        )}

        {/* Quick Presets */}
        {modeType === 'quit' && !editingHabit && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
              Quick Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {QUIT_HABIT_PRESETS.map((p) => {
                const isSelected = title === p.title;
                return (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => onSelectPreset(p)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#2f80ed]/15 border-[#2f80ed]/60 text-[#2f80ed] shadow-sm'
                        : 'bg-[#141519] border-[#24262e] text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <RenderHabitIcon iconKey={p.iconKey} className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-[11px] font-bold truncate">{p.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3.5 pt-1">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
              Habit Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={modeType === 'quit' ? 'e.g. Smoke-Free, Zero Sugar...' : 'e.g. Creatine 5g, Drink 3L Water...'}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#141519] border border-[#24262e] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#2f80ed] font-bold"
            />
          </div>

          {/* Quit Mode Options */}
          {modeType === 'quit' && (
            <div className="space-y-3.5 p-4 rounded-2xl bg-[#141519] border border-[#24262e]">
              {/* Category */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                  Habit Category
                </label>
                <select
                  value={quitCategory}
                  onChange={(e) => setQuitCategory(e.target.value as QuitHabitConfig['quitCategory'])}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#18191e] border border-[#24262e] text-xs text-white focus:outline-none focus:border-[#2f80ed]"
                >
                  <option value="smoking">Smoking / Cigarettes (Full Financial & Cigs Calculator)</option>
                  <option value="sugar">Sugar & Junk Food Cleanse</option>
                  <option value="screens">Social Media & Screen Addiction</option>
                  <option value="caffeine">Energy Drinks & Caffeine Reset</option>
                  <option value="vape">Vape / E-Cigarette</option>
                  <option value="custom">Custom Bad Habit</option>
                </select>
              </div>

              {/* Dedicated Smoking Calculator */}
              {quitCategory === 'smoking' ? (
                <div className="p-3.5 rounded-2xl bg-[#18191e] border border-[#24262e] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2f80ed]">
                    <Wallet className="w-4 h-4" />
                    <span>Smoking Financial & Health Savings Calculator</span>
                  </div>

                  {/* Daily Cigarettes */}
                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                      How many cigarettes did you smoke per day?
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 mb-2">
                      {[10, 20, 30, 40].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCigarettesPerDay(c)}
                          className={`py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                            cigarettesPerDay === c
                              ? 'bg-[#2f80ed] text-white border-[#2f80ed]'
                              : 'bg-[#141519] text-zinc-300 border-[#24262e]'
                          }`}
                        >
                          {c} cigs {c === 20 && '(1 pack)'}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">Custom amount:</span>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={cigarettesPerDay}
                        onChange={(e) => setCigarettesPerDay(Math.max(1, parseInt(e.target.value) || 20))}
                        className="w-20 px-2 py-1 rounded-xl bg-[#141519] border border-[#24262e] text-xs font-numeric font-bold text-white text-center focus:outline-none focus:border-[#2f80ed]"
                      />
                      <span className="text-xs text-zinc-400">cigs / day</span>
                    </div>
                  </div>

                  {/* Price per pack & Currency */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                        Price per Pack ({currency})
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={pricePerPack}
                        onChange={(e) => setPricePerPack(parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 85 or 100"
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#141519] border border-[#24262e] text-xs font-numeric font-bold text-white focus:outline-none focus:border-[#2f80ed]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                        Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#141519] border border-[#24262e] text-xs font-bold text-white focus:outline-none focus:border-[#2f80ed]"
                      >
                        <option value="EGP">EGP (جنيه مصري)</option>
                        <option value="USD">USD ($)</option>
                        <option value="SAR">SAR (ريال سعودي)</option>
                        <option value="AED">AED (درهم إماراتي)</option>
                        <option value="KWD">KWD (دينار كويتي)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>

                  {/* Live Calculated Financial Impact Preview */}
                  <div className="p-3 rounded-xl bg-[#141519] border border-[#2f80ed]/30 space-y-1 text-center font-numeric">
                    <span className="text-[9px] font-mono uppercase text-[#2f80ed] font-bold block">
                      Your Projected Freedom & Savings
                    </span>
                    <div className="grid grid-cols-3 gap-1 pt-1 text-xs">
                      <div>
                        <span className="text-[8px] text-zinc-500 uppercase block">Daily Saved</span>
                        <span className="font-bold text-white">{calculatedDailySmokingCost} {currency}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-zinc-500 uppercase block">Monthly Saved</span>
                        <span className="font-bold text-emerald-400">{(calculatedDailySmokingCost * 30).toLocaleString()} {currency}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-zinc-500 uppercase block">Yearly Saved</span>
                        <span className="font-bold text-amber-400">{(calculatedDailySmokingCost * 365).toLocaleString()} {currency}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                      Estimated Cost Saved / Day ({currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={savingsPerDay}
                      onChange={(e) => setSavingsPerDay(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 50"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#141519] border border-[#24262e] text-xs font-numeric text-white focus:outline-none focus:border-[#2f80ed]"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                      Units Avoided / Day
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={avoidedUnitsPerDay}
                        onChange={(e) => setAvoidedUnitsPerDay(parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 2"
                        className="w-16 px-2 py-1.5 rounded-xl bg-[#141519] border border-[#24262e] text-xs font-numeric text-white focus:outline-none focus:border-[#2f80ed]"
                      />
                      <input
                        type="text"
                        value={avoidedUnitLabel}
                        onChange={(e) => setAvoidedUnitLabel(e.target.value)}
                        placeholder="e.g. Cans / Hours"
                        className="flex-1 px-2 py-1.5 rounded-xl bg-[#141519] border border-[#24262e] text-xs text-white focus:outline-none focus:border-[#2f80ed]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Target Days */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                  Goal Target Duration (Days) *
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[21, 30, 60, 90].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTargetDays(d)}
                      className={`py-1.5 rounded-xl text-xs font-mono font-black border transition-all cursor-pointer ${
                        targetDays === d
                          ? 'bg-[#2f80ed] text-white border-[#2f80ed] shadow-md shadow-[#2f80ed]/25'
                          : 'bg-[#141519] text-zinc-300 border-[#24262e] hover:border-zinc-700'
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Date / Time */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                  Streak Start Date & Time
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="datetime-local"
                    value={startedAt ? new Date(new Date(startedAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setStartedAt(new Date(e.target.value).toISOString());
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#141519] border border-[#24262e] text-xs text-white focus:outline-none focus:border-[#2f80ed]"
                  />
                  <button
                    type="button"
                    onClick={() => setStartedAt(new Date().toISOString())}
                    className="px-2.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    Now
                  </button>
                </div>
              </div>

              {/* Motivation */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                  Personal Motivation / Reason Why
                </label>
                <input
                  type="text"
                  value={motivationReason}
                  onChange={(e) => setMotivationReason(e.target.value)}
                  placeholder="e.g. Clean lungs, save money, build discipline..."
                  className="w-full px-3 py-1.5 rounded-xl bg-[#141519] border border-[#24262e] text-xs text-zinc-200 focus:outline-none focus:border-[#2f80ed]"
                />
              </div>
            </div>
          )}

          {/* Daily Habit Options */}
          {modeType === 'daily' && (
            <>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as UserHabit['category'])}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#141519] border border-[#24262e] text-xs text-white focus:outline-none focus:border-[#2f80ed] cursor-pointer"
                >
                  <option value="Supplement">Supplement (Creatine, Vitamins)</option>
                  <option value="Nutrition">Nutrition & Hydration (Water, Protein)</option>
                  <option value="Recovery">Recovery & Sleep</option>
                  <option value="Lifestyle">Lifestyle (Cold Shower, Mobility)</option>
                  <option value="Mindset">Mindset (Reading, Meditation)</option>
                  <option value="Fitness">Fitness & Activity (Steps, Stretching)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                  Tracking Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('boolean')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      type === 'boolean'
                        ? 'bg-[#2f80ed]/15 text-[#2f80ed] border-[#2f80ed]/50 shadow-sm'
                        : 'bg-[#141519] text-zinc-400 border-[#24262e] hover:text-white'
                    }`}
                  >
                    <span>Simple Checkmark</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('numeric')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      type === 'numeric'
                        ? 'bg-[#2f80ed]/15 text-[#2f80ed] border-[#2f80ed]/50 shadow-sm'
                        : 'bg-[#141519] text-zinc-400 border-[#24262e] hover:text-white'
                    }`}
                  >
                    <span>Numeric Target</span>
                  </button>
                </div>
              </div>

              {type === 'numeric' && (
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#141519] border border-[#24262e]">
                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                      Daily Target Number
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      required
                      value={targetValue}
                      onChange={(e) => setTargetValue(Number(e.target.value))}
                      placeholder="e.g. 3.0 or 8"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#18191e] border border-[#24262e] text-xs font-numeric font-bold text-white focus:outline-none focus:border-[#2f80ed]"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                      Unit
                    </label>
                    <input
                      type="text"
                      required
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="e.g. L, hrs, g, steps"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#18191e] border border-[#24262e] text-xs font-bold text-white focus:outline-none focus:border-[#2f80ed]"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Icon Picker */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
              Icon
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 p-2 rounded-xl bg-[#141519] border border-[#24262e] max-h-36 overflow-y-auto scrollbar-thin">
              {HABIT_ICON_OPTIONS.map((ico) => {
                const isSelected = iconKey === ico.key;
                return (
                  <button
                    key={ico.key}
                    type="button"
                    title={ico.label}
                    onClick={() => setIconKey(ico.key)}
                    className={`aspect-square rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2f80ed]/20 border-[#2f80ed] text-[#2f80ed] shadow-sm ring-1 ring-[#2f80ed]/50'
                        : 'bg-[#18191e] border-[#24262e] text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <RenderHabitIcon iconKey={ico.key} className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[#24262e] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#2f80ed] hover:bg-[#256fd1] text-white text-xs font-black cursor-pointer shadow-md shadow-[#2f80ed]/25 active:scale-95 transition-all uppercase tracking-wider"
            >
              {editingHabit ? 'Save Protocol' : 'Start Protocol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
