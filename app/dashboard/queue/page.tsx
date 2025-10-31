"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, AlertCircle, Mail, Calendar } from 'lucide-react';
interface Campaign {
    id: string;
    title: string;
    subject: string;
    status: 'scheduled' | 'sending';
    job_id: string;
    send_date: string;
    created_at: string;
    updated_at: string;
    jobStatus?: {
        id: string;
        progress: number;
        processedOn?: number;
        finishedOn?: number;
        failedReason?: string;
    } | null;
}
interface UserQueueStats {
    scheduled: number;
    sending: number;
    total: number;
}
interface QueueData {
    campaigns: Campaign[];
    stats: UserQueueStats;
}
export default function QueueDashboard() {
    const [queueData, setQueueData] = useState<QueueData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const fetchQueueData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/campaigns/queue-status');
            if (response.ok) {
                const data = await response.json();
                setQueueData({
                    campaigns: data.campaigns,
                    stats: data.stats,
                });
                setLastUpdated(new Date());
            }
        }
        catch (error) {
            console.error('Failed to fetch queue data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchQueueData();
        const interval = setInterval(fetchQueueData, 30000);
        return () => clearInterval(interval);
    }, []);
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'text-orange-600';
            case 'sending': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'scheduled': return <Clock className="w-4 h-4"/>;
            case 'sending': return <AlertCircle className="w-4 h-4"/>;
            default: return <Mail className="w-4 h-4"/>;
        }
    };
    return (<div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Campaign Queue</h1>
          <p className="text-sm text-gray-600">Monitor your queued and sending campaigns</p>
        </div>
        <div className="flex gap-2">
          {process.env.NODE_ENV === 'development' && (<>
              <Button onClick={async () => {
                try {
                    const response = await fetch('/api/queue/recover', { method: 'POST' });
                    const result = await response.json();
                    console.log('Queue recovery result:', result);
                    alert(`Recovery completed: ${result.recovered?.length || 0} jobs recovered`);
                    setTimeout(fetchQueueData, 1000);
                }
                catch (error) {
                    console.error('Error recovering queue:', error);
                    alert('Queue recovery failed');
                }
            }} variant="secondary">
                <AlertCircle className="w-4 h-4 mr-2"/>
                Recover Queue
              </Button>
              <Button onClick={async () => {
                try {
                    const response = await fetch('/api/queue/process-all');
                    const result = await response.json();
                    console.log('Queue processing result:', result);
                    setTimeout(fetchQueueData, 1000);
                }
                catch (error) {
                    console.error('Error processing queue:', error);
                }
            }} variant="default">
                <Mail className="w-4 h-4 mr-2"/>
                Process Queue
              </Button>
            </>)}
          <Button onClick={fetchQueueData} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}/>
            Refresh
          </Button>
        </div>
      </div>

      {lastUpdated && (<p className="text-sm text-gray-600 mb-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>)}

      {queueData && (<>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                <Clock className="h-4 w-4 text-orange-600"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{queueData.stats.scheduled}</div>
                <p className="text-xs text-gray-600">Campaigns waiting to send</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sending</CardTitle>
                <AlertCircle className="h-4 w-4 text-blue-600"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{queueData.stats.sending}</div>
                <p className="text-xs text-gray-600">Currently being sent</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Active</CardTitle>
                <Mail className="h-4 w-4 text-green-600"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{queueData.stats.total}</div>
                <p className="text-xs text-gray-600">Active campaigns</p>
              </CardContent>
            </Card>
          </div>

          
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {queueData.campaigns.length > 0 ? (<div className="space-y-4">
                  {queueData.campaigns.map((campaign) => (<div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={getStatusColor(campaign.status)}>
                            {getStatusIcon(campaign.status)}
                          </div>
                          <h3 className="font-semibold">{campaign.title || campaign.subject}</h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${campaign.status === 'scheduled'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'}`}>
                          {campaign.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4"/>
                          <span>Scheduled: {formatDate(campaign.send_date)}</span>
                        </div>
                        
                        {campaign.jobStatus && (<div className="flex items-center space-x-2">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/>
                            </div>
                            <span>Progress: {campaign.jobStatus.progress || 0}%</span>
                          </div>)}
                      </div>

                      {campaign.jobStatus?.progress && campaign.jobStatus.progress > 0 && (<div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${campaign.jobStatus.progress}%` }}/>
                          </div>
                        </div>)}

                      {campaign.jobStatus?.failedReason && (<div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          Error: {campaign.jobStatus.failedReason}
                        </div>)}
                    </div>))}
                </div>) : (<div className="text-center py-8">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                  <p className="text-gray-600">No campaigns currently in queue</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Campaigns will appear here when they're scheduled or being sent
                  </p>
                </div>)}
            </CardContent>
          </Card>
        </>)}

      {!queueData && !loading && (<div className="text-center py-8">
          <p className="text-gray-600">Failed to load queue data</p>
        </div>)}
    </div>);
}
