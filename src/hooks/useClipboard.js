/**
 * @file useClipboard.js
 * @description هوك موحد لنسخ النصوص والروابط إلى الحافظة (Clipboard) مع مؤقت نجاح للواجهة.
 * يحل مشكلة تكرار دوال navigator.clipboard.writeText و setTimeout عبر الكومبوننتس.
 */

import { useState, useCallback } from 'react';

/**
 * نسخ نص إلى الحافظة مع إشارة مرئية للنجاح
 * @param {Object} [options]
 * @param {number} [options.timeout=2000] - المدة بالمللي ثانية لظهور علامة "تم النسخ"
 * @returns {{ copied: boolean, copy: (text: string) => Promise<boolean> }}
 */
export function useClipboard(options = {}) {
  const { timeout = 2000 } = options;
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text) => {
    if (!text || typeof window === 'undefined') return false;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, timeout);
      return true;
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
      return false;
    }
  }, [timeout]);

  return { copied, copy };
}
