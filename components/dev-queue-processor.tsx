'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Play, Eye } from 'lucide-react';
export function DevQueueProcessor() {
    const [processing, setProcessing] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [lastResult, setLastResult] = useState<any>(null);
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }
    const processQueue = async () => {
        setProcessing(true);
        try {
            const response = await fetch('/api/queue/process-all');
            const result = await response.json();
            setLastResult(result);
            console.log('Queue processing result:', result);
            await getStats();
        }
        catch (error) {
            console.error('Error processing queue:', error);
            setLastResult({ error: 'Failed to process queue' });
        }
        finally {
            setProcessing(false);
        }
    };
    const getStats = async () => {
        try {
            const response = await fetch('/api/queue/process');
            const result = await response.json();
            setStats(result.stats);
        }
        catch (error) {
            console.error('Error getting queue stats:', error);
        }
    };
    return (<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Development Mode - Queue Processor
          </h3>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p className="mb-3">
              In development, the email queue needs to be manually processed since there's no cron job running.
            </p>
            
            <div className="flex items-center gap-2 mb-3">
              <Button size="sm" onClick={processQueue} disabled={processing} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                {processing ? (<RefreshCw className="w-4 h-4 mr-2 animate-spin"/>) : (<Play className="w-4 h-4 mr-2"/>)}
                Process Queue
              </Button>
              
              <Button size="sm" variant="outline" onClick={getStats} className="border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                <Eye className="w-4 h-4 mr-2"/>
                Check Stats
              </Button>
            </div>

            {stats && (<div className="bg-yellow-100 dark:bg-yellow-900/40 rounded p-2 mb-2">
                <p className="text-xs font-medium">Queue Stats:</p>
                <p className="text-xs">
                  Waiting: {stats.waiting} | Active: {stats.active} | Completed: {stats.completed} | Failed: {stats.failed}
                </p>
              </div>)}

            {lastResult && (<div className="bg-yellow-100 dark:bg-yellow-900/40 rounded p-2">
                <p className="text-xs font-medium">Last Result:</p>
                <p className="text-xs">
                  {lastResult.error ? (<span className="text-red-600">Error: {lastResult.error}</span>) : (<span>
                      Processed: {lastResult.processed || 0} | 
                      Successful: {lastResult.successful || 0} | 
                      Failed: {lastResult.failed || 0}
                    </span>)}
                </p>
              </div>)}
          </div>
        </div>
      </div>
    </div>);
}
