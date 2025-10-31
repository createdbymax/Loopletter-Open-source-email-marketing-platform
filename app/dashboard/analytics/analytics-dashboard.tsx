"use client";
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, Mail, MousePointerClick, Download, RefreshCw, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
interface AnalyticsData {
    overview: {
        totalCampaigns: number;
        totalSent: number;
        totalOpens: number;
        totalClicks: number;
        totalSubscribers: number;
        totalUnsubscribes: number;
        avgOpenRate: number;
        avgClickRate: number;
        newSubscribers: number;
    };
    campaignPerformance: Array<{
        id: string;
        title: string;
        subject: string;
        sendDate: string;
        totalSent: number;
        opens: number;
        clicks: number;
        openRate: number;
        clickRate: number;
    }>;
    timeSeriesData: Array<{
        label: string;
        sent: number;
        opens: number;
        clicks: number;
        date: string;
    }>;
}
export function AnalyticsDashboard() {
    const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('month');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const fetchAnalyticsData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/analytics/overview?period=${period}`);
            if (!response.ok) {
                throw new Error('Failed to fetch analytics data');
            }
            const analyticsData = await response.json();
            setData(analyticsData);
        }
        catch (error) {
            console.error('Error fetching analytics data:', error);
            setError('Could not load analytics data');
        }
        finally {
            setLoading(false);
        }
    }, [period]);
    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);
    const handleRefresh = () => {
        fetchAnalyticsData();
    };
    const handleExport = () => {
        if (!data)
            return;
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'Campaign,Send Date,Total Sent,Opens,Clicks,Open Rate,Click Rate\n';
        data.campaignPerformance.forEach(campaign => {
            const row = [
                `"${campaign.title}"`,
                format(parseISO(campaign.sendDate), 'yyyy-MM-dd'),
                campaign.totalSent,
                campaign.opens,
                campaign.clicks,
                `${(campaign.openRate * 100).toFixed(1)}%`,
                `${(campaign.clickRate * 100).toFixed(1)}%`
            ];
            csvContent += row.join(',') + '\n';
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `campaign-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    if (loading && !data) {
        return (<div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>);
    }
    if (error) {
        return (<div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error}
      </div>);
    }
    if (!data) {
        return (<div className="text-center py-12">
        <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4"/>
        <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
        <p className="text-gray-600 mb-4">Send your first campaign to start collecting analytics</p>
      </div>);
    }
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Track your email campaign performance and audience engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2"/>
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2"/>
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <div className="flex items-center justify-end mb-4">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <Button variant={period === 'day' ? 'default' : 'ghost'} size="sm" onClick={() => setPeriod('day')} className="text-xs">
              Day
            </Button>
            <Button variant={period === 'week' ? 'default' : 'ghost'} size="sm" onClick={() => setPeriod('week')} className="text-xs">
              Week
            </Button>
            <Button variant={period === 'month' ? 'default' : 'ghost'} size="sm" onClick={() => setPeriod('month')} className="text-xs">
              Month
            </Button>
            <Button variant={period === 'year' ? 'default' : 'ghost'} size="sm" onClick={() => setPeriod('year')} className="text-xs">
              Year
            </Button>
            <Button variant={period === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => setPeriod('all')} className="text-xs">
              All Time
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Open Rate
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(data.overview.avgOpenRate * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.overview.avgOpenRate > 0.25 ? (<span className="text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1"/>
                      Above industry average
                    </span>) : (<span className="text-amber-600 flex items-center">
                      <TrendingDown className="h-3 w-3 mr-1"/>
                      Below industry average
                    </span>)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Click Rate
                </CardTitle>
                <MousePointerClick className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(data.overview.avgClickRate * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.overview.avgClickRate > 0.03 ? (<span className="text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1"/>
                      Above industry average
                    </span>) : (<span className="text-amber-600 flex items-center">
                      <TrendingDown className="h-3 w-3 mr-1"/>
                      Below industry average
                    </span>)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Subscribers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.overview.totalSubscribers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1"/>
                    {data.overview.newSubscribers} new this month
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Campaigns
                </CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.overview.totalCampaigns.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.overview.totalSent.toLocaleString()} emails sent
                </p>
              </CardContent>
            </Card>
          </div>

          
          <Card>
            <CardHeader>
              <CardTitle>Engagement Over Time</CardTitle>
              <CardDescription>
                Track opens and clicks across your campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={data.timeSeriesData} margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
        }}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="label"/>
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="opens" stroke="#3b82f6" activeDot={{ r: 8 }} name="Opens"/>
                  <Line type="monotone" dataKey="clicks" stroke="#10b981" name="Clicks"/>
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaign Performance</CardTitle>
              <CardDescription>
                Your last 5 campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {data.campaignPerformance.slice(0, 5).map((campaign) => (<div key={campaign.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{campaign.title}</h4>
                        <p className="text-sm text-gray-500">
                          Sent {format(parseISO(campaign.sendDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{campaign.totalSent.toLocaleString()} sent</p>
                        <p className="text-sm text-gray-500">
                          {(campaign.openRate * 100).toFixed(1)}% open rate
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Opens</span>
                        <span>{campaign.opens.toLocaleString()} ({(campaign.openRate * 100).toFixed(1)}%)</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${campaign.openRate * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Clicks</span>
                        <span>{campaign.clicks.toLocaleString()} ({(campaign.clickRate * 100).toFixed(1)}%)</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${campaign.clickRate * 100}%` }}></div>
                      </div>
                    </div>
                  </div>))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          
          <Card>
            <CardHeader>
              <CardTitle>Campaign Comparison</CardTitle>
              <CardDescription>
                Compare open and click rates across campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={data.campaignPerformance.slice(0, 10)} margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 60,
        }}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="title" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }}/>
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="openRate" fill="#3b82f6" name="Open Rate"/>
                  <Bar dataKey="clickRate" fill="#10b981" name="Click Rate"/>
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>
                Detailed performance metrics for all campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Campaign</th>
                      <th className="text-left py-3 px-4">Send Date</th>
                      <th className="text-right py-3 px-4">Sent</th>
                      <th className="text-right py-3 px-4">Opens</th>
                      <th className="text-right py-3 px-4">Clicks</th>
                      <th className="text-right py-3 px-4">Open Rate</th>
                      <th className="text-right py-3 px-4">Click Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.campaignPerformance.map((campaign) => (<tr key={campaign.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{campaign.title}</td>
                        <td className="py-3 px-4">{format(parseISO(campaign.sendDate), 'MMM d, yyyy')}</td>
                        <td className="py-3 px-4 text-right">{campaign.totalSent.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{campaign.opens.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{campaign.clicks.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{(campaign.openRate * 100).toFixed(1)}%</td>
                        <td className="py-3 px-4 text-right">{(campaign.clickRate * 100).toFixed(1)}%</td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          
          <Card>
            <CardHeader>
              <CardTitle>Audience Growth</CardTitle>
              <CardDescription>
                Track your subscriber growth over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={data.timeSeriesData.map((item, index, array) => {
            const baseSubscribers = data.overview.totalSubscribers - data.overview.newSubscribers;
            const growthPerPeriod = data.overview.newSubscribers / array.length;
            return {
                ...item,
                subscribers: Math.round(baseSubscribers + (growthPerPeriod * index))
            };
        })} margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
        }}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="label"/>
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="subscribers" stroke="#8884d8" activeDot={{ r: 8 }} name="Subscribers"/>
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Subscribers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.overview.totalSubscribers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active subscribers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  New Subscribers
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.overview.newSubscribers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  In the last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Unsubscribes
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.overview.totalUnsubscribes.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.overview.totalSubscribers > 0
            ? `${((data.overview.totalUnsubscribes / (data.overview.totalSubscribers + data.overview.totalUnsubscribes)) * 100).toFixed(1)}% unsubscribe rate`
            : '0% unsubscribe rate'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>);
}
