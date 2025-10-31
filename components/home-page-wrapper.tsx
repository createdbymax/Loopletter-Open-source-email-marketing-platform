'use client';
import { useState, useEffect, Suspense } from 'react';
import { WaitlistPopup } from '@/components/ui/waitlist-popup';
import { UrlParamHandler } from '@/components/ui/url-param-handler';
interface HomePageWrapperProps {
    children: React.ReactNode;
}
export function HomePageWrapper({ children }: HomePageWrapperProps) {
    const [showWaitlist, setShowWaitlist] = useState(false);
    const handleEarlyAccessTrigger = () => {
        setShowWaitlist(true);
    };
    const handleWaitlistClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-waitlist-trigger]')) {
            e.preventDefault();
            setShowWaitlist(true);
        }
    };
    useEffect(() => {
        document.addEventListener('click', handleWaitlistClick);
        return () => document.removeEventListener('click', handleWaitlistClick);
    }, []);
    return (<>
      {children}
      <Suspense fallback={null}>
        <UrlParamHandler onEarlyAccessTrigger={handleEarlyAccessTrigger}/>
      </Suspense>
      <WaitlistPopup isOpen={showWaitlist} onClose={() => setShowWaitlist(false)}/>
    </>);
}
