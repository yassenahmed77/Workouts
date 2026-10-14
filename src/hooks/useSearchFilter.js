/**
 * @file useSearchFilter.js
 * @description هوك موحد للبحث والفلترة السريعة في القوائم والمصفوفات بالنص.
 * يحل مشكلة تكرار دوال toLowerCase().includes(...) في أكثر من 15 ملفاً.
 */

import { useState, useMemo } from 'react';

/**
 * فلترة مصفوفة عناصر بناءً على نص البحث وحقول محددة
 * @param {Array<Object>} items - المصفوفة الأصلية
 * @param {Array<string>} searchKeys - أسماء الحقول المراد البحث فيها (مثال: ['name', 'email'])
 * @param {string} [initialQuery=''] - نص البحث الأولي
 * @returns {{
 *   query: string,
 *   setQuery: (q: string) => void,
 *   filteredItems: Array<Object>,
 *   clearQuery: () => void,
 *   hasResults: boolean
 * }}
 */
export function useSearchFilter(items, searchKeys = [], initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      if (!item) return false;

      // إذا لم يتم تحديد حقول، ابحث في كل خصائص الكائن النصية
      const keysToSearch = searchKeys.length > 0 ? searchKeys : Object.keys(item);

      return keysToSearch.some((key) => {
        const val = item[key];
        if (typeof val === 'string') {
          return val.toLowerCase().includes(q);
        }
        if (typeof val === 'number') {
          return String(val).includes(q);
        }
        return false;
      });
    });
  }, [items, searchKeys, query]);

  const clearQuery = () => setQuery('');

  return {
    query,
    setQuery,
    filteredItems,
    clearQuery,
    hasResults: filteredItems.length > 0
  };
}
