import { useEffect } from 'react';
/**
 * Custom hook to listen for keyboard shortcuts (e.g. meta+K / ctrl+K).
 */
export function useKeyboardShortcut(key, callback, options = {}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            const matchKey = e.key.toLowerCase() === key.toLowerCase();
            const matchMetaOrCtrl = !options.metaOrCtrl || (e.metaKey || e.ctrlKey);
            const matchAlt = !options.alt || e.altKey;
            const matchShift = !options.shift || e.shiftKey;
            if (matchKey && matchMetaOrCtrl && matchAlt && matchShift) {
                e.preventDefault();
                callback(e);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [key, callback, options.metaOrCtrl, options.alt, options.shift]);
}
