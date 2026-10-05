'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import confetti from 'canvas-confetti';
import { 
  UserHabit, 
  QuitHabitConfig, 
  getUserHabits, 
  createUserHabit, 
  updateUserHabit, 
  deleteUserHabit, 
  resetQuitHabit,
  getTodayRecordForHabit,
  setHabitRecord,
  calculateOverallHabitsSummary,
  getQuitHabitsTotalSavings,
  QUIT_HABIT_PRESETS
} from '@/lib/habitsEngine';
import { UserHabitSchema } from '@/schemas/habit.schema';

export function useTraineeHabits() {
  const { currentUser } = useGym();
  const { showToast } = useToast();

  const [habits, setHabits] = useState<UserHabit[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'quit' | 'daily'>('all');

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
  const [color, setColor] = useState('#2f80ed');

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

  // Load user habits on user or refreshKey change
  useEffect(() => {
    if (currentUser) {
      setHabits(getUserHabits(currentUser.id));
    }
  }, [currentUser, refreshKey]);

  // Derived Summary
  const summary = useMemo(() => {
    if (!currentUser) return { todayCompletedCount: 0, todayTotalCount: 0, adherencePercentage: 100, activeStreak: 0 };
    return calculateOverallHabitsSummary(currentUser.id, habits);
  }, [currentUser, habits]);

  const quitSavings = useMemo(() => {
    return getQuitHabitsTotalSavings(habits);
  }, [habits]);

  const quitHabits = useMemo(() => habits.filter((h) => h.type === 'quit'), [habits]);
  const dailyHabits = useMemo(() => habits.filter((h) => h.type !== 'quit'), [habits]);

  const filteredHabits = useMemo(() => {
    if (activeTab === 'quit') return quitHabits;
    if (activeTab === 'daily') return dailyHabits;
    return habits;
  }, [activeTab, habits, quitHabits, dailyHabits]);

  // Daily smoking cost calculation for form preview
  const calculatedDailySmokingCost = useMemo(() => {
    if (cigarettesPerPack > 0 && pricePerPack > 0) {
      return Math.round((cigarettesPerDay / cigarettesPerPack) * pricePerPack);
    }
    return savingsPerDay || 0;
  }, [cigarettesPerDay, cigarettesPerPack, pricePerPack, savingsPerDay]);

  const handleOpenAddModal = useCallback((initialMode: 'quit' | 'daily' = 'quit') => {
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
      setColor('#2f80ed');
    }

    setIsModalOpen(true);
  }, []);

  const handleSelectPreset = useCallback((preset: typeof QUIT_HABIT_PRESETS[0]) => {
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
  }, []);

  const handleOpenEditModal = useCallback((h: UserHabit) => {
    setEditingHabit(h);
    setTitle(h.title);
    setCategory(h.category);
    setType(h.type);
    setTargetValue(h.targetValue);
    setUnit(h.unit);
    setIconKey(h.iconKey);
    setColor(h.color || '#2f80ed');

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
  }, []);

  const handleSaveHabit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
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

    const payload = {
      id: editingHabit ? editingHabit.id : `habit-${Date.now()}`,
      userId: currentUser.id,
      title: title.trim(),
      category: isQuit ? ('Quit / Break' as const) : category,
      type: isQuit ? ('quit' as const) : type,
      targetValue: isQuit ? (Number(targetDays) || 90) : (type === 'boolean' ? 1 : Number(targetValue) || 1),
      unit: isQuit ? 'days clean' : (type === 'boolean' ? 'done' : unit.trim() || 'unit'),
      iconKey,
      color,
      createdAt: editingHabit ? editingHabit.createdAt : new Date().toISOString(),
      quitConfig: quitConfigData
    };

    // Strict runtime validation
    const validationResult = UserHabitSchema.safeParse(payload);
    if (!validationResult.success) {
      showToast('Validation error: ' + validationResult.error.issues[0]?.message, 'error');
      return;
    }

    if (editingHabit) {
      updateUserHabit(currentUser.id, editingHabit.id, {
        title: validationResult.data.title,
        category: validationResult.data.category,
        type: validationResult.data.type,
        targetValue: validationResult.data.targetValue,
        unit: validationResult.data.unit,
        iconKey: validationResult.data.iconKey,
        color: validationResult.data.color,
        quitConfig: validationResult.data.quitConfig
      });
      showToast(`Updated "${title}"!`, 'success');
    } else {
      createUserHabit(currentUser.id, {
        title: validationResult.data.title,
        category: validationResult.data.category,
        type: validationResult.data.type,
        targetValue: validationResult.data.targetValue,
        unit: validationResult.data.unit,
        iconKey: validationResult.data.iconKey,
        color: validationResult.data.color,
        quitConfig: validationResult.data.quitConfig
      });
      showToast(`Started "${title}" protocol!`, 'success');

      if (isQuit) {
        try {
          confetti({
            particleCount: 80,
            spread: 65,
            origin: { y: 0.6 },
            colors: ['#2f80ed', '#10b981', '#ffffff']
          });
        } catch {
          // ignore
        }
      }
    }

    setIsModalOpen(false);
    setRefreshKey((k) => k + 1);
  }, [
    currentUser,
    title,
    modeType,
    savingsPerDay,
    avoidedUnitsPerDay,
    quitCategory,
    cigarettesPerPack,
    pricePerPack,
    cigarettesPerDay,
    startedAt,
    targetDays,
    currency,
    avoidedUnitLabel,
    motivationReason,
    editingHabit,
    category,
    type,
    targetValue,
    unit,
    iconKey,
    color,
    showToast
  ]);

  const handleDeleteHabit = useCallback((h: UserHabit) => {
    if (!currentUser) return;
    deleteUserHabit(currentUser.id, h.id);
    showToast(`Deleted "${h.title}" habit`, 'info');
    setRefreshKey((k) => k + 1);
  }, [currentUser, showToast]);

  const handleOpenRelapseModal = useCallback((h: UserHabit) => {
    setRelapseModalHabit(h);
    setRelapseNote('');
  }, []);

  const handleConfirmRelapse = useCallback(() => {
    if (!currentUser || !relapseModalHabit) return;
    resetQuitHabit(currentUser.id, relapseModalHabit.id, relapseNote);
    showToast(`Clock reset. Stay strong, you will conquer this!`, 'info');
    setRelapseModalHabit(null);
    setRefreshKey((k) => k + 1);
  }, [currentUser, relapseModalHabit, relapseNote, showToast]);

  const handleToggleBooleanHabit = useCallback((h: UserHabit) => {
    if (!currentUser) return;
    const record = getTodayRecordForHabit(currentUser.id, h);
    const nextCompleted = !record.completed;
    setHabitRecord(currentUser.id, h, nextCompleted ? 1 : 0, nextCompleted);
    setRefreshKey((k) => k + 1);
    if (nextCompleted) {
      showToast(`Marked "${h.title}" as completed!`, 'success');
    }
  }, [currentUser, showToast]);

  const handleAdjustNumericHabit = useCallback((h: UserHabit, delta: number) => {
    if (!currentUser) return;
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
      showToast(`Target reached for "${h.title}"!`, 'success');
    }
  }, [currentUser, showToast]);

  return {
    currentUser,
    habits,
    quitHabits,
    dailyHabits,
    filteredHabits,
    summary,
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    editingHabit,
    relapseModalHabit,
    setRelapseModalHabit,
    relapseNote,
    setRelapseNote,
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
    handleOpenAddModal,
    handleSelectPreset,
    handleOpenEditModal,
    handleSaveHabit,
    handleDeleteHabit,
    handleOpenRelapseModal,
    handleConfirmRelapse,
    handleToggleBooleanHabit,
    handleAdjustNumericHabit,
    quitSavings
  };
}
