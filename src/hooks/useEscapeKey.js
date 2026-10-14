/**
 * @file useEscapeKey.js
 * @description هوك موحد لإغلاق النوافذ المنبثقة والقوائم بزر Escape في لوحة المفاتيح.
 * يحل مشكلة تكرار مستمع حدث keydown في أكثر من 32 ملفاً في المشروع.
 */

import { useEffect } from 'react';

/**
 * الاستماع لضغط زر Escape وتشغيل دالة الإغلاق
 * @param {boolean} isOpen - هل النافذة أو القائمة مفتوحة حالياً؟
 * @param {() => void} onClose - الدالة المطلوب تنفيذها عند الضغط على Escape
 */
export function useEscapeKey(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen || typeof onClose !== 'function') return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
}
