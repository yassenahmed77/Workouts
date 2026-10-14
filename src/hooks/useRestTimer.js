/**
 * @file useRestTimer.js
 * @description هوك موحد لإدارة عداد وقت الراحة بين المجموعات (Rest Timer Countdown)
 * يدير العد التنازلي، إضافة وقت إضافي (+30s)، وتنبيه اللاعب بصفارة صوتية Web Audio عند انتهاء الراحة.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { playTimerBeep } from '@/lib/audio';

export function useRestTimer(soundEnabled = true) {
  const [restSecondsLeft, setRestSecondsLeft] = useState(null);
  const [totalRestDuration, setTotalRestDuration] = useState(150);
  const [activeRestExerciseName, setActiveRestExerciseName] = useState('');
  const soundRef = useRef(soundEnabled);

  useEffect(() => {
    soundRef.current = soundEnabled;
  }, [soundEnabled]);

  // إدارة العد التنازلي
  useEffect(() => {
    if (restSecondsLeft === null || restSecondsLeft <= 0) return;

    const interval = setInterval(() => {
      setRestSecondsLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          // إطلاق صفارة التنبيه الصوتي عند انتهاء الوقت
          if (soundRef.current) {
            playTimerBeep(880, 200, 2);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restSecondsLeft]);

  const startRestTimer = useCallback((seconds, exerciseName = '') => {
    const s = Math.max(10, Number(seconds) || 120);
    setTotalRestDuration(s);
    setRestSecondsLeft(s);
    setActiveRestExerciseName(exerciseName);
  }, []);

  const addRestSeconds = useCallback((extra = 30) => {
    setRestSecondsLeft((prev) => (prev !== null ? prev + extra : extra));
    setTotalRestDuration((prev) => prev + extra);
  }, []);

  const skipRestTimer = useCallback(() => {
    setRestSecondsLeft(null);
    setActiveRestExerciseName('');
  }, []);

  return {
    restSecondsLeft,
    totalRestDuration,
    activeRestExerciseName,
    startRestTimer,
    addRestSeconds,
    skipRestTimer,
    isResting: restSecondsLeft !== null && restSecondsLeft > 0
  };
}
