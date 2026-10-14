/**
 * @file audio.js
 * @description مُولّد التنبيهات الصوتية لعداد الراحة وجلسات التمرين (Web Audio API Synthesizer)
 * يُصدر نغمات صوتية (Beeps) نقية بدون الحاجة لتحميل ملفات mp3 خارجية.
 */

/**
 * تشغيل صفارة تنبيه صوتية باستخدام Web Audio API
 * @param {number} [frequency=880] - تردد الصوت بالهرتز (Hz)
 * @param {number} [durationMs=180] - مدة الصوت بالمللي ثانية
 * @param {number} [count=1] - عدد مرات تكرار الصوت
 */
export function playTimerBeep(frequency = 880, durationMs = 180, count = 1) {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    for (let i = 0; i < count; i++) {
      const startTime = ctx.currentTime + (i * (durationMs + 100)) / 1000;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, startTime);

      // ضبط مستوى الصوت تدريجياً لمنع طقطقة الصوت (Audio Pop)
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + durationMs / 1000);
    }
  } catch {
    // تجاوز آمن في حال منع المتصفح تشغيل الصوت التلقائي (Autoplay policy)
  }
}
