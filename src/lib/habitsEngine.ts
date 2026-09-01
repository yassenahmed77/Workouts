export type HabitType = 'boolean' | 'numeric' | 'quit';
export type HabitCategory = 'Supplement' | 'Nutrition' | 'Recovery' | 'Lifestyle' | 'Mindset' | 'Fitness' | 'Quit / Break';

export interface QuitHabitConfig {
  startedAt: string; // ISO timestamp with exact start time e.g. "2026-09-01T04:30:00.000Z"
  targetDays: number; // Standard e.g. 90, 30, 21, 365, etc.
  quitCategory?: 'smoking' | 'sugar' | 'caffeine' | 'screens' | 'vape' | 'alcohol' | 'sleep' | 'custom';
  
  // Specific Smoking / Nicotine Consumption Calculator
  cigarettesPerDay?: number; // How many cigarettes smoked per day (e.g. 20 for 1 pack, 10 for half pack, 30, 40)
  pricePerPack?: number; // Cost of 1 pack (e.g. 85 EGP, 100 EGP, $10)
  cigarettesPerPack?: number; // Cigarettes in a pack (standard 20)
  
  savingsPerDay?: number; // Auto-calculated or manual (e.g. 85 EGP saved/day)
  currency?: string; // e.g. 'EGP', '$', 'SAR', 'AED', 'EUR'
  avoidedUnitsPerDay?: number; // e.g. 20 (cigarettes/day) or 2 (energy drinks/day)
  avoidedUnitLabel?: string; // e.g. 'Cigarettes', 'Packs', 'Cans', 'Hours'
  motivationReason?: string; // Personal why
  relapseHistory?: { timestamp: string; note?: string; durationDays?: number }[];
}

export interface UserHabit {
  id: string;
  userId: string;
  title: string;
  category: HabitCategory;
  type: HabitType;
  targetValue: number; // e.g. 1 for boolean, 3 for 3 Liters, 8 for 8 hours, 90 for 90 days
  unit: string; // e.g. 'done', 'L', 'hrs', 'g', 'steps', 'days clean'
  iconKey: string;
  color: string;
  createdAt: string;
  quitConfig?: QuitHabitConfig;
}

export interface HabitDailyRecord {
  habitId: string;
  date: string; // YYYY-MM-DD
  userId: string;
  value: number; // e.g. 1 for checked boolean, or 2.5 for 2.5L
  completed: boolean;
}

export interface QuitLiveStats {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  totalHours: number;
  exactDaysDecimal: number;
  targetDays: number;
  progressPercentage: number;
  isTargetAchieved: boolean;
  
  // Financial & Physical Avoided metrics
  moneySaved: number;
  projectedMonthlySavings: number;
  projectedYearlySavings: number;
  dailySavings: number;
  
  unitsAvoided: number;
  exactCigarettesAvoided: number;
  packsAvoided: number;
  lifeHoursRegained: number;
  
  currency: string;
  unitLabel: string;
  currentStage: {
    level: number;
    name: string;
    stageTitle: string;
    description: string;
    color: string;
    icon: string;
  };
  milestones: {
    days: number;
    label: string;
    achieved: boolean;
    unlockedAt?: string;
  }[];
  nextMilestone: {
    days: number;
    label: string;
    remainingDays: number;
    remainingHours: number;
    remainingMinutes: number;
  } | null;
  healthBenefitCue: string;
}

export const HABIT_ICON_OPTIONS = [
  { key: 'cigarette-off', label: '🚭 Smoke-Free / Nicotine' },
  { key: 'zap', label: '⚡ Energy / Creatine' },
  { key: 'droplets', label: '💧 Water / Hydration' },
  { key: 'moon', label: '🌙 Sleep / Rest' },
  { key: 'pill', label: '💊 Vitamins / Supplements' },
  { key: 'flame', label: '🔥 Calories / Burn' },
  { key: 'utensils', label: '🍽️ Nutrition / Diet' },
  { key: 'dumbbell', label: '🏋️ Workout / Lifting' },
  { key: 'footprints', label: '🦶 Steps / Walking' },
  { key: 'book', label: '📖 Reading / Learning' },
  { key: 'heart', label: '🧘 Meditation / Mindfulness' },
  { key: 'apple', label: '🍎 Clean Eating / No Sugar' },
  { key: 'coffee', label: '☕ Coffee / Caffeine Control' },
  { key: 'snowflake', label: '🧊 Cold Plunge / Shower' },
  { key: 'bike', label: '🚴 Cardio / Cycling' },
  { key: 'timer', label: '⏱️ Intermittent Fasting' },
  { key: 'target', label: '🎯 Daily Focus' },
  { key: 'sun', label: '☀️ Morning Sunlight' },
  { key: 'brain', label: '🧠 Screen Detox / Mind' },
  { key: 'sparkles', label: '✨ Self-Care / Skincare' },
  { key: 'shield', label: '🛡️ Discipline / Willpower' },
  { key: 'award', label: '🏆 Goal Milestone' },
  { key: 'smile', label: '😊 Gratitude' },
  { key: 'bed', label: '🛏️ Early Bedtime' }
];

export const HABIT_COLOR_OPTIONS = [
  { value: '#ff6b00', name: 'Cyber Orange' },
  { value: '#10b981', name: 'Emerald Green' },
  { value: '#3b82f6', name: 'Sky Blue' },
  { value: '#8b5cf6', name: 'Electric Purple' },
  { value: '#ec4899', name: 'Neon Pink' },
  { value: '#f59e0b', name: 'Amber Gold' },
  { value: '#06b6d4', name: 'Cyan Glow' }
];

export const QUIT_HABIT_PRESETS: {
  title: string;
  iconKey: string;
  color: string;
  category: HabitCategory;
  type: HabitType;
  quitConfig: QuitHabitConfig;
}[] = [
  {
    title: 'Smoke-Free (Cigarettes)',
    iconKey: 'cigarette-off',
    color: '#ff6b00',
    category: 'Quit / Break',
    type: 'quit',
    quitConfig: {
      startedAt: new Date().toISOString(),
      targetDays: 90,
      quitCategory: 'smoking',
      cigarettesPerDay: 20,
      pricePerPack: 85,
      cigarettesPerPack: 20,
      savingsPerDay: 85,
      currency: 'EGP',
      avoidedUnitsPerDay: 20,
      avoidedUnitLabel: 'Cigarettes',
      motivationReason: 'Clean lungs, max cardiovascular stamina, save money & live longer.'
    }
  },
  {
    title: 'Zero Sugar & Junk Food',
    iconKey: 'apple',
    color: '#10b981',
    category: 'Quit / Break',
    type: 'quit',
    quitConfig: {
      startedAt: new Date().toISOString(),
      targetDays: 30,
      quitCategory: 'sugar',
      savingsPerDay: 60,
      currency: 'EGP',
      avoidedUnitsPerDay: 400,
      avoidedUnitLabel: 'Empty Kcal',
      motivationReason: 'Shred fat, eliminate brain fog & peak insulin sensitivity.'
    }
  },
  {
    title: 'No Doomscrolling & Reels',
    iconKey: 'brain',
    color: '#8b5cf6',
    category: 'Quit / Break',
    type: 'quit',
    quitConfig: {
      startedAt: new Date().toISOString(),
      targetDays: 21,
      quitCategory: 'screens',
      savingsPerDay: 0,
      currency: 'EGP',
      avoidedUnitsPerDay: 3,
      avoidedUnitLabel: 'Hours Reclaimed',
      motivationReason: 'Deep focus, dopamine reset & laser workout concentration.'
    }
  },
  {
    title: 'Caffeine & Energy Drinks Reset',
    iconKey: 'coffee',
    color: '#f59e0b',
    category: 'Quit / Break',
    type: 'quit',
    quitConfig: {
      startedAt: new Date().toISOString(),
      targetDays: 30,
      quitCategory: 'caffeine',
      savingsPerDay: 40,
      currency: 'EGP',
      avoidedUnitsPerDay: 2,
      avoidedUnitLabel: 'Cans / Cups',
      motivationReason: 'Restore natural adrenal energy & deep restful sleep.'
    }
  },
  {
    title: 'Vape-Free Clean Air',
    iconKey: 'snowflake',
    color: '#06b6d4',
    category: 'Quit / Break',
    type: 'quit',
    quitConfig: {
      startedAt: new Date().toISOString(),
      targetDays: 90,
      quitCategory: 'vape',
      savingsPerDay: 40,
      currency: 'EGP',
      avoidedUnitsPerDay: 150,
      avoidedUnitLabel: 'Puffs Avoided',
      motivationReason: 'Healthy respiratory system, zero chemical dependency.'
    }
  },
  {
    title: 'Custom Bad Habit Break',
    iconKey: 'shield',
    color: '#ec4899',
    category: 'Quit / Break',
    type: 'quit',
    quitConfig: {
      startedAt: new Date().toISOString(),
      targetDays: 90,
      quitCategory: 'custom',
      savingsPerDay: 0,
      currency: 'EGP',
      avoidedUnitsPerDay: 1,
      avoidedUnitLabel: 'Times Overcome',
      motivationReason: 'Mastering personal discipline and unbreakable willpower.'
    }
  }
];

export const DEFAULT_STARTER_HABITS: Omit<UserHabit, 'id' | 'userId' | 'createdAt'>[] = [
  {
    title: 'Smoke-Free',
    category: 'Quit / Break',
    type: 'quit',
    targetValue: 90,
    unit: 'days clean',
    iconKey: 'cigarette-off',
    color: '#ff6b00',
    quitConfig: {
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // started 28 hours ago for demo
      targetDays: 90,
      quitCategory: 'smoking',
      cigarettesPerDay: 20,
      pricePerPack: 85,
      cigarettesPerPack: 20,
      savingsPerDay: 85,
      currency: 'EGP',
      avoidedUnitsPerDay: 20,
      avoidedUnitLabel: 'Cigarettes',
      motivationReason: 'Peak lung capacity, maximum VO2 max and pure heart health.'
    }
  },
  {
    title: 'Creatine Monohydrate',
    category: 'Supplement',
    type: 'boolean',
    targetValue: 1,
    unit: 'done',
    iconKey: 'zap',
    color: '#ff6b00'
  },
  {
    title: 'Hydration Target',
    category: 'Nutrition',
    type: 'numeric',
    targetValue: 3.0,
    unit: 'L',
    iconKey: 'droplets',
    color: '#3b82f6'
  },
  {
    title: 'Optimal Sleep',
    category: 'Recovery',
    type: 'numeric',
    targetValue: 8.0,
    unit: 'hrs',
    iconKey: 'moon',
    color: '#8b5cf6'
  }
];

const STORAGE_KEY_CUSTOM_HABITS = 'pro_gym_user_habits_v9';
const STORAGE_KEY_DAILY_RECORDS = 'pro_gym_habit_records_v9';

/**
 * Get all habits created for a specific user
 */
export function getUserHabits(userId: string): UserHabit[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_CUSTOM_HABITS}_${userId}`);
    if (raw) {
      const parsed: UserHabit[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Auto-normalize any old "Smoke-Free Protocol" text to "Smoke-Free"
        const cleaned = parsed.map((h) => {
          if (h.title === 'Smoke-Free Protocol') {
            return { ...h, title: 'Smoke-Free' };
          }
          return h;
        });
        return cleaned;
      }
    }
  } catch (e) {
    console.warn('Failed to load user habits:', e);
  }

  // Initialize with starter habits if none exist
  const initialHabits: UserHabit[] = DEFAULT_STARTER_HABITS.map((h, i) => ({
    ...h,
    id: `habit-${Date.now()}-${i}`,
    userId,
    createdAt: new Date().toISOString()
  }));

  saveUserHabits(userId, initialHabits);
  return initialHabits;
}

/**
 * Save habits for a specific user
 */
export function saveUserHabits(userId: string, habits: UserHabit[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY_CUSTOM_HABITS}_${userId}`, JSON.stringify(habits));
  } catch (e) {
    console.warn('Failed to save user habits:', e);
  }
}

/**
 * Create a new custom habit
 */
export function createUserHabit(
  userId: string, 
  habit: Omit<UserHabit, 'id' | 'userId' | 'createdAt'>
): UserHabit {
  const currentHabits = getUserHabits(userId);
  const newHabit: UserHabit = {
    ...habit,
    id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    createdAt: new Date().toISOString()
  };

  const updated = [newHabit, ...currentHabits];
  saveUserHabits(userId, updated);
  return newHabit;
}

/**
 * Update an existing habit
 */
export function updateUserHabit(
  userId: string, 
  habitId: string, 
  partial: Partial<Omit<UserHabit, 'id' | 'userId' | 'createdAt'>>
): UserHabit[] {
  const currentHabits = getUserHabits(userId);
  const updated = currentHabits.map((h) => (h.id === habitId ? { ...h, ...partial } : h));
  saveUserHabits(userId, updated);
  return updated;
}

/**
 * Delete a custom habit
 */
export function deleteUserHabit(userId: string, habitId: string): UserHabit[] {
  const currentHabits = getUserHabits(userId);
  const updated = currentHabits.filter((h) => h.id !== habitId);
  saveUserHabits(userId, updated);
  return updated;
}

/**
 * Reset a quit habit with optional reflection note
 */
export function resetQuitHabit(
  userId: string, 
  habitId: string, 
  reflectionNote?: string
): UserHabit[] {
  const currentHabits = getUserHabits(userId);
  const updated = currentHabits.map((h) => {
    if (h.id === habitId && h.quitConfig) {
      const started = new Date(h.quitConfig.startedAt).getTime();
      const now = Date.now();
      const elapsedDays = Math.max(0, (now - started) / (1000 * 60 * 60 * 24));
      
      const newHistoryItem = {
        timestamp: new Date().toISOString(),
        note: reflectionNote || 'Relapsed and restarted with fresh determination.',
        durationDays: Math.round(elapsedDays * 10) / 10
      };

      const prevHistory = h.quitConfig.relapseHistory || [];

      return {
        ...h,
        quitConfig: {
          ...h.quitConfig,
          startedAt: new Date().toISOString(),
          relapseHistory: [newHistoryItem, ...prevHistory]
        }
      };
    }
    return h;
  });

  saveUserHabits(userId, updated);
  return updated;
}

/**
 * Calculate dynamic live stats for a quit habit
 */
export function calculateQuitLiveStats(habit: UserHabit): QuitLiveStats {
  const config = habit.quitConfig || {
    startedAt: habit.createdAt || new Date().toISOString(),
    targetDays: habit.targetValue || 90
  };

  const startTime = new Date(config.startedAt).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - startTime);

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalHours = Math.floor(totalSeconds / 3600);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const exactDaysDecimal = totalSeconds / 86400;

  const targetDays = config.targetDays || 90;
  const progressPercentage = Math.min(100, Math.round((exactDaysDecimal / targetDays) * 100));
  const isTargetAchieved = exactDaysDecimal >= targetDays;

  // Smoking / Financial & Physical Avoided metrics
  const cigsPerPack = config.cigarettesPerPack || 20;
  const cigsPerDay = config.cigarettesPerDay !== undefined 
    ? config.cigarettesPerDay 
    : (config.quitCategory === 'smoking' ? (config.avoidedUnitsPerDay || 20) : 0);
  const pricePerPack = config.pricePerPack !== undefined ? config.pricePerPack : 0;

  let dailySavings = config.savingsPerDay || 0;
  if (pricePerPack > 0 && cigsPerDay > 0) {
    dailySavings = (cigsPerDay / cigsPerPack) * pricePerPack;
  }

  const moneySaved = Math.round(exactDaysDecimal * dailySavings);
  const projectedMonthlySavings = Math.round(dailySavings * 30);
  const projectedYearlySavings = Math.round(dailySavings * 365);

  const avoidedPerDay = config.avoidedUnitsPerDay || (cigsPerDay > 0 ? cigsPerDay : 0);
  const unitsAvoided = Math.floor(exactDaysDecimal * avoidedPerDay);
  const exactCigarettesAvoided = Math.floor(exactDaysDecimal * (cigsPerDay || avoidedPerDay));
  const packsAvoided = Math.round((exactCigarettesAvoided / cigsPerPack) * 10) / 10;
  const lifeHoursRegained = Math.round((exactCigarettesAvoided * 11) / 60); // 11 mins life gained back per cigarette avoided

  // Dynamic visual evolution stage
  let stageLevel = 1;
  let stageName = 'Awakening';
  let stageTitle = 'First 24 Hours';
  let description = 'Peak withdrawal & cravings. Winning the mental battle second by second!';
  let stageColor = '#ff6b00';
  let stageIcon = '🌱';

  if (exactDaysDecimal >= 90) {
    stageLevel = 7;
    stageName = 'Unbreakable Legend';
    stageTitle = '90+ Days Mastered';
    description = 'Permanent freedom achieved! Neural pathways rewired & ultimate discipline unlocked!';
    stageColor = '#06b6d4';
    stageIcon = '🏆';
  } else if (exactDaysDecimal >= 60) {
    stageLevel = 6;
    stageName = 'Freedom Mastery';
    stageTitle = '2 Months Protocol';
    description = 'Dopamine baseline completely stabilized. The old identity has dissolved.';
    stageColor = '#f59e0b';
    stageIcon = '👑';
  } else if (exactDaysDecimal >= 21) {
    stageLevel = 5;
    stageName = 'Identity Shift';
    stageTitle = '3 Weeks Clean';
    description = 'Habit loops rewritten. You are now someone who has conquered this urge.';
    stageColor = '#ec4899';
    stageIcon = '🦾';
  } else if (exactDaysDecimal >= 7) {
    stageLevel = 4;
    stageName = 'Neuro-Rewiring';
    stageTitle = '1 Week Strong';
    description = 'Physical withdrawal symptoms gone. Psychological momentum building!';
    stageColor = '#8b5cf6';
    stageIcon = '🛡️';
  } else if (exactDaysDecimal >= 3) {
    stageLevel = 3;
    stageName = 'Momentum';
    stageTitle = '72 Hours Clean';
    description = 'Toxins leaving system. Oxygen levels surging and sensory recovery begins.';
    stageColor = '#3b82f6';
    stageIcon = '⚡';
  } else if (exactDaysDecimal >= 1) {
    stageLevel = 2;
    stageName = 'Detoxification';
    stageTitle = 'Day 2 Detox';
    description = 'First full day conquered! Blood carbon monoxide levels normalising.';
    stageColor = '#10b981';
    stageIcon = '🌿';
  }

  // Milestones timeline
  const milestoneDays = [1, 3, 7, 14, 21, 30, 60, 90, 180, 365];
  const milestones = milestoneDays.map((d) => ({
    days: d,
    label: d === 1 ? '24 Hours' : d === 7 ? '1 Week' : d === 14 ? '2 Weeks' : d === 21 ? '21 Days' : d === 30 ? '1 Month' : d === 60 ? '2 Months' : d === 90 ? '90 Days (Goal)' : `${d} Days`,
    achieved: exactDaysDecimal >= d,
    unlockedAt: exactDaysDecimal >= d ? new Date(startTime + d * 86400000).toLocaleDateString() : undefined
  }));

  // Next milestone
  const next = milestones.find((m) => !m.achieved);
  let nextMilestone: QuitLiveStats['nextMilestone'] = null;
  if (next) {
    const remainingSeconds = Math.max(0, (next.days * 86400) - totalSeconds);
    nextMilestone = {
      days: next.days,
      label: next.label,
      remainingDays: Math.floor(remainingSeconds / 86400),
      remainingHours: Math.floor((remainingSeconds % 86400) / 3600),
      remainingMinutes: Math.floor((remainingSeconds % 3600) / 60)
    };
  }

  // Science & health cues based on category
  let healthBenefitCue = 'Your body and nervous system are continuously recovering and rebuilding.';
  const qCat = config.quitCategory || 'smoking';
  if (qCat === 'smoking' || qCat === 'vape') {
    if (exactDaysDecimal < 1) healthBenefitCue = 'Blood pressure and heart rate starting to normalize to healthy levels.';
    else if (exactDaysDecimal < 3) healthBenefitCue = 'Carbon monoxide in blood dropped to normal. Oxygen supply to muscles surging!';
    else if (exactDaysDecimal < 7) healthBenefitCue = 'Nerve endings regrowing, taste and smell sharpening significantly.';
    else if (exactDaysDecimal < 30) healthBenefitCue = 'Lung capacity & cardiovascular endurance in gym increased by up to 30%!';
    else if (exactDaysDecimal < 90) healthBenefitCue = 'Bronchial tubes relaxed, coughing and shortness of breath completely eliminated.';
    else healthBenefitCue = 'Risk of coronary heart disease cut in half. Peak athletic conditioning restored!';
  } else if (qCat === 'sugar') {
    if (exactDaysDecimal < 3) healthBenefitCue = 'Blood sugar spikes stabilized; cravings shifting from glucose to natural fat fuel.';
    else if (exactDaysDecimal < 14) healthBenefitCue = 'Brain fog vanished, constant sustained energy without afternoon crashes.';
    else healthBenefitCue = 'Deep abdominal visceral fat burning accelerated; high insulin sensitivity restored.';
  } else if (qCat === 'screens') {
    if (exactDaysDecimal < 7) healthBenefitCue = 'Attention span improving; baseline dopamine levels resetting to reward real effort.';
    else healthBenefitCue = 'Deep focus restored; sleep architecture and REM recovery improved by 40%.';
  } else if (qCat === 'caffeine') {
    if (exactDaysDecimal < 7) healthBenefitCue = 'Adrenal glands resting, natural cortisol rhythm taking over morning alertness.';
    else healthBenefitCue = 'Natural non-jittery energy all day and restorative deep delta sleep at night.';
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    totalHours,
    exactDaysDecimal,
    targetDays,
    progressPercentage,
    isTargetAchieved,
    moneySaved,
    projectedMonthlySavings,
    projectedYearlySavings,
    dailySavings: Math.round(dailySavings * 10) / 10,
    unitsAvoided,
    exactCigarettesAvoided,
    packsAvoided,
    lifeHoursRegained,
    currency: config.currency || 'EGP',
    unitLabel: config.avoidedUnitLabel || (qCat === 'smoking' ? 'Cigarettes' : 'Units'),
    currentStage: {
      level: stageLevel,
      name: stageName,
      stageTitle,
      description,
      color: stageColor,
      icon: stageIcon
    },
    milestones,
    nextMilestone,
    healthBenefitCue
  };
}

/**
 * Get all habit daily records for a user
 */
export function getHabitRecords(userId: string): Record<string, HabitDailyRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_DAILY_RECORDS}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load habit records:', e);
  }
  return {};
}

/**
 * Save all habit records for a user
 */
export function saveHabitRecords(userId: string, records: Record<string, HabitDailyRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY_DAILY_RECORDS}_${userId}`, JSON.stringify(records));
  } catch (e) {
    console.warn('Failed to save habit records:', e);
  }
}

/**
 * Get today's record for a specific habit
 */
export function getTodayRecordForHabit(userId: string, habit: UserHabit): HabitDailyRecord {
  const todayStr = new Date().toISOString().split('T')[0];
  const key = `${habit.id}_${todayStr}`;
  const records = getHabitRecords(userId);

  if (records[key]) return records[key];

  return {
    habitId: habit.id,
    date: todayStr,
    userId,
    value: 0,
    completed: false
  };
}

/**
 * Update today's record for a specific habit
 */
export function setHabitRecord(
  userId: string,
  habit: UserHabit,
  value: number,
  completed?: boolean
): HabitDailyRecord {
  const todayStr = new Date().toISOString().split('T')[0];
  const key = `${habit.id}_${todayStr}`;
  const records = getHabitRecords(userId);

  const isCompleted = typeof completed === 'boolean' 
    ? completed 
    : habit.type === 'boolean' 
    ? value > 0 
    : value >= habit.targetValue;

  const newRecord: HabitDailyRecord = {
    habitId: habit.id,
    date: todayStr,
    userId,
    value,
    completed: isCompleted
  };

  records[key] = newRecord;
  saveHabitRecords(userId, records);
  return newRecord;
}

/**
 * Calculate dynamic streak (consecutive days) for a single habit
 */
export function calculateHabitStreak(userId: string, habitId: string): number {
  const records = getHabitRecords(userId);
  let streak = 0;
  const now = new Date();

  // Check today first
  const todayStr = now.toISOString().split('T')[0];
  const todayRec = records[`${habitId}_${todayStr}`];
  if (todayRec && todayRec.completed) {
    streak++;
  }

  // Iterate backwards starting from yesterday
  for (let i = 1; i <= 365; i++) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const rec = records[`${habitId}_${dateStr}`];

    if (rec && rec.completed) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate overall today adherence across all user habits
 */
export function calculateOverallHabitsSummary(userId: string, habits: UserHabit[]) {
  if (!habits || habits.length === 0) {
    return {
      todayCompletedCount: 0,
      todayTotalCount: 0,
      adherencePercentage: 100,
      activeStreak: 0
    };
  }

  // Daily habits only (exclude ongoing quit trackers from daily checkbox counts)
  const dailyHabits = habits.filter(h => h.type !== 'quit');
  const quitHabits = habits.filter(h => h.type === 'quit');

  if (dailyHabits.length === 0 && quitHabits.length > 0) {
    // If user only has quit habits
    const totalQuitDays = quitHabits.reduce((acc, h) => {
      const stats = calculateQuitLiveStats(h);
      return acc + stats.days;
    }, 0);
    return {
      todayCompletedCount: quitHabits.length,
      todayTotalCount: quitHabits.length,
      adherencePercentage: 100,
      activeStreak: totalQuitDays
    };
  }

  let completedToday = 0;
  dailyHabits.forEach((h) => {
    const rec = getTodayRecordForHabit(userId, h);
    if (rec.completed) completedToday++;
  });

  const adherencePercentage = dailyHabits.length > 0 ? Math.round((completedToday / dailyHabits.length) * 100) : 100;

  // Overall streak: consecutive days where at least 60% of habits were completed
  const records = getHabitRecords(userId);
  let activeStreak = 0;
  const now = new Date();

  const todayStr = now.toISOString().split('T')[0];
  let todayDone = 0;
  dailyHabits.forEach((h) => {
    if (records[`${h.id}_${todayStr}`]?.completed) todayDone++;
  });
  if (dailyHabits.length > 0 && todayDone / dailyHabits.length >= 0.6) {
    activeStreak++;
  }

  for (let i = 1; i <= 365; i++) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    let dayDone = 0;
    dailyHabits.forEach((h) => {
      if (records[`${h.id}_${dateStr}`]?.completed) dayDone++;
    });

    if (dailyHabits.length > 0 && dayDone / dailyHabits.length >= 0.6) {
      activeStreak++;
    } else {
      break;
    }
  }

  return {
    todayCompletedCount: completedToday,
    todayTotalCount: dailyHabits.length,
    adherencePercentage,
    activeStreak
  };
}

/**
 * Check adherence of habits for a specific date (YYYY-MM-DD)
 */
export function getHabitsAdherenceForDate(
  userId: string,
  habits: UserHabit[],
  dateStr: string
) {
  if (!habits || habits.length === 0) {
    return { completedCount: 0, totalCount: 0, isAllCompleted: true, hasPartial: false };
  }
  const dailyHabits = habits.filter((h) => h.type !== 'quit');
  if (dailyHabits.length === 0) {
    return { completedCount: 0, totalCount: 0, isAllCompleted: true, hasPartial: false };
  }

  const records = getHabitRecords(userId);
  let completed = 0;
  dailyHabits.forEach((h) => {
    if (records[`${h.id}_${dateStr}`]?.completed) {
      completed++;
    }
  });

  const isAllCompleted = completed >= dailyHabits.length;
  const hasPartial = completed > 0 && completed < dailyHabits.length;

  return {
    completedCount: completed,
    totalCount: dailyHabits.length,
    isAllCompleted,
    hasPartial
  };
}
