export interface UserHabit {
  id: string;
  userId: string;
  title: string;
  category: 'Supplement' | 'Nutrition' | 'Recovery' | 'Lifestyle' | 'Mindset' | 'Fitness';
  type: 'boolean' | 'numeric';
  targetValue: number; // e.g. 1 for boolean, 3 for 3 Liters, 8 for 8 hours, 160 for 160g, etc.
  unit: string; // e.g. 'done', 'L', 'hrs', 'g', 'steps', 'pages', 'mins'
  iconKey: string;
  color: string;
  createdAt: string;
}

export interface HabitDailyRecord {
  habitId: string;
  date: string; // YYYY-MM-DD
  userId: string;
  value: number; // e.g. 1 for checked boolean, or 2.5 for 2.5L
  completed: boolean;
}

export const HABIT_ICON_OPTIONS = [
  { key: 'zap', label: '⚡ Energy / Creatine' },
  { key: 'droplets', label: '💧 Water / Hydration' },
  { key: 'moon', label: '🌙 Sleep / Rest' },
  { key: 'pill', label: '💊 Vitamins / Supplements' },
  { key: 'cigarette-off', label: '🚭 Smoke-Free' },
  { key: 'flame', label: '🔥 Calories / Burn' },
  { key: 'utensils', label: '🍽️ Nutrition / Diet' },
  { key: 'dumbbell', label: '🏋️ Workout / Lifting' },
  { key: 'footprints', label: '🦶 Steps / Walking' },
  { key: 'book', label: '📖 Reading / Learning' },
  { key: 'heart', label: '🧘 Meditation / Mindfulness' },
  { key: 'apple', label: '🍎 Clean Eating' },
  { key: 'coffee', label: '☕ Coffee / Fasting' },
  { key: 'snowflake', label: '🧊 Cold Plunge / Shower' },
  { key: 'bike', label: '🚴 Cardio / Cycling' },
  { key: 'timer', label: '⏱️ Intermittent Fasting' },
  { key: 'target', label: '🎯 Daily Focus' },
  { key: 'sun', label: '☀️ Morning Sunlight' },
  { key: 'brain', label: '🧠 Study / Journaling' },
  { key: 'sparkles', label: '✨ Self-Care / Skincare' },
  { key: 'shield', label: '🛡️ Discipline' },
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

export const DEFAULT_STARTER_HABITS: Omit<UserHabit, 'id' | 'userId' | 'createdAt'>[] = [
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
    title: 'Water Hydration',
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

const STORAGE_KEY_CUSTOM_HABITS = 'pro_gym_user_habits_v8';
const STORAGE_KEY_DAILY_RECORDS = 'pro_gym_habit_records_v8';

/**
 * Get all habits created for a specific user
 */
export function getUserHabits(userId: string): UserHabit[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_CUSTOM_HABITS}_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
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

  const updated = [...currentHabits, newHabit];
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
  if (habits.length === 0) {
    return {
      todayCompletedCount: 0,
      todayTotalCount: 0,
      adherencePercentage: 100,
      activeStreak: 0
    };
  }

  let completedToday = 0;
  habits.forEach((h) => {
    const rec = getTodayRecordForHabit(userId, h);
    if (rec.completed) completedToday++;
  });

  const adherencePercentage = Math.round((completedToday / habits.length) * 100);

  // Overall streak: consecutive days where at least 75% of habits were completed
  const records = getHabitRecords(userId);
  let activeStreak = 0;
  const now = new Date();

  const todayStr = now.toISOString().split('T')[0];
  let todayDone = 0;
  habits.forEach((h) => {
    if (records[`${h.id}_${todayStr}`]?.completed) todayDone++;
  });
  if (habits.length > 0 && todayDone / habits.length >= 0.6) {
    activeStreak++;
  }

  for (let i = 1; i <= 365; i++) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    let dayDone = 0;
    habits.forEach((h) => {
      if (records[`${h.id}_${dateStr}`]?.completed) dayDone++;
    });

    if (habits.length > 0 && dayDone / habits.length >= 0.6) {
      activeStreak++;
    } else {
      break;
    }
  }

  return {
    todayCompletedCount: completedToday,
    todayTotalCount: habits.length,
    adherencePercentage,
    activeStreak
  };
}
