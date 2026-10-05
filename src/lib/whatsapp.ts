import { sanitizeText } from './sanitizer';

/**
 * WhatsApp Deep-Link and Phone Number Utility
 * Formats international and local phone numbers and generates pre-filled coach response links.
 */

/**
 * Normalizes phone numbers to standard WhatsApp format (country code + number without '+' or special characters).
 * Defaults to Egyptian country code (+20) if a standard 11-digit Egyptian mobile number is detected (010, 011, 012, 015).
 */
export function formatWhatsAppPhone(phone?: string): string {
  if (!phone) return '';
  // Remove spaces, parentheses, dashes, plus signs
  const digits = phone.replace(/[^0-9]/g, '');

  if (!digits) return '';

  // Case: starts with 00 (international prefix)
  if (digits.startsWith('00')) {
    return digits.substring(2);
  }

  // Case: Egyptian local standard (010, 011, 012, 015 - 11 digits)
  if (digits.startsWith('0') && digits.length === 11) {
    return `2${digits}`; // converts 010... -> 2010...
  }

  // Case: Egyptian 10 digits without leading 0 (e.g., 1012345678)
  if (digits.length === 10 && (digits.startsWith('10') || digits.startsWith('11') || digits.startsWith('12') || digits.startsWith('15'))) {
    return `20${digits}`;
  }

  return digits;
}

export interface WhatsAppFormCheckMessageOptions {
  phone?: string;
  clientName: string;
  exerciseName: string;
  recordedAt: string;
  setDetails?: string;
  coachFeedback?: string;
}

/**
 * Builds a direct WhatsApp chat URL with a pre-filled technique review message.
 */
export function buildWhatsAppFormCheckUrl({
  phone,
  clientName,
  exerciseName,
  recordedAt,
  setDetails,
  coachFeedback
}: WhatsAppFormCheckMessageOptions): string {
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

export interface WhatsAppRenewalAlertOptions {
  phone?: string;
  clientName: string;
  planName: string;
  endDate: string;
  daysLeft: number;
  coachName?: string;
  brandName?: string;
  customTemplate?: string;
}

/**
 * Builds a WhatsApp URL for membership subscription renewal alerts.
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
}: WhatsAppRenewalAlertOptions): string {
  const cleanPhone = formatWhatsAppPhone(phone);
  const cleanClient = sanitizeText(clientName);
  const cleanPlan = sanitizeText(planName);

  let message: string;
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

export interface WhatsAppCheckInReminderOptions {
  phone?: string;
  clientName: string;
  lastCheckInDate?: string;
  coachName?: string;
}

/**
 * Builds a WhatsApp URL for weekly check-in reminder.
 */
export function buildWhatsAppCheckInReminderUrl({
  phone,
  clientName,
  lastCheckInDate,
  coachName = 'Coach'
}: WhatsAppCheckInReminderOptions): string {
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

export interface WhatsAppCompetitorUpdateOptions {
  phone?: string;
  clientName: string;
  targetShow: string;
  daysOut: number;
  prepPhase: string;
  coachNotes?: string;
}

/**
 * Builds a WhatsApp URL for bodybuilding competitor prep adjustments.
 */
export function buildWhatsAppCompetitorUpdateUrl({
  phone,
  clientName,
  targetShow,
  daysOut,
  prepPhase,
  coachNotes
}: WhatsAppCompetitorUpdateOptions): string {
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
