/**
 * @file activeWorkoutEngine.js
 * @description محرك استعادة وحفظ مسودة التمرين المباشر التلقائي (Auto-Recovery & Crash Protection)
 * يحمي المتدرب من فقدان بيانات التمرين في حال إغلاق المتصفح أو انقطاع الاتصال:
 * 1. يحفظ كل مجموعة (Set) وتكرار ووزن والوقت المنقضي فوراً في LocalStorage.
 * 2. يستعيد التمرين تلقائياً عند إعادة فتح الصفحة.
 * 3. يكتشف التمارين المهجورة بعد انتهاء الوقت المحدد + 15 دقيقة خمول ويسجلها كتمرين غير مكتمل.
 */

/**
 * فحص ما إذا كانت مسودة التمرين الحالية قد تجاوزت مهلة الخمول (Inactivity Timeout)
 * القاعدة: وقت التمرين المقدر من الكوتش + 15 دقيقة سماح.
 * إذا كان المتدرب يسجل مجموعات مؤخراً يظل التمرين نشطاً.
 * @param {Object} draft - مسودة التمرين النشطة
 * @param {number} [estimatedMinutesParam] - الوقت المقدر للتمرين بالدقائق
 * @returns {boolean} true إذا انتهت مهلة التمرين
 */
export function isDraftTimedOut(draft, estimatedMinutesParam) {
  if (!draft) return false;
  const estimatedMin = estimatedMinutesParam || draft.estimatedMinutes || 60;
  const timeoutThresholdSeconds = (estimatedMin + 15) * 60;

  // إذا لم يتجاوز الوقت الفعلي للتمرين حد الـ 15 دقيقة الإضافية
  if (draft.elapsedSeconds < timeoutThresholdSeconds) {
    return false;
  }

  // إذا تجاوز الوقت، نفحص آخر نشاط للمستخدم
  const lastActiveTimestamp = draft.lastActivityAt || draft.lastUpdated || draft.startedAt;
  const lastActiveTime = new Date(lastActiveTimestamp).getTime();
  const now = Date.now();
  const inactivityMillis = now - lastActiveTime;
  const maxInactivityMillis = 15 * 60 * 1000; // 15 دقيقة خمول تام

  return inactivityMillis > maxInactivityMillis;
}

/**
 * تسجيل التمرين كتمرين غير مكتمل بسبب انتهاء المهلة أو الخمول
 * @param {Object} record - سجل التمرين غير المكتمل
 * @param {string} record.userId - معرّف المتدرب
 * @param {string} record.dayId - معرّف اليوم
 * @param {string} record.dayName - اسم يوم التمرين
 * @param {string} record.date - تاريخ اليوم
 * @param {string} record.reason - سبب عدم الاكتمال
 * @param {string} record.timedOutAt - توقيت انتهاء المهلة
 */
export function markWorkoutAsUnfinished(record) {
  if (typeof window === 'undefined') return;
  try {
    const key = `pro_gym_unfinished_${record.userId}`;
    const raw = localStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : [];
    const updated = existing.filter((r) => !(r.dayId === record.dayId && r.date === record.date));
    updated.push(record);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving unfinished workout record:', e);
  }
}

/**
 * التحقق مما إذا كان يوم التمرين قد سُجل كغير مكتمل اليوم
 * @param {string} userId - معرّف المتدرب
 * @param {string} dayId - معرّف اليوم
 * @returns {boolean}
 */
export function isDayUnfinished(userId, dayId) {
  if (typeof window === 'undefined') return false;
  try {
    const key = `pro_gym_unfinished_${userId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const existing = JSON.parse(raw);
    const todayStr = new Date().toISOString().split('T')[0];
    return existing.some((r) => r.dayId === dayId && r.date === todayStr);
  } catch (e) {
    return false;
  }
}

/**
 * مسح حالة "غير مكتمل" عند استئناف التمرين أو إكماله بنجاح
 * @param {string} userId - معرّف المتدرب
 * @param {string} dayId - معرّف اليوم
 */
export function clearUnfinishedStatus(userId, dayId) {
  if (typeof window === 'undefined') return;
  try {
    const key = `pro_gym_unfinished_${userId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const existing = JSON.parse(raw);
    const updated = existing.filter((r) => r.dayId !== dayId);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error clearing unfinished status:', e);
  }
}

/**
 * جلب مسودة التمرين النشط المحفوظة للمتدرب ويوم التمرين
 * يفحص تلقائياً مهلة الخمول، وإذا انتهت يحفظه كغير مكتمل ويمسح المسودة
 * @param {string} userId - معرّف المتدرب
 * @param {string} dayId - معرّف اليوم
 * @returns {Object|null} كائن المسودة أو null
 */
export function getActiveWorkoutDraft(userId, dayId) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`pro_gym_active_draft_${userId}_${dayId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.exerciseLogs)) return null;

    // فحص انتهاء المهلة
    if (isDraftTimedOut(parsed)) {
      const todayStr = new Date().toISOString().split('T')[0];
      markWorkoutAsUnfinished({
        userId,
        dayId,
        dayName: parsed.dayName,
        date: todayStr,
        reason: 'timeout_inactivity',
        timedOutAt: new Date().toISOString()
      });
      clearActiveWorkoutDraft(userId, dayId);
      return null;
    }

    return parsed;
  } catch (e) {
    console.warn('Error reading active workout draft:', e);
    return null;
  }
}

/**
 * جلب آخر مسودة نشطة للمتدرب عبر أي يوم
 * @param {string} userId - معرّف المتدرب
 * @returns {Object|null}
 */
export function getUserActiveDraft(userId) {
  if (typeof window === 'undefined') return null;
  try {
    const latestDayId = localStorage.getItem(`pro_gym_latest_active_day_${userId}`);
    if (!latestDayId) return null;
    return getActiveWorkoutDraft(userId, latestDayId);
  } catch (e) {
    return null;
  }
}

/**
 * حفظ تقدم التمرين المباشر فوراً في LocalStorage
 * @param {Object} draft - بيانات المسودة الحالية
 */
export function saveActiveWorkoutDraft(draft) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      `pro_gym_active_draft_${draft.userId}_${draft.dayId}`,
      JSON.stringify({
        ...draft,
        lastUpdated: new Date().toISOString()
      })
    );
    localStorage.setItem(`pro_gym_latest_active_day_${draft.userId}`, draft.dayId);
  } catch (e) {
    console.warn('Error saving active workout draft:', e);
  }
}

/**
 * مسح المسودة المؤقتة بعد إنهاء التمرين أو إلغائه يدوياً
 * @param {string} userId - معرّف المتدرب
 * @param {string} dayId - معرّف اليوم
 */
export function clearActiveWorkoutDraft(userId, dayId) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`pro_gym_active_draft_${userId}_${dayId}`);
    const latest = localStorage.getItem(`pro_gym_latest_active_day_${userId}`);
    if (latest === dayId) {
      localStorage.removeItem(`pro_gym_latest_active_day_${userId}`);
    }
  } catch (e) {
    console.warn('Error clearing active workout draft:', e);
  }
}

/**
 * فحص ما إذا كان هناك تمرين قيد التشغيل بالفعل ويحتوي على مجموعات مسجلة
 * @param {string} userId - معرّف المتدرب
 * @param {string} dayId - معرّف اليوم
 * @returns {boolean}
 */
export function hasActiveWorkoutDraft(userId, dayId) {
  const draft = getActiveWorkoutDraft(userId, dayId);
  if (!draft) return false;
  const hasCompletedSets = draft.exerciseLogs.some((ex) =>
    ex.sets.some((s) => s.completed || (s.weightKg > 0 && s.reps > 0))
  );
  return hasCompletedSets || draft.elapsedSeconds > 10;
}
