'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface QueueAutoProcessorProps {
  enabled?: boolean;
  intervalMs?: number;
}

export function QueueAutoProcessor({ 
  enabled = true, 
  intervalMs = 30000 // 30 seconds default
}: QueueAutoProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessed, setLastProcessed] = useState<Date | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const processQueue = async () => {
      if (isProcessing) return;

      try {
        setIsProcessing(true);
        const response = await fetch('/api/queue/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ processNext: true }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.processed > 0) {
            console.log(`Processed ${result.processed} email jobs`);
            setLastProcessed(new Date());
          }
        }
      } catch (error) {
        console.error('Auto-processing error:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    // Process immediately on mount
    processQueue();

    // Set up interval
    const interval = setInterval(processQueue, intervalMs);

    return () => clearInterval(interval);
  }, [enabled, intervalMs, isProcessing]);

  // Don't render anything - this is a background processor
  return null;
}

// Hook for manual queue processing
export function useQueueProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processQueue = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      const response = await fetch('/api/queue/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processNext: true }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.processed > 0) {
          toast.success(`Processed ${result.processed} email jobs`);
          return result;
        } else {
          toast.info('No jobs to process');
          return result;
        }
      } else {
        toast.error('Failed to process queue');
        return null;
      }
    } catch (error) {
      console.error('Queue processing error:', error);
      toast.error('Error processing queue');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processQueue,
    isProcessing,
  };
}