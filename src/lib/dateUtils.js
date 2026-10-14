/**
 * @file dateUtils.js
 * @description موديول مركزي لتنسيق التواريخ والأوقات في التطبيق.
 * يحل مشكلة تكرار دوال toLocaleDateString وحساب الفروق الزمنية في أكثر من 10 ملفات.
 */

/**
 * تنسيق التاريخ للعرض المقروء (مثال: Oct 14, 2026)
 * @param {string | Date} dateInput - التاريخ كـ string أو كائن Date
 * @param {Intl.DateTimeFormatOptions} [options] - خيارات تنسيق اختيارية
 * @returns {string} التاريخ المنسق
 */
export function formatDisplayDate(dateInput, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', options);
}

/**
 * تنسيق اليوم والشهر فقط (مثال: Oct 14)
 * @param {string | Date} dateInput - التاريخ
 * @returns {string} اليوم والشهر
 */
export function formatShortDate(dateInput) {
  return formatDisplayDate(dateInput, { month: 'short', day: 'numeric' });
}

/**
 * إرجاع اسم اليوم بالأسبوع (مثال: Monday أو الإثنين)
 * @param {string | Date} dateInput - التاريخ
 * @param {'long' | 'short'} [format='long'] - التنسيق الكامل أو المختصر
 * @returns {string} اسم اليوم
 */
export function getWeekdayName(dateInput, format = 'long') {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { weekday: format });
}

/**
 * حساب الوقت المنقضي بشكل نسبي (Relative Time) (مثال: "منذ ساعتين", "منذ 3 أيام")
 * @param {string | Date} dateInput - التاريخ السابق
 * @returns {string} النص النسبي
 */
export function formatTimeAgo(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  return formatShortDate(date);
}

/**
 * حساب عدد الأيام المتبقية حتى تاريخ معين (مثال: عد تنازلي للبطولة أو انتهاء الاشتراك)
 * @param {string | Date} targetDateInput - تاريخ الهدف
 * @returns {number} عدد الأيام (موجب = متبقي، سالب = منتهي)
 */
export function getDaysRemaining(targetDateInput) {
  if (!targetDateInput) return 0;
  const target = new Date(targetDateInput);
  if (isNaN(target.getTime())) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
