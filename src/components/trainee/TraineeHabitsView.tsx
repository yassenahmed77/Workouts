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
  Coins,
  ChevronRight,
  Info,
  AlertCircle,
  HelpCircle,
  Lock,
  CheckCheck
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
  const [savingsPerDay, setSavingsPerDay] = useState<number>(50);
  const [currency, setCurrency] = useState('EGP');
  const [avoidedUnitsPerDay, setAvoidedUnitsPerDay] = useState<number>(20);
  const [avoidedUnitLabel, setAvoidedUnitLabel] = useState('Cigarettes');
  const [motivationReason, setMotivationReason] = useState('Clean lungs, max stamina & unbreakable discipline.');

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
      setSavingsPerDay(defaultPreset.quitConfig.savingsPerDay || 50);
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
    setSavingsPerDay(preset.quitConfig.savingsPerDay || 0);
    setCurrency(preset.quitConfig.currency || 'EGP');
    setAvoidedUnitsPerDay(preset.quitConfig.avoidedUnitsPerDay || 0);
    setAvoidedUnitLabel(preset.quitConfig.avoidedUnitLabel || 'Units');
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
      setSavingsPerDay(h.quitConfig?.savingsPerDay || 0);
      setCurrency(h.quitConfig?.currency || 'EGP');
      setAvoidedUnitsPerDay(h.quitConfig?.avoidedUnitsPerDay || 0);
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

    const quitConfigData: QuitHabitConfig | undefined = isQuit ? {
      startedAt: startedAt || new Date().toISOString(),
      targetDays: Number(targetDays) || 90,
      quitCategory,
      savingsPerDay: Number(savingsPerDay) || 0,
      currency: currency || 'EGP',
      avoidedUnitsPerDay: Number(avoidedUnitsPerDay) || 0,
      avoidedUnitLabel: avoidedUnitLabel.trim() || 'Units',
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
            particleCount: 70,
            spread: 60,
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
    showToast(`Clock reset. Stay strong, you will master this! 🦾`, 'info');
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
    <div className="space-y-5 max-w-2xl mx-auto pb-24">
      
      {/* 1. Hero Card: Habits Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#111218] border border-[#212330] relative overflow-hidden shadow-xl space-y-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b00]/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Title & Description Row */}
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#ff6b00] font-bold px-2.5 py-0.5 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/20">
              <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
              DISCIPLINE & HABITS
            </span>
            {quitHabits.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                <CigaretteOff className="w-3 h-3" />
                {quitHabits.length} Quit Tracker{quitHabits.length > 1 ? 's' : ''} Active
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
            Habit Architecture
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Break addictive habits with real-time live clocks, track daily nutrition, and build titanium discipline.
          </p>
        </div>

        {/* Dedicated Quick Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => handleOpenAddModal('quit')}
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#ff6b00] to-[#ff8c00] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ff6b00]/25 hover:brightness-110 active:scale-98 transition-all"
          >
            <CigaretteOff className="w-4 h-4 stroke-[2.5]" />
            <span>+ Break Bad Habit (Live Clock)</span>
          </button>
          <button
            onClick={() => handleOpenAddModal('daily')}
            className="py-3 px-4 rounded-2xl bg-[#171824] hover:bg-[#202230] border border-[#2e3040] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <Plus className="w-4 h-4 text-[#ff6b00]" />
            <span>+ Add Daily Routine Habit</span>
          </button>
        </div>

        {/* Dynamic Navigation Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#09090b] border border-[#1e202c] pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#ff6b00] text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All ({habits.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quit')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'quit'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-cyan-400'
            }`}
          >
            <CigaretteOff className="w-3.5 h-3.5" />
            <span>Break Habits ({quitHabits.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'daily'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-amber-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Daily ({dailyHabits.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Main Habits Stack */}
      <div className="space-y-4">
        
        {filteredHabits.map((habit) => {
          // If this is a QUIT / BREAK BAD HABIT with real-time ticking clock!
          if (habit.type === 'quit') {
            const stats = calculateQuitLiveStats(habit);

            return (
              <div
                key={habit.id}
                className="p-5 sm:p-6 rounded-3xl bg-[#111218] border border-[#212330] hover:border-[#35384d] transition-all shadow-xl space-y-4 relative overflow-hidden group"
              >
                {/* Glowing Accent Ambient Gradient */}
                <div 
                  className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 transition-opacity group-hover:opacity-30"
                  style={{ backgroundColor: habit.color || '#ff6b00' }}
                />

                {/* Header Row: Title, Stage Badge, Actions */}
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-inner"
                      style={{
                        backgroundColor: `${habit.color}15`,
                        borderColor: `${habit.color}35`,
                        borderWidth: '1px',
                        color: habit.color
                      }}
                    >
                      <RenderHabitIcon iconKey={habit.iconKey} className="w-6 h-6" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight truncate">
                          {habit.title}
                        </h2>
                        <span 
                          className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm"
                          style={{
                            backgroundColor: `${stats.currentStage.color}20`,
                            color: stats.currentStage.color,
                            border: `1px solid ${stats.currentStage.color}40`
                          }}
                        >
                          <span>{stats.currentStage.name}</span>
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5 font-medium">
                        <span>Target: {stats.targetDays} Days Protocol</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">{stats.progressPercentage}% Complete</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions (Reset, Edit, Delete) */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleOpenRelapseModal(habit)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-amber-400 hover:bg-[#1a1b26] border border-transparent hover:border-[#282a3a] transition-all cursor-pointer"
                      title="Reset Streak (Relapse Journal)"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(habit)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#1a1b26] border border-transparent hover:border-[#282a3a] transition-all cursor-pointer"
                      title="Edit Habit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteHabit(habit)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-[#1a1b26] border border-transparent hover:border-[#282a3a] transition-all cursor-pointer"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Live Real-time Ticking Counter Clock (Days, Hours, Minutes, Seconds) */}
                <div className="grid grid-cols-4 gap-2 pt-1 font-numeric relative z-10">
                  {/* Days */}
                  <div className="p-3 rounded-2xl bg-[#09090b] border border-[#1e202c] text-center shadow-inner flex flex-col justify-center">
                    <span className="text-2xl sm:text-3xl font-black text-white leading-none">
                      {String(stats.days).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider mt-1 block">
                      DAYS
                    </span>
                  </div>

                  {/* Hours */}
                  <div className="p-3 rounded-2xl bg-[#09090b] border border-[#1e202c] text-center shadow-inner flex flex-col justify-center">
                    <span className="text-2xl sm:text-3xl font-black text-[#ff6b00] leading-none">
                      {String(stats.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider mt-1 block">
                      HOURS
                    </span>
                  </div>

                  {/* Minutes */}
                  <div className="p-3 rounded-2xl bg-[#09090b] border border-[#1e202c] text-center shadow-inner flex flex-col justify-center">
                    <span className="text-2xl sm:text-3xl font-black text-cyan-400 leading-none">
                      {String(stats.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider mt-1 block">
                      MINS
                    </span>
                  </div>

                  {/* Seconds */}
                  <div className="p-3 rounded-2xl bg-[#09090b] border border-[#1e202c] text-center shadow-inner flex flex-col justify-center relative overflow-hidden">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 leading-none animate-pulse">
                      {String(stats.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider mt-1 block">
                      SECS
                    </span>
                  </div>
                </div>

                {/* Evolution Stage Description & Biological Health Benefit Cue */}
                <div className="p-3.5 rounded-2xl bg-[#09090b]/80 border border-[#1e202c] space-y-2 relative z-10">
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg flex-shrink-0 mt-0.5">{stats.currentStage.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-white">{stats.currentStage.stageTitle}</span>
                        <span className="text-[10px] font-mono text-zinc-500">• Stage {stats.currentStage.level}/7</span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                        {stats.currentStage.description}
                      </p>
                    </div>
                  </div>

                  {stats.healthBenefitCue && (
                    <div className="pt-2 border-t border-[#1a1b24] text-[11px] text-zinc-400 flex items-start gap-2">
                      <Heart className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                      <p className="leading-snug text-zinc-300">{stats.healthBenefitCue}</p>
                    </div>
                  )}
                </div>

                {/* Progress Bar & Next Milestone Indicator */}
                <div className="space-y-1.5 relative z-10">
                  <div className="flex items-center justify-between text-xs font-numeric">
                    <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">
                      Protocol Progress ({stats.days} / {stats.targetDays} Days)
                    </span>
                    {stats.nextMilestone ? (
                      <span className="text-[10px] font-mono text-[#ff6b00] font-bold">
                        Next: {stats.nextMilestone.label} in {stats.nextMilestone.remainingDays > 0 ? `${stats.nextMilestone.remainingDays}d ` : ''}{stats.nextMilestone.remainingHours}h {stats.nextMilestone.remainingMinutes}m
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-cyan-400 font-black">
                        🎉 TARGET MASTERED!
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-[#09090b] border border-[#1e202c] overflow-hidden p-0.5">
                    <div 
                      className="h-full rounded-full transition-all duration-500 shadow-lg"
                      style={{ 
                        width: `${Math.max(2, stats.progressPercentage)}%`,
                        backgroundColor: habit.color || '#ff6b00',
                        boxShadow: `0 0 10px ${habit.color || '#ff6b00'}80`
                      }}
                    />
                  </div>
                </div>

                {/* Money & Units Avoided Metrics Strip */}
                {(stats.moneySaved > 0 || stats.unitsAvoided > 0) && (
                  <div className="grid grid-cols-2 gap-2 pt-1 font-numeric relative z-10">
                    {stats.moneySaved > 0 && (
                      <div className="p-2.5 rounded-2xl bg-[#14151e] border border-[#212330] flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          💰
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-mono uppercase text-zinc-500 block font-bold">Money Saved</span>
                          <span className="text-xs sm:text-sm font-extrabold text-white truncate block">
                            {stats.moneySaved.toLocaleString()} {stats.currency}
                          </span>
                        </div>
                      </div>
                    )}

                    {stats.unitsAvoided > 0 && (
                      <div className="p-2.5 rounded-2xl bg-[#14151e] border border-[#212330] flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          🛡️
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-mono uppercase text-zinc-500 block font-bold">{stats.unitLabel} Avoided</span>
                          <span className="text-xs sm:text-sm font-extrabold text-white truncate block">
                            {stats.unitsAvoided.toLocaleString()} {stats.unitLabel}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Milestone Badges Timeline */}
                <div className="pt-2 border-t border-[#1e202c] relative z-10">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold block mb-2">
                    Milestone Badges
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {stats.milestones.slice(0, 7).map((m) => (
                      <div
                        key={m.days}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 flex-shrink-0 border transition-all ${
                          m.achieved
                            ? 'bg-[#18151f] text-[#ff6b00] border-[#ff6b00]/40 shadow-sm'
                            : 'bg-[#09090b] text-zinc-600 border-[#1a1b24]'
                        }`}
                        title={m.achieved ? `Unlocked: ${m.label}` : `Locked: ${m.label}`}
                      >
                        {m.achieved ? <Award className="w-3 h-3 text-[#ff6b00]" /> : <Lock className="w-3 h-3 text-zinc-600" />}
                        <span>{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Motivation Cue if provided */}
                {habit.quitConfig?.motivationReason && (
                  <div className="px-3 py-2 rounded-2xl bg-[#09090b] border border-[#1e202c] text-[11px] text-zinc-400 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff6b00] flex-shrink-0 mt-0.5" />
                    <p className="italic text-zinc-300 leading-snug font-medium">"{habit.quitConfig.motivationReason}"</p>
                  </div>
                )}
              </div>
            );
          }

          // If this is a STANDARD DAILY HABIT (Boolean or Numeric)
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

        {filteredHabits.length === 0 && (
          <div className="p-10 rounded-3xl bg-[#111218] border border-[#212330] text-center shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#171822] text-[#ff6b00] border border-[#282a3a] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-white">No Habits In This View</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {activeTab === 'quit' 
                ? 'Create a Quit Bad Habit protocol (Smoking, Sugar, Screens, etc.) with a live ticking clock.' 
                : 'Start tracking your daily hydration, supplements, or sleep routines.'}
            </p>
            <button
              onClick={() => handleOpenAddModal(activeTab === 'quit' ? 'quit' : 'daily')}
              className="px-5 py-2.5 rounded-xl btn-orange text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-md active:scale-95 mt-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create {activeTab === 'quit' ? 'Quit Protocol' : 'Daily Habit'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Create / Edit Modal */}
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

            {/* Header */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#1e202c]">
              <div className="w-10 h-10 rounded-2xl bg-[#171822] text-[#ff6b00] border border-[#282a3a] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  {editingHabit ? 'Edit Habit Protocol' : 'Create New Habit Tracker'}
                </h3>
                <p className="text-xs text-zinc-400">
                  Configure live quitting trackers or daily routine targets.
                </p>
              </div>
            </div>

            {/* Mode Switcher: Quit Bad Habit vs Daily Habit */}
            {!editingHabit && (
              <div className="mb-4">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-bold">
                  Tracker Architecture
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModeType('quit');
                      handleSelectPreset(QUIT_HABIT_PRESETS[0]);
                    }}
                    className={`py-3 px-3 rounded-2xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      modeType === 'quit'
                        ? 'bg-gradient-to-r from-[#ff6b00]/20 to-[#ff8c00]/10 text-[#ff6b00] border-[#ff6b00] shadow-md shadow-[#ff6b00]/10'
                        : 'bg-[#09090b] text-zinc-400 border-[#1e202c]'
                    }`}
                  >
                    <CigaretteOff className="w-4 h-4" />
                    <span>Break Bad Habit (Live Clock)</span>
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
                    className={`py-3 px-3 rounded-2xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      modeType === 'daily'
                        ? 'bg-[#18151f] text-[#ff6b00] border-[#ff6b00] shadow-md shadow-[#ff6b00]/10'
                        : 'bg-[#09090b] text-zinc-400 border-[#1e202c]'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Daily Routine Habit</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Presets for Quitting Bad Habits */}
            {modeType === 'quit' && !editingHabit && (
              <div className="mb-4 space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                  ⚡ 1-Tap Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {QUIT_HABIT_PRESETS.map((p) => {
                    const isSelected = title === p.title;
                    return (
                      <button
                        key={p.title}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-[#18151f] border-[#ff6b00] text-[#ff6b00] shadow-sm'
                            : 'bg-[#09090b] border-[#1e202c] text-zinc-300 hover:border-[#35384d]'
                        }`}
                      >
                        <RenderHabitIcon iconKey={p.iconKey} className="w-4 h-4 flex-shrink-0" />
                        <span className="text-[11px] font-bold truncate">{p.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                  placeholder={modeType === 'quit' ? 'e.g. Smoke-Free, Zero Sugar, No Doomscrolling...' : 'e.g. Creatine 5g, Drink 3L Water, 8h Sleep...'}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#09090b] border border-[#1e202c] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff6b00]/60 font-bold"
                />
              </div>

              {/* Specific Quit Mode Configuration */}
              {modeType === 'quit' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-[#09090b] border border-[#1e202c]">
                  
                  {/* Target Days Selector */}
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
                              : 'bg-[#14151e] text-zinc-300 border-[#252736]'
                          }`}
                        >
                          {d} Days {d === 90 && '⭐'}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">Custom Target:</span>
                      <input
                        type="number"
                        min="1"
                        max="3650"
                        value={targetDays}
                        onChange={(e) => setTargetDays(Math.max(1, parseInt(e.target.value) || 90))}
                        className="w-24 px-2.5 py-1 rounded-xl bg-[#14151e] border border-[#252736] text-xs font-mono font-bold text-white text-center focus:outline-none focus:border-[#ff6b00]"
                      />
                      <span className="text-xs text-zinc-400">Days</span>
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
                        className="flex-1 px-3 py-2 rounded-xl bg-[#14151e] border border-[#252736] text-xs text-white focus:outline-none focus:border-[#ff6b00]"
                      />
                      <button
                        type="button"
                        onClick={() => setStartedAt(new Date().toISOString())}
                        className="px-2.5 py-2 rounded-xl bg-[#1c1d27] hover:bg-[#252736] text-zinc-200 text-xs font-mono font-bold transition-colors"
                      >
                        Now
                      </button>
                    </div>
                  </div>

                  {/* Savings & Avoided Units */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                        Cost / Day Saved ({currency})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={savingsPerDay}
                        onChange={(e) => setSavingsPerDay(parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 50"
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#14151e] border border-[#252736] text-xs font-numeric text-white focus:outline-none focus:border-[#ff6b00]"
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
                          placeholder="e.g. 20"
                          className="w-16 px-2 py-1.5 rounded-xl bg-[#14151e] border border-[#252736] text-xs font-numeric text-white focus:outline-none focus:border-[#ff6b00]"
                        />
                        <input
                          type="text"
                          value={avoidedUnitLabel}
                          onChange={(e) => setAvoidedUnitLabel(e.target.value)}
                          placeholder="e.g. Cigarettes"
                          className="flex-1 px-2 py-1.5 rounded-xl bg-[#14151e] border border-[#252736] text-xs text-white focus:outline-none focus:border-[#ff6b00]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Motivation Why */}
                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                      Personal Motivation / Reason Why
                    </label>
                    <input
                      type="text"
                      value={motivationReason}
                      onChange={(e) => setMotivationReason(e.target.value)}
                      placeholder="e.g. Clean lungs, max VO2 stamina, save money..."
                      className="w-full px-3 py-1.5 rounded-xl bg-[#14151e] border border-[#252736] text-xs text-zinc-200 focus:outline-none focus:border-[#ff6b00]"
                    />
                  </div>
                </div>
              )}

              {/* Standard Daily Habit Specific Options */}
              {modeType === 'daily' && (
                <>
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
                      <option value="Lifestyle">🚭 Lifestyle (Cold Shower, Mobility)</option>
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
                </>
              )}

              {/* Icon Picker Grid */}
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
                  {editingHabit ? 'Save Changes' : (modeType === 'quit' ? 'Start Quitting Protocol 🚀' : 'Create Habit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Relapse Reflection & Reset Modal */}
      {relapseModalHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-[#111218] border border-[#212330] rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150 space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <RotateCcw className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Relapse Reflection
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight mt-2">
                Restart Clean Streak
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Slips are data points, not defeats. Acknowledge the trigger, learn from it, and restart your clock right now.
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
                placeholder="e.g. High work stress, peer pressure at outing, lack of sleep..."
                className="w-full p-3 rounded-2xl bg-[#09090b] border border-[#1e202c] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRelapseModalHabit(null)}
                className="py-3 px-4 rounded-2xl bg-[#14151e] hover:bg-[#1e202c] border border-[#212330] text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
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
