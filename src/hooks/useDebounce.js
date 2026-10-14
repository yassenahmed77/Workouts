import { useState, useEffect } from 'react';
/**
 * Custom hook to debounce any rapidly changing value (e.g. search queries).
 * Reduces unneeded re-filtering and rendering.
 */
export function useDebounce(value, delayMs = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delayMs);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delayMs]);
    return debouncedValue;
}
