"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, Shield } from 'lucide-react';
interface SystemQueueStats {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    total: number;
}
export default function AdminQueueDashboard() {
    const [stats, setStats] = useState<SystemQueueStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/queue/process');
            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
                setLastUpdated(new Date());
            }
        }
        catch (error) {
            console.error('Failed to fetch system queue stats:', error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);
    return (<div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-red-600"/>
          <div>
            <h1 className="text-2xl font-bold">System Queue Dashboard</h1>
            <p className="text-sm text-gray-600">System-wide email queue statistics (Admin Only)</p>
          </div>
        </div>
        <Button onClick={fetchStats} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}/>
          Refresh
        </Button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600"/>
          <p className="text-sm text-yellow-800">
            <strong>Admin Notice:</strong> This dashboard shows system-wide queue statistics for all users. 
            Regular users see only their own campaigns in their personal queue dashboard.
          </p>
        </div>
      </div>

      {lastUpdated && (<p className="text-sm text-gray-600 mb-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>)}

      {stats && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waiting</CardTitle>
              <Clock className="h-4 w-4 text-orange-600"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.waiting}</div>
              <p className="text-xs text-gray-600">Jobs in queue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
              <p className="text-xs text-gray-600">Currently processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-gray-600">Successfully sent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <p className="text-xs text-gray-600">Failed to send</p>
            </CardContent>
          </Card>
        </div>)}

      <Card>
        <CardHeader>
          <CardTitle>System Queue Health</CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (<div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Total Jobs:</span>
                <span className="font-semibold">{stats.total}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Success Rate:</span>
                <span className="font-semibold">
                  {stats.total > 0
                ? `${Math.round((stats.completed / (stats.completed + stats.failed)) * 100)}%`
                : 'N/A'}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{
                width: stats.total > 0
                    ? `${(stats.completed / stats.total) * 100}%`
                    : '0%'
            }}/>
              </div>
              
              <div className="text-sm text-gray-600">
                System queue is {stats.waiting > 0 ? 'processing' : 'idle'}
              </div>
            </div>) : (<div className="text-center py-4">
              <p className="text-gray-600">Loading system queue statistics...</p>
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
