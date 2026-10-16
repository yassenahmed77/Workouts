/**
 * @file checkInService.js
 * @description Check-In Protocol & Telemetry Domain Service (Clean Architecture - Layer 3).
 *
 * Provides pure business calculations for:
 * - Recurring weekly check-in schedules (e.g. Every Friday)
 * - On-demand coach requests (immediate / custom date)
 * - Trainee self-initiated submissions detection
 * - Visual status evaluation (Overdue, Due Today, Needs Review, Up to Date)
 * - Weight delta, physique photos count, and girth measurements audit
 * - Zero divide-by-zero, NaN, or timezone drift loopholes.
 */

const DAY_NAME_TO_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

const DAY_INDEX_TO_NAME = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

function getLocalDateString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const checkInService = {
  /**
   * Calculates the next due date based on client's preferred weekly check-in day.
   *
   * @param {string} [preferredDay='friday'] - Day of the week
   * @param {Date} [referenceDate=new Date()] - Reference date for calculation
   * @returns {{ nextDueDateStr: string, daysUntilDue: number, dayName: string }}
   */
  calculateNextDueDate(preferredDay = 'friday', referenceDate = new Date()) {
    const targetDayIndex = DAY_NAME_TO_INDEX[preferredDay.toLowerCase()] ?? 5; // Default Friday
    const currentDayIndex = referenceDate.getDay();

    let diff = targetDayIndex - currentDayIndex;
    if (diff < 0) {
      diff += 7;
    }

    const nextDate = new Date(referenceDate);
    nextDate.setDate(nextDate.getDate() + diff);

    return {
      nextDueDateStr: getLocalDateString(nextDate),
      daysUntilDue: diff,
      dayName: DAY_INDEX_TO_NAME[targetDayIndex]
    };
  },

  /**
   * Coach Magic Eye: Calculates Trainee Check-In Telemetry & Protocol Status.
   *
   * Detects:
   * 1. Trainee Self-Initiated or Unreviewed Submission (needsCoachReview = true)
   * 2. Pending Coach On-Demand Request
   * 3. Overdue Check-in vs Weekly Schedule
   * 4. Due Today vs Upcoming
   * 5. Weight Delta, Photos, and Girth Measurements status
   *
   * @param {Object} client - Trainee user profile
   * @param {Array} userCheckIns - List of check-ins for this user
   * @param {Object} [options] - Optional config (referenceDate, preferredDay)
   * @returns {Object} Rich telemetry payload for Overview card and modals
   */
  calculateCheckInTelemetry(client, userCheckIns = [], options = {}) {
    const refDate = options.referenceDate ? new Date(options.referenceDate) : new Date();
    const todayStr = getLocalDateString(refDate);

    const safeCheckIns = Array.isArray(userCheckIns)
      ? [...userCheckIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      : [];

    const latestCheckIn = safeCheckIns[0] || null;
    const previousCheckIn = safeCheckIns[1] || null;
    const hasHistory = Boolean(latestCheckIn);

    // 1. Unreviewed Submissions (Coach alert: Athlete logged something on their own or via prompt)
    const unreviewedCheckIns = safeCheckIns.filter((c) => c.reviewed === false);
    const unreviewedCount = unreviewedCheckIns.length;
    const hasNewSubmission = unreviewedCount > 0;

    // 2. Pending Coach Request (On-Demand / One-off check-in)
    const pendingRequest = client?.pendingCheckInRequest && client.pendingCheckInRequest.status === 'pending'
      ? client.pendingCheckInRequest
      : null;

    // 3. Weekly Schedule Math
    const preferredDay = client?.checkInPreferredDay || options.preferredDay || 'friday';
    const scheduleInfo = this.calculateNextDueDate(preferredDay, refDate);

    // 4. Weight Delta Calculation (vs previous check-in and vs program start)
    const currentWeight = latestCheckIn?.weightKg ?? client?.weightKg ?? 0;
    const previousWeight = previousCheckIn?.weightKg ?? null;
    const weightDelta = previousWeight !== null ? Number((currentWeight - previousWeight).toFixed(1)) : 0;
    const startWeight = client?.startWeight ?? client?.initialWeight ?? currentWeight;
    const totalWeightDelta = Number((currentWeight - startWeight).toFixed(1));

    // 5. Measurements & Photos count
    const photosCount = latestCheckIn?.photos?.length || 0;
    const measurements = latestCheckIn?.measurements || null;
    const hasMeasurements = Boolean(measurements && Object.keys(measurements).length > 0);

    // 6. Days since last submission
    let daysSinceLast = null;
    if (latestCheckIn?.date) {
      const lastDate = new Date(latestCheckIn.date);
      const diffMs = refDate.getTime() - lastDate.getTime();
      daysSinceLast = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    // 7. Status Resolution
    let status = 'up_to_date';
    let statusLabel = 'UP TO DATE ✓';
    let pillClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
    let headline = `${scheduleInfo.dayName} Due`;
    let subline = latestCheckIn ? `Last: ${latestCheckIn.weightKg} kg (${latestCheckIn.date})` : 'First audit pending';

    // Priority 1: Trainee submitted something new and coach hasn't reviewed yet
    if (hasNewSubmission) {
      status = 'needs_review';
      statusLabel = unreviewedCount > 1 ? `${unreviewedCount} NEW LOGS` : 'NEW SUBMISSION';
      pillClass = 'bg-[var(--main-color-muted)] text-[var(--main-color)] border border-[var(--main-color-border)]';
      headline = latestCheckIn?.date ? `Logged: ${latestCheckIn.date}` : 'New Log Added';
      subline = 'Trainee submitted audit • Needs coach review';
    }
    // Priority 2: Coach requested a check-in and it's still waiting
    else if (pendingRequest) {
      status = 'pending_request';
      statusLabel = 'REQUEST PENDING';
      pillClass = 'bg-[var(--main-color-muted)] text-[var(--main-color)] border border-[var(--main-color-border)]';
      headline = pendingRequest.dueDate === 'immediate' ? 'Immediate Audit' : `Due ${pendingRequest.dueDate}`;
      subline = pendingRequest.notes || 'Coach requested progress audit';
    }
    // Priority 3: Overdue (Past preferred day or > 8 days since last check-in)
    else if (daysSinceLast !== null && daysSinceLast > 7) {
      status = 'overdue';
      const overdueDays = daysSinceLast - 7;
      statusLabel = `OVERDUE (${overdueDays}D)`;
      pillClass = 'bg-rose-500/10 text-rose-400 border-rose-500/25';
      headline = 'Check-In Overdue';
      subline = `Last audit was ${daysSinceLast} days ago`;
    }
    // Priority 4: Due Today
    else if (scheduleInfo.daysUntilDue === 0) {
      status = 'due_today';
      statusLabel = 'DUE TODAY';
      pillClass = 'bg-[var(--main-color-muted)] text-[var(--main-color)] border border-[var(--main-color-border)]';
      headline = `${scheduleInfo.dayName} Check-In`;
      subline = 'Submission expected today';
    }
    // Priority 5: Upcoming in X days
    else {
      status = 'upcoming';
      statusLabel = `DUE IN ${scheduleInfo.daysUntilDue}D`;
      pillClass = 'bg-white/[0.06] text-slate-300 border-white/10';
      headline = `${scheduleInfo.dayName} Check-In`;
      subline = latestCheckIn
        ? `Last: ${latestCheckIn.weightKg} kg (${latestCheckIn.date})`
        : `Due in ${scheduleInfo.daysUntilDue} days`;
    }

    // 8. Scope Pillars (Scale, Photos, InBody)
    const scalePillar = {
      label: 'SCALE',
      value: latestCheckIn ? `${latestCheckIn.weightKg} kg` : (client?.weightKg ? `${client.weightKg} kg` : '—'),
      detail: weightDelta !== 0 ? (weightDelta > 0 ? `+${weightDelta} kg` : `${weightDelta} kg`) : 'Baseline',
      isCompleted: Boolean(latestCheckIn?.weightKg)
    };

    const photosPillar = {
      label: 'PHOTOS',
      value: photosCount > 0 ? `${photosCount} Angles` : '0 Photos',
      detail: photosCount > 0 ? 'Visual' : 'Pending',
      isCompleted: photosCount > 0
    };

    const inBodyData = latestCheckIn?.inBody || null;
    const bodyFatPct = inBodyData?.bodyFatPct ?? latestCheckIn?.measurements?.bodyFatPercentage ?? client?.bodyFatPercentage;
    const inBodyPillar = {
      label: 'INBODY',
      value: bodyFatPct ? `${bodyFatPct}%` : (inBodyData?.muscleMassKg ? `${inBodyData.muscleMassKg}kg` : 'Pending'),
      detail: inBodyData ? (bodyFatPct ? 'Body Fat' : 'Muscle') : 'Scan',
      isCompleted: Boolean(inBodyData || bodyFatPct)
    };

    return {
      hasHistory,
      latestCheckIn,
      previousCheckIn,
      unreviewedCount,
      hasNewSubmission,
      pendingRequest,
      preferredDay: scheduleInfo.dayName,
      daysUntilDue: scheduleInfo.daysUntilDue,
      nextDueDateStr: scheduleInfo.nextDueDateStr,
      daysSinceLast,
      currentWeight,
      weightDelta,
      totalWeightDelta,
      photosCount,
      hasMeasurements,
      measurements,
      inBody: inBodyData,
      status,
      statusLabel,
      pillClass,
      headline,
      subline,
      pillars: {
        scale: scalePillar,
        photos: photosPillar,
        inBody: inBodyPillar,
        tape: inBodyPillar
      }
    };
  }
};
