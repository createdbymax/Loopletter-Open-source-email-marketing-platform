'use client';
import { useState } from 'react';
interface UseEarlyAccessOptions {
    onSuccess?: (email: string) => void;
    onError?: (error: string) => void;
}
export function useWaitlist(options: UseEarlyAccessOptions = {}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const joinWaitlist = async (email: string) => {
        if (!email || !email.includes('@')) {
            const errorMsg = 'Please enter a valid email address';
            setError(errorMsg);
            options.onError?.(errorMsg);
            return false;
        }
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);
        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }
            setIsSuccess(true);
            options.onSuccess?.(email);
            return true;
        }
        catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to join waitlist';
            setError(errorMsg);
            options.onError?.(errorMsg);
            return false;
        }
        finally {
            setIsLoading(false);
        }
    };
    const reset = () => {
        setError(null);
        setIsSuccess(false);
        setIsLoading(false);
    };
    return {
        joinWaitlist,
        isLoading,
        error,
        isSuccess,
        reset,
    };
}
export function useEarlyAccess(options: UseEarlyAccessOptions = {}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const requestEarlyAccess = async (email: string) => {
        if (!email || !email.includes('@')) {
            const errorMsg = 'Please enter a valid email address';
            setError(errorMsg);
            options.onError?.(errorMsg);
            return false;
        }
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);
        try {
            const response = await fetch('/api/early-access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }
            setIsSuccess(true);
            options.onSuccess?.(email);
            return true;
        }
        catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to submit early access request';
            setError(errorMsg);
            options.onError?.(errorMsg);
            return false;
        }
        finally {
            setIsLoading(false);
        }
    };
    const reset = () => {
        setIsLoading(false);
        setError(null);
        setIsSuccess(false);
    };
    return {
        requestEarlyAccess,
        isLoading,
        error,
        isSuccess,
        reset,
    };
}
export function useEarlyAccessStats() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fetchStats = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/early-access');
            if (!response.ok) {
                throw new Error('Failed to fetch early access stats');
            }
            const data = await response.json();
            setStats(data);
        }
        catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to fetch stats';
            setError(errorMsg);
        }
        finally {
            setIsLoading(false);
        }
    };
    const updateEntryStatus = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
        try {
            const response = await fetch(`/api/early-access/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status, notes }),
            });
            if (!response.ok) {
                throw new Error('Failed to update entry');
            }
            await fetchStats();
            return true;
        }
        catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to update entry';
            setError(errorMsg);
            return false;
        }
    };
    const deleteEntry = async (id: string) => {
        try {
            const response = await fetch(`/api/early-access/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete entry');
            }
            await fetchStats();
            return true;
        }
        catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to delete entry';
            setError(errorMsg);
            return false;
        }
    };
    return {
        stats,
        isLoading,
        error,
        fetchStats,
        updateEntryStatus,
        deleteEntry,
    };
}
