import { useState, useCallback } from 'react';

/**
 * Clean, type-safe hook for managing modal dialog states and payloads.
 */
export function useModal<T = undefined>(initialOpen = false, initialPayload?: T) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [payload, setPayload] = useState<T | undefined>(initialPayload);

  const open = useCallback((data?: T) => {
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
