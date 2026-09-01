'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import confetti from 'canvas-confetti';
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
  TrendingUp,
  RotateCcw,
  Clock,
  Lock,
  Wallet,
  Activity,
  Sliders,
  DollarSign,
  Info
} from 'lucide-react';
import { 
  UserHabit,
  QuitHabitConfig,
  getUserHabits,
  createUserHabit,
  updateUserHabit,
  deleteUserHabit,
  resetQuitHabit,
  calculateQuitLiveStats,
  getTodayRecordForHabit,
  setHabitRecord,
  calculateHabitStreak,
  calculateOverallHabitsSummary,
  HABIT_ICON_OPTIONS,
  HABIT_COLOR_OPTIONS,
  QUIT_HABIT_PRESETS
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
  const [activeTab, setActiveTab] = useState<'all' | 'quit' | 'daily'>('all');

  // Real-time ticking state for exact seconds counter
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => (t + 1) % 1000000);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<UserHabit | null>(null);

  // Relapse Reflection Modal State
  const [relapseModalHabit, setRelapseModalHabit] = useState<UserHabit | null>(null);
  const [relapseNote, setRelapseNote] = useState('');

  // Form States
  const [modeType, setModeType] = useState<'quit' | 'daily'>('quit');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<UserHabit['category']>('Quit / Break');
  const [type, setType] = useState<UserHabit['type']>('quit');
  const [targetValue, setTargetValue] = useState<number>(90);
  const [unit, setUnit] = useState('days clean');
  const [iconKey, setIconKey] = useState('cigarette-off');
  const [color, setColor] = useState('#ff6b00');

  // Quit Habit specific form states
  const [quitCategory, setQuitCategory] = useState<QuitHabitConfig['quitCategory']>('smoking');
  const [targetDays, setTargetDays] = useState<number>(90);
  const [startedAt, setStartedAt] = useState<string>(new Date().toISOString());
  
  // Specific Smoking consumption & savings calculator state
  const [cigarettesPerDay, setCigarettesPerDay] = useState<number>(20);
  const [pricePerPack, setPricePerPack] = useState<number>(85);
  const [cigarettesPerPack, setCigarettesPerPack] = useState<number>(20);

  const [savingsPerDay, setSavingsPerDay] = useState<number>(85);
  const [currency, setCurrency] = useState('EGP');
  const [avoidedUnitsPerDay, setAvoidedUnitsPerDay] = useState<number>(20);
  const [avoidedUnitLabel, setAvoidedUnitLabel] = useState('Cigarettes');
  const [motivationReason, setMotivationReason] = useState('Clean lungs, max stamina, save money & build discipline.');

  // Live calculated savings in modal for smoking
  const calculatedDailySmokingCost = useMemo(() => {
    if (cigarettesPerPack > 0 && pricePerPack > 0) {
      return Math.round((cigarettesPerDay / cigarettesPerPack) * pricePerPack);
    }
    return savingsPerDay || 0;
  }, [cigarettesPerDay, cigarettesPerPack, pricePerPack, savingsPerDay]);

  useEffect(() => {
    if (currentUser) {
      setHabits(getUserHabits(currentUser.id));
    }
  }, [currentUser, refreshKey]);

  const summary = useMemo(() => {
    if (!currentUser) return { todayCompletedCount: 0, todayTotalCount: 0, adherencePercentage: 100, activeStreak: 0 };
    return calculateOverallHabitsSummary(currentUser.id, habits);
  }, [currentUser, habits, refreshKey]);

  const quitHabits = useMemo(() => habits.filter(h => h.type === 'quit'), [habits]);
  const dailyHabits = useMemo(() => habits.filter(h => h.type !== 'quit'), [habits]);

  const filteredHabits = useMemo(() => {
    if (activeTab === 'quit') return quitHabits;
    if (activeTab === 'daily') return dailyHabits;
    return habits;
  }, [activeTab, habits, quitHabits, dailyHabits]);

  if (!currentUser) return null;

  const handleOpenAddModal = (initialMode: 'quit' | 'daily' = 'quit') => {
    setEditingHabit(null);
    setModeType(initialMode);
    
    if (initialMode === 'quit') {
      const defaultPreset = QUIT_HABIT_PRESETS[0];
      setTitle(defaultPreset.title);
      setCategory('Quit / Break');
      setType('quit');
      setTargetValue(90);
      setUnit('days clean');
      setIconKey(defaultPreset.iconKey);
      setColor(defaultPreset.color);
      setQuitCategory(defaultPreset.quitConfig.quitCategory);
      setTargetDays(defaultPreset.quitConfig.targetDays);
      setStartedAt(new Date().toISOString());
      
      setCigarettesPerDay(defaultPreset.quitConfig.cigarettesPerDay || 20);
      setPricePerPack(defaultPreset.quitConfig.pricePerPack || 85);
      setCigarettesPerPack(defaultPreset.quitConfig.cigarettesPerPack || 20);
      setSavingsPerDay(defaultPreset.quitConfig.savingsPerDay || 85);
      setCurrency(defaultPreset.quitConfig.currency || 'EGP');
      setAvoidedUnitsPerDay(defaultPreset.quitConfig.avoidedUnitsPerDay || 20);
      setAvoidedUnitLabel(defaultPreset.quitConfig.avoidedUnitLabel || 'Cigarettes');
      setMotivationReason(defaultPreset.quitConfig.motivationReason || '');
    } else {
      setTitle('');
      setCategory('Supplement');
      setType('boolean');
      setTargetValue(1);
      setUnit('done');
      setIconKey('zap');
      setColor('#ff6b00');
    }

    setIsModalOpen(true);
  };

  const handleSelectPreset = (preset: typeof QUIT_HABIT_PRESETS[0]) => {
    setTitle(preset.title);
    setCategory('Quit / Break');
    setType('quit');
    setIconKey(preset.iconKey);
    setColor(preset.color);
    setQuitCategory(preset.quitConfig.quitCategory);
    setTargetDays(preset.quitConfig.targetDays);
    
    if (preset.quitConfig.quitCategory === 'smoking') {
      setCigarettesPerDay(preset.quitConfig.cigarettesPerDay || 20);
      setPricePerPack(preset.quitConfig.pricePerPack || 85);
      setCigarettesPerPack(preset.quitConfig.cigarettesPerPack || 20);
      setSavingsPerDay(preset.quitConfig.savingsPerDay || 85);
      setAvoidedUnitsPerDay(20);
      setAvoidedUnitLabel('Cigarettes');
    } else {
      setSavingsPerDay(preset.quitConfig.savingsPerDay || 0);
      setAvoidedUnitsPerDay(preset.quitConfig.avoidedUnitsPerDay || 0);
      setAvoidedUnitLabel(preset.quitConfig.avoidedUnitLabel || 'Units');
    }

    setCurrency(preset.quitConfig.currency || 'EGP');
    setMotivationReason(preset.quitConfig.motivationReason || '');
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

    if (h.type === 'quit') {
      setModeType('quit');
      setQuitCategory(h.quitConfig?.quitCategory || 'custom');
      setTargetDays(h.quitConfig?.targetDays || h.targetValue || 90);
      setStartedAt(h.quitConfig?.startedAt || h.createdAt || new Date().toISOString());
      
      setCigarettesPerDay(h.quitConfig?.cigarettesPerDay || 20);
      setPricePerPack(h.quitConfig?.pricePerPack || 85);
      setCigarettesPerPack(h.quitConfig?.cigarettesPerPack || 20);
      setSavingsPerDay(h.quitConfig?.savingsPerDay || 85);
      setCurrency(h.quitConfig?.currency || 'EGP');
      setAvoidedUnitsPerDay(h.quitConfig?.avoidedUnitsPerDay || 20);
      setAvoidedUnitLabel(h.quitConfig?.avoidedUnitLabel || 'Units');
      setMotivationReason(h.quitConfig?.motivationReason || '');
    } else {
      setModeType('daily');
    }

    setIsModalOpen(true);
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a habit title', 'error');
      return;
    }

    const isQuit = modeType === 'quit';

    let finalSavingsPerDay = Number(savingsPerDay) || 0;
    let finalAvoidedUnitsPerDay = Number(avoidedUnitsPerDay) || 0;

    if (isQuit && quitCategory === 'smoking') {
      const cPerPack = Number(cigarettesPerPack) || 20;
      const pPerPack = Number(pricePerPack) || 0;
      const cPerDay = Number(cigarettesPerDay) || 20;
      if (pPerPack > 0 && cPerPack > 0) {
        finalSavingsPerDay = Math.round((cPerDay / cPerPack) * pPerPack);
      }
      finalAvoidedUnitsPerDay = cPerDay;
    }

    const quitConfigData: QuitHabitConfig | undefined = isQuit ? {
      startedAt: startedAt || new Date().toISOString(),
      targetDays: Number(targetDays) || 90,
      quitCategory,
      cigarettesPerDay: Number(cigarettesPerDay) || 20,
      pricePerPack: Number(pricePerPack) || 85,
      cigarettesPerPack: Number(cigarettesPerPack) || 20,
      savingsPerDay: finalSavingsPerDay,
      currency: currency || 'EGP',
      avoidedUnitsPerDay: finalAvoidedUnitsPerDay,
      avoidedUnitLabel: quitCategory === 'smoking' ? 'Cigarettes' : (avoidedUnitLabel.trim() || 'Units'),
      motivationReason: motivationReason.trim(),
      relapseHistory: editingHabit?.quitConfig?.relapseHistory || []
    } : undefined;

    if (editingHabit) {
      updateUserHabit(currentUser.id, editingHabit.id, {
        title: title.trim(),
        category: isQuit ? 'Quit / Break' : category,
        type: isQuit ? 'quit' : type,
        targetValue: isQuit ? (Number(targetDays) || 90) : (type === 'boolean' ? 1 : Number(targetValue) || 1),
        unit: isQuit ? 'days clean' : (type === 'boolean' ? 'done' : unit.trim() || 'unit'),
        iconKey,
        color,
        quitConfig: quitConfigData
      });
      showToast(`Updated "${title}"! ✨`, 'success');
    } else {
      createUserHabit(currentUser.id, {
        title: title.trim(),
        category: isQuit ? 'Quit / Break' : category,
        type: isQuit ? 'quit' : type,
        targetValue: isQuit ? (Number(targetDays) || 90) : (type === 'boolean' ? 1 : Number(targetValue) || 1),
        unit: isQuit ? 'days clean' : (type === 'boolean' ? 'done' : unit.trim() || 'unit'),
        iconKey,
        color,
        quitConfig: quitConfigData
      });
      showToast(`Started "${title}" protocol! 🚀`, 'success');

      if (isQuit) {
        try {
          confetti({
            particleCount: 80,
            spread: 65,
            origin: { y: 0.6 },
            colors: ['#ff6b00', '#10b981', '#ffffff']
          });
        } catch {
          // ignore
        }
      }
    }

    setIsModalOpen(false);
    setRefreshKey((k) => k + 1);
  };

  const handleDeleteHabit = (h: UserHabit) => {
    deleteUserHabit(currentUser.id, h.id);
    showToast(`Deleted "${h.title}" habit 🗑️`, 'info');
    setRefreshKey((k) => k + 1);
  };

  const handleOpenRelapseModal = (h: UserHabit) => {
    setRelapseModalHabit(h);
    setRelapseNote('');
  };

  const handleConfirmRelapse = () => {
    if (!relapseModalHabit) return;
    resetQuitHabit(currentUser.id, relapseModalHabit.id, relapseNote);
    showToast(`Clock reset. Stay strong, you will conquer this! 🦾`, 'info');
    setRelapseModalHabit(null);
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
    <div className="space-y-5 max-w-xl mx-auto pb-28 px-1 sm:px-0">
      
      {/* 1. Header: Minimalist Top Navigation */}
      <div className="space-y-3 pt-1">
        
        {/* Title Row (Centered - Zero Wrapping) */}
        <div className="text-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff6b00] font-bold block">
            DISCIPLINE & SOBRIETY
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight whitespace-nowrap">
            Habits Tracker
          </h1>
        </div>

        {/* Action Buttons Row (Dedicated 2-Column Grid - Zero Text Wrapping) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleOpenAddModal('daily')}
            className="py-2.5 px-3 rounded-2xl bg-[#14151e] hover:bg-[#1e202c] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-[#ff6b00]" />
            <span>Add Habit</span>
          </button>
          <button
            onClick={() => handleOpenAddModal('quit')}
            className="py-2.5 px-3 rounded-2xl btn-orange text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-[#ff6b00]/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <CigaretteOff className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Quit Habit</span>
          </button>
        </div>

        {/* Segmented Filter Pills */}
        <div className="grid grid-cols-3 p-1 rounded-2xl bg-[#111218] border border-white/5 text-[11px] sm:text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 rounded-xl transition-all cursor-pointer text-center whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#1e1f2b] text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            All ({habits.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quit')}
            className={`py-2 px-1 rounded-xl transition-all cursor-pointer text-center whitespace-nowrap ${
              activeTab === 'quit'
                ? 'bg-[#1e1f2b] text-[#ff6b00] shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Quit Timers ({quitHabits.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`py-2 px-1 rounded-xl transition-all cursor-pointer text-center whitespace-nowrap ${
              activeTab === 'daily'
                ? 'bg-[#1e1f2b] text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Daily ({dailyHabits.length})
          </button>
        </div>
      </div>

      {/* 2. Main Habits Stack */}
      <div className="space-y-4">
        
        {filteredHabits.map((habit) => {
          // If this is a QUIT / BREAK BAD HABIT with luxury dynamic circular progress dial
          if (habit.type === 'quit') {
            const stats = calculateQuitLiveStats(habit);
            const isSmoking = habit.quitConfig?.quitCategory === 'smoking' || habit.title.toLowerCase().includes('smoke') || habit.title.toLowerCase().includes('cig');

            // SVG Circular Radial Progress Math
            // Radius r = 68, Circumference = 2 * PI * 68 = ~427.25
            const radius = 68;
            const circumference = 2 * Math.PI * radius;
            const progress = Math.min(100, Math.max(0, stats.progressPercentage));
            const strokeDashoffset = circumference - (progress / 100) * circumference;

            return (
              <div
                key={habit.id}
                className="relative rounded-3xl bg-[#111218] border border-white/5 p-4 sm:p-5 shadow-xl overflow-hidden space-y-4"
              >
                {/* Subtle Ambient Glow */}
                <div 
                  className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-15"
                  style={{ backgroundColor: stats.currentStage.color || habit.color || '#ff6b00' }}
                />

                {/* 1. Header: Full-Width Title & Icon (Row 1), Goal Info & Actions (Row 2) */}
                <div className="space-y-2.5 relative z-10 pb-2.5 border-b border-white/5">
                  
                  {/* Row 1: Full-Width Icon + Title (No Truncation) */}
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 bg-white/[0.04] border border-white/10 shadow-sm"
                      style={{ color: habit.color || '#ff6b00' }}
                    >
                      <RenderHabitIcon iconKey={habit.iconKey} className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight break-words">
                        {habit.title}
                      </h2>
                      <span className="text-[10px] text-zinc-400 font-medium block mt-0.5">
                        Sobriety & Recovery Goal
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Target Goal on Left, Action Buttons on Right */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    {/* Goal info */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px]">
                        <span>🎯</span>
                        <span>{stats.targetDays} Days Goal</span>
                      </span>
                      <span className="text-zinc-400 font-mono text-[10px] font-bold whitespace-nowrap">
                        {stats.progressPercentage}% Done
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleOpenRelapseModal(habit)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-white/[0.06] transition-colors cursor-pointer active:scale-95"
                        title="Reset Timer (Relapse)"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(habit)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer active:scale-95"
                        title="Edit Habit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteHabit(habit)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-white/[0.06] transition-colors cursor-pointer active:scale-95"
                        title="Delete Habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Dynamic Circular Radial Progress Dial (Fills dynamically with elapsed time!) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#090a0f] border border-white/5 relative z-10 flex flex-col items-center justify-center">
                  
                  {/* SVG Circular Progress Gauge */}
                  <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id={`circleGrad-${habit.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={habit.color || '#ff6b00'} />
                          <stop offset="100%" stopColor="#ff8c00" />
                        </linearGradient>
                      </defs>

                      {/* Background Inactive Ring */}
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="#1a1c26"
                        strokeWidth="9"
                        fill="transparent"
                      />

                      {/* Foreground Active Dynamic Filling Ring */}
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke={`url(#circleGrad-${habit.id})`}
                        strokeWidth="9"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                        style={{
                          filter: `drop-shadow(0 0 8px ${habit.color || '#ff6b00'}80)`
                        }}
                      />
                    </svg>

                    {/* Content inside the Dynamic Circle */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-numeric select-none">
                      <span className="text-lg -mb-0.5">🔥</span>
                      
                      {/* Big Days Number */}
                      <span className="text-3xl sm:text-4xl font-black text-white leading-none tracking-tight">
                        {stats.days}
                      </span>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 mt-0.5">
                        {stats.days === 1 ? 'DAY CLEAN' : 'DAYS CLEAN'}
                      </span>

                      {/* Live Ticking Time Monospace HUD */}
                      <div className="mt-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono font-bold text-[#ff6b00] tracking-wider">
                        {String(stats.hours).padStart(2, '0')}:{String(stats.minutes).padStart(2, '0')}:{String(stats.seconds).padStart(2, '0')}
                      </div>

                      {/* Dynamic Percentage Badge */}
                      <span className="text-[10px] font-mono text-emerald-400 font-extrabold mt-0.5">
                        {stats.progressPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Goal & Milestone Countdown Below Circle */}
                  <div className="w-full mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400 gap-2">
                    <span className="text-zinc-300 font-bold truncate">Target: {stats.targetDays} Days Clean</span>
                    {stats.nextMilestone && (
                      <span className="text-[#ff6b00] font-bold flex-shrink-0 text-[11px]">
                        Next in {stats.nextMilestone.remainingDays > 0 ? `${stats.nextMilestone.remainingDays}d ` : ''}{stats.nextMilestone.remainingHours}h {stats.nextMilestone.remainingMinutes}m
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Simplified Financial & Physical Impact Tiles (Clean 2x2 Grid) */}
                <div className="grid grid-cols-2 gap-2 font-numeric relative z-10 text-xs">
                  {/* Saved So Far */}
                  <div className="p-2.5 rounded-2xl bg-[#090a0f] border border-white/5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      💰
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] font-mono text-zinc-500 uppercase font-bold block">
                        Saved So Far
                      </span>
                      <span className="text-xs font-extrabold text-emerald-400 truncate block">
                        {stats.moneySaved.toLocaleString()} {stats.currency}
                      </span>
                    </div>
                  </div>

                  {/* Avoided Units / Cigs */}
                  <div className="p-2.5 rounded-2xl bg-[#090a0f] border border-white/5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#ff6b00]/10 text-[#ff6b00] flex items-center justify-center font-bold text-xs flex-shrink-0">
                      🚭
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] font-mono text-zinc-500 uppercase font-bold block">
                        {isSmoking ? 'Cigarettes Avoided' : 'Units Avoided'}
                      </span>
                      <span className="text-xs font-extrabold text-white truncate block">
                        {stats.exactCigarettesAvoided.toLocaleString()} {isSmoking ? 'cigs' : stats.unitLabel}
                      </span>
                    </div>
                  </div>

                  {/* Life Regained / Monthly */}
                  <div className="p-2.5 rounded-2xl bg-[#090a0f] border border-white/5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      ⏳
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] font-mono text-zinc-500 uppercase font-bold block">
                        {isSmoking ? 'Time Gained' : 'Monthly Savings'}
                      </span>
                      <span className="text-xs font-extrabold text-cyan-400 truncate block">
                        {isSmoking ? `+${stats.lifeHoursRegained} Hours` : `${stats.projectedMonthlySavings.toLocaleString()} ${stats.currency}`}
                      </span>
                    </div>
                  </div>

                  {/* 1 Year Savings (Simplified everyday language) */}
                  <div className="p-2.5 rounded-2xl bg-[#090a0f] border border-white/5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      📈
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] font-mono text-zinc-500 uppercase font-bold block">
                        1-Year Savings
                      </span>
                      <span className="text-xs font-extrabold text-amber-400 truncate block">
                        {stats.projectedYearlySavings.toLocaleString()} {stats.currency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Health & Recovery Insight */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 relative z-10 space-y-1">
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-sm flex-shrink-0 mt-0.5">🫁</span>
                    <p className="text-zinc-300 font-medium leading-snug">
                      {stats.healthBenefitCue}
                    </p>
                  </div>
                  {habit.quitConfig?.motivationReason && (
                    <p className="text-[11px] text-zinc-400 italic pl-5.5">
                      "{habit.quitConfig.motivationReason}"
                    </p>
                  )}
                </div>

                {/* 5. Milestone Badges Grid (Zero Horizontal Scrolling - Responsive Stack) */}
                <div className="relative z-10 space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#ff6b00]" />
                      <span>Milestone Badges ({stats.milestones.filter((m) => m.achieved).length}/{stats.milestones.length})</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {stats.milestones.map((m) => (
                      <button
                        key={m.days}
                        type="button"
                        onClick={() => {
                          if (m.achieved) {
                            try {
                              confetti({
                                particleCount: 60,
                                spread: 65,
                                origin: { y: 0.65 },
                                colors: ['#ff6b00', '#10b981', '#ffffff']
                              });
                            } catch {}
                            showToast(`🏆 Milestone Achieved: ${m.label} Clean! Keep dominating! 🎉`, 'success');
                          } else {
                            showToast(`🔒 Locked: Reach ${m.label} to unlock this badge!`, 'info');
                          }
                        }}
                        className={`p-2 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 border transition-all cursor-pointer text-left active:scale-95 ${
                          m.achieved
                            ? 'bg-[#18151f] text-[#ff6b00] border-[#ff6b00]/40 shadow-sm shadow-[#ff6b00]/10 hover:border-[#ff6b00]'
                            : 'bg-[#090a0f] text-zinc-600 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          m.achieved ? 'bg-[#ff6b00]/20 text-[#ff6b00]' : 'bg-white/[0.03] text-zinc-600'
                        }`}>
                          {m.achieved ? <Award className="w-3.5 h-3.5 text-[#ff6b00]" /> : <Lock className="w-3 h-3" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className={`block text-[11px] truncate font-extrabold ${m.achieved ? 'text-white' : 'text-zinc-500'}`}>
                            {m.label}
                          </span>
                          <span className={`text-[8px] block font-medium ${m.achieved ? 'text-emerald-400' : 'text-zinc-600'}`}>
                            {m.achieved ? 'Unlocked ✓' : 'Locked'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            );
          }

          // If this is a STANDARD DAILY ROUTINE HABIT (Creatine, Water, Sleep, etc.)
          const record = getTodayRecordForHabit(currentUser.id, habit);
          const streak = calculateHabitStreak(currentUser.id, habit.id);
          const pct = habit.type === 'boolean'
            ? (record.completed ? 100 : 0)
            : Math.min(100, Math.round((record.value / habit.targetValue) * 100));

          return (
            <div
              key={habit.id}
              className={`p-4 sm:p-5 rounded-3xl border transition-all space-y-3 ${
                record.completed
                  ? 'bg-[#14131d] border-[#ff6b00]/30 shadow-lg shadow-[#ff6b00]/5'
                  : 'bg-[#111218] border-white/5 hover:border-white/10'
              }`}
            >
              {/* Header Row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 bg-white/[0.03] border border-white/10"
                    style={{ color: habit.color || '#ff6b00' }}
                  >
                    <RenderHabitIcon iconKey={habit.iconKey} className="w-4 h-4" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-white tracking-tight leading-tight">
                        {habit.title}
                      </h3>
                      {streak > 0 && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.04] text-[#ff6b00] border border-[#ff6b00]/20 flex items-center gap-1 flex-shrink-0">
                          <Flame className="w-3 h-3 fill-current" />
                          {streak}d
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">
                      {habit.category} • {habit.type === 'boolean' ? 'Daily Check' : `Goal: ${habit.targetValue} ${habit.unit}`}
                    </p>
                  </div>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEditModal(habit)}
                    className="p-1.5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                    title="Edit Habit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteHabit(habit)}
                    className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-white/[0.04] transition-colors cursor-pointer"
                    title="Delete Habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress & Tracking Section */}
              {habit.type === 'boolean' ? (
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs text-zinc-400 font-medium">
                    {record.completed ? 'Protocol completed for today ✨' : 'Tap checkmark when done today'}
                  </span>

                  <button
                    onClick={() => handleToggleBooleanHabit(habit)}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all ${
                      record.completed
                        ? 'bg-[#ff6b00] text-black font-extrabold shadow-[#ff6b00]/25'
                        : 'bg-[#090a0f] hover:bg-[#181926] border border-white/10 text-zinc-300'
                    }`}
                  >
                    <Check className={`w-4 h-4 stroke-[3] ${record.completed ? 'text-black' : 'text-zinc-500'}`} />
                    <span>{record.completed ? 'Completed' : 'Check In'}</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 font-numeric">
                      <span className="text-sm font-extrabold text-white">{record.value}</span>
                      <span className="text-zinc-500">/ {habit.targetValue} {habit.unit}</span>
                      <span className="text-[10px] font-mono font-bold text-[#ff6b00]">({pct}%)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAdjustNumericHabit(habit, -1)}
                        className="w-8 h-8 rounded-xl bg-[#090a0f] hover:bg-white/[0.04] border border-white/5 text-zinc-300 hover:text-white flex items-center justify-center font-bold transition-colors cursor-pointer active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleAdjustNumericHabit(habit, 1)}
                        className="w-8 h-8 rounded-xl bg-[#ff6b00] hover:bg-[#ff7a1a] text-black flex items-center justify-center font-bold transition-colors cursor-pointer shadow-md active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
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

        {filteredHabits.length === 0 && (
          <div className="p-8 rounded-3xl bg-[#111218] border border-white/5 text-center shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] text-[#ff6b00] border border-white/10 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-white">No Habits In This View</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {activeTab === 'quit' 
                ? 'Create a Quit Bad Habit protocol (Smoking, Sugar, Screens, etc.) with live clocks and savings calculators.' 
                : 'Start tracking your daily hydration, supplements, or sleep routines.'}
            </p>
            <button
              onClick={() => handleOpenAddModal(activeTab === 'quit' ? 'quit' : 'daily')}
              className="px-5 py-2.5 rounded-xl bg-[#ff6b00] text-black text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-md active:scale-95 mt-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create {activeTab === 'quit' ? 'Quit Protocol' : 'Daily Habit'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div 
            className="w-full max-w-lg bg-[#111218] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150 scrollbar-thin space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-white/5">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.03] text-[#ff6b00] border border-white/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  {editingHabit ? 'Edit Protocol' : 'New Habit Protocol'}
                </h3>
                <p className="text-xs text-zinc-400">
                  Configure live quitting trackers or daily routine targets.
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            {!editingHabit && (
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#090a0f] border border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setModeType('quit');
                    handleSelectPreset(QUIT_HABIT_PRESETS[0]);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    modeType === 'quit'
                      ? 'bg-[#1c1d27] text-[#ff6b00] shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <CigaretteOff className="w-4 h-4" />
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
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    modeType === 'daily'
                      ? 'bg-[#1c1d27] text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Zap className="w-4 h-4" />
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
                        onClick={() => handleSelectPreset(p)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-[#ff6b00]/10 border-[#ff6b00]/40 text-[#ff6b00]'
                            : 'bg-[#090a0f] border-white/5 text-zinc-300 hover:border-white/10'
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

            <form onSubmit={handleSaveHabit} className="space-y-4 pt-1">
              
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
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#090a0f] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff6b00] font-bold"
                />
              </div>

              {/* Quit Mode Options */}
              {modeType === 'quit' && (
                <div className="space-y-3.5 p-4 rounded-2xl bg-[#090a0f] border border-white/5">
                  
                  {/* Category */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                      Habit Category
                    </label>
                    <select
                      value={quitCategory}
                      onChange={(e) => setQuitCategory(e.target.value as QuitHabitConfig['quitCategory'])}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#14151e] border border-white/10 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
                    >
                      <option value="smoking">🚭 Smoking / Cigarettes (Full Financial & Cigs Calculator)</option>
                      <option value="sugar">🍬 Sugar & Junk Food Cleanse</option>
                      <option value="screens">📱 Social Media & Screen Addiction</option>
                      <option value="caffeine">☕ Energy Drinks & Caffeine Reset</option>
                      <option value="vape">💨 Vape / E-Cigarette</option>
                      <option value="custom">🛑 Custom Bad Habit</option>
                    </select>
                  </div>

                  {/* Dedicated Smoking Calculator */}
                  {quitCategory === 'smoking' ? (
                    <div className="p-3.5 rounded-2xl bg-[#14151e] border border-white/10 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#ff6b00]">
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
                                  ? 'bg-[#ff6b00] text-black border-[#ff6b00]'
                                  : 'bg-[#090a0f] text-zinc-300 border-white/5'
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
                            className="w-20 px-2 py-1 rounded-xl bg-[#090a0f] border border-white/10 text-xs font-numeric font-bold text-white text-center focus:outline-none focus:border-[#ff6b00]"
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
                            className="w-full px-2.5 py-1.5 rounded-xl bg-[#090a0f] border border-white/10 text-xs font-numeric font-bold text-white focus:outline-none focus:border-[#ff6b00]"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                            Currency
                          </label>
                          <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-[#090a0f] border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#ff6b00]"
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
                      <div className="p-3 rounded-xl bg-[#090a0f] border border-[#ff6b00]/30 space-y-1 text-center font-numeric">
                        <span className="text-[9px] font-mono uppercase text-[#ff6b00] font-bold block">
                          🚀 Your Projected Freedom & Savings
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
                          className="w-full px-2.5 py-1.5 rounded-xl bg-[#14151e] border border-white/10 text-xs font-numeric text-white focus:outline-none focus:border-[#ff6b00]"
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
                            className="w-16 px-2 py-1.5 rounded-xl bg-[#14151e] border border-white/10 text-xs font-numeric text-white focus:outline-none focus:border-[#ff6b00]"
                          />
                          <input
                            type="text"
                            value={avoidedUnitLabel}
                            onChange={(e) => setAvoidedUnitLabel(e.target.value)}
                            placeholder="e.g. Cans / Hours"
                            className="flex-1 px-2 py-1.5 rounded-xl bg-[#14151e] border border-white/10 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
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
                              ? 'bg-[#ff6b00] text-black border-[#ff6b00]'
                              : 'bg-[#14151e] text-zinc-300 border-white/5'
                          }`}
                        >
                          {d} Days {d === 90 && '⭐'}
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
                        className="flex-1 px-3 py-2 rounded-xl bg-[#14151e] border border-white/10 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
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
                      className="w-full px-3 py-1.5 rounded-xl bg-[#14151e] border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-[#ff6b00]"
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
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#090a0f] border border-white/10 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
                    >
                      <option value="Supplement">💊 Supplement (Creatine, Vitamins)</option>
                      <option value="Nutrition">💧 Nutrition & Hydration (Water, Protein)</option>
                      <option value="Recovery">🌙 Recovery & Sleep</option>
                      <option value="Lifestyle">🚭 Lifestyle (Cold Shower, Mobility)</option>
                      <option value="Mindset">📖 Mindset (Reading, Meditation)</option>
                      <option value="Fitness">🏋️ Fitness & Activity (Steps, Stretching)</option>
                    </select>
                  </div>

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
                            ? 'bg-[#1c1d27] text-[#ff6b00] border-[#ff6b00]/40'
                            : 'bg-[#090a0f] text-zinc-400 border-white/5'
                        }`}
                      >
                        ✓ Simple Checkmark
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('numeric')}
                        className={`py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                          type === 'numeric'
                            ? 'bg-[#1c1d27] text-[#ff6b00] border-[#ff6b00]/40'
                            : 'bg-[#090a0f] text-zinc-400 border-white/5'
                        }`}
                      >
                        🔢 Numeric Target
                      </button>
                    </div>
                  </div>

                  {type === 'numeric' && (
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#090a0f] border border-white/5">
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
                          className="w-full px-3 py-2 rounded-xl bg-[#14151e] border border-white/10 text-xs font-numeric text-white focus:outline-none focus:border-[#ff6b00]"
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
                          className="w-full px-3 py-2 rounded-xl bg-[#14151e] border border-white/10 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Icon Picker */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-bold">
                  Icon
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 rounded-2xl bg-[#090a0f] border border-white/5 scrollbar-thin">
                  {HABIT_ICON_OPTIONS.map((ico) => {
                    const isSelected = iconKey === ico.key;
                    return (
                      <button
                        key={ico.key}
                        type="button"
                        onClick={() => setIconKey(ico.key)}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#ff6b00]/15 border-[#ff6b00] text-[#ff6b00]'
                            : 'bg-[#14151e] border-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <RenderHabitIcon iconKey={ico.key} className="w-4 h-4" />
                        <span className="text-[8px] font-mono truncate max-w-[50px]">{ico.key}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ff6b00] hover:bg-[#ff7a1a] text-black text-xs font-black cursor-pointer shadow-md active:scale-95 transition-all"
                >
                  {editingHabit ? 'Save Protocol' : 'Start Protocol 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Relapse Reflection & Reset Modal */}
      {relapseModalHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-[#111218] border border-white/10 rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150 space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Relapse Reflection
              </span>
              <h2 className="text-lg font-extrabold text-white tracking-tight mt-2">
                Restart Clean Streak
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Slips are data points, not defeats. Acknowledge what happened and restart your clock right now.
              </p>
            </div>

            <div className="text-left space-y-1.5">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                What triggered this slip? (Optional reflection)
              </label>
              <textarea
                rows={2}
                value={relapseNote}
                onChange={(e) => setRelapseNote(e.target.value)}
                placeholder="e.g. High work stress, peer pressure at outing..."
                className="w-full p-3 rounded-2xl bg-[#090a0f] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRelapseModalHabit(null)}
                className="py-3 px-4 rounded-2xl bg-[#14151e] hover:bg-white/[0.04] border border-white/5 text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Keep Current Streak
              </button>
              <button
                type="button"
                onClick={handleConfirmRelapse}
                className="py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black tracking-wide cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                Reset Clock & Restart
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
