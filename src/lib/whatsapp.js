/**
 * @file whatsapp.js
 * @description موديول إنشاء روابط ورسائل الواتساب المباشرة (WhatsApp Deep-Links)
 * يولد رسائل جاهزة ومصممة للكوتش لإرسالها للمتدربين بضغطة زر واحدة (تذكير بالاشتراك، مراجعة تكنيك، تذكير بالمتابعة).
 */

import { sanitizeText } from './sanitizer';

/**
 * تنظيف وتحويل رقم الهاتف للصيغة القياسية الدولية للواتساب (مفتاح الدولة + الرقم بدون + أو مسافات)
 * يدعم تلقائياً الأرقام المصرية (010, 011, 012, 015) ويضيف مفتاح مصر (2).
 * @param {string} [phone] - رقم الهاتف المدخل
 * @returns {string} الرقم المنسق للواتساب
 */
export function formatWhatsAppPhone(phone) {
  if (!phone) return '';
  // استخراج الأرقام فقط وحذف أي مسافات أو رموز
  const digits = phone.replace(/[^0-9]/g, '');

  if (!digits) return '';

  // إذا كان الرقم يبدأ بـ 00 (بادئة دولية)
  if (digits.startsWith('00')) {
    return digits.substring(2);
  }

  // إذا كان رقماً مصرياً مكوناً من 11 رقماً (010, 011, 012, 015)
  if (digits.startsWith('0') && digits.length === 11) {
    return `2${digits}`; // تحويل 010... إلى 2010...
  }

  // إذا كان رقماً مصرياً من 10 أرقام بدون الصفر
  if (digits.length === 10 && (digits.startsWith('10') || digits.startsWith('11') || digits.startsWith('12') || digits.startsWith('15'))) {
    return `20${digits}`;
  }

  return digits;
}

/**
 * توليد رابط محادثة واتساب لمراجعة فيديو تكنيك (Form Check Review)
 * @param {Object} options - خيارات الرسالة
 * @param {string} [options.phone] - رقم هاتف المتدرب
 * @param {string} options.clientName - اسم المتدرب
 * @param {string} options.exerciseName - اسم التمرين
 * @param {string} options.recordedAt - تاريخ تسجيل الفيديو
 * @param {string} [options.setDetails] - تفاصيل المجموعة والوزن
 * @param {string} [options.coachFeedback] - ملاحظات الكوتش الفنية
 * @returns {string} رابط الواتساب الجاهز
 */
export function buildWhatsAppFormCheckUrl({
  phone,
  clientName,
  exerciseName,
  recordedAt,
  setDetails,
  coachFeedback
}) {
  const cleanPhone = formatWhatsAppPhone(phone);
  const cleanClient = sanitizeText(clientName);
  const cleanExercise = sanitizeText(exerciseName);
  const setInfoPart = setDetails ? ` (${sanitizeText(setDetails)})` : '';
  
  let message = `👋 مرحباً ${cleanClient}، شوفت فيديو تمرينك [${cleanExercise}${setInfoPart}] المسجل بتاريخ ${recordedAt}.\n\n`;

  if (coachFeedback && coachFeedback.trim().length > 0) {
    message += `📋 ملاحظاتي على الأداء والتكنيك:\n${coachFeedback.trim()}\n\n`;
    message += `استمر في التركيز على النقاط دي بالمجموعة الجاية! 💪`;
  } else {
    message += `بخصوص الأداء والتكنيك:\n`;
  }

  if (!cleanPhone) {
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * توليد رابط واتساب لتنبيه المتدرب بقرب انتهاء باقة الاشتراك وتجديدها
 * @param {Object} options - خيارات التنبيه
 * @param {string} [options.phone] - رقم هاتف المتدرب
 * @param {string} options.clientName - اسم المتدرب
 * @param {string} options.planName - اسم الباقة أو الخطة
 * @param {string} options.endDate - تاريخ الانتهاء
 * @param {number} options.daysLeft - الأيام المتبقية
 * @param {string} [options.coachName='Coach'] - اسم الكوتش
 * @param {string} [options.brandName='Workouts Pro'] - اسم البراند أو الجيم
 * @param {string} [options.customTemplate] - قالب رسالة مخصص (اختياري)
 * @returns {string} رابط الواتساب
 */
export function buildWhatsAppRenewalAlertUrl({
  phone,
  clientName,
  planName,
  endDate,
  daysLeft,
  coachName = 'Coach',
  brandName = 'Workouts Pro',
  customTemplate
}) {
  const cleanPhone = formatWhatsAppPhone(phone);
  const cleanClient = sanitizeText(clientName);
  const cleanPlan = sanitizeText(planName);

  let message;
  if (customTemplate && customTemplate.trim().length > 0) {
    message = customTemplate
      .replace(/{clientName}/g, cleanClient)
      .replace(/{coachName}/g, coachName)
      .replace(/{brandName}/g, brandName)
      .replace(/{planName}/g, cleanPlan)
      .replace(/{endDate}/g, endDate)
      .replace(/{daysLeft}/g, String(daysLeft));
  } else {
    message = `Hi ${cleanClient}, this is ${coachName} from ${brandName}. Your ${cleanPlan} membership is ending on ${endDate} (${daysLeft} days remaining). Would you like to renew for the upcoming cycle to keep your progression on track? Let me know! 💪`;
  }

  if (!cleanPhone) {
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * توليد رابط واتساب لتذكير المتدرب بإرسال التقرير الأسبوعي (Weekly Check-In)
 * @param {Object} options - خيارات التذكير
 * @param {string} [options.phone] - رقم الهاتف
 * @param {string} options.clientName - اسم المتدرب
 * @param {string} [options.lastCheckInDate] - تاريخ آخر تقرير
 * @param {string} [options.coachName='Coach'] - اسم الكوتش
 * @returns {string} رابط الواتساب
 */
export function buildWhatsAppCheckInReminderUrl({
  phone,
  clientName,
  lastCheckInDate,
  coachName = 'Coach'
}) {
  const cleanPhone = formatWhatsAppPhone(phone);
  const cleanClient = sanitizeText(clientName);

  let message = `Hi ${cleanClient}! 👋 Friendly reminder from ${coachName} that your weekly check-in is due today.`;
  if (lastCheckInDate) {
    message += ` Last update was on ${lastCheckInDate}.`;
  }
  message += ` Please log your morning weight, biofeedback, and progress photos so we can fine-tune your plan for the week! 🚀`;

  if (!cleanPhone) {
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * توليد رابط واتساب لتعديلات بروتوكول بطولة كمال الأجسام (Contest Prep Protocol)
 * @param {Object} options - خيارات الرسالة
 * @param {string} [options.phone] - رقم الهاتف
 * @param {string} options.clientName - اسم المتسابق
 * @param {string} options.targetShow - اسم البطولة
 * @param {number} options.daysOut - الأيام المتبقية على المسرح
 * @param {string} options.prepPhase - مرحلة التجهيز الحالية
 * @param {string} [options.coachNotes] - ملاحظات وتعديلات الكوتش
 * @returns {string} رابط الواتساب
 */
export function buildWhatsAppCompetitorUpdateUrl({
  phone,
  clientName,
  targetShow,
  daysOut,
  prepPhase,
  coachNotes
}) {
  const cleanPhone = formatWhatsAppPhone(phone);
  const cleanClient = sanitizeText(clientName);
  const cleanShow = sanitizeText(targetShow);

  let message = `🏆 Athlete Update: ${cleanClient}\nShow: ${cleanShow} (${daysOut} Days Out)\nPhase: ${prepPhase}\n\n`;
  if (coachNotes && coachNotes.trim()) {
    message += `📋 Protocol Adjustments:\n${coachNotes.trim()}\n\n`;
  }
  message += `Lock in your water, posing, and sodium targets. We take the trophy! 🥇`;

  if (!cleanPhone) {
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
