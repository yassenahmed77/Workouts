import { useState, useCallback } from 'react';
/**
 * Clean, type-safe hook for managing modal dialog states and payloads.
 */
export function useModal(initialOpen = false, initialPayload) {
    const [isOpen, setIsOpen] = useState(initialOpen);
    const [payload, setPayload] = useState(initialPayload);
    const open = useCallback((data) => {
        if (data !== undefined) {
            setPayload(data);
        }
        setIsOpen(true);
    }, []);
    const close = useCallback(() => {
        setIsOpen(false);
    }, []);
    const toggle = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);
    return {
        isOpen,
        payload,
        open,
        close,
        toggle,
        setPayload
    };
}
