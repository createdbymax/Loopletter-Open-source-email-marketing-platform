import { useState, useEffect } from 'react';
export function usePersistentState<T>(key: string, defaultValue: T): [
    T,
    (value: T) => void,
    () => void
] {
    const [state, setState] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return defaultValue;
        }
        try {
            const saved = localStorage.getItem(key);
            if (saved !== null) {
                return JSON.parse(saved);
            }
        }
        catch (error) {
            console.warn(`Failed to parse localStorage value for key "${key}":`, error);
        }
        return defaultValue;
    });
    const setValue = (value: T) => {
        setState(value);
        if (typeof window !== 'undefined') {
            try {
                if (value === null || value === undefined || value === '') {
                    localStorage.removeItem(key);
                }
                else {
                    localStorage.setItem(key, JSON.stringify(value));
                }
            }
            catch (error) {
                console.warn(`Failed to save to localStorage for key "${key}":`, error);
            }
        }
    };
    const clearValue = () => {
        setState(defaultValue);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
        }
    };
    return [state, setValue, clearValue];
}
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
