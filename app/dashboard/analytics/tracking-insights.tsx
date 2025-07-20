import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Monitor, Clock, Mail } from 'lucide-react';
import { Artist } from '@/lib/types';
import { FeatureGate } from '@/components/ui/feature-access';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface TrackingInsightsProps {
  artist: Artist;
}

interface AdvancedAnalyticsData {
  locations: { city: string; country: string; count: number }[];
  devices: { type: string; count: number; percentage: number }[];
  emailClients: { name: string; count: number; percentage: number }[];
  timeOfDay: { hour: string; opens: number }[];
}

export function TrackingInsights({ artist }: TrackingInsightsProps) {
  const [advancedData, setAdvancedData] = useState<AdvancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdvancedAnalytics() {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics/advanced');
        
        if (!response.ok) {
          throw new Error('Failed to fetch advanced analytics');
        }
        
        const data = await response.json();
        setAdvancedData(data.advanced);
      } catch (error) {
        console.error('Error fetching advanced analytics:', error);
        setError('Could not load advanced analytics data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchAdvancedAnalytics();
  }, []);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <FeatureGate
      feature="advancedAnalytics"
      artist={artist}
      fallback={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Advanced Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">Unlock Advanced Analytics</h3>
              <p className="text-gray-600 mb-4">
                Upgrade to access detailed insights about your audience&apos;s location, devices, and engagement patterns.
              </p>
              <Button>Upgrade to Independent Plan</Button>
            </div>
          </CardContent>
        </Card>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Advanced Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : advancedData ? (
            <Tabs defaultValue="locations">
              <TabsList className="mb-4">
                <TabsTrigger value="locations">
                  <MapPin className="h-4 w-4 mr-2" />
                  Locations
                </TabsTrigger>
                <TabsTrigger value="devices">
                  <Monitor className="h-4 w-4 mr-2" />
                  Devices
                </TabsTrigger>
                <TabsTrigger value="timing">
                  <Clock className="h-4 w-4 mr-2" />
                  Timing
                </TabsTrigger>
                <TabsTrigger value="clients">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Clients
                </TabsTrigger>
              </TabsList>

              <TabsContent value="locations">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Top Locations</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={advancedData.locations}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="city" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {advancedData.locations.map((location: { city: string; country: string; count: number }, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium">{location.city}</div>
                        <div className="text-sm text-gray-600">{location.country}</div>
                        <div className="text-sm font-medium mt-1">{location.count} subscribers</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="devices">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Device Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={advancedData.devices}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                          >
                            {advancedData.devices.map((entry: { type: string; count: number; percentage: number }, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {advancedData.devices.map((device: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span>{device.type}</span>
                          </div>
                          <div className="font-medium">{device.count} ({device.percentage}%)</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="timing">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Opens by Time of Day</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={advancedData.timeOfDay}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="opens" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800">Best Time to Send</h4>
                    <p className="text-blue-700 mt-1">
                      Based on your audience&apos;s engagement patterns, the best times to send emails are:
                      <span className="font-medium"> 10:00 AM, 8:00 PM, and 12:00 PM</span>
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="clients">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Clients</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={advancedData.emailClients}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                          >
                            {advancedData.emailClients.map((entry: { name: string; count: number }, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {advancedData.emailClients.map((client: { name: string; count: number; percentage: number }, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span>{client.name}</span>
                          </div>
                          <div className="font-medium">{client.count} ({client.percentage}%)</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800">Email Client Optimization</h4>
                    <p className="text-blue-700 mt-1">
                      Your emails should be optimized primarily for Gmail and Apple Mail, which account for 
                      <span className="font-medium"> 70% of your audience&apos;s email clients</span>.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : null}
        </CardContent>
      </Card>
    </FeatureGate>
  );
}