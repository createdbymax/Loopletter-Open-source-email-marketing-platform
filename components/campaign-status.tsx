"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Send, 
  CheckCircle, 
  XCircle, 
  Pause,
  Play,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface CampaignStatusProps {
  campaignId: string;
  status: string;
  jobId?: string;
  onStatusChange?: () => void;
}

interface JobStatus {
  id: string;
  name: string;
  progress: number;
  processedOn?: number;
  finishedOn?: number;
  failedReason?: string;
  returnvalue?: any;
}

export function CampaignStatus({ 
  campaignId, 
  status, 
  jobId, 
  onStatusChange 
}: CampaignStatusProps) {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch job status if jobId is provided
  const fetchJobStatus = async () => {
    if (!jobId) return;
    
    try {
      const response = await fetch(`/api/queue/status?jobId=${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJobStatus(data);
        
        // Update campaign status based on job status
        if (data.finishedOn && onStatusChange) {
          onStatusChange();
        } else if (data.failedReason && onStatusChange) {
          onStatusChange();
        }
      }
    } catch (error) {
      console.error('Error fetching job status:', error);
    }
  };

  // Send campaign
  const sendCampaign = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        
        // Start polling for job status
        if (data.jobId) {
          setJobStatus({ 
            id: data.jobId, 
            name: 'send-bulk-campaign', 
            progress: 0 
          });
        }
        
        if (onStatusChange) {
          onStatusChange();
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send campaign');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error('Failed to send campaign');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh job status when sending
  useEffect(() => {
    if (jobId && (status === 'sending' || status === 'scheduled')) {
      fetchJobStatus();
      const interval = setInterval(fetchJobStatus, 2000); // Poll every 2 seconds
      return () => clearInterval(interval);
    }
  }, [jobId, status]);

  const getStatusIcon = () => {
    switch (status) {
      case 'draft':
        return <Clock className="w-4 h-4" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'sending':
        return <Activity className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'scheduled':
        return 'default';
      case 'sending':
        return 'default';
      case 'sent':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'paused':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-3">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <Badge variant={getStatusColor()}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        
        {/* Send Button for Draft Campaigns */}
        {status === 'draft' && (
          <Button
            size="sm"
            onClick={sendCampaign}
            disabled={loading}
            className="ml-2"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Queueing...' : 'Send Now'}
          </Button>
        )}

        {/* Process Queue Button for Sending Campaigns */}
        {(status === 'sending' || status === 'scheduled') && (
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                const response = await fetch('/api/queue/process', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ processNext: true }),
                });
                if (response.ok) {
                  toast.success('Processing jobs...');
                  fetchJobStatus();
                } else {
                  toast.error('Failed to process jobs');
                }
              } catch (error) {
                toast.error('Error processing jobs');
              }
            }}
            className="ml-2"
          >
            <Activity className="w-4 h-4 mr-2" />
            Process Queue
          </Button>
        )}
      </div>

      {/* Progress Bar for Sending Campaigns */}
      {jobStatus && (status === 'sending' || status === 'scheduled') && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Sending Progress</span>
            <span>{jobStatus.progress}%</span>
          </div>
          <Progress value={jobStatus.progress} className="w-full" />
          
          {jobStatus.returnvalue && (
            <div className="text-sm text-gray-600">
              {jobStatus.returnvalue.totalQueued} emails queued for sending
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {jobStatus?.failedReason && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-800 font-medium">Sending Failed:</div>
          <p className="text-red-700 text-sm mt-1">{jobStatus.failedReason}</p>
        </div>
      )}

      {/* Success Message */}
      {status === 'sent' && jobStatus?.returnvalue && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="text-green-800 font-medium">Campaign Sent Successfully!</div>
          <p className="text-green-700 text-sm mt-1">
            {jobStatus.returnvalue.totalQueued} emails were queued for delivery
          </p>
        </div>
      )}
    </div>
  );
}