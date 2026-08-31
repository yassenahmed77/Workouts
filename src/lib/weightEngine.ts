export interface BodyWeightLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  notes?: string;
}

const STORAGE_KEY_WEIGHT = 'pro_gym_weight_history_v6';

// Seed realistic initial weekly weight logs for demo user
const DEFAULT_WEIGHT_LOGS: Record<string, BodyWeightLog[]> = {
  'user-rawan-1': [
    { id: 'w-1', userId: 'user-rawan-1', date: '2026-05-18', weightKg: 70.0, notes: 'Day 1 starting check-in' },
    { id: 'w-2', userId: 'user-rawan-1', date: '2026-05-25', weightKg: 69.4, notes: 'Week 1 check-in' },
    { id: 'w-3', userId: 'user-rawan-1', date: '2026-06-01', weightKg: 68.8, notes: 'Week 2 check-in' },
    { id: 'w-4', userId: 'user-rawan-1', date: '2026-06-08', weightKg: 68.0, notes: 'Week 3 check-in' }
  ]
};

/**
 * Get all body weight check-ins for a user
 */
export function getSavedWeightLogs(userId: string): BodyWeightLog[] {
  if (typeof window === 'undefined') return DEFAULT_WEIGHT_LOGS[userId] || [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_WEIGHT}_${userId}`);
    if (raw) return JSON.parse(raw);
    // Seed default if empty
    if (DEFAULT_WEIGHT_LOGS[userId]) {
      localStorage.setItem(`${STORAGE_KEY_WEIGHT}_${userId}`, JSON.stringify(DEFAULT_WEIGHT_LOGS[userId]));
      return DEFAULT_WEIGHT_LOGS[userId];
    }
  } catch (e) {
    console.warn('Weight logs fetch error:', e);
  }
  return [];
}

/**
 * Save new body weight check-in
 */
export function saveWeightLog(
  userId: string,
  weightKg: number,
  dateStr?: string,
  notes?: string
): BodyWeightLog[] {
  const currentLogs = getSavedWeightLogs(userId);
  const targetDate = dateStr || new Date().toISOString().split('T')[0];

  // Remove existing log on same date if present, or update
  const filtered = currentLogs.filter((l) => l.date !== targetDate);
  const newEntry: BodyWeightLog = {
    id: `w-${Date.now()}`,
    userId,
    date: targetDate,
    weightKg: Math.round(weightKg * 10) / 10,
    notes: notes || 'Weekly weigh-in'
  };

  const updated = [...filtered, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_KEY_WEIGHT}_${userId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Weight logs save error:', e);
    }
  }

  return updated;
}

/**
 * Delete a weight entry
 */
export function deleteWeightLog(userId: string, logId: string): BodyWeightLog[] {
  const currentLogs = getSavedWeightLogs(userId);
  const updated = currentLogs.filter((l) => l.id !== logId);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_KEY_WEIGHT}_${userId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Weight logs delete error:', e);
    }
  }

  return updated;
}

/**
 * 100% Dynamic Weight Progress & Delta Analysis
 */
export function calculateDynamicWeightChange(
  logs: BodyWeightLog[],
  fallbackWeightKg: number = 70
): {
  currentWeightKg: number;
  startingWeightKg: number;
  totalNetDeltaKg: number;
  recentWeeklyDeltaKg: number;
  statusText: string;
  hasIncreased: boolean;
  hasDecreased: boolean;
  isSteady: boolean;
  historyChronological: (BodyWeightLog & { deltaVsPrevKg: number })[];
} {
  if (!logs || logs.length === 0) {
    return {
      currentWeightKg: fallbackWeightKg,
      startingWeightKg: fallbackWeightKg,
      totalNetDeltaKg: 0,
      recentWeeklyDeltaKg: 0,
      statusText: 'No Check-ins Yet',
      hasIncreased: false,
      hasDecreased: false,
      isSteady: true,
      historyChronological: []
    };
  }

  const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const starting = sorted[0].weightKg;
  const latest = sorted[sorted.length - 1].weightKg;
  const prev = sorted.length > 1 ? sorted[sorted.length - 2].weightKg : starting;

  const totalDelta = Math.round((latest - starting) * 10) / 10;
  const weeklyDelta = Math.round((latest - prev) * 10) / 10;

  const hasIncreased = weeklyDelta > 0;
  const hasDecreased = weeklyDelta < 0;
  const isSteady = weeklyDelta === 0;

  let statusText = 'Steady ⚖️';
  if (weeklyDelta < 0) statusText = `${weeklyDelta} kg 📉`;
  else if (weeklyDelta > 0) statusText = `+${weeklyDelta} kg 📈`;

  const historyWithDeltas = sorted.map((entry, idx) => {
    const prevWeight = idx > 0 ? sorted[idx - 1].weightKg : entry.weightKg;
    const delta = Math.round((entry.weightKg - prevWeight) * 10) / 10;
    return {
      ...entry,
      deltaVsPrevKg: delta
    };
  });

  return {
    currentWeightKg: latest,
    startingWeightKg: starting,
    totalNetDeltaKg: totalDelta,
    recentWeeklyDeltaKg: weeklyDelta,
    statusText,
    hasIncreased,
    hasDecreased,
    isSteady,
    historyChronological: historyWithDeltas
  };
}
