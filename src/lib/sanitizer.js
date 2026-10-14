/**
 * @file sanitizer.js
 * @description محرك الحماية وتطهير المدخلات (Security & Input Sanitization Engine)
 * يوفر حماية كاملة ضد هجمات الـ XSS وحقن الأكواد الخبيثة في الحقول التي يدخلها المستخدم أو الكوتش.
 */

/**
 * تنظيف وتطهير النصوص العادية من أي وسوم HTML أو أكواد Script
 * @param {unknown} input - النص المراد تنظيفه
 * @returns {string} النص بعد التطهير وإزالة الأكواد الضارة
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  return input
    // 1. إزالة وسوم السكربت بمحتواها بالكامل <script>...</script>
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // 2. إزالة وسوم التنسيق <style>...</style>
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // 3. إزالة أي وسوم HTML متبقية
    .replace(/<[^>]+>/g, '')
    // 4. إزالة البروتوكولات الخطرة مثل javascript: و data:
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    // 5. إزالة معالجات الأحداث في الـ DOM مثل onclick= أو onerror=
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // 6. إزالة رموز التحكم غير القابلة للطباعة
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .trim();
}

export const sanitizeText = sanitizeString;

/**
 * تنظيف وتطهير النصوص متعددة الأسطر (مثل ملاحظات الكوتش أو تقارير المتابعة)
 * تحافظ على السطور الجديدة والمسافات مع منع أي وسوم ضارة
 * @param {unknown} input - الملاحظات المدخلة
 * @returns {string} الملاحظات النظيفة
 */
export function sanitizeNotes(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // الحفاظ على \r و \n و \t لترتيب الملاحظات المقروءة
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .trim();
}

/**
 * التحقق من صحة أرقام الهواتف (المصرية والدولية)
 * @param {string} [phone] - رقم الهاتف
 * @returns {boolean} true إذا كان الرقم صالحاً أو فارغاً
 */
export function isValidPhoneNumber(phone) {
  if (!phone) return true;
  const phoneRegex = /^(\+?[0-9]{8,15})$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * فحص وتطهير الروابط الخارجية (مثل روابط الفيديوهات وشروحات التمارين)
 * تضمن استخدام http: أو https: فقط وتمنع أي روابط احتيالية
 * @param {unknown} input - الرابط المراد فحصه
 * @returns {string} الرابط الآمن أو نص فارغ إذا كان غير صالح
 */
export function sanitizeUrl(input) {
  if (typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  if (/^(javascript|vbscript|data|file):/i.test(trimmed)) {
    return '';
  }

  const clean = trimmed.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  try {
    const url = new URL(clean);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString();
    }
  } catch {
    return '';
  }

  return '';
}
