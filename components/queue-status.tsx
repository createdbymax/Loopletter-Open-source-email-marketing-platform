"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  total: number;
}

interface JobStatus {
  id: string;
  name: string;
  data: any;
  progress: number;
  processedOn?: number;
  finishedOn?: number;
  failedReason?: string;
  returnvalue?: any;
}

export function QueueStatus() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch queue statistics
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/queue/status');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching queue stats:', error);
    }
  };

  // Fetch specific job status
  const fetchJobStatus = async (jobId: string) => {
    if (!jobId) return;
    
    try {
      const response = await fetch(`/api/queue/status?jobId=${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJobStatus(data);
      } else {
        setJobStatus(null);
        toast.error('Job not found');
      }
    } catch (error) {
      console.error('Error fetching job status:', error);
      toast.error('Failed to fetch job status');
    }
  };

  // Queue management actions
  const manageQueue = async (action: string, jobId?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/queue/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, jobId }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchStats(); // Refresh stats
        if (jobId) fetchJobStatus(jobId); // Refresh job status if applicable
      } else {
        const error = await response.json();
        toast.error(error.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error managing queue:', error);
      toast.error('Failed to perform action');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchStats();
    
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      {/* Queue Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Email Queue Status
              </CardTitle>
              <CardDescription>
                Monitor and manage email sending queue
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStats}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.waiting}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4" />
                  Waiting
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <Activity className="w-4 h-4" />
                  Active
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <XCircle className="w-4 h-4" />
                  Failed
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">Loading queue statistics...</div>
          )}

          {/* Queue Management Actions */}
          <div className="flex gap-2 mt-6 pt-6 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => manageQueue('pause')}
              disabled={loading}
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause Queue
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => manageQueue('resume')}
              disabled={loading}
            >
              <Play className="w-4 h-4 mr-2" />
              Resume Queue
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => manageQueue('cleanup')}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Cleanup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Status Lookup */}
      <Card>
        <CardHeader>
          <CardTitle>Job Status Lookup</CardTitle>
          <CardDescription>
            Enter a job ID to check its status and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Enter job ID..."
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={() => fetchJobStatus(selectedJobId)}
              disabled={!selectedJobId || loading}
            >
              Check Status
            </Button>
          </div>

          {jobStatus && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Job: {jobStatus.name}</h4>
                <Badge variant={
                  jobStatus.finishedOn ? 'default' : 
                  jobStatus.failedReason ? 'destructive' : 
                  'secondary'
                }>
                  {jobStatus.finishedOn ? 'Completed' : 
                   jobStatus.failedReason ? 'Failed' : 
                   'Processing'}
                </Badge>
              </div>

              {jobStatus.progress > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{jobStatus.progress}%</span>
                  </div>
                  <Progress value={jobStatus.progress} className="w-full" />
                </div>
              )}

              {jobStatus.failedReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Error:</span>
                  </div>
                  <p className="text-red-700 mt-1">{jobStatus.failedReason}</p>
                </div>
              )}

              {jobStatus.returnvalue && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="text-green-800 font-medium">Result:</div>
                  <pre className="text-sm text-green-700 mt-1">
                    {JSON.stringify(jobStatus.returnvalue, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => manageQueue('retry', jobStatus.id)}
                  disabled={loading || !jobStatus.failedReason}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => manageQueue('remove', jobStatus.id)}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}