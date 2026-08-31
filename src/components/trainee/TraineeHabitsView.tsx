'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { 
  Sparkles, 
  Droplets, 
  Moon, 
  CigaretteOff, 
  Pill, 
  Check, 
  Plus, 
  Minus, 
  Flame, 
  Award, 
  Calendar,
  Utensils,
  Dumbbell,
  Footprints,
  BookOpen,
  Heart,
  Apple,
  Coffee,
  Snowflake,
  Bike,
  Timer,
  Target,
  Sun,
  Brain,
  Shield,
  Smile,
  Bed,
  Zap,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { 
  UserHabit,
  getUserHabits,
  createUserHabit,
  updateUserHabit,
  deleteUserHabit,
  getTodayRecordForHabit,
  setHabitRecord,
  calculateHabitStreak,
  calculateOverallHabitsSummary,
  HABIT_ICON_OPTIONS,
  HABIT_COLOR_OPTIONS
} from '@/lib/habitsEngine';

// Dynamic Icon Component mapping icon key to Lucide Icon
export const RenderHabitIcon: React.FC<{ iconKey: string; className?: string }> = ({ iconKey, className = 'w-5 h-5' }) => {
  switch (iconKey) {
    case 'zap': return <Zap className={className} />;
    case 'droplets': return <Droplets className={className} />;
    case 'moon': return <Moon className={className} />;
    case 'pill': return <Pill className={className} />;
    case 'cigarette-off': return <CigaretteOff className={className} />;
    case 'flame': return <Flame className={className} />;
    case 'utensils': return <Utensils className={className} />;
    case 'dumbbell': return <Dumbbell className={className} />;
    case 'footprints': return <Footprints className={className} />;
    case 'book': return <BookOpen className={className} />;
    case 'heart': return <Heart className={className} />;
    case 'apple': return <Apple className={className} />;
    case 'coffee': return <Coffee className={className} />;
    case 'snowflake': return <Snowflake className={className} />;
    case 'bike': return <Bike className={className} />;
    case 'timer': return <Timer className={className} />;
    case 'target': return <Target className={className} />;
    case 'sun': return <Sun className={className} />;
    case 'brain': return <Brain className={className} />;
    case 'shield': return <Shield className={className} />;
    case 'award': return <Award className={className} />;
    case 'smile': return <Smile className={className} />;
    case 'bed': return <Bed className={className} />;
    default: return <Sparkles className={className} />;
  }
};

export const TraineeHabitsView: React.FC = () => {
  const { currentUser } = useGym();
  const { showToast } = useToast();

  const [habits, setHabits] = useState<UserHabit[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<UserHabit | null>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<UserHabit['category']>('Supplement');
  const [type, setType] = useState<'boolean' | 'numeric'>('boolean');
  const [targetValue, setTargetValue] = useState<number>(1);
  const [unit, setUnit] = useState('done');
  const [iconKey, setIconKey] = useState('zap');
  const [color, setColor] = useState('#ff6b00');

  useEffect(() => {
    if (currentUser) {
      setHabits(getUserHabits(currentUser.id));
    }
  }, [currentUser, refreshKey]);

  const summary = useMemo(() => {
    if (!currentUser) return { todayCompletedCount: 0, todayTotalCount: 0, adherencePercentage: 100, activeStreak: 0 };
    return calculateOverallHabitsSummary(currentUser.id, habits);
  }, [currentUser, habits, refreshKey]);

  if (!currentUser) return null;

  const handleOpenAddModal = () => {
    setEditingHabit(null);
    setTitle('');
    setCategory('Supplement');
    setType('boolean');
    setTargetValue(1);
    setUnit('done');
    setIconKey('zap');
    setColor('#ff6b00');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (h: UserHabit) => {
    setEditingHabit(h);
    setTitle(h.title);
    setCategory(h.category);
    setType(h.type);
    setTargetValue(h.targetValue);
    setUnit(h.unit);
    setIconKey(h.iconKey);
    setColor(h.color || '#ff6b00');
    setIsModalOpen(true);
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a habit title', 'error');
      return;
    }

    if (editingHabit) {
      updateUserHabit(currentUser.id, editingHabit.id, {
        title: title.trim(),
        category,
        type,
        targetValue: type === 'boolean' ? 1 : Number(targetValue) || 1,
        unit: type === 'boolean' ? 'done' : unit.trim() || 'unit',
        iconKey,
        color
      });
      showToast(`Updated "${title}"! ✨`, 'success');
    } else {
      createUserHabit(currentUser.id, {
        title: title.trim(),
        category,
        type,
        targetValue: type === 'boolean' ? 1 : Number(targetValue) || 1,
        unit: type === 'boolean' ? 'done' : unit.trim() || 'unit',
        iconKey,
        color
      });
      showToast(`Added "${title}" to your daily habits! ⚡`, 'success');
    }

    setIsModalOpen(false);
    setRefreshKey((k) => k + 1);
  };

  const handleDeleteHabit = (h: UserHabit) => {
    deleteUserHabit(currentUser.id, h.id);
    showToast(`Deleted "${h.title}" habit 🗑️`, 'info');
    setRefreshKey((k) => k + 1);
  };

  const handleToggleBooleanHabit = (h: UserHabit) => {
    const record = getTodayRecordForHabit(currentUser.id, h);
    const nextCompleted = !record.completed;
    setHabitRecord(currentUser.id, h, nextCompleted ? 1 : 0, nextCompleted);
    setRefreshKey((k) => k + 1);
    if (nextCompleted) {
      showToast(`Marked "${h.title}" as completed! 🔥`, 'success');
    }
  };

  const handleAdjustNumericHabit = (h: UserHabit, delta: number) => {
    const record = getTodayRecordForHabit(currentUser.id, h);
    const isStepBased = h.unit.toLowerCase().includes('step') || h.targetValue >= 100;
    const stepSize = isStepBased ? 500 : (h.targetValue <= 10 ? 0.5 : 10);
    
    let nextVal = Math.max(0, record.value + delta * stepSize);
    if (h.targetValue <= 10) {
      nextVal = Math.round(nextVal * 10) / 10;
    } else {
      nextVal = Math.round(nextVal);
    }

    const wasCompleted = record.completed;
    const isCompleted = nextVal >= h.targetValue;

    setHabitRecord(currentUser.id, h, nextVal, isCompleted);
    setRefreshKey((k) => k + 1);

    if (isCompleted && !wasCompleted) {
      showToast(`Target reached for "${h.title}"! 🎯`, 'success');
    }
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-10">
      
      {/* 1. Hero Card: Cyber Sunset Habits Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#111218] border border-[#212330] relative overflow-hidden shadow-xl space-y-4">
        <div className="absolute top-0 right-0 w-52 h-52 bg-[#ff6b00]/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Title & Description Row */}
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#ff6b00] font-bold px-2.5 py-0.5 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/20">
              <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
              DAILY HABITS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1.5">
            Habits & Tracking
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Create your custom daily routines, supplements, and wellness targets.
          </p>
        </div>

        {/* Dedicated Add Habit Action Button Row */}
        <div>
          <button
            onClick={handleOpenAddModal}
            className="w-full py-3 px-4 rounded-2xl btn-orange text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Habit</span>
          </button>
        </div>

        {/* Dynamic Adherence Strip */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#1e202c] text-center font-numeric">
          <div className="p-2.5 rounded-2xl bg-[#09090b] border border-[#1e202c]">
            <span className="block text-[9px] font-mono uppercase text-zinc-500 font-bold">Today</span>
            <span className="text-sm font-extrabold text-white">
              {summary.todayCompletedCount} / {summary.todayTotalCount}
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#09090b] border border-[#1e202c]">
            <span className="block text-[9px] font-mono uppercase text-zinc-500 font-bold">Adherence</span>
            <span className="text-sm font-extrabold text-[#ff6b00]">
              {summary.adherencePercentage}%
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#09090b] border border-[#1e202c]">
            <span className="block text-[9px] font-mono uppercase text-zinc-500 font-bold">Streak</span>
            <span className="text-sm font-extrabold text-emerald-400">
              {summary.activeStreak} Days 🔥
            </span>
          </div>
        </div>
      </div>

      {/* 2. Habits List (100% User-Created & Editable) */}
      <div className="space-y-3.5">
        {habits.map((habit) => {
          const record = getTodayRecordForHabit(currentUser.id, habit);
          const streak = calculateHabitStreak(currentUser.id, habit.id);
          const pct = habit.type === 'boolean'
            ? (record.completed ? 100 : 0)
            : Math.min(100, Math.round((record.value / habit.targetValue) * 100));

          return (
            <div
              key={habit.id}
              className={`p-4 sm:p-5 rounded-3xl border transition-all shadow-md space-y-3 ${
                record.completed
                  ? 'bg-[#18151f] border-[#ff6b00]/35 shadow-[#ff6b00]/5'
                  : 'bg-[#111218] border-[#212330] hover:border-[#35384d]'
              }`}
            >
              {/* Header Row: Custom Icon, Title, Streak, Actions */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-inner"
                    style={{
                      backgroundColor: `${habit.color}18`,
                      borderColor: `${habit.color}40`,
                      borderWidth: '1px',
                      color: habit.color
                    }}
                  >
                    <RenderHabitIcon iconKey={habit.iconKey} className="w-5 h-5" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
                        {habit.title}
                      </h3>
                      {streak > 0 && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1e202c] text-[#ff6b00] border border-[#ff6b00]/20 flex items-center gap-1 flex-shrink-0">
                          <Flame className="w-3 h-3 fill-current" />
                          {streak}d
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {habit.category} • {habit.type === 'boolean' ? 'Daily Check' : `Goal: ${habit.targetValue} ${habit.unit}`}
                    </p>
                  </div>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEditModal(habit)}
                    className="p-1.5 rounded-xl text-zinc-500 hover:text-white hover:bg-[#1e202c] transition-colors cursor-pointer"
                    title="Edit Habit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteHabit(habit)}
                    className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-[#1e202c] transition-colors cursor-pointer"
                    title="Delete Habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress & Tracking Section */}
              {habit.type === 'boolean' ? (
                // Boolean Checkmark Action
                <div className="flex items-center justify-between pt-2 border-t border-[#1e202c]">
                  <span className="text-xs text-zinc-400 font-medium">
                    {record.completed ? 'Completed for today 🎉' : 'Tap to complete today\'s protocol'}
                  </span>

                  <button
                    onClick={() => handleToggleBooleanHabit(habit)}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all ${
                      record.completed
                        ? 'btn-orange'
                        : 'bg-[#09090b] hover:bg-[#161722] border border-[#1e202c] text-zinc-300 hover:text-white'
                    }`}
                  >
                    <Check className={`w-4 h-4 stroke-[3] ${record.completed ? 'text-white' : 'text-zinc-500'}`} />
                    <span>{record.completed ? 'Done' : 'Check In'}</span>
                  </button>
                </div>
              ) : (
                // Numeric Increment Action
                <div className="pt-2 border-t border-[#1e202c] space-y-2">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 font-numeric">
                      <span className="text-sm font-extrabold text-white">{record.value}</span>
                      <span className="text-zinc-500">/ {habit.targetValue} {habit.unit}</span>
                      <span className="text-[10px] font-mono font-bold text-[#ff6b00]">({pct}%)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAdjustNumericHabit(habit, -1)}
                        className="w-8 h-8 rounded-xl bg-[#09090b] hover:bg-[#1e202c] border border-[#1e202c] text-zinc-300 hover:text-white flex items-center justify-center font-bold transition-colors cursor-pointer active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleAdjustNumericHabit(habit, 1)}
                        className="w-8 h-8 rounded-xl btn-orange text-white flex items-center justify-center font-bold transition-colors cursor-pointer shadow-md active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[#09090b] border border-[#1e202c] overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${pct}%`,
                        backgroundColor: habit.color || '#ff6b00'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {habits.length === 0 && (
          <div className="p-10 rounded-3xl bg-[#111218] border border-[#212330] text-center shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#171822] text-[#ff6b00] border border-[#282a3a] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-white">No Habits Created Yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Build your customized daily habit stack (Creatine, Hydration, Sleep, Walking, Reading, etc.) with custom icons.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-xl btn-orange text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-md active:scale-95 mt-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Your First Habit</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Create / Edit Habit Modal with Rich Icon Picker */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-lg bg-[#111218] border border-[#212330] rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150 scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-[#1c1d27] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#1e202c]">
              <div className="w-10 h-10 rounded-2xl bg-[#171822] text-[#ff6b00] border border-[#282a3a] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  {editingHabit ? 'Edit Daily Protocol' : 'Create Custom Habit'}
                </h3>
                <p className="text-xs text-zinc-400">
                  Tailor your habit with custom target, icon & theme.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveHabit} className="space-y-4">
              
              {/* Habit Name */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                  Habit Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Creatine 5g, Drink 3L Water, 10k Steps, Read 10 Pages..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#09090b] border border-[#1e202c] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff6b00]/60 font-bold"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as UserHabit['category'])}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#09090b] border border-[#1e202c] text-xs text-white focus:outline-none focus:border-[#ff6b00]/60 font-medium"
                >
                  <option value="Supplement">💊 Supplement (Creatine, Vitamins)</option>
                  <option value="Nutrition">💧 Nutrition & Hydration (Water, Protein)</option>
                  <option value="Recovery">🌙 Recovery & Sleep</option>
                  <option value="Lifestyle">🚭 Lifestyle (Smoke-Free, Cold Shower)</option>
                  <option value="Mindset">📖 Mindset (Reading, Meditation)</option>
                  <option value="Fitness">🏋️ Fitness & Activity (Steps, Stretching)</option>
                </select>
              </div>

              {/* Habit Goal Type: Boolean vs Numeric */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-bold">
                  Tracking Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('boolean')}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                      type === 'boolean'
                        ? 'bg-[#18151f] text-[#ff6b00] border-[#ff6b00]/50 shadow-md shadow-[#ff6b00]/10'
                        : 'bg-[#09090b] text-zinc-400 border-[#1e202c]'
                    }`}
                  >
                    ✓ Simple Checkmark
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('numeric')}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                      type === 'numeric'
                        ? 'bg-[#18151f] text-[#ff6b00] border-[#ff6b00]/50 shadow-md shadow-[#ff6b00]/10'
                        : 'bg-[#09090b] text-zinc-400 border-[#1e202c]'
                    }`}
                  >
                    🔢 Numeric Target
                  </button>
                </div>
              </div>

              {/* Numeric Target Configuration */}
              {type === 'numeric' && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#09090b] border border-[#1e202c]">
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
                      placeholder="e.g. 3.0 or 8 or 10000"
                      className="w-full px-3 py-2 rounded-xl bg-[#14151e] border border-[#252736] text-xs font-numeric text-white focus:outline-none focus:border-[#ff6b00]/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                      Unit (e.g. L, hrs, g, steps)
                    </label>
                    <input
                      type="text"
                      required
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="e.g. L, hrs, g, steps, pages"
                      className="w-full px-3 py-2 rounded-xl bg-[#14151e] border border-[#252736] text-xs text-white focus:outline-none focus:border-[#ff6b00]/60"
                    />
                  </div>
                </div>
              )}

              {/* Rich Icon Picker Grid */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-bold">
                  Pick Habit Icon
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto p-2 rounded-2xl bg-[#09090b] border border-[#1e202c] scrollbar-thin">
                  {HABIT_ICON_OPTIONS.map((ico) => {
                    const isSelected = iconKey === ico.key;
                    return (
                      <button
                        key={ico.key}
                        type="button"
                        onClick={() => setIconKey(ico.key)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#18151f] border-[#ff6b00] text-[#ff6b00] shadow-md shadow-[#ff6b00]/15'
                            : 'bg-[#14151e] border-[#202230] text-zinc-400 hover:text-zinc-200 hover:border-[#35384d]'
                        }`}
                        title={ico.label}
                      >
                        <RenderHabitIcon iconKey={ico.key} className="w-4 h-4" />
                        <span className="text-[9px] font-mono truncate max-w-[55px]">{ico.key}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Accent Picker */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-bold">
                  Card Color Theme
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {HABIT_COLOR_OPTIONS.map((c) => {
                    const isSelected = color === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColor(c.value)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform cursor-pointer ${
                          isSelected ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#111218]' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-[#1e202c] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white rounded-xl hover:bg-[#1e202c] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl btn-orange text-xs font-black cursor-pointer shadow-md active:scale-95 transition-all"
                >
                  {editingHabit ? 'Save Changes' : 'Create Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
