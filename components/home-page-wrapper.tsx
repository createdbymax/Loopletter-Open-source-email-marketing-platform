'use client';

import { useState, useEffect } from 'react';
import { WaitlistPopup } from '@/components/ui/waitlist-popup';

interface HomePageWrapperProps {
  children: React.ReactNode;
}

export function HomePageWrapper({ children }: HomePageWrapperProps) {
  const [showWaitlist, setShowWaitlist] = useState(false);

  // Add click handler to existing waitlist buttons
  const handleWaitlistClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-waitlist-trigger]')) {
      e.preventDefault();
      setShowWaitlist(true);
    }
  };

  // Add event listener when component mounts
  useEffect(() => {
    document.addEventListener('click', handleWaitlistClick);
    return () => document.removeEventListener('click', handleWaitlistClick);
  }, []);

  return (
    <>
      {children}
      <WaitlistPopup 
        isOpen={showWaitlist} 
        onClose={() => setShowWaitlist(false)} 
      />
    </>
  );
}