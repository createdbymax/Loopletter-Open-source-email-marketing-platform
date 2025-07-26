import { useState, useEffect } from 'react';

/**
 * Custom hook that persists state to localStorage
 * Automatically saves and restores state when component mounts/unmounts
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void, () => void] {
  // Initialize state from localStorage or default value
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn(`Failed to parse localStorage value for key "${key}":`, error);
    }
    
    return defaultValue;
  });

  // Update localStorage whenever state changes
  const setValue = (value: T) => {
    setState(value);
    
    if (typeof window !== 'undefined') {
      try {
        if (value === null || value === undefined || value === '') {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.warn(`Failed to save to localStorage for key "${key}":`, error);
      }
    }
  };

  // Clear the persisted state
  const clearValue = () => {
    setState(defaultValue);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  };

  return [state, setValue, clearValue];
}

/**
 * Hook specifically for form input persistence
 * Handles string values and provides a simpler API
 */
export function usePersistentInput(key: string, defaultValue: string = '') {
  const [value, setValue, clearValue] = usePersistentState(key, defaultValue);
  
  return {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(e.target.value);
    },
    setValue,
    clearValue
  };
}