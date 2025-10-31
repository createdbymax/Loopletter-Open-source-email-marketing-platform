'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, Eye, Settings, BarChart3, Database, Mail, UserCheck, Activity, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { QuarantineStatusCard } from './quarantine-status-card';
import { PendingReviewsNotification } from './pending-reviews-notification';
interface AdminStats {
    platform: {
        total_artists: number;
        active_artists: number;
        total_fans: number;
        total_campaigns: number;
    };
    reviews: {
        pending: number;
        approved: number;
        rejected: number;
        total: number;
    };
    reputation: {
        artists_with_good_reputation: number;
        artists_with_warnings: number;
        suspended_artists: number;
    };
    recent_activity: Array<{
        id: string;
        action: string;
        details: string;
        timestamp: string;
        severity: 'info' | 'warning' | 'critical';
    }>;
}
export function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/dashboard-stats');
            if (!response.ok) {
                throw new Error('Failed to fetch admin stats');
            }
            const data = await response.json();
            setStats(data);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);
    if (loading) {
        return (<div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin"/>
            <span>Loading admin dashboard...</span>
          </div>
        </div>
      </div>);
    }
    if (error) {
        return (<div className="container mx-auto py-6">
        <Alert>
          <AlertTriangle className="h-4 w-4"/>
          <AlertDescription>
            Error loading admin dashboard: {error}
            <Button variant="outline" size="sm" onClick={fetchStats} className="ml-2">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>);
    }
    return (<div className="container mx-auto py-6 space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600"/>
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Platform overview and management tools
          </p>
        </div>
        <Button onClick={fetchStats} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2"/>
          Refresh
        </Button>
      </div>

      
      <PendingReviewsNotification showDismiss={false}/>

      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/dashboard/admin/reviews">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Eye className="h-8 w-8 text-blue-500"/>
                <div>
                  <div className="font-medium">Review Queue</div>
                  <div className="text-sm text-muted-foreground">
                    {stats?.reviews.pending || 0} pending
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/manage">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-500"/>
                <div>
                  <div className="font-medium">Admin Users</div>
                  <div className="text-sm text-muted-foreground">Manage access</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/analytics">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-purple-500"/>
                <div>
                  <div className="font-medium">Analytics</div>
                  <div className="text-sm text-muted-foreground">Platform insights</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/system">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-orange-500"/>
                <div>
                  <div className="font-medium">System Tools</div>
                  <div className="text-sm text-muted-foreground">Maintenance</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4"/>
              Total Artists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.platform.total_artists || 0}</div>
            <div className="text-xs text-muted-foreground">
              {stats?.platform.active_artists || 0} active this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4"/>
              Total Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.platform.total_fans || 0}</div>
            <div className="text-xs text-muted-foreground">
              Across all artists
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4"/>
              Total Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.platform.total_campaigns || 0}</div>
            <div className="text-xs text-muted-foreground">
              All time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4"/>
              Platform Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500"/>
              <span className="font-semibold text-green-600">Healthy</span>
            </div>
            <div className="text-xs text-muted-foreground">
              All systems operational
            </div>
          </CardContent>
        </Card>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500"/>
              Good Reputation
            </CardTitle>
            <CardDescription>Artists with healthy sending metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats?.reputation.artists_with_good_reputation || 0}
            </div>
            <div className="text-sm text-muted-foreground">
              {stats?.platform.total_artists ?
            Math.round(((stats?.reputation.artists_with_good_reputation || 0) / stats.platform.total_artists) * 100)
            : 0}% of all artists
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500"/>
              Warnings
            </CardTitle>
            <CardDescription>Artists with reputation warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {stats?.reputation.artists_with_warnings || 0}
            </div>
            <div className="text-sm text-muted-foreground">
              Need attention
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500"/>
              Suspended
            </CardTitle>
            <CardDescription>Artists with suspended sending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats?.reputation.suspended_artists || 0}
            </div>
            <div className="text-sm text-muted-foreground">
              Require intervention
            </div>
          </CardContent>
        </Card>
      </div>

      
      <QuarantineStatusCard />

      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5"/>
            Recent Admin Activity
          </CardTitle>
          <CardDescription>
            Latest actions and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recent_activity && stats.recent_activity.length > 0 ? (<div className="space-y-3">
              {stats.recent_activity.slice(0, 10).map((activity) => (<div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.severity === 'critical' ? (<AlertTriangle className="h-4 w-4 text-red-500"/>) : activity.severity === 'warning' ? (<AlertTriangle className="h-4 w-4 text-yellow-500"/>) : (<CheckCircle className="h-4 w-4 text-blue-500"/>)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{activity.action}</div>
                    <div className="text-sm text-muted-foreground">{activity.details}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant={activity.severity === 'critical' ? 'destructive' :
                    activity.severity === 'warning' ? 'secondary' : 'outline'}>
                    {activity.severity}
                  </Badge>
                </div>))}
            </div>) : (<div className="text-center py-8 text-muted-foreground">
              No recent activity
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
