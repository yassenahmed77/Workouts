/**
 * @file weightEngine.js
 * @description محرك تتبع وتحليل تطور وزن الجسم (Dynamic Weight Progress & Analytics Engine)
 * يدير سجلات الوزن الأسبوعية، يحفظها محلياً، ويحسب الفارق الأسبوعي والإجمالي ومعدل النزول أو الزيادة.
 */

const STORAGE_KEY_WEIGHT = 'pro_gym_weight_history_v8';

// بيانات تجريبية مبدئية للمتدرب الافتراضي
const DEFAULT_WEIGHT_LOGS = {
  'user-rawan-1': [
    { id: 'w-0', userId: 'user-rawan-1', date: '2026-05-10', weightKg: 71.3, notes: 'Starting Baseline Weigh-in' },
    { id: 'w-1', userId: 'user-rawan-1', date: '2026-05-24', weightKg: 70.1, notes: 'Check-in 1' },
    { id: 'w-2', userId: 'user-rawan-1', date: '2026-06-07', weightKg: 69.4, notes: 'Check-in 2' },
    { id: 'w-3', userId: 'user-rawan-1', date: '2026-06-21', weightKg: 68.8, notes: 'Check-in 3' },
    { id: 'w-4', userId: 'user-rawan-1', date: '2026-07-05', weightKg: 68.2, notes: 'Check-in 4' },
    { id: 'w-5', userId: 'user-rawan-1', date: '2026-08-15', weightKg: 69.5, notes: 'Check-in 5' },
    { id: 'w-6', userId: 'user-rawan-1', date: '2026-08-29', weightKg: 67.8, notes: 'Check-in 6' }
  ]
};

/**
 * جلب جميع سجلات وزن الجسم للمتدرب
 * @param {string} userId - معرّف المتدرب
 * @returns {Array<Object>} قائمة بسجلات الوزن
 */
export function getSavedWeightLogs(userId) {
  if (typeof window === 'undefined') return DEFAULT_WEIGHT_LOGS[userId] || [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_WEIGHT}_${userId}`);
    if (raw) return JSON.parse(raw);
    // زرع البيانات المبدئية إذا كان السجل فارغاً
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
 * حفظ وزن جديد للمتدرب
 * @param {string} userId - معرّف المتدرب
 * @param {number} weightKg - الوزن بالكيلوجرام
 * @param {string} [dateStr] - تاريخ التسجيل بصيغة YYYY-MM-DD
 * @param {string} [notes] - ملاحظات الكوتش أو المتدرب
 * @returns {Array<Object>} قائمة السجلات بعد الإضافة والترتيب
 */
export function saveWeightLog(userId, weightKg, dateStr, notes) {
  const currentLogs = getSavedWeightLogs(userId);
  const targetDate = dateStr || new Date().toISOString().split('T')[0];

  // إزالة السجل القديم إذا كان بنفس التاريخ لمنع التكرار
  const filtered = currentLogs.filter((l) => l.date !== targetDate);
  const newEntry = {
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
 * حذف سجل وزن محدد
 * @param {string} userId - معرّف المتدرب
 * @param {string} logId - معرّف سجل الوزن
 * @returns {Array<Object>} السجلات المتبقية بعد الحذف
 */
export function deleteWeightLog(userId, logId) {
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
 * التحليل الديناميكي الشامل لتغيرات الوزن
 * يحسب الوزن الحالي، وزن البداية، الفارق الأسبوعي، ومصفوفة الفروق بين كل قراءة والسابقة لها.
 * @param {Array<Object>} logs - سجلات الوزن
 * @param {number} [fallbackWeightKg=70] - الوزن الافتراضي البديل في حال عدم وجود سجلات
 * @returns {Object} كائن التحليل الشامل
 */
export function calculateDynamicWeightChange(logs, fallbackWeightKg = 70) {
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

  let statusText = 'Steady';
  if (weeklyDelta < 0) statusText = `${weeklyDelta} kg`;
  else if (weeklyDelta > 0) statusText = `+${weeklyDelta} kg`;

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
