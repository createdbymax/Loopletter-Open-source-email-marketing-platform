'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
interface UrlParamHandlerProps {
    onEarlyAccessTrigger: () => void;
}
export function UrlParamHandler({ onEarlyAccessTrigger }: UrlParamHandlerProps) {
    const searchParams = useSearchParams();
    useEffect(() => {
        const earlyAccess = searchParams.get('early-access');
        const waitlist = searchParams.get('waitlist');
        const signup = searchParams.get('signup');
        if (earlyAccess === 'true' || waitlist === 'true' || signup === 'true') {
            onEarlyAccessTrigger();
            if (typeof window !== 'undefined' && window.history.replaceState) {
                const url = new URL(window.location.href);
                url.searchParams.delete('early-access');
                url.searchParams.delete('waitlist');
                url.searchParams.delete('signup');
                window.history.replaceState({}, '', url.toString());
            }
        }
    }, [searchParams, onEarlyAccessTrigger]);
    return null;
}
