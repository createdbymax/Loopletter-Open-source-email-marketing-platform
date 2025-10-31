'use client';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
let globalProcessingFlag = false;
interface QueueAutoProcessorProps {
    enabled?: boolean;
    intervalMs?: number;
}
export function QueueAutoProcessor({ enabled = true, intervalMs = 30000 }: QueueAutoProcessorProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastProcessed, setLastProcessed] = useState<Date | null>(null);
    const processingRef = useRef(false);
    const instanceId = useRef(Math.random().toString(36).substr(2, 9));
    useEffect(() => {
        if (!enabled)
            return;
        console.log(`[QueueAutoProcessor-${instanceId.current}] Starting with ${intervalMs}ms interval`);
        const processQueue = async () => {
            if (processingRef.current || globalProcessingFlag)
                return;
            try {
                processingRef.current = true;
                globalProcessingFlag = true;
                setIsProcessing(true);
                const response = await fetch('/api/queue/process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ processNext: true }),
                });
                if (response.ok) {
                    const result = await response.json();
                    if (result.processed > 0) {
                        console.log(`[QueueAutoProcessor-${instanceId.current}] Processed ${result.processed} email jobs`);
                        setLastProcessed(new Date());
                    }
                }
            }
            catch (error) {
                console.error(`[QueueAutoProcessor-${instanceId.current}] Auto-processing error:`, error);
            }
            finally {
                processingRef.current = false;
                globalProcessingFlag = false;
                setIsProcessing(false);
            }
        };
        processQueue();
        const interval = setInterval(processQueue, intervalMs);
        return () => {
            console.log(`[QueueAutoProcessor-${instanceId.current}] Cleaning up interval`);
            clearInterval(interval);
        };
    }, [enabled, intervalMs]);
    return null;
}
export function useQueueProcessor() {
    const [isProcessing, setIsProcessing] = useState(false);
    const processingRef = useRef(false);
    const processQueue = async () => {
        if (processingRef.current)
            return;
        try {
            processingRef.current = true;
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
                }
                else {
                    toast.info('No jobs to process');
                    return result;
                }
            }
            else {
                toast.error('Failed to process queue');
                return null;
            }
        }
        catch (error) {
            console.error('Queue processing error:', error);
            toast.error('Error processing queue');
            return null;
        }
        finally {
            processingRef.current = false;
            setIsProcessing(false);
        }
    };
    return {
        processQueue,
        isProcessing,
    };
}
